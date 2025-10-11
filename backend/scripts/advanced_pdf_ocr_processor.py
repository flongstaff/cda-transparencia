#!/usr/bin/env python3
"""
Advanced PDF OCR Processor for Carmen de Areco Transparency Portal

This script processes ALL existing PDFs in the central storage using docstrange,
extracts data to CSV/JSON formats, updates existing datasets, and implements
comparison logic between different data sources.
"""

import json
import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
import hashlib
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from docstrange import DocumentExtractor
import PyPDF2
from collections import defaultdict


class AdvancedPDFProcessor:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.central_pdfs_dir = self.project_root / "central_pdfs"
        self.data_dir = self.project_root / "data"
        self.csv_dir = self.data_dir / "raw" / "csv"
        self.ocr_output_dir = self.data_dir / "ocr_extracted"
        self.comparison_output_dir = self.data_dir / "processed"
        
        # Create output directories
        self.ocr_output_dir.mkdir(parents=True, exist_ok=True)
        self.comparison_output_dir.mkdir(parents=True, exist_ok=True)
        self.csv_dir.mkdir(parents=True, exist_ok=True)

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of a file for comparison"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def extract_with_docstrange(self, pdf_path: Path) -> Dict[str, Any]:
        """Extract text and structured data from PDF using docstrange."""
        try:
            # Initialize the document extractor
            extractor = DocumentExtractor()
            
            # Process the document
            result = extractor.extract(str(pdf_path))
            
            # Extract text content - accessing the text properly from ConversionResult
            extracted_text = ""
            tables_data = []
            figures_data = []
            
            # The result object contains pages with elements
            # Access the text content appropriately based on ConversionResult structure
            if hasattr(result, 'pages'):
                for page_idx, page in enumerate(result.pages):
                    if hasattr(page, 'elements'):
                        for element in page.elements:
                            if hasattr(element, 'text') and element.text:
                                extracted_text += element.text + "\n"
                            # Extract tables if available
                            if hasattr(element, 'type') and element.type == 'table' and hasattr(element, 'data'):
                                tables_data.append({
                                    "page": page_idx + 1,
                                    "data": element.data,
                                    "text_preview": str(element.data)[:500]  # Truncate for performance
                                })
                            # Extract figures if available
                            elif hasattr(element, 'type') and element.type in ['figure', 'image', 'chart'] and hasattr(element, 'caption'):
                                figures_data.append({
                                    "page": page_idx + 1,
                                    "caption": element.caption,
                                    "type": element.type
                                })
            else:
                # If direct text access is available
                if hasattr(result, 'text'):
                    extracted_text = result.text
                elif hasattr(result, 'document') and hasattr(result.document, 'text'):
                    extracted_text = result.document.text
                else:
                    # Last resort: try to convert the entire result to string
                    extracted_text = str(result)

            # If docstrange returned empty text, try fallback method
            if len(extracted_text.strip()) == 0:
                print(f"Docstrange returned empty text for {pdf_path.name}, trying fallback method...")
                return self.extract_with_fallback_pypdf2(pdf_path)
            
            # Basic statistics
            page_count = len(result.pages) if hasattr(result, 'pages') else 1
            stats = {
                "file_name": pdf_path.name,
                "file_hash": self.calculate_file_hash(pdf_path),
                "page_count": page_count,
                "text_length": len(extracted_text),
                "table_count": len(tables_data),
                "figure_count": len(figures_data),
                "extracted_text": extracted_text[:2000] + "..." if len(extracted_text) > 2000 else extracted_text,  # Truncate for JSON
                "tables_data": tables_data,
                "figures_data": figures_data,
                "processing_method": "docstrange",
                "extraction_timestamp": datetime.now().isoformat()
            }
            
            # Additional information from the result if available
            if hasattr(result, 'metadata'):
                stats["document_metadata"] = result.metadata
                
            return stats
        except Exception as e:
            print(f"Error processing PDF with docstrange: {str(e)}")
            # Fallback to basic text extraction using PyPDF2 if docstrange fails
            return self.extract_with_fallback_pypdf2(pdf_path)

    def extract_with_fallback_pypdf2(self, pdf_path: Path) -> Dict[str, Any]:
        """Fallback extraction using PyPDF2."""
        try:
            print(f"Using PyPDF2 for text extraction of {pdf_path.name}...")
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                
                stats = {
                    "file_name": pdf_path.name,
                    "file_hash": self.calculate_file_hash(pdf_path),
                    "page_count": len(reader.pages),
                    "text_length": len(text),
                    "table_count": 0,
                    "figure_count": 0,
                    "extracted_text": text[:2000] + "..." if len(text) > 2000 else text,
                    "tables_data": [],
                    "figures_data": [],
                    "processing_method": "pypdf2",
                    "extraction_timestamp": datetime.now().isoformat()
                }
                return stats
        except Exception as fallback_error:
            print(f"Fallback extraction also failed for {pdf_path.name}: {str(fallback_error)}")
            # Final fallback - return minimal stats
            return {
                "file_name": pdf_path.name,
                "file_hash": self.calculate_file_hash(pdf_path),
                "page_count": 1,
                "text_length": 0,
                "table_count": 0,
                "figure_count": 0,
                "extracted_text": "",
                "tables_data": [],
                "figures_data": [],
                "processing_method": "failed",
                "error": str(fallback_error),
                "extraction_timestamp": datetime.now().isoformat()
            }

    def extract_tables_to_csv(self, tables_data: List[Dict], base_filename: str) -> List[str]:
        """Convert extracted tables data to CSV files."""
        csv_files = []
        
        for i, table_data in enumerate(tables_data):
            if "data" in table_data:
                try:
                    # Create a DataFrame from the table data
                    table_df = pd.DataFrame(table_data["data"])
                    
                    # Create CSV filename
                    csv_filename = f"{base_filename}_table_{i+1}.csv"
                    csv_path = self.ocr_output_dir / "csv" / csv_filename
                    csv_path.parent.mkdir(exist_ok=True)
                    
                    # Save to CSV
                    table_df.to_csv(csv_path, index=False, encoding='utf-8')
                    csv_files.append(str(csv_path))
                    
                    print(f"  Saved table {i+1} to: {csv_path}")
                except Exception as e:
                    print(f"  Error converting table {i+1} to CSV: {str(e)}")
        
        return csv_files

    def process_single_pdf(self, pdf_path: Path) -> Optional[Dict[str, Any]]:
        """Process a single PDF file with OCR and return extraction results."""
        print(f"Processing PDF: {pdf_path.name}")
        
        # Extract data using docstrange
        extraction_result = self.extract_with_docstrange(pdf_path)
        
        if extraction_result.get("processing_method") != "failed":
            # Determine base filename for output
            base_filename = pdf_path.stem
            
            # Convert tables to CSV if available
            if extraction_result.get("tables_data"):
                csv_files = self.extract_tables_to_csv(extraction_result["tables_data"], base_filename)
                extraction_result["csv_files"] = csv_files
            
            # Save the extraction result as JSON
            json_filename = f"{base_filename}_extraction.json"
            json_path = self.ocr_output_dir / "json" / json_filename
            json_path.parent.mkdir(exist_ok=True)
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(extraction_result, f, ensure_ascii=False, indent=2)
            
            print(f"  Saved extraction to: {json_path}")
            
            # Also save the full text content
            text_filename = f"{base_filename}_extracted.txt"
            text_path = self.ocr_output_dir / "text" / text_filename
            text_path.parent.mkdir(exist_ok=True)
            
            with open(text_path, 'w', encoding='utf-8') as f:
                f.write(extraction_result.get("extracted_text", ""))
            
            print(f"  Saved extracted text to: {text_path}")
            
            return extraction_result
        else:
            print(f"  Failed to extract data from: {pdf_path.name}")
            return None

    def process_all_pdfs(self) -> Dict[str, Any]:
        """Process all PDF files in the central storage directory."""
        if not self.central_pdfs_dir.exists():
            print(f"Central PDFs directory does not exist: {self.central_pdfs_dir}")
            return {"processed": 0, "errors": 0, "results": []}
        
        pdf_files = list(self.central_pdfs_dir.glob("*.pdf"))
        print(f"Found {len(pdf_files)} PDF files to process in {self.central_pdfs_dir}")
        
        processed_count = 0
        error_count = 0
        results = []
        
        for pdf_file in pdf_files:
            try:
                result = self.process_single_pdf(pdf_file)
                if result:
                    results.append(result)
                    processed_count += 1
                else:
                    error_count += 1
            except Exception as e:
                print(f"Error processing {pdf_file.name}: {str(e)}")
                error_count += 1
        
        # Create a summary file
        summary = {
            "summary": {
                "total_pdfs": len(pdf_files),
                "processed": processed_count,
                "errors": error_count,
                "processed_timestamp": datetime.now().isoformat()
            },
            "results": results
        }
        
        # Save the summary
        summary_path = self.ocr_output_dir / "processing_summary.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        
        print(f"\nProcessing complete. Summary saved to: {summary_path}")
        print(f"Processed: {processed_count}, Errors: {error_count}")
        
        return summary

    def update_existing_csv_datasets(self) -> Dict[str, Any]:
        """Update existing CSV datasets with newly extracted information."""
        print("Updating existing CSV datasets with newly extracted information...")
        
        # Load all extracted JSON files
        extraction_files = list((self.ocr_output_dir / "json").glob("*_extraction.json"))
        updated_counts = {"csv_files": 0, "rows_added": 0, "errors": 0}
        
        for extraction_file in extraction_files:
            try:
                with open(extraction_file, 'r', encoding='utf-8') as f:
                    extraction_data = json.load(f)
                
                # Match the extraction to existing CSVs based on keywords in the extracted text
                matching_csvs = self.find_matching_csvs(extraction_data.get("extracted_text", ""))
                
                for csv_path in matching_csvs:
                    try:
                        # Load the existing CSV
                        df = pd.read_csv(csv_path)
                        
                        # Add new information from the extraction
                        # This is a simplified example - you might want to implement more sophisticated logic
                        new_data = self.extract_structured_data_from_text(
                            extraction_data.get("extracted_text", ""),
                            df.columns.tolist()
                        )
                        
                        if new_data:
                            # Convert new_data to DataFrame and append to existing data
                            new_df = pd.DataFrame([new_data])
                            updated_df = pd.concat([df, new_df], ignore_index=True)
                            
                            # Save updated CSV
                            updated_df.to_csv(csv_path, index=False, encoding='utf-8')
                            updated_counts["csv_files"] += 1
                            updated_counts["rows_added"] += 1
                            
                            print(f"  Updated {csv_path.name} with new data from {extraction_file.name}")
                    except Exception as e:
                        print(f"  Error updating {csv_path.name}: {str(e)}")
                        updated_counts["errors"] += 1
                        
            except Exception as e:
                print(f"Error processing extraction file {extraction_file.name}: {str(e)}")
                updated_counts["errors"] += 1
        
        print(f"CSV update complete: {updated_counts}")
        return updated_counts

    def find_matching_csvs(self, extracted_text: str) -> List[Path]:
        """Find CSV files that might be related to the extracted text based on keywords."""
        matching_csvs = []
        
        # Look for keywords in the extracted text
        text_lower = extracted_text.lower()
        
        # Keywords that might indicate the type of data in the PDF
        keywords = [
            "gasto", "expenditure", "presupuesto", "budget", "revenue", "ingresos",
            "licitacion", "tender", "health", "salud", "education", "educacion",
            "seguridad", "security", "2019", "2020", "2021", "2022", "2023", "2024", "2025"
        ]
        
        for csv_file in self.csv_dir.glob("*.csv"):
            # Check if any keywords from the extracted text appear in the CSV filename
            filename_lower = csv_file.name.lower()
            
            for keyword in keywords:
                if keyword in text_lower and keyword in filename_lower:
                    matching_csvs.append(csv_file)
                    break
        
        return matching_csvs

    def extract_structured_data_from_text(self, text: str, existing_columns: List[str]) -> Optional[Dict[str, Any]]:
        """Extract structured data from text based on existing CSV columns."""
        # This is a simplified implementation - you might want to implement more sophisticated NLP
        data = {}
        
        # Example: look for common patterns in the text
        for col in existing_columns:
            col_lower = col.lower()
            
            # Look for year patterns
            if "year" in col_lower or "año" in col_lower:
                year_match = re.search(r'\b(20[12][0-9]|203[0-9])\b', text)
                if year_match:
                    data[col] = int(year_match.group(0))
            
            # Look for monetary values
            elif "monto" in col_lower or "amount" in col_lower or "importe" in col_lower:
                # Look for monetary patterns (e.g., $1,234.56 or 1234,56)
                money_match = re.search(r'[$€£]?\s*([0-9]{1,3}(?:[,.][0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)', text)
                if money_match:
                    # Clean the number string
                    num_str = money_match.group(1).replace(',', '')
                    try:
                        data[col] = float(num_str)
                    except ValueError:
                        pass
        
        if data:
            # Fill in missing columns with NaN
            for col in existing_columns:
                if col not in data:
                    data[col] = np.nan
            return data
        else:
            return None

    def compare_data_sources(self) -> Dict[str, Any]:
        """Implement comparison logic between different data sources (PDFs, CSVs, etc.)."""
        print("Comparing data sources...")
        
        comparison_results = {
            "summary": {},
            "discrepancies": [],
            "consistencies": []
        }
        
        # Load main data files
        main_data_files = ["main-data.json", "data.json", "main.json"]
        
        for filename in main_data_files:
            data_file_path = self.data_dir / filename
            if data_file_path.exists():
                try:
                    with open(data_file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    print(f"Comparing with {filename}...")
                    
                    # For each dataset in the main data file, check if we have extraction data
                    for dataset in data.get("dataset", []):
                        identifier = dataset.get("identifier")
                        
                        # Check if we have extracted data that matches this dataset
                        for distribution in dataset.get("distribution", []):
                            if distribution.get("format", "").upper() == "PDF":
                                file_name = distribution.get("fileName")
                                if file_name:
                                    # Look for extracted data for this file
                                    extraction_file = self.ocr_output_dir / "json" / f"{Path(file_name).stem}_extraction.json"
                                    if extraction_file.exists():
                                        print(f"  Found extraction for {file_name}")
                                        
                                        # Load the extraction data
                                        with open(extraction_file, 'r', encoding='utf-8') as ef:
                                            extraction_data = json.load(ef)
                                        
                                        # Compare and find discrepancies
                                        discrepancies = self.compare_dataset_with_extraction(
                                            dataset, distribution, extraction_data
                                        )
                                        
                                        if discrepancies:
                                            comparison_results["discrepancies"].extend(discrepancies)
                                        else:
                                            comparison_results["consistencies"].append({
                                                "dataset_id": identifier,
                                                "file_name": file_name,
                                                "status": "consistent"
                                            })
                except Exception as e:
                    print(f"Error comparing with {filename}: {str(e)}")
        
        # Save comparison results
        comparison_path = self.comparison_output_dir / "comparison_results.json"
        with open(comparison_path, 'w', encoding='utf-8') as f:
            json.dump(comparison_results, f, ensure_ascii=False, indent=2)
        
        print(f"Comparison complete. Results saved to: {comparison_path}")
        return comparison_results

    def compare_dataset_with_extraction(self, dataset: Dict, distribution: Dict, extraction_data: Dict) -> List[Dict]:
        """Compare dataset metadata with extracted PDF content."""
        discrepancies = []
        
        # Check if the description in the dataset matches content in the extracted text
        dataset_description = dataset.get("description", "").lower()
        extracted_text = extraction_data.get("extracted_text", "").lower()
        
        # Look for keywords from the dataset description in the extracted text
        if dataset_description and len(dataset_description) > 5:  # Only check meaningful descriptions
            # Split description into key terms
            description_terms = [term.strip() for term in dataset_description.split() if len(term) > 3]
            
            # Check if any terms appear in the extracted text
            missing_terms = [term for term in description_terms if term not in extracted_text]
            
            if missing_terms and len(missing_terms) > len(description_terms) * 0.5:  # If more than half are missing
                discrepancies.append({
                    "type": "description_content_mismatch",
                    "dataset_id": dataset.get("identifier"),
                    "file_name": distribution.get("fileName"),
                    "missing_terms": missing_terms[:5],  # Limit to first 5
                    "description": dataset_description[:100] + "..." if len(dataset_description) > 100 else dataset_description
                })
        
        # Check if the publication date is consistent with content
        pub_date = dataset.get("issued", "")
        if pub_date and extraction_data.get("extracted_text"):
            # Check if year in publication date appears in extracted text
            pub_year = re.search(r'\b(20[12][0-9])\b', pub_date)
            if pub_year:
                year_in_text = pub_year.group(1) in extracted_text
                if not year_in_text:
                    discrepancies.append({
                        "type": "year_mismatch",
                        "dataset_id": dataset.get("identifier"),
                        "file_name": distribution.get("fileName"),
                        "pub_year": pub_year.group(1),
                        "description": f"Publication year {pub_year.group(1)} not found in extracted text"
                    })
        
        return discrepancies

    def run_full_processing(self):
        """Run the complete PDF OCR processing workflow."""
        print("="*60)
        print("ADVANCED PDF OCR PROCESSING WORKFLOW")
        print("="*60)
        
        # Step 1: Process all PDFs
        print("\n1. Processing all PDFs with docstrange OCR...")
        pdf_results = self.process_all_pdfs()
        
        # Step 2: Update existing CSV datasets
        print("\n2. Updating existing CSV datasets with extracted information...")
        csv_updates = self.update_existing_csv_datasets()
        
        # Step 3: Compare data sources
        print("\n3. Comparing data sources...")
        comparison_results = self.compare_data_sources()
        
        # Step 4: Generate final report
        print("\n4. Generating final processing report...")
        self.generate_final_report(pdf_results, csv_updates, comparison_results)
        
        print("\n" + "="*60)
        print("ADVANCED PDF OCR PROCESSING COMPLETE")
        print("="*60)
        print(f"PDFs processed: {pdf_results['summary']['processed']}")
        print(f"CSV files updated: {csv_updates['csv_files']}")
        print(f"Data source comparisons completed")
        print("="*60)

    def generate_final_report(self, pdf_results: Dict, csv_updates: Dict, comparison_results: Dict):
        """Generate a final report of the processing results."""
        report = {
            "report_timestamp": datetime.now().isoformat(),
            "pdf_processing": pdf_results["summary"],
            "csv_updates": csv_updates,
            "comparisons": {
                "total_compared": len(comparison_results["consistencies"]) + len(comparison_results["discrepancies"]),
                "consistent": len(comparison_results["consistencies"]),
                "discrepancies": len(comparison_results["discrepancies"])
            },
            "summary": "Advanced PDF OCR processing completed successfully"
        }
        
        report_path = self.comparison_output_dir / "final_processing_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"Final report saved to: {report_path}")


def main():
    """Main function to run the advanced PDF OCR processor."""
    if len(sys.argv) > 1:
        project_root = sys.argv[1]
    else:
        project_root = "."
    
    processor = AdvancedPDFProcessor(project_root)
    processor.run_full_processing()


if __name__ == "__main__":
    main()
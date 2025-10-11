#!/usr/bin/env python3
"""
Comprehensive Data Processor for Carmen de Areco Transparency Portal

This script processes all existing PDFs and CSVs systematically, downloading
missing documents from official sources and processing them with docstrange.
"""

import json
import os
import sys
from pathlib import Path
import requests
from urllib.parse import urlparse
from docstrange import DocumentExtractor
import pandas as pd


def load_main_data_sources():
    """Load the main data sources from data/main-data.json"""
    data_file_path = Path(__file__).parent.parent.parent / "data" / "main-data.json"
    with open(data_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def get_existing_downloads():
    """Get list of already downloaded files from the downloads directory"""
    downloads_dir = Path(__file__).parent.parent / "data" / "downloads"
    existing_files = {}
    
    if downloads_dir.exists():
        for dataset_dir in downloads_dir.iterdir():
            if dataset_dir.is_dir():
                dataset_id = dataset_dir.name
                files = []
                for file_path in dataset_dir.rglob("*.pdf"):
                    files.append(file_path.name)
                existing_files[dataset_id] = files
    
    return existing_files


def download_file(url, local_path):
    """Download a file from URL to local path"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {url} -> {local_path}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {str(e)}")
        return False


def extract_with_docstrange(pdf_path):
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
                            extracted_text += element.text + "\\n"
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

        # Basic statistics
        page_count = len(result.pages) if hasattr(result, 'pages') else 1
        stats = {
            "page_count": page_count,
            "text_length": len(extracted_text),
            "table_count": len(tables_data),
            "figure_count": len(figures_data),
            "extracted_text": extracted_text[:2000] + "..." if len(extracted_text) > 2000 else extracted_text,  # Truncate for JSON
            "tables_data": tables_data,
            "figures_data": figures_data,
            "processing_method": "docstrange"
        }
        
        # Additional information from the result if available
        if hasattr(result, 'metadata'):
            stats["document_metadata"] = result.metadata
            
        # If docstrange returned empty text, try fallback method
        if len(extracted_text.strip()) == 0:
            print("Docstrange returned empty text, trying fallback method...")
            return extract_with_fallback_pypdf2(pdf_path)
        
        return stats
    except Exception as e:
        print(f"Error processing PDF with docstrange: {str(e)}")
        # Fallback to basic text extraction using PyPDF2 if docstrange fails
        return extract_with_fallback_pypdf2(pdf_path)


def extract_with_fallback_pypdf2(pdf_path):
    """Fallback extraction using PyPDF2."""
    try:
        print("Using PyPDF2 for text extraction...")
        import PyPDF2  # Correct import name
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\\n"
            
            stats = {
                "page_count": len(reader.pages),
                "text_length": len(text),
                "table_count": 0,
                "figure_count": 0,
                "extracted_text": text[:2000] + "..." if len(text) > 2000 else text,
                "tables_data": [],
                "figures_data": [],
                "processing_method": "pypdf2"
            }
            return stats
    except Exception as fallback_error:
        print(f"Fallback extraction also failed: {str(fallback_error)}")
        # Final fallback - return minimal stats
        return {
            "page_count": 1,
            "text_length": 0,
            "table_count": 0,
            "figure_count": 0,
            "extracted_text": "",
            "tables_data": [],
            "figures_data": [],
            "processing_method": "failed",
            "error": str(fallback_error)
        }


def process_existing_pdfs():
    """Process all existing PDFs with docstrange"""
    downloads_dir = Path(__file__).parent.parent / "data" / "downloads"
    processed_count = 0
    error_count = 0
    
    print("Processing existing PDFs with docstrange...")
    
    for dataset_dir in downloads_dir.iterdir():
        if dataset_dir.is_dir():
            print(f"Processing dataset: {dataset_dir.name}")
            
            for pdf_file in dataset_dir.rglob("*.pdf"):
                try:
                    print(f"  Processing PDF: {pdf_file.name}")
                    
                    # Create extraction result
                    extraction_result = extract_with_docstrange(pdf_file)
                    
                    # Save extraction result
                    extraction_path = pdf_file.parent / f"{pdf_file.stem}_extraction.json"
                    with open(extraction_path, 'w', encoding='utf-8') as f:
                        json.dump(extraction_result, f, ensure_ascii=False, indent=2)
                    
                    print(f"    Saved extraction to: {extraction_path}")
                    processed_count += 1
                    
                except Exception as e:
                    print(f"    Error processing {pdf_file.name}: {str(e)}")
                    error_count += 1
    
    print(f"Processed {processed_count} existing PDFs, with {error_count} errors")
    return processed_count, error_count


def identify_missing_documents():
    """Identify which documents from main data sources are missing"""
    main_data = load_main_data_sources()
    existing_files = get_existing_downloads()
    
    missing_docs = []
    
    for dataset in main_data.get("dataset", []):
        dataset_id = dataset.get("identifier")
        dataset_dir = Path(__file__).parent.parent / "data" / "downloads" / dataset_id  # Fixed path
        
        for distribution in dataset.get("distribution", []):
            # Get the file name or construct it from URL
            file_name = distribution.get("fileName")
            if not file_name:
                # Extract filename from URL
                url = distribution.get("accessURL") or distribution.get("downloadURL")
                if url:
                    parsed_url = urlparse(url)
                    file_name = os.path.basename(parsed_url.path)
            
            if file_name:
                # Check if the file exists in the dataset directory
                file_path = dataset_dir / file_name
                if not file_path.exists():
                    missing_docs.append({
                        "dataset_id": dataset_id,
                        "dataset_title": dataset.get("title"),
                        "file_name": file_name,
                        "access_url": distribution.get("accessURL") or distribution.get("downloadURL"),
                        "format": distribution.get("format"),
                        "title": distribution.get("title")
                    })
    
    return missing_docs


def download_missing_documents():
    """Download missing documents from official sources"""
    missing_docs = identify_missing_documents()
    downloaded_count = 0
    error_count = 0
    
    print(f"Found {len(missing_docs)} missing documents to download")
    
    for doc in missing_docs:
        dataset_id = doc["dataset_id"]
        dataset_dir = Path(__file__).parent.parent / "data" / "downloads" / dataset_id
        
        url = doc["access_url"]
        file_name = doc["file_name"]
        local_path = dataset_dir / file_name
        
        print(f"Downloading: {file_name} for {dataset_id}")
        
        success = download_file(url, local_path)
        if success:
            downloaded_count += 1
        else:
            error_count += 1
    
    print(f"Downloaded {downloaded_count} documents, with {error_count} errors")
    return downloaded_count, error_count


def process_csv_files():
    """Process all existing CSV files"""
    csv_dir = Path(__file__).parent.parent.parent / "data" / "raw" / "csv"
    processed_count = 0
    error_count = 0
    
    print("Processing existing CSV files...")
    
    for csv_file in csv_dir.glob("*.csv"):
        try:
            print(f"Processing CSV: {csv_file.name}")
            
            # Load CSV with pandas
            df = pd.read_csv(csv_file)
            
            # Create a simple summary of the CSV
            csv_summary = {
                "file_name": csv_file.name,
                "row_count": len(df),
                "column_count": len(df.columns),
                "columns": df.columns.tolist(),
                "sample_data": df.head().to_dict(orient='records'),
                "data_types": {col: str(df[col].dtype) for col in df.columns},
                "processing_method": "pandas-read_csv"
            }
            
            # Save summary
            summary_path = csv_file.parent / f"{csv_file.stem}_summary.json"
            with open(summary_path, 'w', encoding='utf-8') as f:
                json.dump(csv_summary, f, ensure_ascii=False, indent=2)
            
            print(f"  Saved summary to: {summary_path}")
            processed_count += 1
            
        except Exception as e:
            print(f"  Error processing {csv_file.name}: {str(e)}")
            error_count += 1
    
    print(f"Processed {processed_count} CSV files, with {error_count} errors")
    return processed_count, error_count


def update_data_indices():
    """Update the data indices to reflect processed documents"""
    print("Updating data indices...")
    
    # Create a summary of processed data
    summary = {
        "last_processed": "2025-10-09T00:00:00Z",
        "processed_pdfs": 0,
        "processed_csvs": 0,
        "downloaded_documents": 0,
        "missing_documents": 0
    }
    
    # Count processed PDFs
    downloads_dir = Path(__file__).parent.parent / "data" / "downloads"
    processed_pdfs = 0
    for pdf in downloads_dir.rglob("*_extraction.json"):
        processed_pdfs += 1
    summary["processed_pdfs"] = processed_pdfs
    
    # Count processed CSVs
    csv_dir = Path(__file__).parent.parent.parent / "data" / "raw" / "csv"
    processed_csvs = 0
    for summary_file in csv_dir.glob("*_summary.json"):
        processed_csvs += 1
    summary["processed_csvs"] = processed_csvs
    
    # Count downloaded documents
    downloaded_docs = 0
    for pdf in downloads_dir.rglob("*.pdf"):
        downloaded_docs += 1
    summary["downloaded_documents"] = downloaded_docs
    
    # Identify missing documents
    missing_docs = identify_missing_documents()
    summary["missing_documents"] = len(missing_docs)
    
    # Save summary
    summary_path = Path(__file__).parent.parent / "data" / "processing_summary.json"
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    print(f"Saved processing summary to: {summary_path}")
    print(f"Summary: {summary}")


def main():
    """Main function to run the comprehensive data processing."""
    print("Starting comprehensive data processing...")
    
    # Process existing PDFs
    print("\\n1. Processing existing PDFs...")
    processed_pdfs, pdf_errors = process_existing_pdfs()
    
    # Process existing CSVs
    print("\\n2. Processing existing CSVs...")
    processed_csvs, csv_errors = process_csv_files()
    
    # Identify and download missing documents
    print("\\n3. Identifying missing documents...")
    missing_docs = identify_missing_documents()
    print(f"Found {len(missing_docs)} missing documents")
    
    print("\\n4. Downloading missing documents...")
    downloaded_count, download_errors = download_missing_documents()
    
    # Process newly downloaded PDFs
    print("\\n5. Processing newly downloaded PDFs...")
    new_processed_pdfs, new_pdf_errors = process_existing_pdfs()
    
    # Update data indices
    print("\\n6. Updating data indices...")
    update_data_indices()
    
    print("\\n" + "="*50)
    print("COMPREHENSIVE DATA PROCESSING COMPLETE")
    print("="*50)
    print(f"Existing PDFs processed: {processed_pdfs}")
    print(f"New PDFs downloaded: {downloaded_count}")
    print(f"Total PDFs with extraction: {processed_pdfs + new_processed_pdfs}")
    print(f"CSV files processed: {processed_csvs}")
    print(f"Missing documents identified: {len(missing_docs)}")
    print(f"PDF processing errors: {pdf_errors + new_pdf_errors}")
    print(f"Download errors: {download_errors}")
    print(f"CSV processing errors: {csv_errors}")
    print("="*50)


if __name__ == "__main__":
    main()
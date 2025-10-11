#!/usr/bin/env python3
"""
OCR Processing Script using docstrange for Carmen de Areco Transparency Portal

This script processes PDFs using docstrange OCR and updates data files with extracted information.
"""

import json
import os
import sys
from pathlib import Path
import requests
from docstrange import DocumentExtractor


def download_pdf(url, local_path):
    """Download a PDF from a URL to a local path."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded PDF: {url} -> {local_path}")
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
                text += page.extract_text() + "\n"
            
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


def process_dataset(dataset_entry, data_dir):
    """Process a single dataset entry from the data file."""
    identifier = dataset_entry.get("identifier", "unknown")
    print(f"Processing dataset: {identifier}")
    
    # Process each distribution (usually PDF files)
    for i, distribution in enumerate(dataset_entry.get("distribution", [])):
        if distribution.get("format", "").upper() == "PDF":
            pdf_url = distribution.get("downloadURL") or distribution.get("accessURL")
            local_path = distribution.get("localPath")  # Check if we have a local path
            
            # Determine the source of the PDF
            if local_path:
                # Use local file directly
                source_pdf_path = Path(local_path)
                if not source_pdf_path.exists():
                    print(f"  Local PDF file does not exist: {source_pdf_path}")
                    continue
                # Create a copy in the expected location
                filename = distribution.get("fileName", f"{identifier}_{i}.pdf")
                local_pdf_path = Path(data_dir) / "pdfs" / identifier / filename
                local_pdf_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy the file to the expected location (or create a symlink)
                import shutil
                shutil.copy2(source_pdf_path, local_pdf_path)
                print(f"  Using local PDF: {source_pdf_path.name}")
            elif pdf_url:
                # Create local path for the PDF and download from URL
                filename = distribution.get("fileName", f"{identifier}_{i}.pdf")
                local_pdf_path = Path(data_dir) / "pdfs" / identifier / filename
                
                print(f"  Downloading: {filename}")
                if not download_pdf(pdf_url, local_pdf_path):
                    continue  # Skip if download failed
            else:
                print(f"  No PDF source found for distribution {i}")
                continue
            
            print(f"  Extracting text with docstrange...")
            extraction_result = extract_with_docstrange(local_pdf_path)
            
            if extraction_result:
                # Save extraction result
                extraction_path = local_pdf_path.parent / f"{local_pdf_path.stem}_extraction.json"
                with open(extraction_path, 'w', encoding='utf-8') as f:
                    json.dump(extraction_result, f, ensure_ascii=False, indent=2)
                
                print(f"  Saved extraction to: {extraction_path}")
                
                # Update the distribution entry with extraction info
                distribution["extractionResult"] = {
                    "extractionPath": str(extraction_path.relative_to(Path(data_dir))),
                    "pageCount": extraction_result["page_count"],
                    "textLength": extraction_result["text_length"],
                    "extractedPreview": extraction_result["extracted_text"][:200] + "..." if len(extraction_result["extracted_text"]) > 200 else extraction_result["extracted_text"]
                }
                
                # Add additional fields if available
                if "table_count" in extraction_result:
                    distribution["extractionResult"]["tableCount"] = extraction_result["table_count"]
                if "figure_count" in extraction_result:
                    distribution["extractionResult"]["figureCount"] = extraction_result["figure_count"]
                if "fallback_method" in extraction_result:
                    distribution["extractionResult"]["method"] = extraction_result["fallback_method"]
                else:
                    distribution["extractionResult"]["method"] = "docstrange"


def process_data_file(data_file_path, output_dir):
    """Process a data file containing multiple datasets."""
    # Read the data file
    with open(data_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Processing data file with {len(data.get('dataset', []))} datasets")
    
    # Create directory for processing
    data_dir = Path(output_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Process each dataset
    for dataset in data.get("dataset", []):
        process_dataset(dataset, data_dir)
    
    # Save updated data file
    updated_file_path = data_dir / "updated_data.json"
    with open(updated_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Updated data file saved to: {updated_file_path}")
    return updated_file_path


def main():
    """Main function to run the OCR processing."""
    if len(sys.argv) < 3:
        print("Usage: python process_pdfs_with_docstrange.py <input_data_file> <output_directory>")
        sys.exit(1)
    
    input_data_file = Path(sys.argv[1])
    output_directory = Path(sys.argv[2])
    
    if not input_data_file.exists():
        print(f"Input data file does not exist: {input_data_file}")
        sys.exit(1)
    
    print(f"Starting OCR processing with docstrange...")
    print(f"Input: {input_data_file}")
    print(f"Output: {output_directory}")
    
    # Process the data file
    updated_file = process_data_file(input_data_file, output_directory)
    
    print(f"OCR processing completed. Updated file: {updated_file}")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Extract data from all PDFs using pdfplumber
"""

import os
import pdfplumber
import pandas as pd
from pathlib import Path

def extract_tables_from_pdf(pdf_path):
    """Extract tables from a PDF file using pdfplumber"""
    tables = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_tables = page.extract_tables()
                for table in page_tables:
                    if table and len(table) > 0:  # Check if table is not empty
                        tables.append(table)
    except Exception as e:
        print(f"Error extracting tables from {pdf_path}: {str(e)}")
        return []
    
    return tables

def process_pdfs():
    """Process all PDFs and extract data"""
    data_dir = Path("data")
    all_extracted_data = {}
    
    # Get all PDF files
    pdf_files = list(data_dir.rglob("*.pdf"))
    print(f"Processing {len(pdf_files)} PDF files...")
    
    for pdf_path in pdf_files:
        print(f"Processing: {pdf_path}")
        
        # Extract tables from the PDF
        tables = extract_tables_from_pdf(pdf_path)
        
        if tables:
            # Process each table found
            for i, table in enumerate(tables):
                # The first row might be the header, but if not we'll create one
                if table and len(table) > 0:
                    # If first row appears to be data rather than headers, we create generic headers
                    if any(cell and str(cell).strip().isdigit() for cell in table[0] if cell is not None):
                        # Create generic headers
                        headers = [f"Column_{j}" for j in range(len(table[0]))]
                        df = pd.DataFrame(table, columns=headers)
                    else:
                        # Use first row as headers
                        df = pd.DataFrame(table[1:], columns=table[0])
                    
                    # Create a key for this specific table in this PDF
                    table_key = f"{pdf_path.stem}_table_{i}"
                    all_extracted_data[table_key] = df
        else:
            print(f"No tables found in: {pdf_path}")
    
    return all_extracted_data

def save_extracted_data(all_extracted_data):
    """Save all extracted data to individual CSV files"""
    output_dir = Path("data/extracted_csv")
    output_dir.mkdir(exist_ok=True)
    
    print(f"Saving {len(all_extracted_data)} tables to CSV...")
    
    for table_key, df in all_extracted_data.items():
        output_file = output_dir / f"{table_key}.csv"
        df.to_csv(output_file, index=False)
        print(f"Saved: {output_file} ({len(df)} rows)")

def main():
    print("Starting PDF data extraction...")
    
    # Process all PDFs
    all_data = process_pdfs()
    
    # Save all extracted data
    save_extracted_data(all_data)
    
    print(f"Extraction completed! Processed {len(all_data)} tables from PDFs.")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Simple script to extract budget data from PDF files
"""

import pdfplumber
import json
import sys
import os

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    text_content = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    text_content.append({
                        'page': page_num + 1,
                        'text': text
                    })
                else:
                    # Try to extract table data
                    tables = page.extract_tables()
                    if tables:
                        for table_num, table in enumerate(tables):
                            text_content.append({
                                'page': page_num + 1,
                                'table': table_num + 1,
                                'table_data': table
                            })
    except Exception as e:
        print(f"Error extracting from {pdf_path}: {e}")
        return None
    
    return text_content

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract_budget_data.py <pdf_file>")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    
    if not os.path.exists(pdf_file):
        print(f"File {pdf_file} does not exist")
        sys.exit(1)
    
    print(f"Extracting data from {pdf_file}...")
    
    extracted_data = extract_text_from_pdf(pdf_file)
    
    if extracted_data:
        # Save to JSON file
        output_file = pdf_file.replace('.pdf', '_extracted.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(extracted_data, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"Data extracted and saved to {output_file}")
        
        # Print first few lines of extracted text
        for item in extracted_data[:3]:
            if 'text' in item:
                print(f"\n--- Page {item['page']} ---")
                print(item['text'][:500] + "..." if len(item['text']) > 500 else item['text'])
            elif 'table_data' in item:
                print(f"\n--- Page {item['page']}, Table {item['table']} ---")
                for row in item['table_data'][:5]:
                    print(row)
    else:
        print("No data extracted")

if __name__ == "__main__":
    main()
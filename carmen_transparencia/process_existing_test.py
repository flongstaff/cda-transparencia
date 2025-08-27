#!/usr/bin/env python3
"""
Process existing files without re-downloading them.
This script processes files that are already downloaded in data/live_scrape
and converts them to structured formats using our new processing modules.
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def process_existing_documents(input_dir, output_dir):
    """
    Process existing documents and convert them to structured formats.
    
    Args:
        input_dir (str): Directory containing original documents
        output_dir (str): Directory to save processed files
    """
    from carmen_transparencia.processing import (
        convert_table_pdf_to_csv,
        convert_docx_to_txt,
        convert_excel_to_csv,
        convert_excel_to_markdown,
        validate_document_integrity
    )
    
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Track processing results
    results = []
    processed_count = 0
    total_files = 0
    
    print(f"📁 Processing documents in {input_path}...")
    
    # Process all files in the input directory
    for file_path in input_path.iterdir():
        if not file_path.is_file():
            continue
            
        total_files += 1
        print(f"Processing {file_path.name}...")
        
        # Validate document first
        validation = validate_document_integrity(str(file_path))
        
        result = {
            "original_file": str(file_path),
            "filename": file_path.name,
            "type": file_path.suffix.lower(),
            "size": validation.get('size', 0),
            "valid": validation.get('valid', False),
            "processed_files": []
        }
        
        if not validation.get('valid', False):
            result['error'] = validation.get('error', 'Invalid or unreadable file')
            results.append(result)
            print(f"  ❌ Skipping invalid file: {validation.get('error', 'Unknown error')}")
            continue
        
        # Process based on file type
        try:
            if file_path.suffix.lower() == '.pdf':
                csv_output = output_path / (file_path.stem + '_tables.csv')
                if convert_table_pdf_to_csv(str(file_path), str(csv_output)):
                    result['processed_files'].append({
                        'type': 'csv',
                        'path': str(csv_output)
                    })
                    processed_count += 1
                    print(f"  ✅ Converted PDF to CSV: {csv_output.name}")
                else:
                    print(f"  ⚠️  No tables found in PDF")
            
            elif file_path.suffix.lower() == '.docx':
                txt_output = output_path / (file_path.stem + '.txt')
                if convert_docx_to_txt(str(file_path), str(txt_output)):
                    result['processed_files'].append({
                        'type': 'txt',
                        'path': str(txt_output)
                    })
                    processed_count += 1
                    print(f"  ✅ Converted DOCX to TXT: {txt_output.name}")
                else:
                    print(f"  ⚠️  Failed to convert DOCX")
            
            elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                csv_output = output_path / (file_path.stem + '.csv')
                md_content = convert_excel_to_markdown(str(file_path))
                
                if convert_excel_to_csv(str(file_path), str(csv_output)):
                    result['processed_files'].append({
                        'type': 'csv',
                        'path': str(csv_output)
                    })
                    print(f"  ✅ Converted Excel to CSV: {csv_output.name}")
                
                if md_content:
                    md_output = output_path / (file_path.stem + '.md')
                    with open(md_output, 'w', encoding='utf-8') as f:
                        f.write(md_content)
                    result['processed_files'].append({
                        'type': 'markdown',
                        'path': str(md_output)
                    })
                    print(f"  ✅ Converted Excel to Markdown: {md_output.name}")
                
                processed_count += 1
            
            results.append(result)
            
        except Exception as e:
            print(f"  ❌ Error processing {file_path.name}: {e}")
            result['error'] = str(e)
            results.append(result)
    
    # Write summary JSON
    summary = {
        "input_directory": str(input_path),
        "output_directory": str(output_path),
        "processed_at": datetime.now().isoformat(),
        "total_files": total_files,
        "processed_successfully": processed_count,
        "results": results
    }
    
    summary_file = output_path / "processing_summary.json"
    with open(summary_file, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2, ensure_ascii=False)
    
    print(f"\n✨ Processing complete!")
    print(f"📊 Processed {processed_count}/{total_files} files")
    print(f"📄 Summary saved to {summary_file}")
    
    return summary

def main():
    """Main function to process existing files."""
    # Define input and output directories
    input_dir = "../data/live_scrape"  # Original files
    output_dir = "../data/processed"   # Processed files
    
    print("🚀 Processing existing Carmen de Areco transparency documents...")
    print(f"📂 Input directory: {os.path.abspath(input_dir)}")
    print(f"📂 Output directory: {os.path.abspath(output_dir)}\n")
    
    try:
        summary = process_existing_documents(input_dir, output_dir)
        
        # Print a summary
        print("\n📈 Processing Summary:")
        print(f"  Total files: {summary['total_files']}")
        print(f"  Successfully processed: {summary['processed_successfully']}")
        print(f"  Success rate: {summary['processed_successfully']/summary['total_files']*100:.1f}%" if summary['total_files'] > 0 else "  Success rate: 0%")
        
        return 0
    except Exception as e:
        print(f"\n💥 Error during processing: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
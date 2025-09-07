#!/usr/bin/env python3
"""
Script to organize all PDF files by year, category, and with unique identifiers
"""

import os
import json
import hashlib
import shutil
from pathlib import Path

def calculate_file_hash(file_path):
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def organize_pdfs():
    """Organize all PDF files by year, category, and with unique identifiers"""
    
    # Base paths
    data_dir = "/Users/flong/Developer/cda-transparencia/data"
    pdf_extracts_dir = os.path.join(data_dir, "pdf_extracts")
    organized_pdfs_dir = "/Users/flong/Developer/cda-transparencia/organized_pdfs"
    
    # Load the main data index
    data_index_file = os.path.join(pdf_extracts_dir, "data_index.json")
    with open(data_index_file, 'r') as f:
        data_index = json.load(f)
    
    # Create a mapping of filenames to their metadata
    filename_mapping = {}
    if 'documents' in data_index:
        for doc in data_index['documents']:
            filename = doc.get('title', '') + '.pdf'
            filename_mapping[filename] = {
                'year': doc.get('year', ''),
                'category': doc.get('category', 'Documentos_Generales'),
                'url': doc.get('url', ''),
                'description': doc.get('description', '')
            }
    
    # Also check year-specific indexes
    for year in range(2017, 2026):
        year_index_file = os.path.join(pdf_extracts_dir, f"data_index_{year}.json")
        if os.path.exists(year_index_file):
            with open(year_index_file, 'r') as f:
                year_index = json.load(f)
            if 'documents' in year_index:
                for doc in year_index['documents']:
                    filename = doc.get('title', '') + '.pdf'
                    filename_mapping[filename] = {
                        'year': doc.get('year', year),
                        'category': doc.get('category', 'Documentos_Generales'),
                        'url': doc.get('url', ''),
                        'description': doc.get('description', '')
                    }
    
    # Track file hashes to identify duplicates
    file_hashes = {}
    organized_count = 0
    duplicate_count = 0
    unmapped_count = 0
    
    # Find all PDF files
    pdf_files = list(Path(pdf_extracts_dir).rglob("*.pdf"))
    print(f"Found {len(pdf_files)} PDF files to organize")
    
    # Process each PDF file
    for pdf_file in pdf_files:
        filename = pdf_file.name
        
        # Calculate file hash to identify duplicates
        file_hash = calculate_file_hash(pdf_file)
        
        # Check if this is a duplicate
        if file_hash in file_hashes:
            print(f"Duplicate found: {filename} (same as {file_hashes[file_hash]})")
            duplicate_count += 1
            continue
        
        # Determine year and category
        year = None
        category = "Documentos_Generales"  # default category
        
        if filename in filename_mapping:
            # Use metadata from the index
            metadata = filename_mapping[filename]
            year = metadata.get('year')
            category = metadata.get('category', 'Documentos_Generales')
        else:
            # Try to extract year from filename
            import re
            year_match = re.search(r'(20\d{2})', filename)
            if year_match:
                year = int(year_match.group(1))
            else:
                # Try specific year patterns
                for y in range(2025, 2016, -1):
                    if str(y) in filename:
                        year = y
                        break
            
            # Try to determine category from filename
            filename_upper = filename.upper()
            if 'EJECUCION' in filename_upper and 'GASTOS' in filename_upper:
                category = 'Ejecución_de_Gastos'
            elif 'EJECUCION' in filename_upper and 'RECURSOS' in filename_upper:
                category = 'Ejecución_de_Recursos'
            elif 'BALANCE' in filename_upper or ('SITUACION' in filename_upper and 'ECONOMICA' in filename_upper):
                category = 'Estados_Financieros'
            elif 'SUELDO' in filename_upper or 'ESCALA' in filename_upper:
                category = 'Recursos_Humanos'
            elif 'PRESUPUESTO' in filename_upper:
                category = 'Presupuesto_Municipal'
            elif 'LICITACION' in filename_upper:
                category = 'Contrataciones'
            elif 'DDJJ' in filename_upper or ('DECLARACION' in filename_upper and 'JURADA' in filename_upper):
                category = 'Declaraciones_Patrimoniales'
            elif 'CAIF' in filename_upper:
                category = 'Salud_Pública'
        
        # Validate year
        if year is None or not (2017 <= year <= 2025):
            # Try to get year from the data index as fallback
            if filename in filename_mapping and filename_mapping[filename].get('year'):
                year = filename_mapping[filename]['year']
            else:
                year = 2023  # default to 2023 if no year can be determined
        
        # Ensure year is in valid range
        if not (2017 <= year <= 2025):
            year = 2023
        
        # Create destination path
        dest_dir = os.path.join(organized_pdfs_dir, str(year), category)
        os.makedirs(dest_dir, exist_ok=True)
        
        # Handle files with the same name by adding hash suffix
        dest_path = os.path.join(dest_dir, filename)
        if os.path.exists(dest_path):
            # Add hash prefix to make it unique
            name_part = filename[:-4]  # Remove .pdf extension
            extension = filename[-4:]  # .pdf extension
            unique_filename = f"{name_part}_{file_hash[:8]}{extension}"
            dest_path = os.path.join(dest_dir, unique_filename)
            print(f"Name conflict resolved: {filename} -> {unique_filename}")
        
        # Copy file to organized structure
        try:
            shutil.copy2(pdf_file, dest_path)
            file_hashes[file_hash] = filename
            organized_count += 1
            print(f"Organized: {filename} -> {dest_path}")
        except Exception as e:
            print(f"Error copying {filename}: {e}")
            unmapped_count += 1
    
    # Create a summary report
    summary = {
        "total_files_processed": len(pdf_files),
        "organized_files": organized_count,
        "duplicate_files": duplicate_count,
        "unmapped_files": unmapped_count,
        "file_hashes": len(file_hashes)
    }
    
    summary_file = os.path.join(organized_pdfs_dir, "organization_summary.json")
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\nOrganization complete!")
    print(f"Total PDF files processed: {len(pdf_files)}")
    print(f"Files organized: {organized_count}")
    print(f"Duplicate files skipped: {duplicate_count}")
    print(f"Files with issues: {unmapped_count}")
    print(f"Unique files: {len(file_hashes)}")
    print(f"Summary saved to: {summary_file}")

def main():
    """Main function"""
    print("Organizing PDF files...")
    organize_pdfs()
    print("Done!")

if __name__ == "__main__":
    main()
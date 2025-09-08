#!/usr/bin/env python3
"""
Script to organize all PDF files by year, category, and with unique identifiers
"""

import os
import json
import hashlib
import shutil
import re
from pathlib import Path

def calculate_file_hash(file_path):
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def extract_year_from_filename(filename):
    """Extract year from filename"""
    # Try to extract year from filename
    year_match = re.search(r'(20\d{2})', filename)
    if year_match:
        year = int(year_match.group(1))
        if 2017 <= year <= 2025:
            return year
    
    # Try specific year patterns
    for y in range(2025, 2016, -1):
        if str(y) in filename:
            return y
    
    return None

def categorize_file(filename):
    """Categorize file based on filename"""
    filename_upper = filename.upper()
    
    if 'EJECUCION' in filename_upper and 'GASTOS' in filename_upper:
        return 'Ejecución_de_Gastos'
    elif 'EJECUCION' in filename_upper and 'RECURSOS' in filename_upper:
        return 'Ejecución_de_Recursos'
    elif 'BALANCE' in filename_upper or ('SITUACION' in filename_upper and 'ECONOMICA' in filename_upper):
        return 'Estados_Financieros'
    elif 'SUELDO' in filename_upper or 'ESCALA' in filename_upper:
        return 'Recursos_Humanos'
    elif 'PRESUPUESTO' in filename_upper:
        return 'Presupuesto_Municipal'
    elif 'LICITACION' in filename_upper:
        return 'Contrataciones'
    elif 'DDJJ' in filename_upper or ('DECLARACION' in filename_upper and 'JURADA' in filename_upper):
        return 'Declaraciones_Patrimoniales'
    elif 'CAIF' in filename_upper:
        return 'Salud_Pública'
    else:
        return 'Documentos_Generales'

def organize_pdfs():
    """Organize all PDF files by year, category, and with unique identifiers"""
    
    # Base paths
    source_pdf_dir = "/Users/flong/Developer/cda-transparencia/data/pdfs"
    organized_pdfs_dir = "/Users/flong/Developer/cda-transparencia/organized_pdfs"
    
    # Create organized_pdfs directory if it doesn't exist
    os.makedirs(organized_pdfs_dir, exist_ok=True)
    
    # Track file hashes to identify duplicates
    file_hashes = {}
    organized_count = 0
    duplicate_count = 0
    
    # Find all PDF files
    pdf_files = list(Path(source_pdf_dir).rglob("*.pdf"))
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
        year = extract_year_from_filename(filename)
        if year is None:
            year = 2023  # default to 2023 if no year can be determined
            
        category = categorize_file(filename)
        
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
    
    # Create a summary report
    summary = {
        "total_files_processed": len(pdf_files),
        "organized_files": organized_count,
        "duplicate_files": duplicate_count,
        "file_hashes": len(file_hashes)
    }
    
    summary_file = os.path.join(organized_pdfs_dir, "organization_summary.json")
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\nOrganization complete!")
    print(f"Total PDF files processed: {len(pdf_files)}")
    print(f"Files organized: {organized_count}")
    print(f"Duplicate files skipped: {duplicate_count}")
    print(f"Unique files: {len(file_hashes)}")
    print(f"Summary saved to: {summary_file}")

def main():
    """Main function"""
    print("Organizing PDF files...")
    organize_pdfs()
    print("Done!")

if __name__ == "__main__":
    main()
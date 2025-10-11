#!/usr/bin/env python3
"""
Script to organize PDF files into categorized directories based on their naming patterns.
"""

import os
import shutil
from pathlib import Path
import re

def categorize_pdf(filename):
    """Categorize a PDF based on its filename."""
    filename_lower = filename.lower()
    
    # Budget/Economy related terms
    budget_terms = [
        'ejecucion', 'gasto', 'recurso', 'balance', 'presupuesto', 
        'situacion economica', 'situacion financiera', 'cuenta ahorro',
        'estado de ejecucion', 'ejecución de gastos', 'ejecución de recursos'
    ]
    
    # Contracts/Licitations
    contract_terms = [
        'licitacion', 'contratacion', 'ordenanza', 'contract', 'licitación'
    ]
    
    # Debt
    debt_terms = [
        'deuda', 'debt'
    ]
    
    # Employment
    employment_terms = [
        'empleado', 'personal', 'sueldo', 'salario', 'empleo', 'rrhh', 'recursos humanos'
    ]
    
    # Energy
    energy_terms = [
        'energia', 'energy', 'electricidad', 'gas', 'petroleo'
    ]
    
    # Health
    health_terms = [
        'salud', 'health', 'hospital', 'medicina', 'sanidad'
    ]
    
    # Security
    security_terms = [
        'seguridad', 'security', 'policia', 'police'
    ]
    
    # Tourism
    tourism_terms = [
        'turismo', 'tourism'
    ]
    
    # Mining
    mining_terms = [
        'mineria', 'mining'
    ]
    
    # Check for matches
    for term in budget_terms:
        if term in filename_lower:
            return 'budget'
            
    for term in contract_terms:
        if term in filename_lower:
            return 'contracts'
            
    for term in debt_terms:
        if term in filename_lower:
            return 'debt'
            
    for term in employment_terms:
        if term in filename_lower:
            return 'employment'
            
    for term in energy_terms:
        if term in filename_lower:
            return 'energy'
            
    for term in health_terms:
        if term in filename_lower:
            return 'health'
            
    for term in security_terms:
        if term in filename_lower:
            return 'security'
            
    for term in tourism_terms:
        if term in filename_lower:
            return 'tourism'
            
    for term in mining_terms:
        if term in filename_lower:
            return 'mining'
    
    # Default category
    return 'other'

def organize_pdfs(source_dir, dest_dir):
    """Move PDFs from source directory to organized destination directories."""
    moved_count = 0
    source_path = Path(source_dir)
    dest_path = Path(dest_dir)
    
    # Iterate through all PDF files in the source directory
    for pdf_file in source_path.rglob('*.pdf'):
        # Skip if already in the destination directory
        if str(pdf_file).startswith(str(dest_path)):
            continue
            
        # Categorize the file
        category = categorize_pdf(pdf_file.name)
        
        # Create destination path
        dest_category_path = dest_path / category
        dest_category_path.mkdir(exist_ok=True)
        
        # Move file
        dest_file_path = dest_category_path / pdf_file.name
        
        # Handle name conflicts by adding a number suffix
        counter = 1
        original_dest_file_path = dest_file_path
        while dest_file_path.exists():
            name_without_ext = original_dest_file_path.stem
            ext = original_dest_file_path.suffix
            dest_file_path = dest_category_path / f"{name_without_ext}_{counter}{ext}"
            counter += 1
        
        try:
            shutil.move(str(pdf_file), str(dest_file_path))
            print(f"Moved: {pdf_file} -> {dest_file_path}")
            moved_count += 1
        except Exception as e:
            print(f"Error moving {pdf_file}: {e}")
    
    return moved_count

def main():
    source_directory = "/Users/flong/Developer/cda-transparencia"
    destination_directory = "/Users/flong/Developer/cda-transparencia/data/organized_pdfs"
    
    print("Organizing PDF files into categorized directories...")
    moved_count = organize_pdfs(source_directory, destination_directory)
    print(f"\n--- Summary ---")
    print(f"Total PDFs moved: {moved_count}")
    
    # Show the organized structure
    print("\nOrganized directory structure:")
    for category in os.listdir(destination_directory):
        category_path = Path(destination_directory) / category
        if category_path.is_dir():
            pdf_count = len([f for f in category_path.iterdir() if f.suffix.lower() == '.pdf'])
            print(f"  {category}: {pdf_count} PDFs")

if __name__ == "__main__":
    main()
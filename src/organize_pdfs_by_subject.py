#!/usr/bin/env python3
# Script to organize all PDFs into a better folder structure based on categories and subjects

import os
import shutil
from pathlib import Path
import re
from collections import defaultdict

def categorize_pdf(filename):
    # Categorize PDF based on filename keywords
    filename_lower = filename.lower()
    
    # Financial Reports
    if any(keyword in filename_lower for keyword in ['ejecucion', 'recurso']):
        if 'gasto' in filename_lower:
            return "Ejecución de Gastos"
        elif 'recurso' in filename_lower:
            return "Ejecución de Recursos"
        else:
            return "Informes Financieros"
    
    # Budget Documents
    elif any(keyword in filename_lower for keyword in ['presupuesto', 'budget']):
        return "Presupuestos"
    
    # Health Statistics
    elif any(keyword in filename_lower for keyword in ['salud', 'caif', 'hospital']):
        return "Estadísticas de Salud"
    
    # Personnel/Human Resources
    elif any(keyword in filename_lower for keyword in ['personal', 'salario', 'sueldo', 'empleado']):
        return "Recursos Humanos"
    
    # Public Works/Infrastructure
    elif any(keyword in filename_lower for keyword in ['obra', 'construccion', 'infraestructura', 'paviment']):
        return "Obras Públicas"
    
    # Contracts/Licitaions
    elif any(keyword in filename_lower for keyword in ['licitacion', 'contrato', 'adjudicacion']):
        return "Contrataciones"
    
    # Declarations
    elif any(keyword in filename_lower for keyword in ['declaracion', 'patrimonial', 'jurada']):
        return "Declaraciones Patrimoniales"
    
    # General Documents
    elif any(keyword in filename_lower for keyword in ['informe', 'reporte']):
        return "Informes Generales"
    
    # Municipal Governance
    elif any(keyword in filename_lower for keyword in ['ordenanza', 'decreto', 'resolucion']):
        return "Normativa Municipal"
    
    # Economic Reports
    elif any(keyword in filename_lower for keyword in ['economico', 'financiero', 'situacion']):
        return "Informes Económicos"
    
    # Default category
    else:
        return "Documentos Generales"

def extract_year(filename):
    # Extract year from filename
    # Look for 4-digit years
    year_match = re.search(r'(20\d{2})', filename)
    if year_match:
        return year_match.group(1)
    
    # Look for fiscal year patterns like 2022-4°TRE
    fy_match = re.search(r'(20\d{2})-(\d)[°]?[Tt][Rr]', filename)
    if fy_match:
        return fy_match.group(1)
    
    # Look for trimester/year patterns
    tri_match = re.search(r'[Tt]rimestre.*?(20\d{2})', filename)
    if tri_match:
        return tri_match.group(1)
    
    return "Sin Año"

def organize_pdfs():
    # Organize all PDFs into better folder structure
    project_root = Path("/Users/flong/Developer/cda-transparencia")
    
    # Source directories where PDFs are located
    source_dirs = [
        project_root / "frontend" / "dist" / "data" / "organized_pdfs",
        project_root / "frontend" / "dist" / "data" / "local",
        project_root / "frontend" / "dist" / "data" / "pdfs"
    ]
    
    # Destination directory
    dest_dir = project_root / "frontend" / "dist" / "data" / "organized_by_subject"
    
    # Create destination directory
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # Track organized files to avoid duplicates
    organized_files = {}
    stats = defaultdict(int)
    
    print("Organizing PDFs into subject-based folders...")
    
    # Process each source directory
    for source_dir in source_dirs:
        if not source_dir.exists():
            print(f"Warning: Source directory {source_dir} does not exist")
            continue
            
        print(f"Processing {source_dir}...")
        
        # Find all PDFs in this directory
        for pdf_path in source_dir.rglob("*.pdf"):
            filename = pdf_path.name
            
            # Skip if already organized this file
            if filename in organized_files:
                stats['duplicates_skipped'] += 1
                continue
            
            # Categorize and extract year
            category = categorize_pdf(filename)
            year = extract_year(filename)
            
            # Create destination path
            category_dir = dest_dir / year / category
            category_dir.mkdir(parents=True, exist_ok=True)
            
            dest_path = category_dir / filename
            
            # Copy file if it doesn't already exist
            if not dest_path.exists():
                try:
                    shutil.copy2(pdf_path, dest_path)
                    organized_files[filename] = str(dest_path.relative_to(project_root))
                    stats['files_copied'] += 1
                    stats[f'category_{category.replace(" ", "_")}'] += 1
                    print(f"  Copied: {filename} -> {dest_path.relative_to(dest_dir)}")
                except Exception as e:
                    print(f"  Error copying {filename}: {e}")
                    stats['copy_errors'] += 1
            else:
                stats['duplicates_skipped'] += 1
                print(f"  Skipped (already exists): {filename}")
    
    # Print summary
    print(f"\nOrganization complete!")
    print(f"Files copied: {stats['files_copied']}")
    print(f"Duplicates skipped: {stats['duplicates_skipped']}")
    print(f"Copy errors: {stats['copy_errors']}")
    
    # Print category breakdown
    print("\nCategory breakdown:")
    for key, count in stats.items():
        if key.startswith('category_'):
            category_name = key.replace('category_', '').replace('_', ' ')
            print(f"  {category_name}: {count}")
    
    # Create a summary file
    summary_file = dest_dir / "organization_summary.txt"
    with open(summary_file, 'w') as f:
        f.write("PDF Organization Summary\n")
        f.write("======================\n\n")
        f.write(f"Total files organized: {stats['files_copied']}\n")
        f.write(f"Duplicates skipped: {stats['duplicates_skipped']}\n")
        f.write(f"Copy errors: {stats['copy_errors']}\n\n")
        f.write("Categories:\n")
        for key, count in stats.items():
            if key.startswith('category_'):
                category_name = key.replace('category_', '').replace('_', ' ')
                f.write(f"  {category_name}: {count}\n")
        f.write(f"\nGenerated on: {Path(__file__).name}\n")
    
    print(f"\nSummary written to: {summary_file}")
    
    return organized_files

if __name__ == "__main__":
    organized_files = organize_pdfs()
    print(f"\nSuccessfully organized {len(organized_files)} unique PDF files!")
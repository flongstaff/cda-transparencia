#!/usr/bin/env python3
"""
Fix script to ensure symlinks are properly created in the by_category and by_year directories
"""

import os
import shutil
from pathlib import Path

def create_symlinks():
    """Create symlinks from the organized directories to the originals"""
    project_root = Path("/Users/flong/Developer/cda-transparencia")
    central_pdfs_dir = project_root / "central_pdfs"
    originals_dir = central_pdfs_dir / "originals"
    
    # Define organized directories
    by_category_dir = central_pdfs_dir / "by_category"
    by_year_dir = central_pdfs_dir / "by_year"
    
    # Create category mappings
    category_mapping = {
        'ejecucion_gastos': ['gastos', 'ejecucion.*gastos', 'estado.*gastos', 'presupuesto.*ejecucion'],
        'ejecucion_recursos': ['recursos', 'ejecucion.*recursos', 'estado.*recursos', 'presupuesto.*recursos'],
        'situacion_economica': ['situacion', 'economica', 'financiera', 'balance'],
        'contrataciones': ['licitacion', 'contratacion', 'contrato', 'compra', 'adquisicion'],
        'estadisticas_salud': ['salud', 'caif', 'caps', 'estadisticas.*salud'],
        'recursos_humanos': ['personal', 'administracion.*personal', 'recursos.*humanos', 'empleados'],
        'documentos_generales': ['boletin', 'ordenanza', 'resolucion', 'decreto', 'documento'],
        'seguridad': ['seguridad', 'policia', 'police'],
        'turismo': ['turismo', 'tourism'],
        'mineria': ['mineria', 'mining'],
        'energy': ['energia', 'energy', 'electricidad', 'gas', 'petroleo'],
        'otros': []
    }
    
    # Create reverse mapping for categories
    reverse_mapping = {}
    for category, patterns in category_mapping.items():
        for pattern in patterns:
            reverse_mapping[pattern] = category
    
    # Process each file in originals
    for pdf_file in originals_dir.glob("*.pdf"):
        filename = pdf_file.name
        filename_lower = filename.lower()
        
        # Determine category
        category = 'otros'  # default
        for pattern, cat in reverse_mapping.items():
            if pattern in filename_lower:
                category = cat
                break
        
        # Extract year
        import re
        year_match = re.search(r'(19|20)\d{2}', filename)
        year = year_match.group(0) if year_match else 'unknown'
        
        # Create category directory and symlink
        category_dir = by_category_dir / category
        category_dir.mkdir(exist_ok=True)
        category_link = category_dir / filename
        if category_link.exists():
            category_link.unlink()
        try:
            category_link.symlink_to(pdf_file)
            print(f"Created symlink: {category_link} -> {pdf_file}")
        except OSError as e:
            print(f"Failed to create symlink for {filename} in category: {e}")
            # Copy instead
            shutil.copy2(pdf_file, category_link)
        
        # Create year directory and symlink
        year_dir = by_year_dir / year
        year_dir.mkdir(exist_ok=True)
        year_link = year_dir / filename
        if year_link.exists():
            year_link.unlink()
        try:
            year_link.symlink_to(pdf_file)
            print(f"Created symlink: {year_link} -> {pdf_file}")
        except OSError as e:
            print(f"Failed to create symlink for {filename} in year: {e}")
            # Copy instead
            shutil.copy2(pdf_file, year_link)

if __name__ == "__main__":
    create_symlinks()
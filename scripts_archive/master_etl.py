#!/usr/bin/env python3
"""
Master ETL Script for Processing All Source Materials

This script processes all files in the source_materials directory:
- PDF files for declarations, salaries, etc.
- Excel files for debt, financial reports, etc.
- Other file types are catalogued but not processed

The script identifies file types and routes them to appropriate processors.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
import hashlib

def get_file_hash(file_path):
    """Calculate SHA256 hash of a file"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def identify_file_category(file_path):
    """Identify the category of a file based on its name and path"""
    filename = os.path.basename(file_path).lower()
    parent_dir = os.path.basename(os.path.dirname(file_path)).lower()
    
    # Debt files
    if any(keyword in filename for keyword in ['stock-de-deuda', 'deuda-y-perfil']):
        return 'municipal_debt'
    
    # Salary files
    if any(keyword in filename for keyword in ['salario', 'escalafon', 'remuneracion']):
        return 'salaries'
    
    # Declaration files
    if any(keyword in filename for keyword in ['ddjj', 'declaracion']):
        return 'declarations'
    
    # Financial reports
    if any(keyword in filename for keyword in ['modulo-fiscal', 'informe', 'estado-de-ejecucion']):
        return 'financial_reports'
    
    # Public tenders
    if any(keyword in filename for keyword in ['licitacion', 'concurso', 'compra']):
        return 'public_tenders'
    
    # Fees and rights
    if any(keyword in filename for keyword in ['impositiva', 'arancel', 'derecho']):
        return 'fees_rights'
    
    # Operational expenses
    if any(keyword in filename for keyword in ['gasto', 'ejecucion', 'presupuesto']):
        return 'operational_expenses'
    
    # Investments and assets
    if any(keyword in filename for keyword in ['inversion', 'activo', 'patrimonio']):
        return 'investments_assets'
    
    # Default categories based on directory
    if parent_dir in ['declarations', 'declaraciones']:
        return 'declarations'
    elif parent_dir in ['salaries', 'salarios']:
        return 'salaries'
    elif parent_dir in ['debt', 'deuda']:
        return 'municipal_debt'
    elif parent_dir in ['reports', 'informes']:
        return 'financial_reports'
    elif parent_dir in ['tenders', 'licitaciones']:
        return 'public_tenders'
    
    return 'unknown'

def extract_year_from_path(file_path):
    """Extract year from file path or filename"""
    # Try to extract year from directory name
    path_parts = file_path.split(os.sep)
    for part in path_parts:
        if part.isdigit() and 2000 <= int(part) <= 2030:
            return int(part)
    
    # Try to extract year from filename
    filename = os.path.basename(file_path)
    for i in range(2000, 2031):
        if str(i) in filename:
            return i
    
    # Default to current year
    return datetime.now().year

def process_debt_excel_file(file_path, year):
    """Process municipal debt Excel files"""
    print(f"Processing municipal debt Excel file: {file_path}")
    
    # Add the project root to sys.path
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_path = os.path.join(project_root, 'backend', 'src', 'etl_scripts')
    sys.path.insert(0, backend_path)
    
    try:
        # Import the processor
        import extract_municipal_debt
        extracted_data = extract_municipal_debt.extract_debt_from_excel(file_path)
        if extracted_data:
            transformed_data = extract_municipal_debt.transform_debt_data(extracted_data, year)
            extract_municipal_debt.load_debt_to_db(transformed_data)
            return True, f"Processed {len(transformed_data)} debt records"
        else:
            return False, "No debt data extracted"
    except Exception as e:
        import traceback
        traceback.print_exc()
        return False, f"Error processing debt: {e}"

def create_file_registry(source_dir, output_file):
    """Create a registry of all files with their metadata"""
    registry = []
    
    for root, dirs, files in os.walk(source_dir):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        for file in files:
            if file.startswith('.'):
                continue
                
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, source_dir)
            
            # Get file metadata
            stat = os.stat(file_path)
            file_size = stat.st_size
            modified_time = datetime.fromtimestamp(stat.st_mtime).isoformat()
            
            # Get file hash
            file_hash = get_file_hash(file_path)
            
            # Identify category and year
            category = identify_file_category(file_path)
            year = extract_year_from_path(file_path)
            
            # Get file extension
            file_ext = os.path.splitext(file)[1].lower()
            
            registry_entry = {
                'filename': file,
                'relative_path': relative_path,
                'full_path': file_path,
                'size': file_size,
                'modified': modified_time,
                'hash': file_hash,
                'extension': file_ext,
                'category': category,
                'year': year,
                'processed': False,
                'processing_result': None
            }
            
            registry.append(registry_entry)
    
    # Save registry to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)
    
    return registry

def main():
    if len(sys.argv) < 2:
        print("Usage: python master_etl.py <source_materials_directory> [output_registry_file]")
        print("Example: python master_etl.py data/source_materials data/file_registry.json")
        sys.exit(1)
    
    source_dir = sys.argv[1]
    output_registry = sys.argv[2] if len(sys.argv) > 2 else "data/file_registry.json"
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_registry), exist_ok=True)
    
    print(f"Creating file registry for: {source_dir}")
    registry = create_file_registry(source_dir, output_registry)
    print(f"Registry created with {len(registry)} files")
    
    # Process files by type
    processed_count = 0
    pdf_count = 0
    excel_count = 0
    
    for entry in registry:
        file_path = entry['full_path']
        file_ext = entry['extension']
        category = entry['category']
        year = entry['year']
        
        try:
            if file_ext == '.pdf':
                pdf_count += 1
                # PDF processing would go here
                entry['processed'] = False
                entry['processing_result'] = "PDF processing not implemented in this version"
                print(f"PDF Result: PDF processing not implemented")
                
            elif file_ext in ['.xlsx', '.xls']:
                excel_count += 1
                success = False
                message = "No processor available"
                
                if category == 'municipal_debt':
                    success, message = process_debt_excel_file(file_path, year)
                
                entry['processed'] = success
                entry['processing_result'] = message
                if success:
                    processed_count += 1
                print(f"Excel Result: {message}")
                
        except Exception as e:
            entry['processed'] = False
            entry['processing_result'] = f"Error: {e}"
            print(f"Error processing {file_path}: {e}")
    
    # Update registry with processing results
    with open(output_registry, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)
    
    print(f"\n--- Processing Summary ---")
    print(f"Total files in registry: {len(registry)}")
    print(f"PDF files: {pdf_count}")
    print(f"Excel files: {excel_count}")
    print(f"Successfully processed: {processed_count}")
    print(f"Registry saved to: {output_registry}")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Script to organize all documents by year, category, and file type
"""

import os
import json
import shutil
from pathlib import Path
import re

# Define the base paths
BASE_DIR = "/Users/flong/Developer/cda-transparencia"
DATA_DIR = os.path.join(BASE_DIR, "data")
ORGANIZED_DIR = os.path.join(BASE_DIR, "organized_documents")
PDF_EXTRACTS_DIR = os.path.join(DATA_DIR, "pdf_extracts")
MARKDOWN_DIR = os.path.join(DATA_DIR, "markdown_documents")
PRESERVED_DIR = os.path.join(DATA_DIR, "preserved")

# Category mapping to standardize names
CATEGORY_MAPPING = {
    "Ejecución de Gastos": "Ejecución_de_Gastos",
    "Ejecucion de Gastos": "Ejecución_de_Gastos",
    "Ejecución de Recursos": "Ejecución_de_Recursos",
    "Ejecucion de Recursos": "Ejecución_de_Recursos",
    "Estados Financieros": "Estados_Financieros",
    "Presupuesto Municipal": "Presupuesto_Municipal",
    "Recursos Humanos": "Recursos_Humanos",
    "Contrataciones": "Contrataciones",
    "Declaraciones Patrimoniales": "Declaraciones_Patrimoniales",
    "Salud Pública": "Salud_Pública",
    "Documentos Generales": "Documentos_Generales"
}

def extract_year_from_filename(filename):
    """Extract year from filename"""
    # Look for 4-digit year patterns
    year_match = re.search(r'(20\d{2})', filename)
    if year_match:
        return int(year_match.group(1))
    
    # Special cases for files that might have year in a different format
    if '2025' in filename:
        return 2025
    elif '2024' in filename:
        return 2024
    elif '2023' in filename:
        return 2023
    elif '2022' in filename:
        return 2022
    elif '2021' in filename:
        return 2021
    elif '2020' in filename:
        return 2020
    elif '2019' in filename:
        return 2019
    elif '2018' in filename:
        return 2018
    elif '2017' in filename:
        return 2017
    
    return None

def get_category_from_title(title):
    """Determine category based on document title"""
    title_upper = title.upper()
    
    if 'EJECUCION' in title_upper and 'GASTOS' in title_upper:
        return 'Ejecución_de_Gastos'
    elif 'EJECUCION' in title_upper and 'RECURSOS' in title_upper:
        return 'Ejecución_de_Recursos'
    elif 'BALANCE' in title_upper or 'SITUACION' in title_upper and 'ECONOMICA' in title_upper:
        return 'Estados_Financieros'
    elif 'SUELDO' in title_upper or 'ESCALA' in title_upper:
        return 'Recursos_Humanos'
    elif 'PRESUPUESTO' in title_upper:
        return 'Presupuesto_Municipal'
    elif 'LICITACION' in title_upper:
        return 'Contrataciones'
    elif 'DDJJ' in title_upper or 'DECLARACION' in title_upper and 'JURADA' in title_upper:
        return 'Declaraciones_Patrimoniales'
    elif 'CAIF' in title_upper:
        return 'Salud_Pública'
    else:
        return 'Documentos_Generales'

def organize_from_data_indexes():
    """Organize files based on the data index JSON files"""
    print("Organizing files from data indexes...")
    
    # Process each year's index file
    for year in range(2017, 2026):
        index_file = os.path.join(PDF_EXTRACTS_DIR, f"data_index_{year}.json")
        if os.path.exists(index_file):
            print(f"Processing {index_file}...")
            with open(index_file, 'r') as f:
                data = json.load(f)
            
            # Process documents in this year's index
            if 'categories' in data:
                for category, documents in data['categories'].items():
                    standardized_category = CATEGORY_MAPPING.get(category, category.replace(' ', '_'))
                    for doc in documents:
                        # Handle PDF files
                        if 'url' in doc and doc['url'].endswith('.pdf'):
                            filename = os.path.basename(doc['url'])
                            source_path = os.path.join(MARKDOWN_DIR, str(year), filename.replace('.pdf', '.md'))
                            if os.path.exists(source_path):
                                dest_path = os.path.join(ORGANIZED_DIR, str(year), standardized_category, 'markdown', filename.replace('.pdf', '.md'))
                                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                                shutil.copy2(source_path, dest_path)
                                print(f"Copied {source_path} to {dest_path}")
                        
                        # Handle JSON files
                        json_filename = doc['title'].replace('.pdf', '.json') + '.json'
                        source_json_path = os.path.join(PRESERVED_DIR, 'json', json_filename)
                        if os.path.exists(source_json_path):
                            dest_json_path = os.path.join(ORGANIZED_DIR, str(year), standardized_category, 'json', json_filename)
                            os.makedirs(os.path.dirname(dest_json_path), exist_ok=True)
                            shutil.copy2(source_json_path, dest_json_path)
                            print(f"Copied {source_json_path} to {dest_json_path}")

def organize_markdown_files():
    """Organize markdown files by year and category"""
    print("Organizing markdown files...")
    
    # Process each year's markdown directory
    for year in range(2017, 2026):
        year_md_dir = os.path.join(MARKDOWN_DIR, str(year))
        if os.path.exists(year_md_dir):
            print(f"Processing markdown files for {year}...")
            for filename in os.listdir(year_md_dir):
                if filename.endswith('.md'):
                    # Determine category from filename
                    category = get_category_from_title(filename.replace('.md', ''))
                    
                    # Copy file to organized structure
                    source_path = os.path.join(year_md_dir, filename)
                    dest_path = os.path.join(ORGANIZED_DIR, str(year), category, 'markdown', filename)
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    shutil.copy2(source_path, dest_path)
                    print(f"Copied {source_path} to {dest_path}")

def organize_json_files():
    """Organize JSON files by year and category"""
    print("Organizing JSON files...")
    
    json_dir = os.path.join(PRESERVED_DIR, 'json')
    if os.path.exists(json_dir):
        print("Processing JSON files...")
        for filename in os.listdir(json_dir):
            if filename.endswith('.json'):
                # Extract year from filename
                year = extract_year_from_filename(filename)
                if year:
                    # Determine category from filename
                    category = get_category_from_title(filename.replace('.json', ''))
                    
                    # Copy file to organized structure
                    source_path = os.path.join(json_dir, filename)
                    dest_path = os.path.join(ORGANIZED_DIR, str(year), category, 'json', filename)
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    shutil.copy2(source_path, dest_path)
                    print(f"Copied {source_path} to {dest_path}")

def create_summary_report():
    """Create a summary report of organized files"""
    print("Creating summary report...")
    
    summary = {
        "total_files": 0,
        "by_year": {},
        "by_category": {},
        "by_file_type": {}
    }
    
    for root, dirs, files in os.walk(ORGANIZED_DIR):
        if files:
            # Extract year, category, and file type from path
            path_parts = root.split(os.sep)
            if len(path_parts) >= 3:
                year = path_parts[-3]
                category = path_parts[-2]
                file_type = path_parts[-1]
                
                file_count = len(files)
                summary["total_files"] += file_count
                
                # Update year count
                if year not in summary["by_year"]:
                    summary["by_year"][year] = 0
                summary["by_year"][year] += file_count
                
                # Update category count
                if category not in summary["by_category"]:
                    summary["by_category"][category] = 0
                summary["by_category"][category] += file_count
                
                # Update file type count
                if file_type not in summary["by_file_type"]:
                    summary["by_file_type"][file_type] = 0
                summary["by_file_type"][file_type] += file_count
    
    # Write summary to file
    summary_file = os.path.join(ORGANIZED_DIR, "organization_summary.json")
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"Summary report created at {summary_file}")
    print(f"Total files organized: {summary['total_files']}")

def main():
    """Main function to organize all documents"""
    print("Starting document organization process...")
    
    # Create organized directory structure if it doesn't exist
    os.makedirs(ORGANIZED_DIR, exist_ok=True)
    
    # Organize files from different sources
    organize_from_data_indexes()
    organize_markdown_files()
    organize_json_files()
    
    # Create summary report
    create_summary_report()
    
    print("Document organization process completed!")

if __name__ == "__main__":
    main()
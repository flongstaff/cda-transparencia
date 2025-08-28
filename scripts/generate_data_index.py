#!/usr/bin/env python3
"""
Data Index Generator for Carmen de Areco Transparency Portal
Organizes all available documents by year and type for the frontend
"""

import json
import os
from pathlib import Path
from collections import defaultdict
import re

def extract_year_from_filename(filename):
    """Extract year from filename"""
    year_match = re.search(r'(20\d{2})', filename)
    return int(year_match.group(1)) if year_match else None

def categorize_document(filename):
    """Categorize document by filename"""
    upper = filename.upper()
    
    if 'EJECUCION' in upper and 'GASTOS' in upper:
        return 'Ejecución de Gastos'
    elif 'EJECUCION' in upper and 'RECURSOS' in upper:
        return 'Ejecución de Recursos'
    elif 'BALANCE' in upper:
        return 'Estados Financieros'
    elif 'SITUACION' in upper and 'ECONOMICA' in upper:
        return 'Estados Financieros'
    elif 'ESCALA' in upper or 'SUELDO' in upper:
        return 'Recursos Humanos'
    elif 'PRESUPUESTO' in upper:
        return 'Presupuesto Municipal'
    elif 'LICITACION' in upper:
        return 'Contrataciones'
    elif 'DDJJ' in upper:
        return 'Declaraciones Patrimoniales'
    elif 'CAIF' in upper:
        return 'Salud Pública'
    elif 'STOCK' in upper and 'DEUDA' in upper:
        return 'Deuda Pública'
    else:
        return 'Documentos Generales'

def generate_data_index():
    """Generate comprehensive data index"""
    
    # Load data from various sources
    data_index = {
        'metadata': {
            'generated_at': '2025-08-28',
            'total_documents': 0,
            'years_covered': [],
            'categories': []
        },
        'by_year': defaultdict(list),
        'by_category': defaultdict(list),
        'documents': []
    }
    
    # 1. Load from bora_scrape data
    bora_file = Path('/Users/flong/Developer/cda-transparencia/data/bora_scrape/bora_scrape_20250827_204647.json')
    if bora_file.exists():
        with open(bora_file, 'r') as f:
            bora_data = json.load(f)
            
        for doc in bora_data.get('municipal_documents', []):
            year = extract_year_from_filename(doc.get('url', ''))
            if not year:
                continue
                
            category = categorize_document(doc.get('title', ''))
            
            document = {
                'id': f"bora-{len(data_index['documents'])}",
                'title': doc.get('title', ''),
                'url': doc.get('url', ''),
                'year': year,
                'category': category,
                'source': 'Municipal Website',
                'type': 'PDF',
                'description': f"Documento oficial del municipio de Carmen de Areco - {category}",
                'official_url': doc.get('url', ''),
                'size_mb': 0.5,  # Placeholder
                'last_modified': doc.get('extracted_at', '')
            }
            
            data_index['documents'].append(document)
            data_index['by_year'][year].append(document)
            data_index['by_category'][category].append(document)
    
    # 2. Load from quick_download data
    quick_download_dir = Path('/Users/flong/Developer/cda-transparencia/data/quick_download/')
    if quick_download_dir.exists():
        for file_path in quick_download_dir.glob('*.pdf'):
            filename = file_path.name
            year = extract_year_from_filename(filename)
            if not year:
                # Try to extract year from the filename pattern
                if '2024' in filename:
                    year = 2024
                elif '2023' in filename:
                    year = 2023
                elif '2022' in filename:
                    year = 2022
                elif '2021' in filename:
                    year = 2021
                elif '2020' in filename:
                    year = 2020
                elif '2019' in filename:
                    year = 2019
                else:
                    continue
                    
            category = categorize_document(filename)
            
            document = {
                'id': f"quick-{len(data_index['documents'])}",
                'title': filename.replace('.pdf', '').replace('-', ' '),
                'url': f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}",
                'year': year,
                'category': category,
                'source': 'Quick Download',
                'type': 'PDF',
                'description': f"Documento financiero del municipio de Carmen de Areco - {category}",
                'official_url': f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}",
                'size_mb': round(file_path.stat().st_size / (1024 * 1024), 2),
                'last_modified': ''
            }
            
            data_index['documents'].append(document)
            data_index['by_year'][year].append(document)
            data_index['by_category'][category].append(document)
    
    # 3. Load from live_scrape data
    live_scrape_dir = Path('/Users/flong/Developer/cda-transparencia/data/live_scrape/')
    if live_scrape_dir.exists():
        for file_path in live_scrape_dir.glob('*.pdf'):
            filename = file_path.name
            year = extract_year_from_filename(filename)
            if not year:
                # Try to extract year from the filename pattern
                years_in_filename = re.findall(r'(20\d{2})', filename)
                if years_in_filename:
                    year = int(years_in_filename[0])
                else:
                    continue
                    
            category = categorize_document(filename)
            
            document = {
                'id': f"live-{len(data_index['documents'])}",
                'title': filename.replace('.pdf', '').replace('-', ' '),
                'url': f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}",
                'year': year,
                'category': category,
                'source': 'Live Scrape',
                'type': 'PDF',
                'description': f"Documento municipal de Carmen de Areco - {category}",
                'official_url': f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}",
                'size_mb': round(file_path.stat().st_size / (1024 * 1024), 2),
                'last_modified': ''
            }
            
            data_index['documents'].append(document)
            data_index['by_year'][year].append(document)
            data_index['by_category'][category].append(document)
    
    # Convert defaultdict to regular dict and sort
    data_index['by_year'] = dict(data_index['by_year'])
    data_index['by_category'] = dict(data_index['by_category'])
    
    # Sort years and categories
    data_index['metadata']['years_covered'] = sorted(data_index['by_year'].keys())
    data_index['metadata']['categories'] = sorted(data_index['by_category'].keys())
    data_index['metadata']['total_documents'] = len(data_index['documents'])
    
    # Sort documents within each year and category
    for year in data_index['by_year']:
        data_index['by_year'][year].sort(key=lambda x: x['title'])
    
    for category in data_index['by_category']:
        data_index['by_category'][category].sort(key=lambda x: x['year'], reverse=True)
    
    # Sort main documents list by year and title
    data_index['documents'].sort(key=lambda x: (x['year'], x['title']), reverse=True)
    
    return data_index

def save_data_index(data_index):
    """Save data index to files"""
    
    # Save main index
    output_dir = Path('/Users/flong/Developer/cda-transparencia/data/organized_data/')
    output_dir.mkdir(exist_ok=True)
    
    # Save as JSON
    with open(output_dir / 'data_index.json', 'w') as f:
        json.dump(data_index, f, indent=2, default=str)
    
    # Save yearly indexes
    for year, documents in data_index['by_year'].items():
        yearly_data = {
            'year': year,
            'total_documents': len(documents),
            'categories': {},
            'documents': documents
        }
        
        # Group by category for this year
        for doc in documents:
            category = doc['category']
            if category not in yearly_data['categories']:
                yearly_data['categories'][category] = []
            yearly_data['categories'][category].append(doc)
        
        with open(output_dir / f'data_index_{year}.json', 'w') as f:
            json.dump(yearly_data, f, indent=2, default=str)
    
    # Save category indexes
    for category, documents in data_index['by_category'].items():
        # Sanitize category name for filename
        safe_category = re.sub(r'[^\w\s-]', '', category).strip().replace(' ', '_')
        category_data = {
            'category': category,
            'total_documents': len(documents),
            'years': {},
            'documents': documents
        }
        
        # Group by year for this category
        for doc in documents:
            year = doc['year']
            if year not in category_data['years']:
                category_data['years'][year] = []
            category_data['years'][year].append(doc)
        
        with open(output_dir / f'data_index_{safe_category}.json', 'w') as f:
            json.dump(category_data, f, indent=2, default=str)
    
    print(f"Data index generated successfully!")
    print(f"Total documents: {data_index['metadata']['total_documents']}")
    print(f"Years covered: {data_index['metadata']['years_covered']}")
    print(f"Categories: {data_index['metadata']['categories']}")

def main():
    """Main function"""
    print("Generating comprehensive data index...")
    data_index = generate_data_index()
    save_data_index(data_index)
    print("Done!")

if __name__ == "__main__":
    main()
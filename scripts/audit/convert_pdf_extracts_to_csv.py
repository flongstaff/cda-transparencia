#!/usr/bin/env python3
"""
Convert PDF extract data to CSV/TSV format for easier data consumption
Carmen de Areco Transparency Portal Data Converter

This script processes JSON files from PDF extracts and converts them to CSV/TSV format
to make the data more accessible for the web frontend and data analysis.
"""

import json
import csv
import os
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd

class DataConverter:
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.pdf_extracts_dir = self.data_dir / "pdf_extracts"
        self.csv_output_dir = self.data_dir / "csv_exports"
        self.tsv_output_dir = self.data_dir / "tsv_exports"
        
        # Create output directories
        self.csv_output_dir.mkdir(exist_ok=True)
        self.tsv_output_dir.mkdir(exist_ok=True)
        
    def load_json_data(self, file_path):
        """Load JSON data from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            return None
    
    def convert_main_index_to_csv(self):
        """Convert main data_index.json to CSV/TSV"""
        main_index_file = self.pdf_extracts_dir / "data_index.json"
        if not main_index_file.exists():
            print(f"Main index file not found: {main_index_file}")
            return
        
        data = self.load_json_data(main_index_file)
        if not data:
            return
        
        # Extract all documents from all years
        all_documents = []
        
        if 'by_year' in data:
            for year, documents in data['by_year'].items():
                for doc in documents:
                    doc['year'] = year
                    all_documents.append(doc)
        
        if 'by_category' in data:
            for category, documents in data['by_category'].items():
                for doc in documents:
                    doc['category'] = category
                    all_documents.append(doc)
        
        if all_documents:
            # Convert to CSV
            csv_file = self.csv_output_dir / "all_documents.csv"
            df = pd.DataFrame(all_documents)
            df.to_csv(csv_file, index=False)
            print(f"✅ Created {csv_file} with {len(all_documents)} documents")
            
            # Convert to TSV
            tsv_file = self.tsv_output_dir / "all_documents.tsv"
            df.to_csv(tsv_file, sep='\t', index=False)
            print(f"✅ Created {tsv_file} with {len(all_documents)} documents")
    
    def convert_year_indices_to_csv(self):
        """Convert individual year index files to CSV/TSV"""
        year_files = list(self.pdf_extracts_dir.glob("data_index_20*.json"))
        
        for year_file in year_files:
            year = year_file.stem.replace('data_index_', '')
            data = self.load_json_data(year_file)
            
            if not data or 'documents' not in data:
                continue
            
            documents = data['documents']
            if documents:
                # Convert to CSV
                csv_file = self.csv_output_dir / f"documents_{year}.csv"
                df = pd.DataFrame(documents)
                df['year'] = year
                df.to_csv(csv_file, index=False)
                print(f"✅ Created {csv_file} with {len(documents)} documents")
                
                # Convert to TSV
                tsv_file = self.tsv_output_dir / f"documents_{year}.tsv"
                df.to_csv(tsv_file, sep='\t', index=False)
                print(f"✅ Created {tsv_file} with {len(documents)} documents")
    
    def convert_category_indices_to_csv(self):
        """Convert category-specific index files to CSV/TSV"""
        category_files = []
        
        for file_path in self.pdf_extracts_dir.glob("data_index_*.json"):
            if not file_path.stem.startswith('data_index_20'):  # Skip year files
                category_files.append(file_path)
        
        for cat_file in category_files:
            category = cat_file.stem.replace('data_index_', '')
            data = self.load_json_data(cat_file)
            
            if not data or 'documents' not in data:
                continue
            
            documents = data['documents']
            if documents:
                # Convert to CSV
                csv_file = self.csv_output_dir / f"category_{category}.csv"
                df = pd.DataFrame(documents)
                df['category'] = category
                df.to_csv(csv_file, index=False)
                print(f"✅ Created {csv_file} with {len(documents)} documents")
                
                # Convert to TSV
                tsv_file = self.tsv_output_dir / f"category_{category}.tsv"
                df.to_csv(tsv_file, sep='\t', index=False)
                print(f"✅ Created {tsv_file} with {len(documents)} documents")
    
    def create_summary_report(self):
        """Create summary report of converted data"""
        summary = {
            'conversion_date': datetime.now().isoformat(),
            'csv_files': [],
            'tsv_files': [],
            'total_documents': 0,
            'years_available': set(),
            'categories_available': set()
        }
        
        # Count CSV files
        for csv_file in self.csv_output_dir.glob("*.csv"):
            df = pd.read_csv(csv_file)
            file_info = {
                'filename': csv_file.name,
                'document_count': len(df),
                'size_bytes': csv_file.stat().st_size
            }
            summary['csv_files'].append(file_info)
            summary['total_documents'] += len(df)
            
            # Extract years and categories
            if 'year' in df.columns:
                summary['years_available'].update(df['year'].dropna().astype(str).unique())
            if 'category' in df.columns:
                summary['categories_available'].update(df['category'].dropna().unique())
        
        # Count TSV files
        for tsv_file in self.tsv_output_dir.glob("*.tsv"):
            df = pd.read_csv(tsv_file, sep='\t')
            file_info = {
                'filename': tsv_file.name,
                'document_count': len(df),
                'size_bytes': tsv_file.stat().st_size
            }
            summary['tsv_files'].append(file_info)
        
        # Convert sets to lists for JSON serialization
        summary['years_available'] = sorted(list(summary['years_available']))
        summary['categories_available'] = sorted(list(summary['categories_available']))
        
        # Save summary report
        summary_file = self.data_dir / "conversion_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 CONVERSION SUMMARY:")
        print(f"   • Total documents processed: {summary['total_documents']}")
        print(f"   • CSV files created: {len(summary['csv_files'])}")
        print(f"   • TSV files created: {len(summary['tsv_files'])}")
        print(f"   • Years available: {', '.join(summary['years_available'])}")
        print(f"   • Categories: {len(summary['categories_available'])}")
        print(f"   • Summary saved to: {summary_file}")
        
        return summary
    
    def run_conversion(self):
        """Run the complete conversion process"""
        print("🔄 Starting PDF extract to CSV/TSV conversion...")
        print(f"   Source directory: {self.pdf_extracts_dir}")
        print(f"   CSV output: {self.csv_output_dir}")
        print(f"   TSV output: {self.tsv_output_dir}")
        
        # Convert main index
        print("\n📋 Converting main document index...")
        self.convert_main_index_to_csv()
        
        # Convert year-specific indices
        print("\n📅 Converting year-specific indices...")
        self.convert_year_indices_to_csv()
        
        # Convert category-specific indices
        print("\n📂 Converting category-specific indices...")
        self.convert_category_indices_to_csv()
        
        # Create summary report
        print("\n📊 Creating summary report...")
        summary = self.create_summary_report()
        
        print("\n✅ Conversion completed successfully!")
        return summary

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        data_dir = sys.argv[1]
    else:
        data_dir = "data"
    
    converter = DataConverter(data_dir)
    
    try:
        summary = converter.run_conversion()
        return 0
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
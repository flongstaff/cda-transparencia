#!/usr/bin/env python3
"""
Script to show statistics about the organized PDF documents
"""

import os
import json
from collections import defaultdict

def show_organization_stats():
    """Show statistics about the organized PDF documents"""
    
    organized_pdfs_dir = "/Users/flong/Developer/cda-transparencia/organized_pdfs"
    summary_file = os.path.join(organized_pdfs_dir, "organization_summary.json")
    
    # Load the organization summary
    with open(summary_file, 'r') as f:
        summary = json.load(f)
    
    print("PDF Document Organization Statistics")
    print("=" * 40)
    print(f"Total PDF files processed: {summary['total_files_processed']}")
    print(f"Files organized: {summary['organized_files']}")
    print(f"Duplicate files skipped: {summary['duplicate_files']}")
    print(f"Files with issues: {summary['unmapped_files']}")
    print(f"Unique files: {summary['file_hashes']}")
    
    # Count files by year and category
    print("\nFiles by Year and Category:")
    print("-" * 30)
    
    years = defaultdict(lambda: defaultdict(int))
    categories = defaultdict(int)
    
    for year_dir in os.listdir(organized_pdfs_dir):
        year_path = os.path.join(organized_pdfs_dir, year_dir)
        if os.path.isdir(year_path) and year_dir.isdigit() and 2017 <= int(year_dir) <= 2025:
            year_total = 0
            print(f"\n{year_dir}:")
            for category_dir in os.listdir(year_path):
                category_path = os.path.join(year_path, category_dir)
                if os.path.isdir(category_path):
                    file_count = len([f for f in os.listdir(category_path) if f.endswith('.pdf')])
                    years[year_dir][category_dir] = file_count
                    categories[category_dir] += file_count
                    year_total += file_count
                    print(f"  {category_dir}: {file_count} files")
            print(f"  Total for {year_dir}: {year_total} files")
    
    print("\nFiles by Category (All Years):")
    print("-" * 30)
    for category in sorted(categories.keys()):
        print(f"{category}: {categories[category]} files")

def main():
    """Main function"""
    show_organization_stats()

if __name__ == "__main__":
    main()
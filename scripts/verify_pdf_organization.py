#!/usr/bin/env python3
"""
Script to verify the PDF organization is complete and correct
"""

import os
import json
import hashlib
from collections import defaultdict

def verify_pdf_organization():
    """Verify that the PDF organization is complete and correct"""
    
    organized_pdfs_dir = "/Users/flong/Developer/cda-transparencia/organized_pdfs"
    original_pdfs_dir = "/Users/flong/Developer/cda-transparencia/data/pdf_extracts"
    summary_file = os.path.join(organized_pdfs_dir, "organization_summary.json")
    
    print("Verifying PDF Organization...")
    print("=" * 40)
    
    # Load the organization summary
    with open(summary_file, 'r') as f:
        summary = json.load(f)
    
    print(f"Organization Summary:")
    print(f"  Total files processed: {summary['total_files_processed']}")
    print(f"  Files organized: {summary['organized_files']}")
    print(f"  Duplicate files skipped: {summary['duplicate_files']}")
    print(f"  Unique files: {summary['file_hashes']}")
    
    # Count actual files in organized structure
    actual_files = 0
    year_counts = defaultdict(int)
    category_counts = defaultdict(int)
    
    for root, dirs, files in os.walk(organized_pdfs_dir):
        # Skip the base directory itself
        if root == organized_pdfs_dir:
            continue
            
        # Count PDF files
        pdf_files = [f for f in files if f.endswith('.pdf')]
        if pdf_files:
            actual_files += len(pdf_files)
            
            # Extract year and category from path
            path_parts = root.split(os.sep)
            if len(path_parts) >= 3:
                year = path_parts[-2]
                category = path_parts[-1]
                year_counts[year] += len(pdf_files)
                category_counts[category] += len(pdf_files)
    
    print(f"\nActual Counts:")
    print(f"  Total PDF files: {actual_files}")
    
    # Check if counts match
    if actual_files == summary['organized_files']:
        print("  ✓ File counts match")
    else:
        print(f"  ✗ File count mismatch: expected {summary['organized_files']}, found {actual_files}")
    
    # Show distribution by year
    print(f"\nDistribution by Year:")
    for year in sorted(year_counts.keys()):
        print(f"  {year}: {year_counts[year]} files")
    
    # Show distribution by category
    print(f"\nDistribution by Category:")
    for category in sorted(category_counts.keys()):
        print(f"  {category}: {category_counts[category]} files")
    
    # Verify no duplicates by calculating hashes
    print(f"\nChecking for duplicates...")
    file_hashes = {}
    duplicates = []
    
    for root, dirs, files in os.walk(organized_pdfs_dir):
        for file in files:
            if file.endswith('.pdf'):
                file_path = os.path.join(root, file)
                try:
                    # Calculate file hash
                    with open(file_path, "rb") as f:
                        file_hash = hashlib.sha256(f.read()).hexdigest()
                    
                    if file_hash in file_hashes:
                        duplicates.append((file_path, file_hashes[file_hash]))
                    else:
                        file_hashes[file_hash] = file_path
                except Exception as e:
                    print(f"  Error processing {file_path}: {e}")
    
    if duplicates:
        print(f"  Found {len(duplicates)} duplicates:")
        for dup1, dup2 in duplicates:
            print(f"    {dup1} ↔ {dup2}")
    else:
        print(f"  ✓ No duplicates found ({len(file_hashes)} unique files)")
    
    # Compare with original directory
    print(f"\nComparing with original PDF extracts...")
    original_files = list(os.walk(original_pdfs_dir))[0][2]  # Files in the top directory
    original_count = len([f for f in original_files if f.endswith('.pdf')])
    
    print(f"  Original PDF files: {original_count}")
    print(f"  Organized PDF files: {actual_files}")
    
    if actual_files <= original_count:
        print("  ✓ All organized files accounted for")
    else:
        print("  ⚠ More organized files than original files")
    
    print(f"\nVerification complete!")

def main():
    """Main function"""
    verify_pdf_organization()

if __name__ == "__main__":
    main()

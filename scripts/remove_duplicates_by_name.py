#!/usr/bin/env python3
"""
Script to remove duplicate PDF files by name across the project.
This will keep only the primary copies and remove all duplicates.
"""

import os
from pathlib import Path
from collections import defaultdict

def find_duplicates_by_name(root_dir):
    """Find duplicate PDFs by filename across the project."""
    pdf_files = defaultdict(list)
    
    # Common directories that might contain duplicates
    skip_dirs = ['.git', 'node_modules', '__pycache__', '.wrangler', 'test-output', 'backups']
    
    for root, dirs, files in os.walk(root_dir):
        # Skip certain directories
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files[file].append(Path(root) / file)
    
    # Return only files that appear more than once
    return {name: paths for name, paths in pdf_files.items() if len(paths) > 1}

def remove_duplicates(duplicates):
    """Remove duplicate PDFs, keeping only the primary copies."""
    removed_count = 0
    saved_space = 0
    
    for filename, paths in duplicates.items():
        print(f"\n--- {filename} ---")
        
        # Sort paths to put the primary file first
        # Primary files are those in the main processed_pdfs directory, not in subdirectories
        paths_sorted = sorted(paths, key=lambda p: len(str(p).split('/')) + ('central_pdfs' not in str(p)))
        primary_path = paths_sorted[0]
        
        print(f"Keeping: {primary_path}")
        
        # Remove all other duplicates
        for path in paths_sorted[1:]:
            try:
                file_size = path.stat().st_size
                path.unlink()
                print(f"Removed: {path} ({file_size} bytes)")
                removed_count += 1
                saved_space += file_size
            except Exception as e:
                print(f"Error removing {path}: {e}")
    
    print(f"\n--- Summary ---")
    print(f"Total duplicates removed: {removed_count}")
    print(f"Total space saved: {saved_space / (1024*1024):.2f} MB")
    
    return removed_count, saved_space

def main():
    root_directory = "/Users/flong/Developer/cda-transparencia"
    
    print("Finding duplicate PDFs by name...")
    duplicates = find_duplicates_by_name(root_directory)
    
    print(f"Found {len(duplicates)} duplicate filenames.")
    
    if duplicates:
        print("\nRemoving duplicates...")
        removed_count, saved_space = remove_duplicates(duplicates)
        print(f"\nFinished! Removed {removed_count} duplicate files, saving {saved_space / (1024*1024):.2f} MB.")
    else:
        print("No duplicates found.")

if __name__ == "__main__":
    main()
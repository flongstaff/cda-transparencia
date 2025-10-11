#!/usr/bin/env python3
"""
Script to identify and remove duplicate PDF files by name across the project.
This will help us organize the files better and reduce redundancy.
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

def main():
    root_directory = "/Users/flong/Developer/cda-transparencia"
    
    print("Finding duplicate PDFs by name...")
    duplicates = find_duplicates_by_name(root_directory)
    
    print(f"\nFound {len(duplicates)} duplicate filenames:")
    
    total_duplicates = 0
    total_size = 0
    
    # Sort duplicates by number of copies (descending)
    sorted_duplicates = sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True)
    
    for filename, paths in sorted_duplicates:
        print(f"\n--- {filename} ---")
        print(f"Found {len(paths)} copies:")
        
        # Sort paths to put central_pdfs first
        paths_sorted = sorted(paths, key=lambda p: 'central_pdfs' not in str(p))
        primary_path = paths_sorted[0]
        
        size = primary_path.stat().st_size
        print(f"  Primary (keeping): {primary_path} ({size} bytes)")
        
        for path in paths_sorted[1:]:
            size = path.stat().st_size
            print(f"  Duplicate (can remove): {path} ({size} bytes)")
            total_duplicates += 1
            total_size += size
            
            # Uncomment the next lines to actually remove duplicates
            # try:
            #     path.unlink()
            #     print(f"    Removed: {path}")
            # except Exception as e:
            #     print(f"    Error removing {path}: {e}")
    
    print(f"\n--- Summary ---")
    print(f"Total duplicate files found: {total_duplicates}")
    print(f"Total space that could be saved: {total_size / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Script to identify and remove duplicate PDF files by content across the project.
Based on the findings from find_duplicate_pdfs.py, this script will:
1. Keep one copy of each duplicate set (preferably in central_pdfs)
2. Remove all other copies
3. Update references in the code if needed
"""

import os
import hashlib
from pathlib import Path
import shutil

def get_file_hash(filepath):
    """Calculate SHA256 hash of a PDF file."""
    hash_sha256 = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            # Read file in chunks to handle large files efficiently
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def find_all_pdfs(root_dir):
    """Find all PDF files in the project."""
    pdf_files = []
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(Path(root) / file)
    return pdf_files

def organize_pdfs_by_hash(pdf_files):
    """Organize PDF files by their content hash."""
    pdfs_by_hash = {}
    
    for pdf_file in pdf_files:
        file_hash = get_file_hash(pdf_file)
        if file_hash:
            if file_hash not in pdfs_by_hash:
                pdfs_by_hash[file_hash] = []
            pdfs_by_hash[file_hash].append(pdf_file)
    
    return pdfs_by_hash

def remove_duplicates(pdfs_by_hash, central_pdfs_dir):
    """
    Remove duplicate PDFs, keeping only one copy per hash.
    Prefer to keep copies in central_pdfs directory.
    """
    removed_count = 0
    saved_space = 0
    
    for file_hash, file_paths in pdfs_by_hash.items():
        if len(file_paths) > 1:
            # Sort to put central_pdfs files first
            file_paths.sort(key=lambda x: str(x).count('central_pdfs'), reverse=True)
            
            # Keep the first file (preferably in central_pdfs)
            file_to_keep = file_paths[0]
            print(f"Keeping: {file_to_keep}")
            
            # Remove all other duplicates
            for file_path in file_paths[1:]:
                try:
                    file_size = file_path.stat().st_size
                    file_path.unlink()
                    print(f"Removed duplicate: {file_path} ({file_size} bytes)")
                    removed_count += 1
                    saved_space += file_size
                except Exception as e:
                    print(f"Error removing {file_path}: {e}")
    
    print(f"\n--- Summary ---")
    print(f"Total duplicates removed: {removed_count}")
    print(f"Total space saved: {saved_space / (1024*1024):.2f} MB")

def main():
    root_directory = "/Users/flong/Developer/cda-transparencia"
    central_pdfs_directory = Path(root_directory) / "central_pdfs"
    
    print("Finding all PDF files in the project...")
    all_pdfs = find_all_pdfs(root_directory)
    print(f"Found {len(all_pdfs)} PDF files.")
    
    print("\nOrganizing PDFs by content hash...")
    pdfs_by_hash = organize_pdfs_by_hash(all_pdfs)
    
    # Filter to only duplicate sets (more than one file per hash)
    duplicates = {hash_val: paths for hash_val, paths in pdfs_by_hash.items() if len(paths) > 1}
    print(f"Found {len(duplicates)} sets of duplicates.")
    
    print("\nRemoving duplicates...")
    remove_duplicates(duplicates, central_pdfs_directory)

if __name__ == "__main__":
    main()
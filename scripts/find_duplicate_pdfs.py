#!/usr/bin/env python3
"""
Script to find duplicate PDF files by content across the project.
"""
import os
import hashlib
from pathlib import Path

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

def find_duplicate_pdfs(root_dir):
    """Find duplicate PDF files by content across the project."""
    pdf_files = {}
    duplicates = {}
    
    # Walk through all directories to find PDF files
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith('.pdf'):
                filepath = Path(root) / file
                file_hash = get_file_hash(filepath)
                
                if file_hash:
                    if file_hash in pdf_files:
                        # This is a duplicate - add both files to duplicates
                        if file_hash not in duplicates:
                            duplicates[file_hash] = [pdf_files[file_hash]]
                        duplicates[file_hash].append(filepath)
                    else:
                        # First occurrence of this hash
                        pdf_files[file_hash] = filepath
    
    return duplicates

def main():
    root_directory = "/Users/flong/Developer/cda-transparencia"
    print("Searching for duplicate PDF files by content...")
    
    duplicates = find_duplicate_pdfs(root_directory)
    
    print(f"\nFound {len(duplicates)} sets of duplicate PDF files:")
    
    total_duplicated_files = 0
    total_size_saved = 0
    
    for i, (file_hash, file_paths) in enumerate(duplicates.items(), 1):
        print(f"\n--- Duplicate Set {i} ---")
        print(f"Hash: {file_hash}")
        
        for j, filepath in enumerate(file_paths, 1):
            size = filepath.stat().st_size
            print(f"  {j}. {filepath} ({size} bytes)")
            
            if j > 1:  # Count from second file onwards as duplicates
                total_duplicated_files += 1
                total_size_saved += size
    
    print(f"\n--- Summary ---")
    print(f"Total duplicate sets found: {len(duplicates)}")
    print(f"Total number of duplicated files (beyond first occurrence): {total_duplicated_files}")
    print(f"Approximate space that could be saved: {total_size_saved / (1024*1024):.2f} MB")
    
    return duplicates

if __name__ == "__main__":
    main()
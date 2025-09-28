#!/usr/bin/env python3

"""
Deduplication Script for Raw Files
Removes byte-identical duplicate files from the raw data directories
"""

import os
import hashlib
from pathlib import Path

def hash_file(filepath):
    """Generate SHA256 hash of a file"""
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def dedupe_folder(folder):
    """Remove duplicate files in a folder based on their content hash"""
    seen = {}
    duplicates_removed = 0
    
    print(f"\n🔍 Scanning {folder} for duplicates...")
    
    # Get all files in the folder
    files = list(Path(folder).rglob('*'))
    total_files = len([f for f in files if f.is_file()])
    
    print(f"📁 Found {total_files} files to check")
    
    for path in files:
        if path.is_file():
            try:
                file_hash = hash_file(path)
                if file_hash in seen:
                    print(f"🗑️  Removing duplicate: {path}")
                    path.unlink()
                    duplicates_removed += 1
                else:
                    seen[file_hash] = path
            except Exception as e:
                print(f"⚠️  Skipping {path}: {e}")
    
    print(f"✅ Removed {duplicates_removed} duplicate files from {folder}")
    print(f"📦 Kept {len(seen)} unique files")
    return duplicates_removed

def main():
    """Main function to deduplicate both PDF and CSV folders"""
    print("🚀 Starting deduplication process...")
    
    # Define folders to deduplicate
    folders = [
        "data/raw/pdf",
        "data/raw/csv"
    ]
    
    total_duplicates = 0
    
    # Deduplicate each folder
    for folder in folders:
        if os.path.exists(folder):
            duplicates = dedupe_folder(folder)
            total_duplicates += duplicates
        else:
            print(f"⏭️  Skipping {folder} (does not exist)")
    
    print(f"\n🏁 Deduplication complete!")
    print(f"📉 Total duplicates removed: {total_duplicates}")

if __name__ == "__main__":
    main()
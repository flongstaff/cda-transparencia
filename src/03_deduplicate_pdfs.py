#!/usr/bin/env python3
"""
Deduplicate PDF files in the data/raw directory
"""
import os
import hashlib
from pathlib import Path

def hash_file(filepath):
    """Return SHA256 hash of file content"""
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def main():
    """Main function to deduplicate PDFs"""
    pdf_dir = Path("data/raw/pdf")
    seen = {}
    
    if not pdf_dir.exists():
        print("⚠️  PDF directory not found")
        return
    
    for pdf in pdf_dir.rglob("*.pdf"):
        try:
            file_hash = hash_file(pdf)
            if file_hash in seen:
                print(f"🗑️  Removing duplicate: {pdf}")
                pdf.unlink()
            else:
                seen[file_hash] = pdf
        except Exception as e:
            print(f"⚠️  Error with {pdf}: {e}")
    
    print(f"✅ Deduplication complete. Processed {len(seen)} unique files.")

if __name__ == "__main__":
    main()
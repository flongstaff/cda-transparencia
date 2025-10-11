#!/usr/bin/env python3
"""
Data File Deduplication Script for Carmen de Areco Transparency Portal

This script identifies and removes duplicate CSV and JSON files based on content hashing,
similar to the PDF deduplication system.
"""

import os
import hashlib
import json
from pathlib import Path
from typing import Dict, List, Set
import csv


class DataFileDeduplicator:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.data_dir = self.project_root / "data"
        self.central_data_dir = self.project_root / "central_data"
        self.central_data_dir.mkdir(exist_ok=True)
        
        # Tracking files
        self.content_registry_file = self.project_root / ".data_content_registry.json"
        self.location_registry_file = self.project_root / ".data_location_registry.json"
        
        # Load registries
        self.content_registry: Dict[str, str] = self.load_registry(self.content_registry_file)
        self.location_registry: Dict[str, str] = self.load_registry(self.location_registry_file)

    def load_registry(self, registry_file: Path) -> dict:
        """Load a registry from file or create empty one"""
        if registry_file.exists():
            with open(registry_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def save_registry(self, registry: dict, registry_file: Path):
        """Save a registry to file"""
        with open(registry_file, 'w', encoding='utf-8') as f:
            json.dump(registry, f, indent=2)

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of a file for comparison"""
        hash_md5 = hashlib.md5()
        try:
            # Handle CSV and JSON files appropriately
            if file_path.suffix.lower() == '.csv':
                # For CSV, we want to normalize the content to avoid false duplicates
                # due to line ending differences or spacing
                with open(file_path, "rb") as f:
                    content = f.read()
                    # Normalize line endings
                    normalized_content = content.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
                    hash_md5.update(normalized_content)
            else:
                # For JSON and other files, read as binary
                with open(file_path, "rb") as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            print(f"Error calculating hash for {file_path}: {e}")
            return None

    def get_all_data_files(self) -> List[Path]:
        """Get all CSV and JSON files in the data directory"""
        data_files = []
        for ext in ['*.csv', '*.json']:
            data_files.extend(self.data_dir.rglob(ext))
        return data_files

    def identify_duplicates(self) -> Dict[str, List[Path]]:
        """Identify duplicate files based on content hash"""
        print("Identifying duplicate data files...")
        
        # Group files by content hash
        hash_to_files: Dict[str, List[Path]] = {}
        
        data_files = self.get_all_data_files()
        print(f"Processing {len(data_files)} data files...")
        
        for file_path in data_files:
            try:
                file_hash = self.calculate_file_hash(file_path)
                if file_hash:
                    if file_hash not in hash_to_files:
                        hash_to_files[file_hash] = []
                    hash_to_files[file_hash].append(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        # Filter to only include hashes with multiple files (actual duplicates)
        duplicates = {hash_val: files for hash_val, files in hash_to_files.items() if len(files) > 1}
        
        print(f"Found {len(duplicates)} sets of duplicate files")
        return duplicates

    def remove_duplicates(self):
        """Remove duplicate files, keeping only one copy of each unique file"""
        duplicates = self.identify_duplicates()
        
        files_removed = 0
        files_kept = 0
        
        for file_hash, file_list in duplicates.items():
            # Keep the first file, remove the rest
            files_to_keep = file_list[0]
            files_to_remove = file_list[1:]
            
            print(f"Keeping: {files_to_keep}")
            for file_path in files_to_remove:
                try:
                    file_path.unlink()
                    print(f"  Removed duplicate: {file_path}")
                    files_removed += 1
                except Exception as e:
                    print(f"  Error removing {file_path}: {e}")
            
            files_kept += 1
        
        print(f"Kept {files_kept} unique files, removed {files_removed} duplicates")
        return files_removed, files_kept

    def organize_files(self):
        """Organize files into a central location with proper structure"""
        print("Organizing files into central data directory...")
        
        # Create organized subdirectories
        organized_dirs = {
            'by_type': self.central_data_dir / 'by_type',
            'by_year': self.central_data_dir / 'by_year',
            'raw': self.central_data_dir / 'raw',
            'processed': self.central_data_dir / 'processed'
        }
        
        for dir_path in organized_dirs.values():
            dir_path.mkdir(exist_ok=True)
        
        # Also create type-specific subdirectories
        type_dirs = {
            'csv': organized_dirs['by_type'] / 'csv',
            'json': organized_dirs['by_type'] / 'json'
        }
        
        for dir_path in type_dirs.values():
            dir_path.mkdir(exist_ok=True)
        
        # Move files to appropriate locations
        data_files = self.get_all_data_files()
        
        for file_path in data_files:
            try:
                # Determine destination based on file characteristics
                rel_path = file_path.relative_to(self.data_dir)
                filename = file_path.name
                file_ext = file_path.suffix.lower()
                
                # Extract year from path or filename if possible
                year = self.extract_year_from_path(rel_path, filename)
                
                # Create year directory if it doesn't exist
                if year:
                    year_dir = organized_dirs['by_year'] / year
                    year_dir.mkdir(exist_ok=True)
                
                # Copy to type directory
                if file_ext == '.csv':
                    dest_path = type_dirs['csv'] / filename
                elif file_ext == '.json':
                    dest_path = type_dirs['json'] / filename
                else:
                    dest_path = self.central_data_dir / filename
                
                # Copy to year directory if applicable
                if year:
                    year_dest_path = organized_dirs['by_year'] / year / filename
                    if not year_dest_path.exists():
                        year_dest_path.symlink_to(file_path)
                
                # Copy to raw/processed based on path
                if 'raw' in str(rel_path):
                    raw_dest_path = organized_dirs['raw'] / filename
                    if not raw_dest_path.exists():
                        raw_dest_path.symlink_to(file_path)
                elif 'processed' in str(rel_path):
                    processed_dest_path = organized_dirs['processed'] / filename
                    if not processed_dest_path.exists():
                        processed_dest_path.symlink_to(file_path)
                        
            except Exception as e:
                print(f"Error organizing {file_path}: {e}")

    def extract_year_from_path(self, rel_path: Path, filename: str) -> str:
        """Extract year from file path or filename"""
        path_str = str(rel_path)
        name_str = filename.lower()
        
        # Look for years in path
        import re
        year_match = re.search(r'(19|20)\d{2}', path_str)
        if year_match:
            return year_match.group(0)
            
        # Look for years in filename
        year_match = re.search(r'(19|20)\d{2}', name_str)
        if year_match:
            return year_match.group(0)
            
        return None

    def run_deduplication(self):
        """Run the complete deduplication process"""
        print("Starting data file deduplication process...")
        
        # Step 1: Remove duplicates
        removed, kept = self.remove_duplicates()
        
        # Step 2: Organize remaining files
        self.organize_files()
        
        # Step 3: Save registries
        self.save_registry(self.content_registry, self.content_registry_file)
        self.save_registry(self.location_registry, self.location_registry_file)
        
        print("Data file deduplication completed!")
        print(f"Summary: Kept {kept} unique files, removed {removed} duplicates")


def main():
    deduplicator = DataFileDeduplicator("/Users/flong/Developer/cda-transparencia")
    deduplicator.run_deduplication()


if __name__ == "__main__":
    main()
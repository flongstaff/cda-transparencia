#!/usr/bin/env python3
"""
Enhanced Data Management System for Carmen de Areco Transparency Portal

This script manages CSV and JSON files across the entire project to prevent duplication
and maintain a single source of truth, similar to the PDF management system.
"""

import os
import shutil
import json
import hashlib
from pathlib import Path
from typing import List, Dict, Set
import csv


class EnhancedDataManager:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.central_data_dir = self.project_root / "central_data"
        self.central_data_dir.mkdir(exist_ok=True)
        
        # Define the locations where data files are needed
        self.data_locations = [
            self.project_root / "frontend" / "public" / "data" / "organized_data",
            self.project_root / "cloudflare-deploy" / "public" / "data" / "organized_data",
            self.project_root / "backend" / "data" / "organized_data"
        ]
        
        # Create directories if they don't exist
        for location in self.data_locations:
            location.mkdir(parents=True, exist_ok=True)
        
        # Load configuration
        config_file = self.project_root / "data_config.json"
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        else:
            # Default configuration
            self.config = {
                "data_directories": [
                    "data",
                    "data/raw",
                    "data/processed",
                    "data/consolidated",
                    "frontend/public/data",
                    "cloudflare-deploy/public/data"
                ],
                "central_data_location": "central_data",
                "file_types": [".csv", ".json"]
            }
        
        # Track data files to maintain consistency
        self.content_registry_file = self.project_root / ".data_content_registry.json"
        self.location_registry_file = self.project_root / ".data_location_registry.json"

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of a file for comparison"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            print(f"Error calculating hash for {file_path}: {e}")
            return None

    def get_all_existing_data_files(self) -> Dict[str, List[Path]]:
        """Get all data files across the project, grouped by filename"""
        data_groups: Dict[str, List[Path]] = {}
        
        # Search in defined data directories
        search_paths = [self.project_root / Path(path) for path in self.config.get("data_directories", [])]
        
        for search_path in search_paths:
            if search_path.exists():
                for ext in self.config.get("file_types", [".csv", ".json"]):
                    for data_file in search_path.rglob(f"*{ext}"):
                        filename = data_file.name
                        if filename not in data_groups:
                            data_groups[filename] = []
                        data_groups[filename].append(data_file)
        
        return data_groups

    def move_unique_data_files_to_central(self):
        """Move unique data files to the central storage, avoiding duplicates"""
        print("Identifying unique data files across the project...")
        
        data_groups = self.get_all_existing_data_files()
        moved_files: Set[str] = set()
        
        for filename, file_list in data_groups.items():
            # Group files by their content hash
            hash_to_files: Dict[str, List[Path]] = {}
            
            for file_path in file_list:
                try:
                    file_hash = self.calculate_file_hash(file_path)
                    if file_hash not in hash_to_files:
                        hash_to_files[file_hash] = []
                    hash_to_files[file_hash].append(file_path)
                except Exception as e:
                    print(f"Error calculating hash for {file_path}: {e}")
            
            # For each unique content (by hash), move one copy to central storage
            for file_hash, similar_files in hash_to_files.items():
                # Select the first file from the group to keep
                source_file = similar_files[0]
                
                # Create central file path
                central_file = self.central_data_dir / filename
                
                # If this content isn't already in central storage, move it
                if not central_file.exists():
                    print(f"Moving unique data file to central storage: {source_file.name}")
                    shutil.copy2(source_file, central_file)
                    moved_files.add(source_file.name)
                else:
                    # Verify the content is the same
                    if self.calculate_file_hash(central_file) != file_hash:
                        print(f"WARNING: Different content found for {filename}")
                    moved_files.add(source_file.name)
        
        print(f"Moved {len(moved_files)} unique data files to central storage")
        return moved_files

    def create_data_registry(self) -> Dict[str, str]:
        """Create a registry of data files with their hashes for tracking"""
        registry = {}
        
        for data_file in self.central_data_dir.glob("*.*"):
            if data_file.suffix.lower() in self.config.get("file_types", [".csv", ".json"]):
                file_hash = self.calculate_file_hash(data_file)
                registry[data_file.name] = file_hash
        
        # Save registry to tracking file
        with open(self.content_registry_file, 'w', encoding='utf-8') as f:
            json.dump(registry, f, indent=2)
        
        return registry

    def sync_data_locations(self):
        """Synchronize data files to all required locations based on central storage"""
        print("Synchronizing data files to all required locations...")
        
        # Load the registry
        if self.content_registry_file.exists():
            with open(self.content_registry_file, 'r', encoding='utf-8') as f:
                registry = json.load(f)
        else:
            registry = self.create_data_registry()
        
        # For each location, ensure it has the required data files
        for location in self.data_locations:
            print(f"Syncing to: {location}")
            
            for data_name in registry.keys():
                source_path = self.central_data_dir / data_name
                dest_path = location / data_name
                
                # Create symbolic link if possible, otherwise copy
                if source_path.exists():
                    if dest_path.exists():
                        dest_path.unlink()  # Remove existing file/link
                    
                    try:
                        dest_path.symlink_to(source_path)
                        print(f"  Created symlink for {data_name}")
                    except OSError:
                        # If symlinks fail, copy the files instead
                        shutil.copy2(source_path, dest_path)
                        print(f"  Copied {data_name} to {location}")

    def organize_data_files(self):
        """Organize data files in central storage by type, year, and category"""
        print("Organizing data files by type, year, and category...")
        
        # Create organized directories
        organized_dirs = {
            'by_type': self.central_data_dir / 'by_type',
            'by_year': self.central_data_dir / 'by_year',
            'by_category': self.central_data_dir / 'by_category'
        }
        
        for dir_path in organized_dirs.values():
            dir_path.mkdir(exist_ok=True)
        
        # Process each file in central storage
        for data_file in self.central_data_dir.glob("*.*"):
            if data_file.is_file() and data_file.suffix.lower() in self.config.get("file_types", [".csv", ".json"]):
                filename = data_file.name
                
                # Organize by type
                file_type = data_file.suffix.lower()[1:]  # Remove the dot
                type_dir = organized_dirs['by_type'] / file_type
                type_dir.mkdir(exist_ok=True)
                type_link = type_dir / filename
                
                if not type_link.exists():
                    try:
                        type_link.symlink_to(data_file)
                    except OSError:
                        shutil.copy2(data_file, type_link)
                
                # Extract year and category from filename
                year = self.extract_year_from_filename(filename)
                category = self.extract_category_from_filename(filename)
                
                # Organize by year if found
                if year:
                    year_dir = organized_dirs['by_year'] / year
                    year_dir.mkdir(exist_ok=True)
                    year_link = year_dir / filename
                    
                    if not year_link.exists():
                        try:
                            year_link.symlink_to(data_file)
                        except OSError:
                            shutil.copy2(data_file, year_link)
                
                # Organize by category if found
                if category:
                    category_dir = organized_dirs['by_category'] / category
                    category_dir.mkdir(exist_ok=True)
                    category_link = category_dir / filename
                    
                    if not category_link.exists():
                        try:
                            category_link.symlink_to(data_file)
                        except OSError:
                            shutil.copy2(data_file, category_link)

    def extract_year_from_filename(self, filename: str) -> str:
        """Extract year from filename using common patterns"""
        import re
        # Pattern for 4-digit years
        year_match = re.search(r'(19|20)\d{2}', filename)
        if year_match:
            return year_match.group(0)
        return "unknown"

    def extract_category_from_filename(self, filename: str) -> str:
        """Extract category from filename using common patterns"""
        filename_lower = filename.lower()
        
        category_keywords = {
            'budget': ['budget', 'presupuesto'],
            'contracts': ['contract', 'contrato', 'licitacion', 'licitación'],
            'debt': ['debt', 'deuda'],
            'documents': ['document', 'documento'],
            'salaries': ['salary', 'salario', 'sueldo'],
            'summary': ['summary', 'resumen'],
            'treasury': ['treasury', 'tesoreria'],
            'revenue': ['revenue', 'ingreso', 'recaudacion'],
            'expenditure': ['expenditure', 'gasto', 'ejecucion'],
            'investments': ['investment', 'inversion'],
            'personnel': ['personnel', 'personal'],
            'statistics': ['statistics', 'estadistica'],
            'reports': ['report', 'informe'],
            'audit': ['audit', 'auditoria']
        }
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in filename_lower:
                    return category
        
        return "other"

    def run_full_sync(self):
        """Run the complete synchronization process"""
        print("Starting full data file synchronization...")
        
        # Step 1: Identify and move unique data files to central storage
        print("\n1. Moving unique data files to central storage...")
        self.move_unique_data_files_to_central()
        
        # Step 2: Create registry
        print("\n2. Creating data file registry...")
        self.create_data_registry()
        
        # Step 3: Organize files
        print("\n3. Organizing data files...")
        self.organize_data_files()
        
        # Step 4: Sync to all locations
        print("\n4. Synchronizing to all required locations...")
        self.sync_data_locations()
        
        print("\nData file synchronization completed!")


def main():
    # Create the data manager instance
    data_manager = EnhancedDataManager("/Users/flong/Developer/cda-transparencia")
    
    # Run the full synchronization
    data_manager.run_full_sync()


if __name__ == "__main__":
    main()
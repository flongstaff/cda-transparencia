#!/usr/bin/env python3
"""
Enhanced PDF Management System for Carmen de Areco Transparency Portal

This script provides a comprehensive solution for managing PDF files with:
1. Content-based deduplication
2. Centralized storage with organized subdirectories
3. Distribution to frontend and backend locations
4. Support for GitHub Pages deployment with Cloudflare
"""

import os
import shutil
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Set, Tuple
from datetime import datetime
import re


class EnhancedPDFManager:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.central_pdfs_dir = self.project_root / "central_pdfs"
        self.central_pdfs_dir.mkdir(exist_ok=True)
        
        # Subdirectories for organized storage
        self.organized_dirs = {
            'by_year': self.central_pdfs_dir / 'by_year',
            'by_category': self.central_pdfs_dir / 'by_category',
            'originals': self.central_pdfs_dir / 'originals',
            'duplicates': self.central_pdfs_dir / 'duplicates'  # For tracking purposes only
        }
        
        for path in self.organized_dirs.values():
            path.mkdir(parents=True, exist_ok=True)
        
        # Define locations where PDFs are needed across the project
        self.pdf_locations = [
            self.project_root / "public" / "data" / "pdfs",
            self.project_root / "frontend" / "public" / "data" / "organized_by_subject",
            self.project_root / "frontend" / "public" / "data" / "processed_pdfs",
            self.project_root / "frontend" / "public" / "data" / "pdf_ocr_results",
            self.project_root / "cloudflare-deploy" / "public" / "data" / "web_accessible_pdfs",
            self.project_root / "data" / "ocr_extracted" / "main" / "pdfs",
            self.project_root / "data" / "ocr_extracted" / "data" / "pdfs",
            self.project_root / "data" / "ocr_extracted" / "main-data" / "pdfs",
            self.project_root / "src" / "data" / "downloaded" / "pdfs",
        ]
        
        # Create directories if they don't exist
        for location in self.pdf_locations:
            location.mkdir(parents=True, exist_ok=True)
        
        # Tracking files for content hashes and file locations
        self.content_registry_file = self.project_root / ".pdf_content_registry.json"
        self.location_registry_file = self.project_root / ".pdf_location_registry.json"
        
        # Initialize registries
        self.content_registry: Dict[str, str] = self.load_content_registry()
        self.location_registry: Dict[str, str] = self.load_location_registry()

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of a file for content comparison"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def load_content_registry(self) -> Dict[str, str]:
        """Load the content registry from file or create empty one"""
        if self.content_registry_file.exists():
            with open(self.content_registry_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def save_content_registry(self):
        """Save the content registry to file"""
        with open(self.content_registry_file, 'w', encoding='utf-8') as f:
            json.dump(self.content_registry, f, indent=2)

    def load_location_registry(self) -> Dict[str, str]:
        """Load the location registry from file or create empty one"""
        if self.location_registry_file.exists():
            with open(self.location_registry_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def save_location_registry(self):
        """Save the location registry to file"""
        with open(self.location_registry_file, 'w', encoding='utf-8') as f:
            json.dump(self.location_registry, f, indent=2)

    def extract_year_from_filename(self, filename: str) -> str:
        """Extract year from filename using common patterns"""
        # Pattern 1: Year in the beginning or middle of filename
        year_match = re.search(r'(19|20)\d{2}', filename)
        if year_match:
            return year_match.group(0)
        
        # Check for specific year indicators in the filename
        year_indicators = {
            '2021': ['2021'],
            '2022': ['2022', '22'],
            '2023': ['2023', '23'],
            '2024': ['2024', '24'],
            '2025': ['2025', '25']
        }
        
        for year, patterns in year_indicators.items():
            for pattern in patterns:
                if pattern in filename:
                    return year
        
        return 'unknown'

    def determine_category_from_filename(self, filename: str) -> str:
        """Determine category from filename using common patterns"""
        filename_lower = filename.lower()
        
        category_indicators = {
            'ejecucion_gastos': ['gastos', 'ejecucion.*gastos', 'estado.*gastos', 'presupuesto.*ejecucion'],
            'ejecucion_recursos': ['recursos', 'ejecucion.*recursos', 'estado.*recursos', 'presupuesto.*recursos'],
            'situacion_economica': ['situacion', 'economica', 'financiera', 'balance', 'situacion.*economica'],
            'contrataciones': ['licitacion', 'contratacion', 'contrato', 'compra', 'adquisicion'],
            'estadisticas_salud': ['salud', 'caif', 'caps', 'estadisticas.*salud'],
            'recursos_humanos': ['personal', 'administracion.*personal', 'recursos.*humanos', 'empleados'],
            'documentos_generales': ['boletin', 'ordenanza', 'resolucion', 'decreto', 'documento'],
            'otros': ['otro', 'varios', 'misc']
        }
        
        for category, patterns in category_indicators.items():
            for pattern in patterns:
                if re.search(pattern, filename_lower):
                    return category
        
        return 'otros'

    def identify_all_pdfs(self) -> Dict[str, List[Path]]:
        """Identify all PDF files across the project"""
        pdf_groups: Dict[str, List[Path]] = {}
        
        # Search in common PDF directories
        search_paths = [
            self.project_root / "public" / "data",
            self.project_root / "frontend" / "public" / "data",
            self.project_root / "data",
            self.project_root / "src" / "data",
            self.project_root / "cloudflare-deploy" / "public" / "data",
            self.project_root / "central_pdfs"  # Include existing central location
        ]
        
        for search_path in search_paths:
            if search_path.exists():
                for pdf_file in search_path.rglob("*.pdf"):
                    filename = pdf_file.name
                    if filename not in pdf_groups:
                        pdf_groups[filename] = []
                    pdf_groups[filename].append(pdf_file)
        
        return pdf_groups

    def run_deduplication(self):
        """Run the deduplication process based on content, not just filenames"""
        print("Starting comprehensive deduplication process...")
        
        # Get all PDFs across the project
        all_pdfs = self.identify_all_pdfs()
        print(f"Found {sum(len(files) for files in all_pdfs.values())} PDF files across {len(all_pdfs)} unique filenames")
        
        # Group by content hash
        content_groups: Dict[str, List[Path]] = {}
        processed_files: Set[str] = set()
        
        for filename, file_list in all_pdfs.items():
            for file_path in file_list:
                if str(file_path) in processed_files:
                    continue
                    
                try:
                    file_hash = self.calculate_file_hash(file_path)
                    
                    if file_hash not in content_groups:
                        content_groups[file_hash] = []
                    content_groups[file_hash].append(file_path)
                    
                    processed_files.add(str(file_path))
                except Exception as e:
                    print(f"Error calculating hash for {file_path}: {e}")
        
        print(f"Found {len(content_groups)} unique content groups")
        
        # For each content group, move one file to central storage
        unique_files_moved = 0
        duplicates_found = 0
        
        for file_hash, similar_files in content_groups.items():
            if len(similar_files) > 1:
                duplicates_found += len(similar_files) - 1
            
            # Select the most appropriate file to keep (prefer central location files)
            # If no central file exists, use the first one found
            central_file = None
            for file_path in similar_files:
                if "central_pdfs" in str(file_path):
                    central_file = file_path
                    break
            
            if not central_file:
                central_file = similar_files[0]
            
            # Create destination path in originals folder
            dest_filename = central_file.name
            dest_path = self.organized_dirs['originals'] / dest_filename
            
            # If the file doesn't already exist in central storage with the same content
            if not dest_path.exists() or self.calculate_file_hash(dest_path) != file_hash:
                print(f"Moving unique PDF to central storage: {dest_filename}")
                shutil.copy2(central_file, dest_path)
                
                # Update location registry
                self.location_registry[dest_filename] = str(dest_path.relative_to(self.project_root))
                
                # Update content registry
                self.content_registry[dest_filename] = file_hash
                
                unique_files_moved += 1
            else:
                # The file is already in central storage with the same content
                print(f"File already exists in central storage: {dest_filename}")
        
        print(f"Moved {unique_files_moved} unique PDFs to central storage")
        print(f"Identified {duplicates_found} duplicate files")
        
        # Organize files by year and category
        self.organize_files_by_metadata()
        
        # Save registries
        self.save_content_registry()
        self.save_location_registry()

    def organize_files_by_metadata(self):
        """Organize the central PDFs by year and category"""
        print("Organizing files by year and category...")
        
        for pdf_file in self.organized_dirs['originals'].glob("*.pdf"):
            filename = pdf_file.name
            
            # Extract year and category
            year = self.extract_year_from_filename(filename)
            category = self.determine_category_from_filename(filename)
            
            # Create year subdirectory
            year_dir = self.organized_dirs['by_year'] / year
            year_dir.mkdir(exist_ok=True)
            
            # Create category subdirectory
            category_dir = self.organized_dirs['by_category'] / category
            category_dir.mkdir(exist_ok=True)
            
            # Create symlinks to the original file
            year_link = year_dir / filename
            category_link = category_dir / filename
            
            # Remove existing links if they exist
            if year_link.exists():
                year_link.unlink()
            if category_link.exists():
                category_link.unlink()
            
            # Create new symlinks
            try:
                year_link.symlink_to(pdf_file)
                category_link.symlink_to(pdf_file)
            except OSError:
                # If symlinks fail, copy the files instead
                print(f"Failed to create symlink for {filename}, copying instead")
                shutil.copy2(pdf_file, year_link)
                shutil.copy2(pdf_file, category_link)

    def sync_to_all_locations(self):
        """Synchronize PDFs to all required locations based on central storage"""
        print("Synchronizing PDFs to all required locations...")
        
        # Get all files from the originals directory
        for pdf_file in self.organized_dirs['originals'].glob("*.pdf"):
            filename = pdf_file.name
            
            # Sync to each location
            for location in self.pdf_locations:
                dest_path = location / filename
                
                # Create symbolic link if possible, otherwise copy
                try:
                    if dest_path.exists():
                        dest_path.unlink()  # Remove existing file/link
                    dest_path.symlink_to(pdf_file)
                except OSError:
                    # If symlinks fail, copy the files instead
                    if not dest_path.exists():
                        shutil.copy2(pdf_file, dest_path)
            
            # Process organized_by_subject and web_accessible_pdfs specifically
            for location in self.pdf_locations:
                if "organized_by_subject" in str(location) or "web_accessible_pdfs" in str(location):
                    self.sync_organized_pdfs(location, pdf_file)

    def sync_organized_pdfs(self, location: Path, source_file: Path):
        """Handle synchronization for organized PDF directories with subdirectories"""
        pdf_name = source_file.name
        
        # Extract year and category to place file in appropriate subdirectories
        year = self.extract_year_from_filename(pdf_name)
        category = self.determine_category_from_filename(pdf_name)
        
        # Create year subdirectory
        year_dir = location / year
        year_dir.mkdir(exist_ok=True)
        
        # Map category to appropriate subdirectory name for organized structures
        category_mapping = {
            'ejecucion_gastos': 'Ejecución de Gastos',
            'ejecucion_recursos': 'Ejecución de Recursos',
            'situacion_economica': 'Situación Económico-Financiera',
            'contrataciones': 'Contrataciones',
            'estadisticas_salud': 'Estadísticas de Salud',
            'recursos_humanos': 'Recursos Humanos',
            'documentos_generales': 'Documentos Generales'
        }
        
        # Create category subdirectory
        category_name = category_mapping.get(category, category.replace('_', ' ').title())
        category_dir = location / category_name
        category_dir.mkdir(exist_ok=True)
        
        # Create destination paths
        year_dest_path = year_dir / pdf_name
        category_dest_path = category_dir / pdf_name
        
        # Create symlinks to the original file
        for dest_path in [year_dest_path, category_dest_path]:
            if dest_path.exists():
                dest_path.unlink()
            try:
                dest_path.symlink_to(source_file)
            except OSError:
                # If symlinks fail, copy the files instead
                shutil.copy2(source_file, dest_path)

    def cleanup_old_duplicates(self):
        """Find and remove actual file duplicates (not just by name)"""
        print("Cleaning up old duplicates...")
        
        # Find all PDFs across the project
        all_pdfs = list(self.project_root.rglob("*.pdf"))
        
        # Group by content hash
        content_groups: Dict[str, List[Path]] = {}
        for pdf_file in all_pdfs:
            # Skip files already in central storage originals
            if "central_pdfs/originals" in str(pdf_file) or str(pdf_file.parent) == str(self.organized_dirs['originals']):
                continue
                
            try:
                file_hash = self.calculate_file_hash(pdf_file)
                if file_hash not in content_groups:
                    content_groups[file_hash] = []
                content_groups[file_hash].append(pdf_file)
            except Exception as e:
                print(f"Error calculating hash for {pdf_file}: {e}")
        
        # For each group with more than one file, keep only one and remove others
        duplicates_removed = 0
        for file_hash, similar_files in content_groups.items():
            if len(similar_files) > 1:
                # Keep the first file, remove others
                kept_file = similar_files[0]
                print(f"Keeping: {kept_file}")
                for duplicate_file in similar_files[1:]:
                    try:
                        # Check if this file is in central originals - if so, don't delete
                        if "central_pdfs/originals" not in str(duplicate_file):
                            duplicate_file.unlink()
                            print(f"Removed duplicate: {duplicate_file}")
                            duplicates_removed += 1
                    except Exception as e:
                        print(f"Could not remove {duplicate_file}: {e}")
        
        print(f"Removed {duplicates_removed} duplicate files")

    def run_full_optimization(self):
        """Run the complete optimization process"""
        print("Starting full PDF optimization process...")
        
        # Step 1: Run deduplication based on content
        print("\n1. Running deduplication based on content...")
        self.run_deduplication()
        
        # Step 2: Clean up old duplicates
        print("\n2. Cleaning up old duplicates...")
        self.cleanup_old_duplicates()
        
        # Step 3: Sync to all required locations
        print("\n3. Synchronizing to all required locations...")
        self.sync_to_all_locations()
        
        print("\nPDF optimization completed!")
        print(f"Unique files stored in central location: {len(list(self.organized_dirs['originals'].glob('*.pdf')))}")
        
        # Summary
        total_pdfs = len(list(self.project_root.rglob("*.pdf")))
        print(f"Total PDF files after optimization: {total_pdfs}")


def main():
    # Create the enhanced PDF manager instance
    pdf_manager = EnhancedPDFManager()
    
    # Run the full optimization
    pdf_manager.run_full_optimization()


if __name__ == "__main__":
    main()
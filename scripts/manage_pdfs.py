#!/usr/bin/env python3
"""
PDF Management Script for Carmen de Areco Transparency Portal

This script manages PDF files across the entire project to prevent duplication
and maintain a single source of truth for all PDF documents.
"""

import os
import shutil
import json
import hashlib
from pathlib import Path
from typing import List, Dict, Set


class PDFManager:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.central_pdfs_dir = self.project_root / "central_pdfs"
        self.central_pdfs_dir.mkdir(exist_ok=True)
        
        # Define the locations where PDFs are needed
        self.pdf_locations = [
            self.project_root / "public" / "data" / "pdfs",
            self.project_root / "frontend" / "public" / "data" / "organized_by_subject",
            self.project_root / "frontend" / "public" / "data" / "processed_pdfs",
            self.project_root / "frontend" / "public" / "data" / "pdf_ocr_results",
            self.project_root / "cloudflare-deploy" / "public" / "data" / "pdfs",
            self.project_root / "cloudflare-deploy" / "public" / "data" / "web_accessible_pdfs",
            self.project_root / "data" / "ocr_extracted" / "main" / "pdfs",
            self.project_root / "data" / "ocr_extracted" / "data" / "pdfs",
            self.project_root / "data" / "ocr_extracted" / "main-data" / "pdfs",
            self.project_root / "src" / "data" / "downloaded" / "pdfs",
        ]
        
        # Create directories if they don't exist
        for location in self.pdf_locations:
            location.mkdir(parents=True, exist_ok=True)
        
        # Track PDFs to maintain consistency
        self.tracking_file = self.project_root / ".pdf_tracking.json"

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of a file for comparison"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def get_all_existing_pdfs(self) -> Dict[str, List[Path]]:
        """Get all PDF files across the project, grouped by filename"""
        pdf_groups: Dict[str, List[Path]] = {}
        
        # Search in common PDF directories
        search_paths = [
            self.project_root / "public" / "data",
            self.project_root / "frontend" / "public" / "data",
            self.project_root / "data",
            self.project_root / "src" / "data",
            self.project_root / "cloudflare-deploy" / "public" / "data",
        ]
        
        for search_path in search_paths:
            if search_path.exists():
                for pdf_file in search_path.rglob("*.pdf"):
                    filename = pdf_file.name
                    if filename not in pdf_groups:
                        pdf_groups[filename] = []
                    pdf_groups[filename].append(pdf_file)
        
        return pdf_groups

    def move_unique_pdfs_to_central(self):
        """Move unique PDFs to the central storage, avoiding duplicates"""
        print("Identifying unique PDFs across the project...")
        
        pdf_groups = self.get_all_existing_pdfs()
        moved_files: Set[str] = set()
        
        for filename, file_list in pdf_groups.items():
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
                central_file = self.central_pdfs_dir / filename
                
                # If this content isn't already in central storage, move it
                if not central_file.exists():
                    print(f"Moving unique PDF to central storage: {source_file.name}")
                    shutil.copy2(source_file, central_file)
                    moved_files.add(source_file.name)
                else:
                    # Verify the content is the same
                    if self.calculate_file_hash(central_file) != file_hash:
                        print(f"WARNING: Different content found for {filename}")
                    moved_files.add(source_file.name)
        
        print(f"Moved {len(moved_files)} unique PDFs to central storage")
        return moved_files

    def create_pdf_registry(self) -> Dict[str, str]:
        """Create a registry of PDFs with their hashes for tracking"""
        registry = {}
        
        for pdf_file in self.central_pdfs_dir.glob("*.pdf"):
            file_hash = self.calculate_file_hash(pdf_file)
            registry[pdf_file.name] = file_hash
        
        # Save registry to tracking file
        with open(self.tracking_file, 'w', encoding='utf-8') as f:
            json.dump(registry, f, indent=2)
        
        return registry

    def sync_pdf_locations(self):
        """Synchronize PDFs to all required locations based on central storage"""
        print("Synchronizing PDFs to all required locations...")
        
        # Load the registry
        if self.tracking_file.exists():
            with open(self.tracking_file, 'r', encoding='utf-8') as f:
                registry = json.load(f)
        else:
            registry = self.create_pdf_registry()
        
        # For each location, ensure it has the required PDFs
        for location in self.pdf_locations:
            print(f"Syncing to: {location}")
            
            # Clear old files if needed (optional - could be made configurable)
            # This step would copy from central storage to maintain consistency
            
            for pdf_name in registry.keys():
                source_path = self.central_pdfs_dir / pdf_name
                dest_path = location / pdf_name
                
                # If it's an organized directory, we might need special handling
                if "organized_by_subject" in str(location) or "web_accessible_pdfs" in str(location):
                    # These directories have year subdirectories, need special handling
                    self.sync_organized_pdfs(location, source_path)
                else:
                    # Simple copy for standard directories
                    if source_path.exists() and not dest_path.exists():
                        shutil.copy2(source_path, dest_path)
                        print(f"  Copied {pdf_name} to {location}")

    def sync_organized_pdfs(self, location: Path, source_path: Path):
        """Handle synchronization for organized PDF directories with subdirectories"""
        # For organized_by_subject and web_accessible_pdfs, we need to copy
        # into appropriate subdirectories based on file naming
        pdf_name = source_path.name
        
        # Identify the category/year from the filename or metadata
        # This is a simplified approach - in a real scenario, you'd have more logic
        # to determine the appropriate subdirectory
        
        # For demo purposes, create some common subdirectories if they don't exist
        subdirs = [
            "2021", "2022", "2023", "2024", "2025",
            "Ejecución de Gastos", "Ejecución de Recursos",
            "Situación Económico-Financiera", "Contrataciones"
        ]
        
        for subdir in subdirs:
            subdir_path = location / subdir
            subdir_path.mkdir(exist_ok=True)
            
            # Determine if this PDF should go in this subdir based on naming
            dest_path = subdir_path / pdf_name
            
            # Simple heuristic: if subdir name appears in PDF name or it's a common pattern
            if (subdir in pdf_name or 
                any(pattern in pdf_name.lower() for pattern in ["gastos", "recursos", "situacion", "contrataciones", "licitacion"])) and not dest_path.exists():
                shutil.copy2(source_path, dest_path)
                print(f"  Copied {pdf_name} to {subdir_path}")

    def run_full_sync(self):
        """Run the complete synchronization process"""
        print("Starting full PDF synchronization...")
        
        # Step 1: Identify and move unique PDFs to central storage
        print("\n1. Moving unique PDFs to central storage...")
        self.move_unique_pdfs_to_central()
        
        # Step 2: Create registry
        print("\n2. Creating PDF registry...")
        self.create_pdf_registry()
        
        # Step 3: Sync to all locations
        print("\n3. Synchronizing to all required locations...")
        self.sync_pdf_locations()
        
        print("\nPDF synchronization completed!")


def main():
    # Create the PDF manager instance
    pdf_manager = PDFManager()
    
    # Run the full synchronization
    pdf_manager.run_full_sync()


if __name__ == "__main__":
    main()
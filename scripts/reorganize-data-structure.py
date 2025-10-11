#!/usr/bin/env python3
"""
Data Structure Reorganization Script
Centralizes and organizes all data files for the Carmen de Areco Transparency Portal
"""

import os
import json
import shutil
import logging
from pathlib import Path
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataStructureOrganizer:
    def __init__(self, base_dir: str = "/Users/flong/Developer/cda-transparencia"):
        self.base_dir = Path(base_dir)
        self.data_dir = self.base_dir / "data"
        self.frontend_public_data = self.base_dir / "frontend" / "public" / "data"
        self.central_pdfs = self.base_dir / "central_pdfs"
        self.central_data = self.base_dir / "central_data"
        
        # Define the new centralized data structure
        self.new_structure = {
            "api": {},
            "charts": {},
            "consolidated": {},
            "csv": {},
            "documents": {
                "pdfs": {},
                "organized": {}
            },
            "json": {},
            "metadata": {}
        }
        
        # Mapping of current directories to new structure
        self.directory_mapping = {
            # PDF organization
            str(self.data_dir / "organized_pdfs"): str(self.central_data / "documents" / "organized"),
            
            # Frontend public data directories
            str(self.frontend_public_data / "api"): str(self.central_data / "api"),
            str(self.frontend_public_data / "charts"): str(self.central_data / "charts"),
            str(self.frontend_public_data / "consolidated"): str(self.central_data / "consolidated"),
            str(self.frontend_public_data / "csv"): str(self.central_data / "csv"),
            str(self.frontend_public_data / "json"): str(self.central_data / "json"),
            
            # Central data directories
            str(self.central_pdfs): str(self.central_data / "documents" / "pdfs"),
        }

    def create_centralized_structure(self):
        """Create the new centralized data structure"""
        logger.info("📁 Creating centralized data structure...")
        
        # Create the central_data directory
        self.central_data.mkdir(exist_ok=True)
        logger.info(f"✅ Created central data directory: {self.central_data}")
        
        # Create the new directory structure
        for dir_name in ["api", "charts", "consolidated", "csv", "documents", "json", "metadata"]:
            dir_path = self.central_data / dir_name
            dir_path.mkdir(exist_ok=True)
            logger.info(f"✅ Created directory: {dir_path}")
            
        # Create subdirectories for documents
        (self.central_data / "documents" / "pdfs").mkdir(exist_ok=True)
        (self.central_data / "documents" / "organized").mkdir(exist_ok=True)
        logger.info(f"✅ Created document subdirectories")
        
        return True

    def validate_current_structure(self) -> bool:
        """Validate that the current structure exists as expected"""
        logger.info("🔍 Validating current data structure...")
        
        # Check if main directories exist
        required_dirs = [
            self.data_dir,
            self.frontend_public_data,
            self.central_pdfs
        ]
        
        missing_dirs = []
        for dir_path in required_dirs:
            if not dir_path.exists():
                missing_dirs.append(str(dir_path))
                logger.error(f"❌ Missing directory: {dir_path}")
                
        if missing_dirs:
            logger.error(f"Found {len(missing_dirs)} missing directories")
            return False
            
        logger.info("✅ Current structure validation passed")
        return True

    def reorganize_data_files(self):
        """Move and reorganize data files to the new centralized structure"""
        logger.info("🔄 Reorganizing data files...")
        
        # Move data from frontend public to central data
        frontend_data_dirs = [
            ("api", self.frontend_public_data / "api"),
            ("charts", self.frontend_public_data / "charts"),
            ("consolidated", self.frontend_public_data / "consolidated"),
            ("csv", self.frontend_public_data / "csv"),
            ("json", self.frontend_public_data / "json")
        ]
        
        for dir_name, source_dir in frontend_data_dirs:
            if source_dir.exists():
                target_dir = self.central_data / dir_name
                logger.info(f"➡️  Moving {source_dir} to {target_dir}")
                
                # Move all files from source to target
                for item in source_dir.iterdir():
                    target_item = target_dir / item.name
                    if target_item.exists():
                        logger.warning(f"⚠️  Skipping {item.name} - already exists in target")
                        continue
                        
                    shutil.move(str(item), str(target_item))
                    logger.debug(f"✅ Moved {item.name}")
                    
                logger.info(f"✅ Completed moving files from {source_dir}")
            else:
                logger.warning(f"⚠️  Source directory does not exist: {source_dir}")
        
        # Move organized PDFs
        organized_pdfs_src = self.data_dir / "organized_pdfs"
        organized_pdfs_dst = self.central_data / "documents" / "organized"
        
        if organized_pdfs_src.exists():
            logger.info(f"➡️  Moving organized PDFs from {organized_pdfs_src} to {organized_pdfs_dst}")
            
            for item in organized_pdfs_src.iterdir():
                # Skip .DS_Store and other hidden files
                if item.name.startswith('.'):
                    continue
                    
                target_item = organized_pdfs_dst / item.name
                if target_item.exists():
                    logger.warning(f"⚠️  Skipping {item.name} - already exists in target")
                    continue
                    
                shutil.move(str(item), str(target_item))
                logger.debug(f"✅ Moved {item.name}")
                
            logger.info("✅ Completed moving organized PDFs")
            
        return True

    def create_symlinks(self):
        """Create symbolic links to maintain backward compatibility"""
        logger.info("🔗 Creating symbolic links for backward compatibility...")
        
        # Create symlink from frontend/public/data to central_data
        frontend_data_link = self.frontend_public_data / "central"
        if not frontend_data_link.exists():
            frontend_data_link.symlink_to(str(self.central_data))
            logger.info(f"✅ Created symlink: {frontend_data_link} -> {self.central_data}")
        
        # Create symlinks for each major data category
        categories = ["api", "charts", "consolidated", "csv", "documents", "json", "metadata"]
        for category in categories:
            src = self.central_data / category
            dst = self.frontend_public_data / category
            
            # Remove existing directory/file if it exists
            if dst.exists():
                if dst.is_symlink():
                    dst.unlink()
                elif dst.is_dir():
                    shutil.rmtree(dst)
                else:
                    dst.unlink()
            
            # Create symlink
            dst.symlink_to(str(src))
            logger.info(f"✅ Created symlink: {dst} -> {src}")
            
        # Special handling for documents subdirectories
        doc_subdirs = ["pdfs", "organized"]
        for subdir in doc_subdirs:
            src = self.central_data / "documents" / subdir
            dst = self.frontend_public_data / "documents" / subdir
            
            # Create parent directory if needed
            dst.parent.mkdir(exist_ok=True)
            
            # Remove existing directory/file if it exists
            if dst.exists():
                if dst.is_symlink():
                    dst.unlink()
                elif dst.is_dir():
                    shutil.rmtree(dst)
                else:
                    dst.unlink()
            
            # Create symlink
            dst.symlink_to(str(src))
            logger.info(f"✅ Created symlink: {dst} -> {src}")
            
        return True

    def validate_new_structure(self) -> bool:
        """Validate that the new structure is correctly set up"""
        logger.info("✅ Validating new data structure...")
        
        # Check if central_data exists and has the right directories
        if not self.central_data.exists():
            logger.error(f"❌ Central data directory does not exist: {self.central_data}")
            return False
            
        required_dirs = [
            self.central_data / "api",
            self.central_data / "charts",
            self.central_data / "consolidated",
            self.central_data / "csv",
            self.central_data / "documents",
            self.central_data / "documents" / "pdfs",
            self.central_data / "documents" / "organized",
            self.central_data / "json",
            self.central_data / "metadata"
        ]
        
        missing_dirs = []
        for dir_path in required_dirs:
            if not dir_path.exists():
                missing_dirs.append(str(dir_path))
                logger.error(f"❌ Missing directory in new structure: {dir_path}")
                
        if missing_dirs:
            logger.error(f"Found {len(missing_dirs)} missing directories in new structure")
            return False
            
        # Check symlinks
        symlink_checks = [
            (self.frontend_public_data / "central", self.central_data),
            (self.frontend_public_data / "api", self.central_data / "api"),
            (self.frontend_public_data / "charts", self.central_data / "charts"),
            (self.frontend_public_data / "consolidated", self.central_data / "consolidated"),
            (self.frontend_public_data / "csv", self.central_data / "csv"),
            (self.frontend_public_data / "json", self.central_data / "json"),
            (self.frontend_public_data / "documents" / "pdfs", self.central_data / "documents" / "pdfs"),
            (self.frontend_public_data / "documents" / "organized", self.central_data / "documents" / "organized")
        ]
        
        broken_symlinks = []
        for symlink_path, target_path in symlink_checks:
            if symlink_path.exists() and symlink_path.is_symlink():
                if symlink_path.resolve() != target_path:
                    broken_symlinks.append((str(symlink_path), str(target_path)))
                    logger.error(f"❌ Symlink {symlink_path} does not point to {target_path}")
            elif not symlink_path.exists():
                broken_symlinks.append((str(symlink_path), str(target_path)))
                logger.error(f"❌ Missing symlink: {symlink_path} -> {target_path}")
                
        if broken_symlinks:
            logger.error(f"Found {len(broken_symlinks)} broken or missing symlinks")
            return False
            
        logger.info("✅ New structure validation passed")
        return True

    def update_configuration_files(self):
        """Update configuration files to reflect the new structure"""
        logger.info("⚙️  Updating configuration files...")
        
        # Update data_config.json if it exists
        data_config_path = self.base_dir / "data_config.json"
        if data_config_path.exists():
            try:
                with open(data_config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    
                # Update paths in configuration
                if 'dataPaths' in config:
                    config['dataPaths']['central'] = str(self.central_data)
                    config['dataPaths']['api'] = str(self.central_data / "api")
                    config['dataPaths']['charts'] = str(self.central_data / "charts")
                    config['dataPaths']['consolidated'] = str(self.central_data / "consolidated")
                    config['dataPaths']['csv'] = str(self.central_data / "csv")
                    config['dataPaths']['documents'] = str(self.central_data / "documents")
                    config['dataPaths']['json'] = str(self.central_data / "json")
                    config['dataPaths']['metadata'] = str(self.central_data / "metadata")
                    
                # Save updated configuration
                with open(data_config_path, 'w', encoding='utf-8') as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)
                    
                logger.info(f"✅ Updated configuration file: {data_config_path}")
            except Exception as e:
                logger.warning(f"⚠️  Could not update data_config.json: {e}")
        
        # Update any hardcoded paths in source files
        # This is a simplified approach - in practice, you'd want to be more specific
        logger.info("✅ Configuration files update completed")
        return True

    def run_full_reorganization(self) -> bool:
        """Run the complete data reorganization process"""
        logger.info("🚀 Starting full data reorganization process...")
        
        # Step 1: Validate current structure
        if not self.validate_current_structure():
            logger.error("❌ Current structure validation failed")
            return False
            
        # Step 2: Create new centralized structure
        if not self.create_centralized_structure():
            logger.error("❌ Failed to create centralized structure")
            return False
            
        # Step 3: Move and reorganize data files
        if not self.reorganize_data_files():
            logger.error("❌ Failed to reorganize data files")
            return False
            
        # Step 4: Create symlinks for backward compatibility
        if not self.create_symlinks():
            logger.error("❌ Failed to create symlinks")
            return False
            
        # Step 5: Validate new structure
        if not self.validate_new_structure():
            logger.error("❌ New structure validation failed")
            return False
            
        # Step 6: Update configuration files
        if not self.update_configuration_files():
            logger.error("❌ Failed to update configuration files")
            return False
            
        logger.info("🎉 Full data reorganization completed successfully!")
        return True

def main():
    organizer = DataStructureOrganizer()
    success = organizer.run_full_reorganization()
    
    if success:
        logger.info("✅ Data reorganization completed successfully!")
        logger.info("📁 New centralized data structure is ready:")
        logger.info("   /central_data/")
        logger.info("   ├── api/")
        logger.info("   ├── charts/")
        logger.info("   ├── consolidated/")
        logger.info("   ├── csv/")
        logger.info("   ├── documents/")
        logger.info("   │   ├── pdfs/")
        logger.info("   │   └── organized/")
        logger.info("   ├── json/")
        logger.info("   └── metadata/")
        return True
    else:
        logger.error("❌ Data reorganization failed!")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
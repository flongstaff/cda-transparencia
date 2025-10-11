#!/usr/bin/env python3
"""
Simple Data Validation Script
Checks for file consistency, symlinks, and basic file integrity
"""

import os
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def validate_data_files():
    """Validate data files for consistency"""
    base_dir = Path("/Users/flong/Developer/cda-transparencia")
    data_dir = base_dir / "data"
    organized_pdfs_dir = data_dir / "organized_pdfs"
    
    logger.info("🔍 Starting data validation...")
    
    # Check if directories exist
    if not data_dir.exists():
        logger.error(f"❌ Data directory not found: {data_dir}")
        return False
        
    if not organized_pdfs_dir.exists():
        logger.error(f"❌ Organized PDFs directory not found: {organized_pdfs_dir}")
        return False
    
    issues_found = 0
    
    # Check symlinks in organized_pdfs
    logger.info("🔗 Checking symlinks...")
    for root, dirs, files in os.walk(organized_pdfs_dir):
        for file in files:
            if file.endswith('.pdf'):
                file_path = Path(root) / file
                if file_path.is_symlink():
                    target = file_path.resolve()
                    if not target.exists():
                        logger.warning(f"❌ Broken symlink: {file_path} -> {target}")
                        issues_found += 1
                    else:
                        logger.debug(f"✅ Valid symlink: {file_path}")
    
    # Check data index files
    logger.info("📚 Checking data index files...")
    index_files = [
        data_dir / "data-index.json",
        data_dir / "master_index.json",
        data_dir / "data-mapping.json"
    ]
    
    for index_file in index_files:
        if index_file.exists():
            try:
                with open(index_file, 'r', encoding='utf-8') as f:
                    json.load(f)
                logger.debug(f"✅ Valid index file: {index_file}")
            except Exception as e:
                logger.warning(f"❌ Invalid JSON in {index_file}: {e}")
                issues_found += 1
        else:
            logger.warning(f"⚠️  Index file not found: {index_file}")
    
    # Check for duplicate filenames
    logger.info("🔄 Checking for duplicate filenames...")
    all_files = {}
    for root, dirs, files in os.walk(data_dir):
        # Skip node_modules and .git directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
        for file in files:
            if file not in all_files:
                all_files[file] = []
            all_files[file].append(Path(root) / file)
    
    duplicates = {name: paths for name, paths in all_files.items() if len(paths) > 1}
    if duplicates:
        logger.warning(f"⚠️  Found {len(duplicates)} duplicate filenames:")
        for name, paths in list(duplicates.items())[:5]:  # Show first 5
            logger.warning(f"  - {name}: {len(paths)} copies")
        issues_found += len(duplicates)
    
    # Summary
    logger.info("="*50)
    if issues_found == 0:
        logger.info("✅ All data validation checks passed!")
        return True
    else:
        logger.warning(f"⚠️  Found {issues_found} issues during validation")
        return False

if __name__ == "__main__":
    success = validate_data_files()
    exit(0 if success else 1)
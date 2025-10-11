#!/usr/bin/env python3
"""
Enhanced PDF Backup System for Carmen de Areco Transparency Portal

This script creates backups of the organized PDF repository and maintains
copies across different parts of the application as needed.
"""

import os
import shutil
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import List, Dict
import zipfile
import tarfile


class EnhancedPDFBackupSystem:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.central_pdfs_dir = self.project_root / "central_pdfs"
        self.backup_dir = self.project_root / "backups" / "pdfs"
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Load configuration
        config_file = self.project_root / "pdf_config.json"
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        else:
            # Default configuration
            self.config = {
                "central_pdf_location": "central_pdfs",
                "backup_strategy": {
                    "daily": True,
                    "weekly": True,
                    "on_change": True
                }
            }

    def create_backup(self, backup_name: str = None) -> Path:
        """Create a backup of the central PDF directory"""
        if not backup_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"pdf_backup_{timestamp}"
        
        backup_path = self.backup_dir / backup_name
        backup_path.mkdir(exist_ok=True)
        
        # Copy all PDFs from central location to backup
        if self.central_pdfs_dir.exists():
            for pdf_file in self.central_pdfs_dir.rglob("*.pdf"):  # Include subdirectories
                # Calculate relative path from central_pdfs
                relative_path = pdf_file.relative_to(self.central_pdfs_dir)
                dest_path = backup_path / relative_path
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(pdf_file, dest_path)
        
        print(f"Created backup: {backup_path}")
        return backup_path

    def create_compressed_backup(self, backup_name: str = None, format='zip') -> Path:
        """Create a compressed archive of the central PDF directory"""
        if not backup_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"pdf_backup_{timestamp}.{format}"
        
        archive_path = self.backup_dir / backup_name
        
        if self.central_pdfs_dir.exists():
            if format == 'zip':
                with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for pdf_file in self.central_pdfs_dir.rglob("*.pdf"):
                        relative_path = pdf_file.relative_to(self.central_pdfs_dir)
                        zipf.write(pdf_file, relative_path)
            elif format == 'tar':
                with tarfile.open(archive_path, 'w') as tar:
                    for pdf_file in self.central_pdfs_dir.rglob("*.pdf"):
                        relative_path = pdf_file.relative_to(self.central_pdfs_dir)
                        tar.add(pdf_file, arcname=relative_path)
            elif format == 'tar.gz':
                with tarfile.open(archive_path, 'w:gz') as tar:
                    for pdf_file in self.central_pdfs_dir.rglob("*.pdf"):
                        relative_path = pdf_file.relative_to(self.central_pdfs_dir)
                        tar.add(pdf_file, arcname=relative_path)
        
        print(f"Created compressed backup: {archive_path}")
        return archive_path

    def create_daily_backup(self):
        """Create a daily backup with the current date"""
        today = datetime.now().strftime("%Y-%m-%d")
        backup_name = f"daily_backup_{today}"
        return self.create_backup(backup_name)

    def create_weekly_backup(self):
        """Create a weekly backup with the week number"""
        week_num = datetime.now().strftime("%Y-W%U")
        backup_name = f"weekly_backup_{week_num}"
        return self.create_backup(backup_name)

    def restore_from_backup(self, backup_name: str):
        """Restore PDFs from a specific backup"""
        backup_path = self.backup_dir / backup_name
        
        if not backup_path.exists():
            print(f"Backup {backup_name} does not exist")
            return False
        
        # Determine if it's a directory backup or compressed file
        if backup_path.is_dir():
            # Clear central directory first
            shutil.rmtree(self.central_pdfs_dir, ignore_errors=True)
            self.central_pdfs_dir.mkdir(exist_ok=True)
            
            # Copy files from backup to central location
            for pdf_file in backup_path.rglob("*.pdf"):
                relative_path = pdf_file.relative_to(backup_path)
                dest_path = self.central_pdfs_dir / relative_path
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(pdf_file, dest_path)
        elif backup_path.suffix == '.zip':
            # Extract ZIP file
            shutil.rmtree(self.central_pdfs_dir, ignore_errors=True)
            self.central_pdfs_dir.mkdir(exist_ok=True)
            
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(self.central_pdfs_dir)
        elif backup_path.suffix in ['.tar', '.gz']:
            # Extract tar file
            shutil.rmtree(self.central_pdfs_dir, ignore_errors=True)
            self.central_pdfs_dir.mkdir(exist_ok=True)
            
            with tarfile.open(backup_path, 'r') as tar:
                tar.extractall(self.central_pdfs_dir)
        
        print(f"Restored from backup: {backup_name}")
        return True

    def get_backup_list(self) -> List[str]:
        """Get a list of available backups"""
        backups = []
        for item in self.backup_dir.iterdir():
            if item.is_dir() or item.suffix in ['.zip', '.tar', '.gz']:
                backups.append(item.name)
        return sorted(backups, reverse=True)

    def cleanup_old_backups(self, keep_count: int = 5):
        """Remove old backups, keeping only the most recent ones"""
        backups = self.get_backup_list()
        
        if len(backups) > keep_count:
            backups_to_remove = backups[keep_count:]
            for backup_name in backups_to_remove:
                backup_path = self.backup_dir / backup_name
                if backup_path.is_file():
                    backup_path.unlink()
                elif backup_path.is_dir():
                    shutil.rmtree(backup_path)
                print(f"Removed old backup: {backup_name}")
    
    def run_backup_maintenance(self):
        """Run all backup operations based on configuration"""
        print("Running PDF backup maintenance...")
        
        # Create daily backup if configured
        if self.config.get("backup_strategy", {}).get("daily", False):
            print("Creating daily backup...")
            self.create_daily_backup()
        
        # Create compressed backup to save space
        print("Creating compressed backup...")
        self.create_compressed_backup(format='tar.gz')
        
        # Cleanup old backups
        self.cleanup_old_backups()
        
        print("Backup maintenance completed!")


def main():
    # Create the backup system instance
    backup_system = EnhancedPDFBackupSystem()
    
    # Run backup maintenance
    backup_system.run_backup_maintenance()
    
    # Show available backups
    print("\nAvailable backups:")
    for backup in backup_system.get_backup_list()[:10]:  # Show only first 10
        print(f"  - {backup}")


if __name__ == "__main__":
    main()
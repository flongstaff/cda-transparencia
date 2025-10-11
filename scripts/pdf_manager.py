#!/usr/bin/env python3
"""
Comprehensive PDF Management Solution for Carmen de Areco Transparency Portal

This script provides a complete solution for managing PDF files across the entire
project including:
1. Centralized storage
2. Deduplication
3. Distribution to required locations
4. Backup and recovery
"""

import os
import sys
import argparse
from pathlib import Path

# Import the individual modules
from manage_pdfs import PDFManager
from backup_pdfs import PDFBackupSystem


def main():
    parser = argparse.ArgumentParser(description="PDF Management System for Transparency Portal")
    parser.add_argument("action", choices=["sync", "backup", "restore", "list", "cleanup", "full-maintenance"], 
                        help="Action to perform")
    parser.add_argument("--backup-name", help="Name of backup to restore")
    parser.add_argument("--project-root", default=".", help="Root of the project")
    
    args = parser.parse_args()
    
    if args.action == "sync":
        print("Synchronizing PDFs to central location and all required directories...")
        pdf_manager = PDFManager(args.project_root)
        pdf_manager.run_full_sync()
    
    elif args.action == "backup":
        print("Creating backup of central PDFs...")
        backup_system = PDFBackupSystem(args.project_root)
        backup_system.run_backup_maintenance()
    
    elif args.action == "restore":
        if not args.backup_name:
            print("Error: --backup-name is required for restore action")
            sys.exit(1)
        
        print(f"Restoring from backup: {args.backup_name}")
        backup_system = PDFBackupSystem(args.project_root)
        backup_system.restore_from_backup(args.backup_name)
    
    elif args.action == "list":
        print("Available backups:")
        backup_system = PDFBackupSystem(args.project_root)
        for backup in backup_system.get_backup_list():
            print(f"  - {backup}")
    
    elif args.action == "cleanup":
        print("Cleaning up old backups...")
        backup_system = PDFBackupSystem(args.project_root)
        backup_system.cleanup_old_backups()
    
    elif args.action == "full-maintenance":
        print("Running full PDF management maintenance...")
        pdf_manager = PDFManager(args.project_root)
        pdf_manager.run_full_sync()
        
        backup_system = PDFBackupSystem(args.project_root)
        backup_system.run_backup_maintenance()
        
        print("Full maintenance completed!")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Comprehensive PDF Management System for Carmen de Areco Transparency Portal

This script provides a complete solution for managing PDF files across the entire
project including:
1. Content-based deduplication
2. Centralized storage with organized subdirectories
3. Distribution to frontend and backend locations
4. Backup and recovery
5. Support for GitHub Pages deployment with Cloudflare
"""

import os
import sys
import argparse
from pathlib import Path

# Import the individual modules
from enhanced_pdf_manager import EnhancedPDFManager
from enhanced_backup_system import EnhancedPDFBackupSystem


def main():
    parser = argparse.ArgumentParser(description="Enhanced PDF Management System for Transparency Portal")
    parser.add_argument("action", choices=["sync", "backup", "restore", "list", "cleanup", "full-maintenance", "deduplicate"], 
                        help="Action to perform")
    parser.add_argument("--backup-name", help="Name of backup to restore")
    parser.add_argument("--project-root", default=".", help="Root of the project")
    
    args = parser.parse_args()
    
    if args.action == "sync":
        print("Synchronizing PDFs to central location and all required directories...")
        pdf_manager = EnhancedPDFManager(args.project_root)
        pdf_manager.run_full_optimization()
    
    elif args.action == "deduplicate":
        print("Running deduplication process...")
        pdf_manager = EnhancedPDFManager(args.project_root)
        pdf_manager.run_deduplication()
        pdf_manager.cleanup_old_duplicates()
        pdf_manager.sync_to_all_locations()
    
    elif args.action == "backup":
        print("Creating backup of central PDFs...")
        backup_system = EnhancedPDFBackupSystem(args.project_root)
        backup_system.run_backup_maintenance()
    
    elif args.action == "restore":
        if not args.backup_name:
            print("Error: --backup-name is required for restore action")
            sys.exit(1)
        
        print(f"Restoring from backup: {args.backup_name}")
        backup_system = EnhancedPDFBackupSystem(args.project_root)
        backup_system.restore_from_backup(args.backup_name)
    
    elif args.action == "list":
        print("Available backups:")
        backup_system = EnhancedPDFBackupSystem(args.project_root)
        for backup in backup_system.get_backup_list():
            print(f"  - {backup}")
    
    elif args.action == "cleanup":
        print("Cleaning up old backups...")
        backup_system = EnhancedPDFBackupSystem(args.project_root)
        backup_system.cleanup_old_backups()
        
        print("Cleaning up duplicate PDFs...")
        pdf_manager = EnhancedPDFManager(args.project_root)
        pdf_manager.cleanup_old_duplicates()
    
    elif args.action == "full-maintenance":
        print("Running full PDF management maintenance...")
        
        # Run deduplication
        pdf_manager = EnhancedPDFManager(args.project_root)
        pdf_manager.run_full_optimization()
        
        # Create backup
        backup_system = EnhancedPDFBackupSystem(args.project_root)
        backup_system.run_backup_maintenance()
        
        print("Full maintenance completed!")


if __name__ == "__main__":
    main()
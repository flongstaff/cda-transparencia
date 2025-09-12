#!/usr/bin/env python3
"""
Script to safely remove organized files from original data directories
since they're now properly organized in their respective collections.
"""

import os
import shutil

def remove_organized_files():
    """Remove organized files from original data directories"""
    
    base_dir = "/Users/flong/Developer/cda-transparencia"
    data_dir = os.path.join(base_dir, "data")
    
    print("Removing organized files from original data directories...")
    print("=" * 60)
    
    # Files and directories to remove (these are now organized elsewhere)
    files_to_remove = [
        # Cycle result files
        os.path.join(data_dir, "cycle_results"),
        
        # Enhanced audit files
        os.path.join(data_dir, "enhanced_audit_data"),
        
        # Comparison reports
        os.path.join(data_dir, "comparison_reports"),
        
        # Standalone JSON files (now in organized_analysis)
        os.path.join(data_dir, "anomaly_data_2024.json"),
        os.path.join(data_dir, "budget_data_2024.json"),
        os.path.join(data_dir, "debt_data_2024.json"),
        os.path.join(data_dir, "salary_data_2024.json"),
        os.path.join(data_dir, "web_sources.json"),
        
        # Visualizations (now in organized_analysis)
        os.path.join(data_dir, "visualizations"),
    ]
    
    # Remove files and directories
    removed_count = 0
    for file_path in files_to_remove:
        if os.path.exists(file_path):
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    print(f"Removed file: {file_path}")
                    removed_count += 1
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
                    print(f"Removed directory: {file_path}")
                    removed_count += 1
            except Exception as e:
                print(f"Error removing {file_path}: {e}")
    
    # Remove CSV exports directory (now in organized_analysis)
    csv_exports_dir = os.path.join(data_dir, "csv_exports")
    if os.path.exists(csv_exports_dir):
        try:
            shutil.rmtree(csv_exports_dir)
            print(f"Removed directory: {csv_exports_dir}")
            removed_count += 1
        except Exception as e:
            print(f"Error removing {csv_exports_dir}: {e}")
    
    print(f"\nRemoval complete! Removed {removed_count} files/directories.")
    
    # Keep these directories as they may still be needed:
    # - pdf_extracts (original PDF files)
    # - markdown_documents (converted markdown files)
    # - db (database file may still be needed)

def verify_remaining_files():
    """Verify that essential files are still present"""
    
    data_dir = "/Users/flong/Developer/cda-transparencia/data"
    
    print("\nVerifying essential files are still present...")
    print("-" * 40)
    
    # Essential files that should remain
    essential_files = [
        "db",  # Database file
        "documents.db",  # Another database file
        "pdf_extracts",  # Original PDF files
        "markdown_documents",  # Converted markdown files
    ]
    
    for file_name in essential_files:
        file_path = os.path.join(data_dir, file_name)
        if os.path.exists(file_path):
            if os.path.isfile(file_path):
                size = os.path.getsize(file_path)
                print(f"✓ {file_name} ({size} bytes)")
            else:
                print(f"✓ {file_name} (directory)")
        else:
            print(f"⚠ {file_name} (missing)")

def main():
    """Main function"""
    print("Preparing to remove organized files from original data directories...")
    
    # Confirm with user before proceeding
    response = input("This will remove organized files that are now in /organized_analysis/. Continue? (y/N): ")
    if response.lower() != 'y':
        print("Operation cancelled.")
        return
    
    remove_organized_files()
    verify_remaining_files()
    print("\nCleanup complete!")

if __name__ == "__main__":
    main()
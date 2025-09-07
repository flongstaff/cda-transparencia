#!/usr/bin/env python3
"""
Script to identify organized files that can be safely removed from original data directories
since they're now properly organized in their respective collections.
"""

import os
import shutil

def list_removable_files():
    """List organized files that can be safely removed from original data directories"""
    
    base_dir = "/Users/flong/Developer/cda-transparencia"
    data_dir = os.path.join(base_dir, "data")
    
    print("Files and directories that can be safely removed")
    print("(These are now organized in /organized_analysis/)")
    print("=" * 60)
    
    # Files and directories that can be removed
    removable_items = [
        # Cycle result files
        ("Directory", os.path.join(data_dir, "cycle_results")),
        
        # Enhanced audit files
        ("Directory", os.path.join(data_dir, "enhanced_audit_data")),
        
        # Comparison reports
        ("Directory", os.path.join(data_dir, "comparison_reports")),
        
        # CSV exports (now in organized_analysis)
        ("Directory", os.path.join(data_dir, "csv_exports")),
        
        # Visualizations (now in organized_analysis)
        ("Directory", os.path.join(data_dir, "visualizations")),
        
        # Standalone JSON files (now in organized_analysis)
        ("File", os.path.join(data_dir, "anomaly_data_2024.json")),
        ("File", os.path.join(data_dir, "budget_data_2024.json")),
        ("File", os.path.join(data_dir, "debt_data_2024.json")),
        ("File", os.path.join(data_dir, "salary_data_2024.json")),
        ("File", os.path.join(data_dir, "web_sources.json")),
    ]
    
    removable_count = 0
    total_size = 0
    
    for item_type, item_path in removable_items:
        if os.path.exists(item_path):
            try:
                if item_type == "File":
                    size = os.path.getsize(item_path)
                    print(f"[FILE] {os.path.relpath(item_path, base_dir)} ({size:,} bytes)")
                    total_size += size
                else:  # Directory
                    # Calculate directory size
                    dir_size = 0
                    for root, dirs, files in os.walk(item_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            try:
                                dir_size += os.path.getsize(file_path)
                            except:
                                pass
                    print(f"[DIR]  {os.path.relpath(item_path, base_dir)} ({dir_size:,} bytes)")
                    total_size += dir_size
                removable_count += 1
            except Exception as e:
                print(f"[ERR]  {os.path.relpath(item_path, base_dir)} (Error: {e})")
    
    print(f"\nTotal items that can be removed: {removable_count}")
    print(f"Total space that can be freed: {total_size:,} bytes ({total_size / (1024*1024):.2f} MB)")
    
    # Essential files that should remain
    print(f"\nEssential files that should remain:")
    print("-" * 40)
    
    # Essential files that should remain
    essential_files = [
        os.path.join(data_dir, "db"),
        os.path.join(data_dir, "documents.db"),
        os.path.join(data_dir, "pdf_extracts"),
        os.path.join(data_dir, "markdown_documents"),
    ]
    
    for file_path in essential_files:
        if os.path.exists(file_path):
            if os.path.isfile(file_path):
                size = os.path.getsize(file_path)
                print(f"[FILE] {os.path.relpath(file_path, base_dir)} ({size:,} bytes)")
            else:
                # Calculate directory size
                dir_size = 0
                for root, dirs, files in os.walk(file_path):
                    for file in files:
                        file_path_full = os.path.join(root, file)
                        try:
                            dir_size += os.path.getsize(file_path_full)
                        except:
                            pass
                print(f"[DIR]  {os.path.relpath(file_path, base_dir)} ({dir_size:,} bytes)")
    
    return removable_items

def remove_selected_files(removable_items):
    """Remove selected files after confirmation"""
    
    print(f"\n" + "=" * 60)
    response = input("Do you want to remove these files? (y/N): ")
    if response.lower() != 'y':
        print("Operation cancelled.")
        return
    
    removed_count = 0
    for item_type, item_path in removable_items:
        if os.path.exists(item_path):
            try:
                if item_type == "File":
                    os.remove(item_path)
                    print(f"Removed file: {os.path.relpath(item_path, '/Users/flong/Developer/cda-transparencia')}")
                else:  # Directory
                    shutil.rmtree(item_path)
                    print(f"Removed directory: {os.path.relpath(item_path, '/Users/flong/Developer/cda-transparencia')}")
                removed_count += 1
            except Exception as e:
                print(f"Error removing {os.path.relpath(item_path, '/Users/flong/Developer/cda-transparencia')}: {e}")
    
    print(f"\nRemoval complete! Removed {removed_count} items.")

def main():
    """Main function"""
    print("Analyzing data directory for removable organized files...")
    
    removable_items = list_removable_files()
    
    if removable_items:
        remove_selected_files(removable_items)
    else:
        print("No removable files found.")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Script to remove organized files from original data directories
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
    removable_items = [
        # Cycle result files
        os.path.join(data_dir, "cycle_results"),
        
        # Enhanced audit files
        os.path.join(data_dir, "enhanced_audit_data"),
        
        # Comparison reports
        os.path.join(data_dir, "comparison_reports"),
        
        # CSV exports (now in organized_analysis)
        os.path.join(data_dir, "csv_exports"),
        
        # Visualizations (now in organized_analysis)
        os.path.join(data_dir, "visualizations"),
        
        # Standalone JSON files (now in organized_analysis)
        os.path.join(data_dir, "anomaly_data_2024.json"),
        os.path.join(data_dir, "budget_data_2024.json"),
        os.path.join(data_dir, "debt_data_2024.json"),
        os.path.join(data_dir, "salary_data_2024.json"),
        os.path.join(data_dir, "web_sources.json"),
    ]
    
    removed_count = 0
    total_size = 0
    
    for item_path in removable_items:
        if os.path.exists(item_path):
            try:
                # Calculate size before removal
                if os.path.isfile(item_path):
                    size = os.path.getsize(item_path)
                    os.remove(item_path)
                    print(f"Removed file: {os.path.relpath(item_path, base_dir)} ({size:,} bytes)")
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
                    shutil.rmtree(item_path)
                    print(f"Removed directory: {os.path.relpath(item_path, base_dir)} ({dir_size:,} bytes)")
                    total_size += dir_size
                removed_count += 1
            except Exception as e:
                print(f"Error removing {os.path.relpath(item_path, base_dir)}: {e}")
    
    print(f"\nRemoval complete!")
    print(f"Removed {removed_count} items")
    print(f"Freed {total_size:,} bytes ({total_size / (1024*1024):.2f} MB)")
    return removed_count, total_size

def verify_remaining_files():
    """Verify that essential files are still present"""
    
    base_dir = "/Users/flong/Developer/cda-transparencia"
    data_dir = os.path.join(base_dir, "data")
    
    print("\nVerifying essential files are still present...")
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
                print(f"✓ {os.path.relpath(file_path, base_dir)} ({size:,} bytes)")
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
                print(f"✓ {os.path.relpath(file_path, base_dir)} ({dir_size:,} bytes)")
        else:
            print(f"⚠ {os.path.relpath(file_path, base_dir)} (missing)")

def main():
    """Main function"""
    print("Removing organized files from data directory...")
    print("These files are now properly organized in /organized_analysis/")
    print()
    
    removed_count, total_size = remove_organized_files()
    verify_remaining_files()
    
    print(f"\n{'='*60}")
    print("SUMMARY:")
    print(f"  Removed {removed_count} organized files/directories")
    print(f"  Freed {total_size:,} bytes ({total_size / (1024*1024):.2f} MB)")
    print("  Essential files preserved in data directory")
    print("  All organized files available in /organized_analysis/")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
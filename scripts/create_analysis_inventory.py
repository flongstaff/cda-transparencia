#!/usr/bin/env python3
"""
Script to create a detailed inventory of organized analysis files
"""

import os
import json
from collections import defaultdict

def create_detailed_inventory():
    """Create a detailed inventory of all organized analysis files"""
    
    organized_dir = "/Users/flong/Developer/cda-transparencia/organized_analysis"
    inventory = {}
    
    # Walk through all directories and files
    for root, dirs, files in os.walk(organized_dir):
        # Skip the base directory itself
        if root == organized_dir:
            continue
            
        # Get relative path from organized_dir
        rel_path = os.path.relpath(root, organized_dir)
        
        # Split path into components
        path_parts = rel_path.split(os.sep)
        
        # Only process if we have at least one directory level
        if len(path_parts) >= 1:
            category = path_parts[0]
            
            # Initialize category in inventory if not present
            if category not in inventory:
                inventory[category] = {
                    "description": "",
                    "file_count": 0,
                    "files": []
                }
            
            # Add files to inventory
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    file_size = os.path.getsize(file_path)
                except:
                    file_size = 0
                
                # Get file extension
                _, ext = os.path.splitext(file)
                ext = ext.lower() if ext else "no_extension"
                
                file_info = {
                    "name": file,
                    "path": os.path.relpath(file_path, organized_dir),
                    "size_bytes": file_size,
                    "extension": ext
                }
                
                inventory[category]["files"].append(file_info)
                inventory[category]["file_count"] += 1
    
    # Add descriptions for each category
    descriptions = {
        "audit_cycles": "Audit cycles and enhanced audits",
        "data_analysis": "Data analysis outputs",
        "financial_oversight": "Financial oversight data",
        "governance_review": "Governance and transparency review"
    }
    
    for category in inventory:
        if category in descriptions:
            inventory[category]["description"] = descriptions[category]
    
    # Sort files in each category by name
    for category in inventory:
        inventory[category]["files"].sort(key=lambda x: x["name"])
    
    # Write inventory to JSON file
    inventory_file = os.path.join(organized_dir, "detailed_inventory.json")
    with open(inventory_file, 'w') as f:
        json.dump(inventory, f, indent=2)
    
    # Create a summary report
    summary = {
        "total_categories": len(inventory),
        "total_files": sum(inventory[cat]["file_count"] for cat in inventory),
        "by_category": {},
        "by_file_type": defaultdict(int)
    }
    
    for category, data in inventory.items():
        summary["by_category"][category] = data["file_count"]
        
        # Count file types
        for file_info in data["files"]:
            summary["by_file_type"][file_info["extension"]] += 1
    
    # Write summary to file
    summary_file = os.path.join(organized_dir, "inventory_summary.json")
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    # Create a CSV version for easier browsing
    csv_file = os.path.join(organized_dir, "detailed_inventory.csv")
    with open(csv_file, 'w') as f:
        f.write("Category,Description,Filename,Relative Path,Size (bytes),Extension\n")
        for category, data in inventory.items():
            description = data["description"]
            for file_info in data["files"]:
                # Escape commas and quotes in fields
                def escape_csv(text):
                    if isinstance(text, str) and (',' in text or '"' in text):
                        return f'"{text.replace("\"", "\"\"")}"'
                    return text
                
                category_esc = escape_csv(category)
                description_esc = escape_csv(description)
                filename_esc = escape_csv(file_info["name"])
                path_esc = escape_csv(file_info["path"])
                ext_esc = escape_csv(file_info["extension"])
                
                f.write(f"{category_esc},{description_esc},{filename_esc},{path_esc},{file_info['size_bytes']},{ext_esc}\n")
    
    print(f"Detailed inventory created!")
    print(f"Total categories: {summary['total_categories']}")
    print(f"Total files: {summary['total_files']}")
    print(f"File types: {dict(summary['by_file_type'])}")
    print(f"Inventory file: {inventory_file}")
    print(f"CSV file: {csv_file}")
    print(f"Summary file: {summary_file}")

def main():
    """Main function"""
    create_detailed_inventory()

if __name__ == "__main__":
    main()
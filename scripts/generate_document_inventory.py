#!/usr/bin/env python3
"""
Script to generate a detailed inventory of all organized documents
with their official links and metadata.
"""

import os
import json

def generate_document_inventory():
    """Generate a detailed inventory of all organized documents"""
    
    base_dir = "/Users/flong/Developer/cda-transparencia/organized_documents"
    inventory = []
    
    # Walk through all directories
    for root, dirs, files in os.walk(base_dir):
        # Skip the base directory itself and the root level files
        if root == base_dir:
            continue
            
        # Process files in file type directories
        if files:
            # Check if this is a file type directory (contains actual document files)
            path_parts = root.split(os.sep)
            if len(path_parts) >= 5:  # organized_documents/year/category/filetype
                # Check if the parent directory is a file type directory
                file_type_dir = path_parts[-1]  # This should be pdf, markdown, json, or csv
                if file_type_dir in ['pdf', 'markdown', 'json', 'csv']:
                    file_type = file_type_dir
                    category = path_parts[-2]
                    year = path_parts[-3]
                    
                    # Process files in this directory
                    for filename in files:
                        # Construct the official URL
                        # For most documents: /wp-content/uploads/{year}/{filename}
                        # Convert file extension back to PDF for the official URL
                        if file_type == 'pdf':
                            official_url = f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}"
                        elif file_type == 'markdown':
                            # Convert markdown back to PDF for the official URL
                            if filename.endswith('.md'):
                                original_filename = filename[:-3] + '.pdf'
                                official_url = f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{original_filename}"
                            else:
                                original_filename = filename + '.pdf'
                                official_url = f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{original_filename}"
                        elif file_type == 'json':
                            # Convert JSON back to PDF for the official URL
                            if filename.endswith('.json'):
                                original_filename = filename[:-5] + '.pdf'
                                official_url = f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{original_filename}"
                            else:
                                original_filename = filename + '.pdf'
                                official_url = f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{original_filename}"
                        else:  # csv or other types
                            # Try to infer the original filename
                            if '.' in filename:
                                name_part = '.'.join(filename.split('.')[:-1])
                                original_filename = name_part + '.pdf'
                            else:
                                original_filename = filename + '.pdf'
                            official_url = f"http://carmendeareco.gob.ar/wp-content/uploads/{year}/{original_filename}"
                        
                        # Get file size
                        file_path = os.path.join(root, filename)
                        try:
                            file_size = os.path.getsize(file_path)
                        except:
                            file_size = 0
                        
                        doc_entry = {
                            "year": year,
                            "category": category,
                            "file_type": file_type,
                            "filename": filename,
                            "relative_path": os.path.relpath(file_path, base_dir),
                            "official_url": official_url,
                            "file_size": file_size
                        }
                        
                        inventory.append(doc_entry)
    
    # Sort inventory by year, category, and filename
    inventory.sort(key=lambda x: (x['year'], x['category'], x['filename']))
    
    # Write inventory to file
    inventory_file = os.path.join(base_dir, "document_inventory.json")
    with open(inventory_file, 'w') as f:
        json.dump(inventory, f, indent=2)
    
    # Also create a CSV version for easier browsing
    csv_file = os.path.join(base_dir, "document_inventory.csv")
    with open(csv_file, 'w') as f:
        f.write("Year,Category,File Type,Filename,Relative Path,Official URL,File Size\n")
        for doc in inventory:
            # Escape commas and quotes in fields for CSV
            def escape_csv_field(field):
                if isinstance(field, str):
                    if ',' in field or '"' in field or '\n' in field:
                        return '"' + field.replace('"', '""') + '"'
                    return field
                return str(field)
            
            year = escape_csv_field(doc['year'])
            category = escape_csv_field(doc['category'])
            file_type = escape_csv_field(doc['file_type'])
            filename = escape_csv_field(doc['filename'])
            relative_path = escape_csv_field(doc['relative_path'])
            official_url = escape_csv_field(doc['official_url'])
            file_size = escape_csv_field(doc['file_size'])
            
            f.write(f"{year},{category},{file_type},{filename},{relative_path},{official_url},{file_size}\n")
    
    # Create a summary report
    summary = {
        "total_documents": len(inventory),
        "by_year": {},
        "by_category": {},
        "by_file_type": {}
    }
    
    for doc in inventory:
        # Count by year
        if doc['year'] not in summary['by_year']:
            summary['by_year'][doc['year']] = 0
        summary['by_year'][doc['year']] += 1
        
        # Count by category
        if doc['category'] not in summary['by_category']:
            summary['by_category'][doc['category']] = 0
        summary['by_category'][doc['category']] += 1
        
        # Count by file type
        if doc['file_type'] not in summary['by_file_type']:
            summary['by_file_type'][doc['file_type']] = 0
        summary['by_file_type'][doc['file_type']] += 1
    
    # Write summary to file
    summary_file = os.path.join(base_dir, "inventory_summary.json")
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"Document inventory generated successfully!")
    print(f"Total documents: {len(inventory)}")
    print(f"Inventory file: {inventory_file}")
    print(f"CSV file: {csv_file}")
    print(f"Summary file: {summary_file}")
    
    # Print a sample of the inventory
    print("\nSample entries:")
    for i in range(min(5, len(inventory))):
        doc = inventory[i]
        print(f"  {doc['year']}/{doc['category']}/{doc['file_type']}: {doc['filename']}")

def main():
    """Main function"""
    print("Generating document inventory...")
    generate_document_inventory()
    print("Done!")

if __name__ == "__main__":
    main()
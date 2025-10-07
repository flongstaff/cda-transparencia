#!/usr/bin/env python3
"""
Work with existing processed data without reprocessing.
This script demonstrates how to use your existing processed data in the new system.
"""

import sys
import os
import json
import pandas as pd
from pathlib import Path
from datetime import datetime

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def work_with_existing_data():
    """
    Work with existing processed data without reprocessing.
    """
    from carmen_transparencia.database import (
        initialize_database,
        create_documents_table,
        insert_metadata,
        get_document_stats,
        export_to_json
    )
    
    print("🚀 Working with existing processed data...")
    
    # Directories
    json_dir = Path("../data/preserved/json")
    csv_file = Path("../data/preserved/csv/complete_file_inventory.csv")
    
    # Check if directories exist
    if not json_dir.exists():
        print(f"❌ JSON directory not found: {json_dir}")
        return False
    
    if not csv_file.exists():
        print(f"❌ CSV file not found: {csv_file}")
        return False
    
    print(f"📂 JSON directory: {json_dir}")
    print(f"📂 CSV file: {csv_file}")
    
    # Initialize database
    print("\n🗄️  Initializing database...")
    initialize_database()
    
    # Load the main CSV file
    print(f"\n📥 Loading main inventory...")
    try:
        df = pd.read_csv(csv_file)
        print(f"   ✅ Loaded {len(df)} records from inventory")
    except Exception as e:
        print(f"   ❌ Error loading CSV: {e}")
        return False
    
    # Insert a sample of documents into the database
    print(f"\n📥 Inserting sample documents into database...")
    sample_size = min(20, len(df))  # Insert first 20 records as examples
    inserted_count = 0
    
    for index, row in df.head(sample_size).iterrows():
        try:
            # Extract data
            filename = row.get('filename', f'document_{index}')
            file_size = row.get('size_bytes', 0)
            file_type = row.get('file_type', 'unknown')
            url = row.get('official_url', f'https://carmendeareco.gob.ar/documents/{filename}')
            
            # Create a placeholder file (since we don't have the real files)
            temp_file = Path(f"/tmp/{filename}")
            temp_file.write_text(f"Placeholder for {filename}")
            
            # Insert into database
            doc_id = insert_metadata(
                url=url,
                path=temp_file,
                size=file_size,
                content_type=file_type
            )
            
            if doc_id:
                inserted_count += 1
                if inserted_count <= 5:  # Show first 5 insertions
                    print(f"   ✅ Inserted {filename} ({file_type}, {file_size} bytes)")
            
            # Clean up temp file
            temp_file.unlink()
            
        except Exception as e:
            if inserted_count <= 5:  # Show first 5 errors
                print(f"   ❌ Error inserting {filename}: {e}")
    
    print(f"   ✅ Inserted {inserted_count} documents into database")
    
    # Show database statistics
    print(f"\n📊 Database Statistics:")
    try:
        stats = get_document_stats()
        print(f"   Total documents: {stats.get('total_documents', 0)}")
        print(f"   By type: {stats.get('by_type', {})}")
        if 'size_stats' in stats:
            size_stats = stats['size_stats']
            print(f"   Total size: {size_stats.get('total_size', 0)} bytes")
            print(f"   Average size: {size_stats.get('avg_size', 0)} bytes")
    except Exception as e:
        print(f"   ❌ Error getting stats: {e}")
    
    # Export database to JSON for verification
    print(f"\n📤 Exporting database to JSON...")
    try:
        export_file = "database_export.json"
        if export_to_json(export_file):
            print(f"   ✅ Database exported to {export_file}")
        else:
            print(f"   ❌ Failed to export database")
    except Exception as e:
        print(f"   ❌ Error exporting database: {e}")
    
    # Summary
    print(f"\n🎉 Working with existing data completed!")
    print(f"   Processed records: {sample_size}")
    print(f"   Database entries: {inserted_count}")
    print(f"   Export file: {export_file}")
    
    return True

def main():
    """Main function."""
    try:
        success = work_with_existing_data()
        if success:
            print(f"\n✨ Successfully worked with existing data!")
            print(f"🗄️  Database file: audit.db")
            return 0
        else:
            print(f"\n💥 Failed to work with existing data!")
            return 1
    except Exception as e:
        print(f"\n💥 Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
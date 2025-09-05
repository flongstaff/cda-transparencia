#!/usr/bin/env python3
"""
Load documents data into the PostgreSQL database
"""

import json
import psycopg2
from pathlib import Path
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters from environment
DB_PARAMS = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'transparency_portal'),
    'user': 'flong',  # Use current user instead of postgres
    'password': os.getenv('DB_PASSWORD', '')  # Empty password for local user
}

def connect_to_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def load_documents_data(conn):
    """Load documents data into database"""
    try:
        # Find all JSON files in the preserved/json directory
        json_dir = Path("data/preserved/json")
        if not json_dir.exists():
            print("Documents data directory not found")
            return False
        
        json_files = list(json_dir.glob("*.json"))
        if not json_files:
            print("No JSON files found in documents data directory")
            return False
        
        cursor = conn.cursor()
        inserted_count = 0
        updated_count = 0
        skipped_count = 0
        
        # Process each JSON file
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Handle different data formats
                documents = []
                if isinstance(data, list):
                    documents = data
                elif isinstance(data, dict) and 'documents' in data:
                    documents = data['documents']
                elif isinstance(data, dict):
                    # Check if it's a single document object
                    if 'filename' in data or 'name' in data:
                        documents = [data]
                    else:
                        # Skip if it's not a document format we recognize
                        continue
                else:
                    print(f"Unexpected data format in {json_file}")
                    continue
                
                # Insert documents
                for doc in documents:
                    try:
                        # Extract relevant fields
                        filename = doc.get('filename', doc.get('name', ''))
                        if not filename:
                            skipped_count += 1
                            continue
                            
                        url = doc.get('url', '')
                        location = doc.get('absolute_path', doc.get('path', ''))
                        size = doc.get('size', 0)
                        content_type = doc.get('content_type', 'application/pdf')
                        sha256 = doc.get('sha256_hash', doc.get('sha256', ''))
                        
                        # Insert document with conflict handling
                        cursor.execute("""
                            INSERT INTO transparency.documents 
                            (filename, url, location, size, content_type, sha256, created_at, last_verified, status)
                            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, %s)
                            ON CONFLICT (filename) DO UPDATE SET
                                url = EXCLUDED.url,
                                location = EXCLUDED.location,
                                size = EXCLUDED.size,
                                content_type = EXCLUDED.content_type,
                                sha256 = EXCLUDED.sha256,
                                last_verified = CURRENT_TIMESTAMP
                            WHERE transparency.documents.filename = EXCLUDED.filename
                            RETURNING id
                        """, (
                            filename,
                            url,
                            location,
                            size,
                            content_type,
                            sha256,
                            'active'
                        ))
                        
                        result = cursor.fetchone()
                        if result:
                            inserted_count += 1
                        else:
                            updated_count += 1
                        
                    except Exception as e:
                        print(f"Error inserting document from {json_file}: {e}")
                        skipped_count += 1
                        continue
                        
            except Exception as e:
                print(f"Error processing {json_file}: {e}")
                continue
        
        conn.commit()
        print(f"Successfully loaded {inserted_count} new documents, updated {updated_count} documents, skipped {skipped_count} documents")
        return True
        
    except Exception as e:
        print(f"Error loading documents data: {e}")
        return False

def main():
    """Main function"""
    print("Loading documents data into database...")
    print(f"Connecting to: {DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['database']} as {DB_PARAMS['user']}")
    
    # Connect to database
    conn = connect_to_db()
    if not conn:
        return 1
    
    try:
        # Load documents data
        if load_documents_data(conn):
            print("✅ Documents data loaded successfully")
            return 0
        else:
            print("❌ Failed to load documents data")
            return 1
    finally:
        conn.close()

if __name__ == "__main__":
    sys.exit(main())
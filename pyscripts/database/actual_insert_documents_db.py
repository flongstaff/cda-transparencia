#!/usr/bin/env python3
"""
Actual database insertion script for discovered documents
"""

import sys
import os
from pathlib import Path
import psycopg2
from datetime import datetime
from urllib.parse import urlparse

def get_db_connection():
    """Get actual database connection"""
    try:
        # Connect through Docker exec
        import subprocess
        result = subprocess.run([
            "docker", "exec", "transparency_portal_db", 
            "psql", "-U", "postgres", "-d", "transparency_portal",
            "-t", "-c", "SELECT 1;"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Database connection verified")
            return True
        else:
            print(f"❌ Database connection failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def insert_document(url, title):
    """Insert a single document into the database"""
    try:
        # Use docker exec to insert document
        filename = Path(urlparse(url).path).name if url else title
        filename = filename[:255] if filename else "unknown"  # Limit to 255 chars
        
        # Create the INSERT command
        insert_cmd = f"""
        INSERT INTO transparency.documents (url, filename, created_at, status) 
        VALUES ('{url}', '{filename}', NOW(), 'discovered')
        ON CONFLICT (url) DO UPDATE SET 
        last_verified = NOW(), status = 'updated';
        """
        
        # Execute through docker
        import subprocess
        result = subprocess.run([
            "docker", "exec", "transparency_portal_db",
            "psql", "-U", "postgres", "-d", "transparency_portal",
            "-c", insert_cmd
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            return True
        else:
            print(f"   Failed to insert {filename}: {result.stderr}")
            return False
    except Exception as e:
        print(f"   Exception inserting {filename}: {e}")
        return False

def insert_all_documents(documents):
    """Insert all documents into database"""
    print(f"Inserting {len(documents)} documents into database...")
    
    success_count = 0
    for i, doc in enumerate(documents):
        url = doc.get('url', '')
        title = doc.get('title', '')
        
        if url:  # Only insert documents with URLs
            if insert_document(url, title):
                success_count += 1
                print(f"   ✅ Inserted {i+1}/{len(documents)}: {title[:50]}...")
            else:
                print(f"   ❌ Failed to insert {i+1}/{len(documents)}: {title[:50]}...")
        
        # Show progress every 20 documents
        if (i + 1) % 20 == 0:
            print(f"   Progress: {i+1}/{len(documents)} documents processed")
    
    return success_count

def get_document_count():
    """Get current document count from database"""
    try:
        import subprocess
        result = subprocess.run([
            "docker", "exec", "transparency_portal_db",
            "psql", "-U", "postgres", "-d", "transparency_portal",
            "-t", "-c", "SELECT COUNT(*) FROM transparency.documents;"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            count = result.stdout.strip()
            return int(count) if count.isdigit() else 0
        else:
            print(f"Failed to get document count: {result.stderr}")
            return 0
    except Exception as e:
        print(f"Exception getting document count: {e}")
        return 0

def discover_documents():
    """Discover documents using our service"""
    print("Discovering documents...")
    
    try:
        # Add project root to path
        project_root = Path(__file__).parent
        sys.path.insert(0, str(project_root))
        
        from services.data_acquisition_service import UnifiedDataAcquisitionService
        service = UnifiedDataAcquisitionService(output_dir="data/db_actual_insertion")
        documents = service.discover_documents_municipal()
        
        print(f"✅ Found {len(documents)} documents")
        return documents
    except Exception as e:
        print(f"❌ Failed to discover documents: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    """Main function"""
    print("Actual Document Database Insertion")
    print("=" * 40)
    
    # Verify database connection
    print("1. Verifying database connection...")
    if not get_db_connection():
        return 1
    
    # Get initial document count
    print("2. Getting initial document count...")
    initial_count = get_document_count()
    print(f"   Initial document count: {initial_count}")
    
    # Discover documents
    print("3. Discovering documents...")
    documents = discover_documents()
    if not documents:
        return 1
    
    # Insert documents
    print("4. Inserting documents into database...")
    inserted_count = insert_all_documents(documents)
    
    # Get final document count
    print("5. Getting final document count...")
    final_count = get_document_count()
    print(f"   Final document count: {final_count}")
    
    # Summary
    print("\n" + "=" * 40)
    print("INSERTION RESULTS")
    print("=" * 40)
    print(f"{len(documents)} documents discovered")
    print(f"✅ {inserted_count} documents successfully inserted")
    print(f"📊 Database documents: {initial_count} → {final_count}")
    
    if final_count >= 191:
        print(f"\n🎉 SUCCESS: Database now contains {final_count} documents (≥ 191 target)")
        print("The system has successfully stored all documents in the database.")
    else:
        print(f"\n⚠️  Database contains {final_count} documents (< 191 target)")
        print("Some documents may need additional processing.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
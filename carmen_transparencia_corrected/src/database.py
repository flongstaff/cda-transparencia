# database.py
"""
Convenience wrappers for persisting to SQLite database.
"""

import pathlib
import sqlite3
import pandas as pd
import hashlib
import json
from typing import Optional, List, Dict, Any

DB_PATH = pathlib.Path.cwd() / "audit.db"

def _conn() -> sqlite3.Connection:
    """Get a database connection with row factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_documents_table() -> None:
    """
    Create a comprehensive documents table for the audit.
    """
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE,
                filename TEXT NOT NULL,
                location TEXT,
                size INTEGER,
                content_type TEXT,
                sha256 TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )
        """)
        
        # Create indexes for better performance
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_documents_filename 
            ON documents(filename)
        """)
        
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_documents_sha256 
            ON documents(sha256)
        """)

def create_processed_files_table() -> None:
    """
    Create a table to track processed files (CSV, TXT, Markdown outputs).
    """
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS processed_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                original_filename TEXT NOT NULL,
                processed_filename TEXT NOT NULL,
                processing_type TEXT NOT NULL,
                file_size INTEGER,
                processing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT 1,
                error_message TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
        """)

def create_financial_data_table() -> None:
    """
    Create a table to store extracted financial data.
    """
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS financial_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                year INTEGER,
                amount DECIMAL(15,2),
                concept TEXT,
                category TEXT,
                date_extracted DATE,
                extraction_method TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
        """)

def insert_metadata(
        url: str,
        path: pathlib.Path,
        size: int,
        content_type: str,
) -> Optional[int]:
    """
    Insert one file record with SHA-256 hash.
    Returns the document ID if successful, None otherwise.
    """
    try:
        # Calculate SHA-256 hash
        sha = hashlib.sha256()
        with open(path, "rb") as fh:
            for chunk in iter(lambda: fh.read(4096), b""):
                sha.update(chunk)
        hash_value = sha.hexdigest()
        
        with _conn() as conn:
            cursor = conn.execute("""
                INSERT OR IGNORE INTO documents
                (url, filename, location, size, content_type, sha256)
                VALUES (?,?,?,?,?,?)
            """, (url, path.name, str(path), size, content_type, hash_value))
            
            if cursor.rowcount > 0:
                return cursor.lastrowid
            else:
                # Get existing document ID
                result = conn.execute(
                    "SELECT id FROM documents WHERE url = ?", (url,)
                ).fetchone()
                return result['id'] if result else None
                
    except Exception as e:
        print(f"Error inserting metadata for {path}: {e}")
        return None

def insert_processed_file(
        document_id: int,
        original_filename: str,
        processed_filename: str,
        processing_type: str,
        file_size: int = 0,
        success: bool = True,
        error_message: str = None
) -> bool:
    """
    Insert a record of a processed file.
    Returns True if successful, False otherwise.
    """
    try:
        with _conn() as conn:
            conn.execute("""
                INSERT INTO processed_files
                (document_id, original_filename, processed_filename, 
                 processing_type, file_size, success, error_message)
                VALUES (?,?,?,?,?,?,?)
            """, (document_id, original_filename, processed_filename, 
                  processing_type, file_size, success, error_message))
            return True
    except Exception as e:
        print(f"Error inserting processed file record: {e}")
        return False

def load_from_csv(csv_file: str) -> pd.DataFrame:
    """
    Parse a metadata CSV file returned by the scraper.
    """
    try:
        return pd.read_csv(csv_file, dtype=str)
    except Exception as e:
        print(f"Error loading CSV {csv_file}: {e}")
        return pd.DataFrame()

def get_document_stats() -> Dict[str, Any]:
    """
    Get comprehensive statistics about documents in the database.
    """
    with _conn() as conn:
        stats = {}
        
        # Basic document counts
        result = conn.execute("SELECT COUNT(*) as total FROM documents").fetchone()
        stats['total_documents'] = result['total']
        
        # Document types
        type_results = conn.execute("""
            SELECT content_type, COUNT(*) as count 
            FROM documents 
            GROUP BY content_type 
            ORDER BY count DESC
        """).fetchall()
        stats['by_type'] = {row['content_type']: row['count'] for row in type_results}
        
        # File sizes
        size_result = conn.execute("""
            SELECT 
                SUM(size) as total_size,
                AVG(size) as avg_size,
                MIN(size) as min_size,
                MAX(size) as max_size
            FROM documents
        """).fetchone()
        stats['size_stats'] = dict(size_result)
        
        # Processing stats
        proc_result = conn.execute("""
            SELECT 
                processing_type,
                COUNT(*) as count,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful
            FROM processed_files 
            GROUP BY processing_type
        """).fetchall()
        stats['processing'] = {
            row['processing_type']: {
                'total': row['count'],
                'successful': row['successful']
            } for row in proc_result
        }
        
        return stats

def cleanup_duplicates() -> int:
    """
    Remove duplicate documents based on SHA-256 hash.
    Returns the number of duplicates removed.
    """
    with _conn() as conn:
        # Find duplicates
        duplicates = conn.execute("""
            SELECT sha256, COUNT(*) as count, MIN(id) as keep_id
            FROM documents 
            WHERE sha256 IS NOT NULL
            GROUP BY sha256 
            HAVING COUNT(*) > 1
        """).fetchall()
        
        removed_count = 0
        for dup in duplicates:
            # Delete all but the first occurrence
            result = conn.execute("""
                DELETE FROM documents 
                WHERE sha256 = ? AND id != ?
            """, (dup['sha256'], dup['keep_id']))
            removed_count += result.rowcount
        
        return removed_count

def export_to_json(output_file: str) -> bool:
    """
    Export all database contents to a JSON file.
    Returns True if successful, False otherwise.
    """
    try:
        with _conn() as conn:
            # Get all documents
            documents = conn.execute("""
                SELECT * FROM documents ORDER BY created_at
            """).fetchall()
            
            # Get processed files
            processed = conn.execute("""
                SELECT * FROM processed_files ORDER BY processing_date
            """).fetchall()
            
            # Convert to dictionaries
            export_data = {
                'export_date': pd.Timestamp.now().isoformat(),
                'documents': [dict(row) for row in documents],
                'processed_files': [dict(row) for row in processed],
                'statistics': get_document_stats()
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False, default=str)
            
            return True
    except Exception as e:
        print(f"Error exporting to JSON: {e}")
        return False

def initialize_database() -> None:
    """
    Initialize all database tables.
    """
    create_documents_table()
    create_processed_files_table()
    create_financial_data_table()
    print("✅ Database initialized successfully")

if __name__ == '__main__':
    initialize_database()
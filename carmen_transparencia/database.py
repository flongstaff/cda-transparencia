# database.py
"""
Convenience wrappers for persisting to SQLite or PostgreSQL database.
"""

import pathlib
import sqlite3
import pandas as pd
import hashlib
from contextlib import contextmanager
from typing import Iterator

# Global connection
_conn = None

@contextmanager
def _conn_context() -> Iterator[sqlite3.Connection]:
    """
    Context manager for database connections.
    """
    global _conn
    if _conn is None:
        _conn = sqlite3.connect("transparency.db")
        _conn.row_factory = sqlite3.Row
    try:
        yield _conn
    finally:
        pass  # Keep connection open

def create_documents_table() -> None:
    """
    Create a comprehensive documents table for the audit.
    """
    with _conn_context() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL UNIQUE,
                filepath TEXT NOT NULL,
                filesize INTEGER,
                filetype TEXT,
                year INTEGER,
                month INTEGER,
                category TEXT,
                hash TEXT UNIQUE,
                processed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def insert_metadata(filepath: str, year: int = None, month: int = None, category: str = None) -> None:
    """
    Insert a document into the database.
    """
    path = pathlib.Path(filepath)
    filename = path.name
    filesize = path.stat().st_size if path.exists() else None
    filetype = path.suffix.lower()
    
    # Calculate file hash
    hash = None
    if path.exists():
        with open(path, "rb") as f:
            bytes = f.read()
            hash = hashlib.md5(bytes).hexdigest()
    
    with _conn_context() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO documents 
            (filename, filepath, filesize, filetype, year, month, category, hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (filename, str(path), filesize, filetype, year, month, category, hash))
        conn.commit()

def get_documents() -> list:
    """
    Retrieve all documents from the database.
    """
    with _conn_context() as conn:
        cursor = conn.execute("SELECT * FROM documents")
        return cursor.fetchall()

def mark_processed(filepath: str) -> None:
    """
    Mark a document as processed.
    """
    with _conn_context() as conn:
        conn.execute("""
            UPDATE documents 
            SET processed = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE filepath = ?
        """, (filepath,))
        conn.commit()

def get_document_stats() -> dict:
    """
    Get statistics about documents in the database.
    """
    with _conn_context() as conn:
        cursor = conn.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN processed = 1 THEN 1 ELSE 0 END) as processed,
                SUM(CASE WHEN filetype = '.pdf' THEN 1 ELSE 0 END) as pdf_count,
                SUM(CASE WHEN filetype = '.xlsx' THEN 1 ELSE 0 END) as xlsx_count,
                SUM(CASE WHEN filetype = '.docx' THEN 1 ELSE 0 END) as docx_count
            FROM documents
        """)
        result = cursor.fetchone()
        return {
            'total': result[0],
            'processed': result[1],
            'pdf_count': result[2],
            'xlsx_count': result[3],
            'docx_count': result[4]
        }

def initialize_database() -> None:
    """
    Initialize the database with all required tables.
    """
    create_documents_table()

def load_from_csv(filepath: str) -> pd.DataFrame:
    """
    Load data from a CSV file into a pandas DataFrame.
    """
    return pd.read_csv(filepath)
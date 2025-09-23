#!/usr/bin/env python3
"""
Simple script to initialize the documents database for the backend.
"""

import sqlite3
import os
from pathlib import Path

# Database path - same as used in DocumentService.js
DB_PATH = Path("data/documents.db")

def create_database():
    """Create the documents database with required tables."""
    
    # Create data directory if it doesn't exist
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    # Connect to database (creates it if it doesn't exist)
    conn = sqlite3.connect(DB_PATH)
    
    # Create tables
    cursor = conn.cursor()
    
    # Documents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            original_path TEXT,
            markdown_path TEXT,
            document_type TEXT,
            category TEXT,
            year INTEGER,
            file_size INTEGER,
            file_hash TEXT,
            verification_status TEXT,
            official_url TEXT,
            archive_url TEXT,
            markdown_available BOOLEAN,
            verification_status_badge TEXT,
            display_category TEXT,
            file_size_formatted TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    # Document content table (for extracted content)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id TEXT,
            page_number INTEGER,
            content TEXT,
            searchable_text TEXT,
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
    """)
    
    # Budget data table (for financial data extraction)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS budget_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id TEXT,
            year INTEGER,
            category TEXT,
            budgeted_amount REAL,
            executed_amount REAL,
            execution_percentage REAL,
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
    """)
    
    # Verification audit table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS verification_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id TEXT,
            verification_method TEXT,
            verification_date TEXT,
            status TEXT,
            notes TEXT,
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
    """)
    
    # Full-text search table for document content
    cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS document_content_fts USING fts5(
            document_id,
            content
        )
    """)
    
    # Add financial data columns if they don't exist
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN budgeted REAL")
        print("Added budgeted column to documents table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e).lower():
            print(f"Warning: Could not add budgeted column: {e}")
    
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN executed REAL")
        print("Added executed column to documents table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e).lower():
            print(f"Warning: Could not add executed column: {e}")
    
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN execution_rate REAL")
        print("Added execution_rate column to documents table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e).lower():
            print(f"Warning: Could not add execution_rate column: {e}")
    
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN financial_summary TEXT")
        print("Added financial_summary column to documents table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e).lower():
            print(f"Warning: Could not add financial_summary column: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database created successfully at {DB_PATH}")

if __name__ == "__main__":
    try:
        create_database()
        print("🎉 Documents database initialization complete!")
    except Exception as e:
        print(f"💥 Error creating database: {e}")
        exit(1)
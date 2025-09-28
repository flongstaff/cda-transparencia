#!/usr/bin/env python3
"""
Script to import all transparency data CSV files into the SQLite database
for the Carmen de Areco Transparency Portal.
"""

import sys
import os
import pandas as pd
import sqlite3
from pathlib import Path

def import_csv_to_database():
    """Import all CSV files into the SQLite database."""
    
    # Database connection
    db_path = "carmen_transparencia/data/documents.db"
    
    # Ensure the directory exists
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    
    # Create the documents table if it doesn't exist
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT,
                title TEXT,
                category TEXT,
                year INTEGER,
                quarter TEXT,
                size_mb REAL,
                source TEXT,
                path TEXT,
                official_url TEXT,
                last_modified TEXT,
                processing_date TEXT,
                verification_status TEXT,
                document_type TEXT,
                priority TEXT,
                has_structured_data BOOLEAN,
                extracted_data TEXT
            )
        """)
    
    # CSV files to import
    csv_dir = Path("data/csv")
    csv_files = list(csv_dir.glob("*.csv"))
    
    print(f"Found {len(csv_files)} CSV files to import...")
    
    for csv_file in csv_files:
        print(f"Processing {csv_file.name}...")
        
        # Load the CSV file
        df = pd.read_csv(csv_file)
        
        # Determine document type based on filename
        filename = csv_file.name
        if "2019" in filename:
            doc_type = "financial_report"
            category = "financial_reports"
            year = 2019
        elif "transparency" in filename:
            doc_type = "transparency_document"
            category = "transparency"
            year = 2022  # Default, will be refined if possible
        elif "licitaciones" in filename:
            doc_type = "tender"
            category = "tenders"
            year = 2023  # Based on naming
        elif "estadisticas" in filename:
            doc_type = "statistical_report"
            category = "statistics"
            year = 2022  # Default, will be refined if possible
        else:
            doc_type = "other"
            category = "other"
            year = 2022  # Default year
        
        # Generate a unique ID (using filename)
        doc_id = f"csv_{filename.replace('.csv', '').replace('.', '_')}"
        
        # Insert document metadata into database
        with conn:
            conn.execute("""
                INSERT OR REPLACE INTO documents (
                    id, filename, title, category, year, 
                    size_mb, source, path, document_type, 
                    has_structured_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                doc_id,
                filename,
                f"{category.replace('_', ' ').title()} Data {year}",
                category,
                year,
                csv_file.stat().st_size / (1024 * 1024),  # Size in MB
                "Internal CSV",
                str(csv_file),
                doc_type,
                True  # has structured data
            ))
    
    conn.close()
    print("All CSV files have been successfully imported into the database!")

if __name__ == "__main__":
    import_csv_to_database()
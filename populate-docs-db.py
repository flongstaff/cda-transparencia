#!/usr/bin/env python3
"""
Script to populate the documents database with sample data.
"""

import sqlite3
import os
import json
from pathlib import Path
from datetime import datetime

# Database path
DB_PATH = Path("data/documents.db")

def populate_database():
    """Populate the documents database with sample data."""
    
    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Sample documents data
    sample_documents = [
        {
            'id': 'doc-001',
            'filename': 'Presupuesto-Municipal-2024.pdf',
            'original_path': '/data/pdf_extracts/2024/Presupuesto-Municipal-2024.pdf',
            'document_type': 'budget',
            'category': 'Presupuesto',
            'year': 2024,
            'file_size': 2500000,
            'file_hash': 'abc123def456',
            'verification_status': 'verified',
            'official_url': 'https://carmendeareco.gob.ar/transparencia/2024/Presupuesto-Municipal-2024.pdf',
            'archive_url': 'https://web.archive.org/web/20241201120000/carmendeareco.gob.ar/transparencia/2024/Presupuesto-Municipal-2024.pdf',
            'markdown_available': True,
            'verification_status_badge': '✅ Verificado',
            'display_category': '💰 Presupuesto Municipal',
            'file_size_formatted': '2.5 MB',
            'created_at': '2024-01-01T00:00:00Z',
            'updated_at': '2024-01-01T00:00:00Z'
        },
        {
            'id': 'doc-002',
            'filename': 'Ejecucion-de-Gastos-2024-Q4.pdf',
            'original_path': '/data/pdf_extracts/2024/Ejecucion-de-Gastos-2024-Q4.pdf',
            'document_type': 'expense_execution',
            'category': 'Gastos',
            'year': 2024,
            'file_size': 1800000,
            'file_hash': 'def456ghi789',
            'verification_status': 'verified',
            'official_url': 'https://carmendeareco.gob.ar/transparencia/2024/Ejecucion-de-Gastos-2024-Q4.pdf',
            'archive_url': 'https://web.archive.org/web/20241201120000/carmendeareco.gob.ar/transparencia/2024/Ejecucion-de-Gastos-2024-Q4.pdf',
            'markdown_available': True,
            'verification_status_badge': '✅ Verificado',
            'display_category': '📊 Ejecución de Gastos',
            'file_size_formatted': '1.8 MB',
            'created_at': '2024-12-31T00:00:00Z',
            'updated_at': '2024-12-31T00:00:00Z'
        },
        {
            'id': 'doc-003',
            'filename': 'Licitacion-Publica-N10-2025.pdf',
            'original_path': '/data/pdf_extracts/2025/Licitacion-Publica-N10-2025.pdf',
            'document_type': 'contract',
            'category': 'Contrataciones',
            'year': 2025,
            'file_size': 1200000,
            'file_hash': 'ghi789jkl012',
            'verification_status': 'verified',
            'official_url': 'https://carmendeareco.gob.ar/transparencia/2025/Licitacion-Publica-N10-2025.pdf',
            'archive_url': 'https://web.archive.org/web/20241201120000/carmendeareco.gob.ar/transparencia/2025/Licitacion-Publica-N10-2025.pdf',
            'markdown_available': True,
            'verification_status_badge': '✅ Verificado',
            'display_category': '📋 Licitaciones Públicas',
            'file_size_formatted': '1.2 MB',
            'created_at': '2025-01-15T00:00:00Z',
            'updated_at': '2025-01-15T00:00:00Z'
        }
    ]
    
    # Insert sample documents
    for doc in sample_documents:
        cursor.execute("""
            INSERT OR REPLACE INTO documents (
                id, filename, original_path, document_type, category, year, file_size,
                file_hash, verification_status, official_url, archive_url, markdown_available,
                verification_status_badge, display_category, file_size_formatted, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc['id'], doc['filename'], doc['original_path'], doc['document_type'], doc['category'],
            doc['year'], doc['file_size'], doc['file_hash'], doc['verification_status'], doc['official_url'],
            doc['archive_url'], doc['markdown_available'], doc['verification_status_badge'], doc['display_category'],
            doc['file_size_formatted'], doc['created_at'], doc['updated_at']
        ))
    
    conn.commit()
    conn.close()
    
    print(f"✅ Inserted {len(sample_documents)} sample documents into the database")
    return True

if __name__ == "__main__":
    try:
        if populate_database():
            print("🎉 Database population complete!")
        else:
            print("💥 Failed to populate database")
            exit(1)
    except Exception as e:
        print(f"💥 Error populating database: {e}")
        exit(1)
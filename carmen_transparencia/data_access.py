
import sqlite3
import json
from datetime import datetime, timedelta

DB_PATH = "carmen_transparencia/data/documents.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_db_connection()
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

def insert_document(doc):
    conn = get_db_connection()
    with conn:
        conn.execute("""
            INSERT OR REPLACE INTO documents (
                id, filename, title, category, year, quarter, size_mb, source, path, 
                official_url, last_modified, processing_date, verification_status, 
                document_type, priority, has_structured_data, extracted_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc.get('id'), doc.get('filename'), doc.get('title'), doc.get('category'),
            doc.get('year'), doc.get('quarter'), doc.get('size_mb'), doc.get('source'),
            doc.get('path'), doc.get('official_url'), doc.get('last_modified'),
            doc.get('processing_date'), doc.get('verification_status'),
            doc.get('document_type'), doc.get('priority'),
            doc.get('has_structured_data', False),
            json.dumps(doc.get('extracted_data')) if doc.get('extracted_data') else None
        ))

def get_documents_by_category(category):
    conn = get_db_connection()
    with conn:
        return conn.execute("SELECT * FROM documents WHERE category = ?", (category,)).fetchall()

def get_documents_by_year(year):
    conn = get_db_connection()
    with conn:
        return conn.execute("SELECT * FROM documents WHERE year = ?", (year,)).fetchall()

def get_high_priority_documents():
    conn = get_db_connection()
    with conn:
        return conn.execute("SELECT * FROM documents WHERE priority = 'high' ORDER BY year DESC").fetchall()

def get_budget_execution_documents():
    conn = get_db_connection()
    with conn:
        return conn.execute("SELECT * FROM documents WHERE document_type = 'budget_execution' ORDER BY year DESC, quarter ASC").fetchall()

def get_all_documents():
    conn = get_db_connection()
    with conn:
        return conn.execute("SELECT * FROM documents").fetchall()

def get_document_by_id(doc_id):
    conn = get_db_connection()
    with conn:
        return conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()

def get_statistics():
    conn = get_db_connection()
    with conn:
        docs = conn.execute("SELECT * FROM documents").fetchall()
        total_documents = len(docs)
        by_category = {row['category']: row['count'] for row in conn.execute("SELECT category, COUNT(*) as count FROM documents GROUP BY category").fetchall()}
        by_year = {row['year']: row['count'] for row in conn.execute("SELECT year, COUNT(*) as count FROM documents GROUP BY year").fetchall()}
        by_source = {row['source']: row['count'] for row in conn.execute("SELECT source, COUNT(*) as count FROM documents GROUP BY source").fetchall()}
        by_priority = {row['priority']: row['count'] for row in conn.execute("SELECT priority, COUNT(*) as count FROM documents GROUP BY priority").fetchall()}
        budget_execution_count = conn.execute("SELECT COUNT(*) as count FROM documents WHERE document_type = 'budget_execution'").fetchone()['count']
        total_size_mb = conn.execute("SELECT SUM(size_mb) as total_size FROM documents").fetchone()['total_size']
        latest_document = conn.execute("SELECT * FROM documents ORDER BY last_modified DESC LIMIT 1").fetchone()

        return {
            'total_documents': total_documents,
            'by_category': by_category,
            'by_year': by_year,
            'by_source': by_source,
            'by_priority': by_priority,
            'budget_execution_count': budget_execution_count,
            'total_size_mb': total_size_mb,
            'latest_document': dict(latest_document) if latest_document else None
        }

def needs_refresh():
    conn = get_db_connection()
    with conn:
        last_updated_row = conn.execute("SELECT MAX(last_modified) as last_updated FROM documents").fetchone()
        if last_updated_row and last_updated_row['last_updated']:
            last_updated = datetime.fromisoformat(last_updated_row['last_updated'])
            return datetime.now() - last_updated > timedelta(hours=1)
    return True

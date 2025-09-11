import sqlite3
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

source_dbs = [
    os.path.join(project_root, 'data', 'documents.db'),
    os.path.join(project_root, 'data', 'test.db'),
    os.path.join(project_root, 'scripts', 'audit', 'audit_irregularities', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'audit_irregularities', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'audit_results', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'test_run', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'enhanced_audit', 'audit_results.db'),
    os.path.join(project_root, 'scripts', 'audit', 'infrastructure_tracking', 'projects.db'),
    os.path.join(project_root, 'scripts', 'audit', 'optimized', 'transparency_optimized.db'),
]

dest_db = os.path.join(project_root, 'transparency_data', 'transparency.db')

def get_all_data():
    all_data = []
    for db_path in source_dbs:
        if not os.path.exists(db_path):
            continue
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        for table_name in tables:
            table_name = table_name[0]
            if table_name.startswith('sqlite'):
                continue
            try:
                cursor.execute(f"SELECT * FROM {table_name}")
                rows = cursor.fetchall()
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    row_dict = dict(zip(columns, row))
                    row_dict['source_table'] = table_name
                    row_dict['source_db'] = os.path.basename(db_path)
                    all_data.append(row_dict)
            except sqlite3.OperationalError:
                continue
        conn.close()
    return all_data

def create_unified_table(cursor):
    cursor.execute('DROP TABLE IF EXISTS documents')
    cursor.execute('''
        CREATE TABLE documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT, title TEXT, year INTEGER, category TEXT,
            document_type TEXT, file_type TEXT, file_size REAL, url TEXT,
            official_url TEXT, archive_url TEXT, verification_status TEXT,
            created_at TEXT, last_modified TEXT, content TEXT, budgeted_amount REAL,
            executed_amount REAL, execution_percentage REAL, irregularity_type TEXT,
            irregularity_description TEXT, irregularity_severity TEXT,
            project_name TEXT, contractor TEXT, source_db TEXT,
            UNIQUE(title, year, source_db)
        )
    ''')

def map_and_insert(cursor, data):
    for row in data:
        mapped_row = {
            'filename': row.get('filename') or row.get('document_name') or 'N/A',
            'title': row.get('title') or row.get('project_name') or row.get('description') or 'N/A',
            'year': row.get('year') or 0,
            'category': row.get('category') or 'N/A',
            'document_type': row.get('document_type') or row.get('finding_type') or 'N/A',
            'file_type': row.get('filetype') or row.get('file_type') or 'N/A',
            'file_size': row.get('file_size') or row.get('size') or row.get('filesize') or 0,
            'url': row.get('url') or row.get('source_url') or 'N/A',
            'official_url': row.get('official_url') or 'N/A',
            'archive_url': row.get('archive_url') or 'N/A',
            'verification_status': row.get('verification_status') or row.get('status') or row.get('compliance_status') or 'N/A',
            'created_at': row.get('created_at') or row.get('detection_date') or row.get('award_date') or 'N/A',
            'last_modified': row.get('updated_at') or row.get('last_updated') or 'N/A',
            'content': row.get('content') or row.get('summary') or row.get('description') or 'N/A',
            'budgeted_amount': row.get('budgeted_amount') or 0,
            'executed_amount': row.get('actual_spent') or row.get('executed_amount') or 0,
            'execution_percentage': row.get('execution_percentage') or 0,
            'irregularity_type': row.get('irregularity_type') or 'N/A',
            'irregularity_description': row.get('description') or 'N/A',
            'irregularity_severity': row.get('severity') or 'N/A',
            'project_name': row.get('project_name') or 'N/A',
            'contractor': row.get('contractor') or row.get('contractor_name') or 'N/A',
            'source_db': row.get('source_db') or 'N/A'
        }
        
        columns = ', '.join(mapped_row.keys())
        placeholders = ', '.join('?' * len(mapped_row))
        values = list(mapped_row.values())
        try:
            cursor.execute(f'INSERT INTO documents ({columns}) VALUES ({placeholders})', values)
        except sqlite3.IntegrityError:
            # print(f"Skipping duplicate: {mapped_row['title']}")
            continue # Skip duplicates

if __name__ == '__main__':
    all_data = get_all_data()
    dest_conn = sqlite3.connect(dest_db)
    dest_cursor = dest_conn.cursor()
    create_unified_table(dest_cursor)
    map_and_insert(dest_cursor, all_data)
    dest_conn.commit()
    dest_conn.close()
    print(f"Successfully merged data into {dest_db}")

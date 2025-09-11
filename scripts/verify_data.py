import sqlite3
import os

# Get the absolute path to the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

db_path = os.path.join(project_root, 'transparency_data', 'transparency.db')

def verify_data():
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        return

    print(f"Verifying data in: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check for duplicates
    cursor.execute('''
        SELECT filename, year, category, title, COUNT(*)
        FROM documents
        GROUP BY filename, year, category, title
        HAVING COUNT(*) > 1
    ''')
    duplicates = cursor.fetchall()
    if duplicates:
        print("Found duplicate documents:")
        for row in duplicates:
            print(row)
    else:
        print("No duplicate documents found.")

    # Check for null values in important columns
    important_columns = [
        'filename', 'title', 'year', 'category', 'document_type', 
        'file_type', 'file_size', 'url', 'official_url', 'created_at'
    ]
    for column in important_columns:
        try:
            cursor.execute(f'SELECT COUNT(*) FROM documents WHERE {column} IS NULL')
            count = cursor.fetchone()[0]
            if count > 0:
                print(f"Found {count} documents with null values in column: {column}")
            else:
                print(f"No null values found in column: {column}")
        except sqlite3.OperationalError:
            print(f"Column {column} not found in documents table.")

    conn.close()

if __name__ == '__main__':
    verify_data()
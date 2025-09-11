import sqlite3
import os

# Get the absolute path to the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# All database files found previously
source_dbs = [
    os.path.join(project_root, 'data', 'documents.db'),
    os.path.join(project_root, 'data', 'organized_analysis', 'audit_cycles', 'cycle_reports', 'transparency_data.db'),
    os.path.join(project_root, 'data', 'test.db'),
    os.path.join(project_root, 'scripts', 'audit', 'audit_irregularities', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'dashboard', 'dashboard.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'audit_irregularities', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'audit_results', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'audit_results', 'powerbi_data.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'dashboard', 'dashboard.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'enhanced_audit', 'audit_results.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'infrastructure_tracking', 'projects.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'powerbi_extraction', 'powerbi_data.db'),
    os.path.join(project_root, 'scripts', 'audit', 'data', 'test_run', 'irregularities.db'),
    os.path.join(project_root, 'scripts', 'audit', 'enhanced_audit', 'audit_results.db'),
    os.path.join(project_root, 'scripts', 'audit', 'infrastructure_tracking', 'projects.db'),
    os.path.join(project_root, 'scripts', 'audit', 'optimized', 'transparency_optimized.db'),
    os.path.join(project_root, 'scripts', 'audit', 'powerbi_extraction', 'powerbi_data.db'),
    os.path.join(project_root, 'transparency_data', 'transparency.db')
]

def inspect_all_schemas():
    for db_path in source_dbs:
        if not os.path.exists(db_path):
            print(f"---\nDatabase not found: {db_path}\n")
            continue

        print(f"---\nInspecting schema of: {db_path}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            if not tables:
                print("No tables in this database.")
                continue
            
            print("Tables: ", [table[0] for table in tables])
            for table_name in tables:
                print(f"  Schema for table '{table_name[0]}':")
                cursor.execute(f"PRAGMA table_info({table_name[0]})")
                print(f"    {cursor.fetchall()}")

        except sqlite3.OperationalError as e:
            print(f"Error inspecting schema: {e}")
        finally:
            conn.close()

if __name__ == '__main__':
    inspect_all_schemas()
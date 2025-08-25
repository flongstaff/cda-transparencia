#!/usr/bin/env python3
"""
Enhanced Data Converter: PDF/Excel to Markdown + PostgreSQL
Converts files to markdown for GitHub AND populates PostgreSQL database for live frontend
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
import hashlib

# Add the parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from convert_data_to_markdown import DataToMarkdownConverter

# Import database connection
try:
    import psycopg2
    import psycopg2.extras
    POSTGRES_AVAILABLE = True
except ImportError:
    print("⚠️  psycopg2 not available. Install with: pip install psycopg2-binary")
    POSTGRES_AVAILABLE = False

class EnhancedDataProcessor(DataToMarkdownConverter):
    def __init__(self):
        super().__init__()
        self.db_config = {
            'host': 'localhost',
            'port': 5432,
            'database': 'transparency_portal',
            'user': 'postgres',
            'password': 'postgres'
        }
        self.db_connection = None
        
    def connect_database(self):
        """Connect to PostgreSQL database"""
        if not POSTGRES_AVAILABLE:
            print("❌ PostgreSQL connection not available")
            return False
            
        try:
            self.db_connection = psycopg2.connect(**self.db_config)
            print("✅ Connected to PostgreSQL database")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def create_database_tables(self):
        """Create necessary database tables"""
        if not self.db_connection:
            return False
            
        try:
            cursor = self.db_connection.cursor()
            
            # Create main documents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    original_path TEXT,
                    markdown_path TEXT,
                    category VARCHAR(100),
                    document_type VARCHAR(50),
                    year INTEGER,
                    file_size BIGINT,
                    file_hash VARCHAR(64),
                    content_text TEXT,
                    metadata JSONB,
                    official_urls JSONB,
                    processed_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(file_hash)
                )
            """)
            
            # Create extracted data table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS extracted_data (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES documents(id),
                    data_type VARCHAR(50),
                    table_data JSONB,
                    key_values JSONB,
                    extracted_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Create processing log table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS processing_log (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255),
                    action VARCHAR(50),
                    status VARCHAR(20),
                    message TEXT,
                    processed_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            self.db_connection.commit()
            print("✅ Database tables created successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            self.db_connection.rollback()
            return False
    
    def save_document_to_db(self, file_path: Path, markdown_content: str, year: int):
        """Save document information to database"""
        if not self.db_connection:
            return
            
        try:
            cursor = self.db_connection.cursor()
            
            # Calculate file hash
            file_hash = hashlib.sha256(file_path.read_bytes()).hexdigest()
            
            # Categorize document
            category_info = self.categorize_document(file_path.name)
            
            # Generate official URLs
            official_urls = self.generate_official_urls(file_path.name, category_info)
            
            # Extract content for database
            if file_path.suffix.lower() == '.pdf':
                content_data = self.extract_pdf_content(file_path)
            elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                content_data = self.extract_excel_content(file_path)
            else:
                content_data = {'text_content': ''}
            
            # Insert document record
            cursor.execute("""
                INSERT INTO documents (
                    filename, original_path, category, document_type, year,
                    file_size, file_hash, content_text, metadata, official_urls
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (file_hash) DO UPDATE SET
                    processed_at = NOW()
                RETURNING id
            """, (
                file_path.name,
                str(file_path),
                category_info['category'],
                category_info['type'],
                year,
                file_path.stat().st_size,
                file_hash,
                content_data.get('text_content', '')[:50000],  # Limit text size
                json.dumps(content_data.get('metadata', {})),
                json.dumps(official_urls)
            ))
            
            document_id = cursor.fetchone()[0]
            
            # Save extracted data
            if content_data.get('tables'):
                for table in content_data['tables']:
                    cursor.execute("""
                        INSERT INTO extracted_data (document_id, data_type, table_data)
                        VALUES (%s, %s, %s)
                    """, (document_id, 'table', json.dumps(table)))
            
            # Log processing
            cursor.execute("""
                INSERT INTO processing_log (filename, action, status, message)
                VALUES (%s, %s, %s, %s)
            """, (file_path.name, 'convert_and_save', 'success', 'Document processed successfully'))
            
            self.db_connection.commit()
            print(f"  💾 Saved to database: {file_path.name}")
            
        except Exception as e:
            print(f"  ❌ Database save error for {file_path.name}: {e}")
            self.db_connection.rollback()
            
            # Log error
            try:
                cursor = self.db_connection.cursor()
                cursor.execute("""
                    INSERT INTO processing_log (filename, action, status, message)
                    VALUES (%s, %s, %s, %s)
                """, (file_path.name, 'convert_and_save', 'error', str(e)))
                self.db_connection.commit()
            except:
                pass
    
    def process_all_files_enhanced(self):
        """Enhanced processing with database integration"""
        stats = {
            'total_files': 0,
            'pdf_files': 0,
            'excel_files': 0,
            'markdown_created': 0,
            'database_saved': 0,
            'errors': 0
        }
        
        print("🔄 Processing files with database integration...")
        
        # Connect to database
        if not self.connect_database():
            print("⚠️  Continuing without database integration")
        else:
            self.create_database_tables()
        
        # Process year directories
        for year_dir in self.data_dir.iterdir():
            if year_dir.is_dir() and year_dir.name.isdigit():
                year = int(year_dir.name)
                year_output_dir = self.output_dir / str(year)
                year_output_dir.mkdir(exist_ok=True)
                
                print(f"📁 Processing year {year}...")
                
                for file_path in year_dir.iterdir():
                    if file_path.is_file():
                        stats['total_files'] += 1
                        
                        if file_path.suffix.lower() == '.pdf':
                            stats['pdf_files'] += 1
                        elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                            stats['excel_files'] += 1
                        else:
                            continue
                        
                        try:
                            # Create markdown version
                            markdown_content = self.create_markdown_document(file_path, year)
                            
                            # Save markdown file
                            markdown_filename = f"{file_path.stem}.md"
                            markdown_path = year_output_dir / markdown_filename
                            
                            with open(markdown_path, 'w', encoding='utf-8') as f:
                                f.write(markdown_content)
                            
                            stats['markdown_created'] += 1
                            
                            # Save to database
                            if self.db_connection:
                                self.save_document_to_db(file_path, markdown_content, year)
                                stats['database_saved'] += 1
                            
                            print(f"  ✅ {file_path.name} → markdown + database")
                            
                        except Exception as e:
                            stats['errors'] += 1
                            print(f"  ❌ Error processing {file_path.name}: {e}")
        
        return stats
    
    def get_database_summary(self):
        """Get summary of database contents"""
        if not self.db_connection:
            return None
            
        try:
            cursor = self.db_connection.cursor()
            
            # Get document counts by category and year
            cursor.execute("""
                SELECT 
                    category,
                    year,
                    COUNT(*) as document_count,
                    COUNT(DISTINCT document_type) as type_count
                FROM documents 
                GROUP BY category, year 
                ORDER BY year DESC, category
            """)
            
            results = cursor.fetchall()
            
            summary = {
                'total_documents': sum([r[2] for r in results]),
                'by_category_year': [
                    {
                        'category': r[0],
                        'year': r[1],
                        'count': r[2],
                        'types': r[3]
                    } for r in results
                ]
            }
            
            return summary
            
        except Exception as e:
            print(f"❌ Error getting database summary: {e}")
            return None

def setup_github_repository():
    """Initialize and setup GitHub repository"""
    print("\n🐙 Setting up GitHub repository...")
    
    try:
        # Initialize git if not already done
        if not Path('.git').exists():
            subprocess.run(['git', 'init'], check=True)
            print("  ✅ Git repository initialized")
        
        # Check if origin exists
        result = subprocess.run(['git', 'remote', 'get-url', 'origin'], 
                              capture_output=True, text=True)
        
        if result.returncode != 0:
            print("  ⚠️  No origin remote found. Add with:")
            print("     git remote add origin https://github.com/yourusername/cda-transparencia.git")
        else:
            print(f"  ✅ Origin remote: {result.stdout.strip()}")
        
        # Create .gitignore if not exists
        gitignore_path = Path('.gitignore')
        if not gitignore_path.exists():
            gitignore_content = """# Dependencies
node_modules/
__pycache__/
*.pyc

# Environment files
.env
.env.local

# Database files
*.db
*.sqlite

# Logs
*.log
logs/

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Cold storage (keep local only)
cold_storage_backup/

# Large source files (use markdown versions)
data/source_materials/
*.pdf
*.xlsx
*.xls

# Temporary files
tmp/
temp/
"""
            gitignore_path.write_text(gitignore_content)
            print("  ✅ .gitignore created")
        
        # Add files to staging
        subprocess.run(['git', 'add', '.'], check=True)
        print("  ✅ Files added to staging")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Git command failed: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Error setting up repository: {e}")
        return False

def test_frontend_connection():
    """Test connection to frontend localhost:5173"""
    print("\n🌐 Testing frontend connection...")
    
    try:
        import requests
        response = requests.get('http://localhost:5173', timeout=5)
        if response.status_code == 200:
            print("  ✅ Frontend is running at localhost:5173")
            return True
        else:
            print(f"  ⚠️  Frontend responded with status {response.status_code}")
            return False
    except ImportError:
        print("  ⚠️  requests library not available")
        return False
    except requests.exceptions.RequestException:
        print("  ❌ Frontend not running at localhost:5173")
        print("  💡 Start with: cd frontend && npm run dev")
        return False

def main():
    """Main execution function"""
    print("🚀 Enhanced Data Processing: Markdown + Database + GitHub")
    print("=" * 70)
    
    processor = EnhancedDataProcessor()
    
    # Process all files (markdown + database)
    stats = processor.process_all_files_enhanced()
    
    # Create web sources index
    processor.create_web_sources_index()
    
    # Create master index
    processor.create_master_index(stats)
    
    # Get database summary
    db_summary = processor.get_database_summary()
    
    print(f"\n✅ Processing Complete!")
    print(f"📊 Statistics:")
    print(f"   • Total files processed: {stats['total_files']}")
    print(f"   • Markdown files created: {stats['markdown_created']}")
    print(f"   • Database records saved: {stats['database_saved']}")
    print(f"   • Processing errors: {stats['errors']}")
    
    if db_summary:
        print(f"\n💾 Database Summary:")
        print(f"   • Total documents in DB: {db_summary['total_documents']}")
        print(f"   • Categories and years:")
        for item in db_summary['by_category_year'][:10]:  # Show first 10
            print(f"     - {item['category']} ({item['year']}): {item['count']} docs")
    
    # Setup GitHub repository
    github_success = setup_github_repository()
    
    # Test frontend connection
    frontend_running = test_frontend_connection()
    
    print(f"\n🎯 Next Steps:")
    print(f"1. 📊 Database populated with {stats['database_saved']} documents")
    print(f"2. 📝 Markdown files ready for GitHub in data/markdown_documents/")
    
    if github_success:
        print(f"3. 🐙 Git repository ready for push")
        print(f"   • Run: git commit -m 'Add processed transparency documents'")
        print(f"   • Run: git push origin main")
    
    if not frontend_running:
        print(f"4. 🌐 Start frontend to see live data:")
        print(f"   • cd frontend && npm run dev")
    else:
        print(f"4. ✅ Frontend running - check localhost:5173 for live data")
    
    print(f"\n🔄 To refresh data:")
    print(f"   • Add new files to data/source_materials/YEAR/")
    print(f"   • Run: python scripts/convert_and_populate.py")
    print(f"   • Frontend will show updated data automatically")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Populate Database with Existing Markdown Files
Takes existing markdown documents and populates the PostgreSQL database
"""

import os
import re
import json
import hashlib
from pathlib import Path
from datetime import datetime

try:
    import psycopg2
    import psycopg2.extras
    POSTGRES_AVAILABLE = True
except ImportError:
    print("❌ psycopg2 not available. Install with: pip install psycopg2-binary")
    POSTGRES_AVAILABLE = False

class ExistingDataPopulator:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.markdown_dir = self.project_root / "data" / "markdown_documents"
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
            
            self.db_connection.commit()
            print("✅ Database tables created successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            self.db_connection.rollback()
            return False
    
    def analyze_markdown_content(self, md_path: Path) -> dict:
        """Analyze markdown content and extract metadata"""
        try:
            content = md_path.read_text(encoding='utf-8')
            
            # Extract document info
            filename = md_path.stem
            
            # Categorize document
            category_info = self.categorize_document(filename)
            
            # Extract year from filename or content
            year = self.extract_year(filename, content)
            
            # Extract key data from content
            key_data = self.extract_key_data_from_markdown(content)
            
            # Generate content hash
            content_hash = hashlib.sha256(content.encode()).hexdigest()
            
            return {
                'filename': filename,
                'markdown_path': str(md_path),
                'category': category_info['category'],
                'document_type': category_info['type'],
                'year': year,
                'file_size': md_path.stat().st_size,
                'file_hash': content_hash,
                'content_text': content[:50000],  # Limit size
                'key_data': key_data,
                'metadata': {
                    'word_count': len(content.split()),
                    'line_count': len(content.split('\n')),
                    'has_tables': '|' in content,
                    'has_monetary_values': bool(re.search(r'\$[\d,\.]+', content)),
                    'extraction_date': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            print(f"❌ Error analyzing {md_path}: {e}")
            return None
    
    def categorize_document(self, filename: str) -> dict:
        """Categorize document based on filename"""
        name = filename.lower()
        
        categories = {
            'licitacion': {'category': 'Licitaciones Públicas', 'type': 'tender'},
            'sueldo': {'category': 'Información Salarial', 'type': 'salary'},
            'escala': {'category': 'Información Salarial', 'type': 'salary'},
            'presupuesto': {'category': 'Presupuesto Municipal', 'type': 'budget'},
            'ejecucion': {'category': 'Ejecución Presupuestaria', 'type': 'execution'},
            'estado': {'category': 'Ejecución Presupuestaria', 'type': 'execution'},
            'recurso': {'category': 'Recursos Municipales', 'type': 'resources'},
            'resolucion': {'category': 'Normativa Legal', 'type': 'legal'},
            'decreto': {'category': 'Normativa Legal', 'type': 'legal'},
            'ordenanza': {'category': 'Normativa Legal', 'type': 'legal'},
            'deuda': {'category': 'Información Financiera', 'type': 'financial'},
            'stock': {'category': 'Información Financiera', 'type': 'financial'},
            'balance': {'category': 'Información Financiera', 'type': 'financial'},
            'situacion': {'category': 'Información Financiera', 'type': 'financial'},
            'cuenta': {'category': 'Información Financiera', 'type': 'financial'},
            'gasto': {'category': 'Gastos Municipales', 'type': 'expenses'},
            'informe': {'category': 'Reportes Institucionales', 'type': 'report'},
            'estadistica': {'category': 'Estadísticas Municipales', 'type': 'statistics'},
            'cap': {'category': 'Servicios de Salud', 'type': 'health'},
            'salud': {'category': 'Servicios de Salud', 'type': 'health'},
            'produccion': {'category': 'Desarrollo Económico', 'type': 'economic'},
            'ganaderia': {'category': 'Desarrollo Económico', 'type': 'economic'},
            'cosecha': {'category': 'Desarrollo Económico', 'type': 'economic'}
        }
        
        for key, info in categories.items():
            if key in name:
                return info
        
        return {'category': 'Documentos Generales', 'type': 'general'}
    
    def extract_year(self, filename: str, content: str) -> int:
        """Extract year from filename or content"""
        # Try filename first
        year_match = re.search(r'(20\d{2})', filename)
        if year_match:
            return int(year_match.group(1))
        
        # Try content
        year_matches = re.findall(r'(20\d{2})', content)
        if year_matches:
            # Return most common year
            from collections import Counter
            year_counts = Counter(year_matches)
            return int(year_counts.most_common(1)[0][0])
        
        # Default to 2024 if no year found
        return 2024
    
    def extract_key_data_from_markdown(self, content: str) -> dict:
        """Extract key financial data from markdown content"""
        key_data = {}
        
        # Extract monetary amounts
        money_pattern = r'\$\s*([\d,.]+)'
        amounts = re.findall(money_pattern, content)
        if amounts:
            key_data['monetary_amounts'] = len(amounts)
            key_data['sample_amounts'] = amounts[:5]  # First 5 amounts
        
        # Extract dates
        date_pattern = r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})'
        dates = re.findall(date_pattern, content)
        if dates:
            key_data['dates_found'] = len(dates)
            key_data['sample_dates'] = dates[:3]  # First 3 dates
        
        # Extract percentages
        percent_pattern = r'(\d+(?:,\d+)?)\s*%'
        percentages = re.findall(percent_pattern, content)
        if percentages:
            key_data['percentages'] = len(percentages)
        
        # Check for tables
        if '|' in content and '---' in content:
            table_count = content.count('|---')
            key_data['tables_found'] = table_count
        
        return key_data
    
    def save_document_to_db(self, doc_data: dict):
        """Save document to database"""
        if not self.db_connection or not doc_data:
            return False
            
        try:
            cursor = self.db_connection.cursor()
            
            # Insert document record
            cursor.execute("""
                INSERT INTO documents (
                    filename, markdown_path, category, document_type, year,
                    file_size, file_hash, content_text, metadata, official_urls
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (file_hash) DO UPDATE SET
                    processed_at = NOW()
                RETURNING id
            """, (
                doc_data['filename'],
                doc_data['markdown_path'],
                doc_data['category'],
                doc_data['document_type'],
                doc_data['year'],
                doc_data['file_size'],
                doc_data['file_hash'],
                doc_data['content_text'],
                json.dumps(doc_data['metadata']),
                json.dumps({})  # Empty official URLs for now
            ))
            
            document_id = cursor.fetchone()[0]
            
            # Save extracted key data
            if doc_data.get('key_data'):
                cursor.execute("""
                    INSERT INTO extracted_data (document_id, data_type, key_values)
                    VALUES (%s, %s, %s)
                """, (document_id, 'key_data', json.dumps(doc_data['key_data'])))
            
            self.db_connection.commit()
            return True
            
        except Exception as e:
            print(f"  ❌ Database save error: {e}")
            self.db_connection.rollback()
            return False
    
    def process_all_markdown_files(self):
        """Process all existing markdown files"""
        if not self.markdown_dir.exists():
            print(f"❌ Markdown directory not found: {self.markdown_dir}")
            return {'processed': 0, 'errors': 0}
        
        stats = {'processed': 0, 'errors': 0}
        
        print(f"📁 Processing markdown files from: {self.markdown_dir}")
        
        for md_file in self.markdown_dir.glob("*.md"):
            try:
                print(f"  📄 Processing: {md_file.name}")
                
                # Analyze markdown content
                doc_data = self.analyze_markdown_content(md_file)
                
                if doc_data:
                    # Save to database
                    if self.save_document_to_db(doc_data):
                        stats['processed'] += 1
                        print(f"    ✅ Saved: {doc_data['category']} ({doc_data['year']})")
                    else:
                        stats['errors'] += 1
                else:
                    stats['errors'] += 1
                    
            except Exception as e:
                print(f"    ❌ Error processing {md_file.name}: {e}")
                stats['errors'] += 1
        
        return stats
    
    def get_database_summary(self):
        """Get database summary"""
        if not self.db_connection:
            return None
            
        try:
            cursor = self.db_connection.cursor()
            
            # Get document counts
            cursor.execute("""
                SELECT 
                    category,
                    COUNT(*) as doc_count,
                    COUNT(DISTINCT year) as year_count,
                    MIN(year) as earliest_year,
                    MAX(year) as latest_year
                FROM documents 
                GROUP BY category 
                ORDER BY doc_count DESC
            """)
            
            results = cursor.fetchall()
            
            summary = {
                'categories': [
                    {
                        'category': r[0],
                        'document_count': r[1],
                        'year_span': f"{r[3]}-{r[4]}" if r[3] != r[4] else str(r[3]),
                        'years_covered': r[2]
                    } for r in results
                ],
                'total_documents': sum([r[1] for r in results])
            }
            
            return summary
            
        except Exception as e:
            print(f"❌ Error getting summary: {e}")
            return None

def main():
    print("🚀 Populating Database with Existing Markdown Documents")
    print("=" * 60)
    
    populator = ExistingDataPopulator()
    
    # Connect to database
    if not populator.connect_database():
        print("❌ Cannot continue without database connection")
        return
    
    # Create tables
    if not populator.create_database_tables():
        print("❌ Cannot continue without database tables")
        return
    
    # Process all markdown files
    stats = populator.process_all_markdown_files()
    
    # Get summary
    summary = populator.get_database_summary()
    
    print(f"\n✅ Processing Complete!")
    print(f"📊 Statistics:")
    print(f"   • Documents processed: {stats['processed']}")
    print(f"   • Processing errors: {stats['errors']}")
    
    if summary:
        print(f"\n💾 Database Summary:")
        print(f"   • Total documents in DB: {summary['total_documents']}")
        print(f"   • Document categories:")
        for cat in summary['categories'][:15]:  # Show top 15
            print(f"     - {cat['category']}: {cat['document_count']} docs ({cat['year_span']})")
    
    print(f"\n🎯 Next Steps:")
    print(f"1. ✅ Database populated with existing markdown documents")
    print(f"2. 🌐 Frontend at localhost:5173 can now display this data")
    print(f"3. 🐙 Ready to create GitHub repository")

if __name__ == "__main__":
    main()
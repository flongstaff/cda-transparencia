#!/usr/bin/env python3
"""
Enhanced Local File Processor for Carmen de Areco Transparency Investigation
Processes PDF/Excel files and extracts structured data to database
"""

import os
import sys
import re
import json
import hashlib
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

# PDF processing
try:
    import PyPDF2
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    print("⚠️  PDF libraries not available. Install with: pip install PyPDF2 pdfplumber")
    PDF_AVAILABLE = False

# Database connection
try:
    import psycopg2
    import psycopg2.extras
    POSTGRES_AVAILABLE = True
except ImportError:
    print("⚠️  PostgreSQL not available. Install with: pip install psycopg2-binary")
    POSTGRES_AVAILABLE = False

class EnhancedLocalProcessor:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.source_dir = self.project_root / "data" / "source_materials"
        self.markdown_dir = self.project_root / "data" / "markdown_documents"
        
        self.db_config = {
            'host': 'localhost',
            'port': 5432,
            'database': 'transparency_portal',
            'user': 'postgres',
            'password': 'postgres'
        }
        self.db_connection = None
        
        # Processing statistics
        self.stats = {
            'files_processed': 0,
            'pdfs_processed': 0,
            'excels_processed': 0,
            'data_extracted': 0,
            'database_records': 0,
            'errors': []
        }
        
        # Financial data patterns
        self.financial_patterns = {
            'amounts': r'\$\s*([0-9,]+\.?[0-9]*)',
            'dates': r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            'percentages': r'(\d+(?:,\d+)?)\s*%',
            'employee_names': r'([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)+)',
            'positions': r'(Intendente|Secretari[ao]|Director|Jefe|Coordinador|Administrativo)',
            'tender_numbers': r'(Licitación|LICITACION).*?N[°º]?\s*(\d+)',
            'resolution_numbers': r'(Resolución|RESOLUCION)\s+(\d+)[\/\-](\d{4})',
            'ordinance_numbers': r'(Ordenanza|ORDENANZA)\s+(\d+)[\/\-](\d{2,4})'
        }
    
    def connect_database(self):
        """Connect to PostgreSQL database"""
        if not POSTGRES_AVAILABLE:
            print("❌ PostgreSQL not available")
            return False
            
        try:
            self.db_connection = psycopg2.connect(**self.db_config)
            self.db_connection.autocommit = True
            print("✅ Connected to PostgreSQL database")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def create_enhanced_tables(self):
        """Create enhanced database tables for comprehensive data"""
        if not self.db_connection:
            return False
            
        try:
            cursor = self.db_connection.cursor()
            
            # Enhanced documents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS transparency_documents (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(500),
                    original_path TEXT,
                    category VARCHAR(100),
                    document_type VARCHAR(50),
                    year INTEGER,
                    quarter INTEGER,
                    month VARCHAR(20),
                    content_preview TEXT,
                    file_hash VARCHAR(64),
                    file_size BIGINT,
                    processing_status VARCHAR(50) DEFAULT 'processed',
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(file_hash)
                )
            """)
            
            # Extracted financial data table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS extracted_financial_data (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES transparency_documents(id),
                    data_type VARCHAR(50),
                    category VARCHAR(100),
                    extracted_text TEXT,
                    amounts JSONB,
                    dates JSONB,
                    entities JSONB,
                    metadata JSONB,
                    confidence_score DECIMAL(3,2),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Employee salary details
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS salary_details (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES transparency_documents(id),
                    employee_name VARCHAR(255),
                    position VARCHAR(255),
                    department VARCHAR(255),
                    basic_salary DECIMAL(12,2),
                    bonuses DECIMAL(12,2),
                    deductions DECIMAL(12,2),
                    net_salary DECIMAL(12,2),
                    period_year INTEGER,
                    period_month INTEGER,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Contract and tender details
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contract_details (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES transparency_documents(id),
                    contract_number VARCHAR(100),
                    title TEXT,
                    contractor VARCHAR(500),
                    amount DECIMAL(15,2),
                    contract_date DATE,
                    execution_period INTEGER,
                    status VARCHAR(100),
                    category VARCHAR(100),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Budget execution details
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS budget_execution (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES transparency_documents(id),
                    year INTEGER,
                    quarter INTEGER,
                    category VARCHAR(100),
                    budgeted_amount DECIMAL(15,2),
                    executed_amount DECIMAL(15,2),
                    execution_percentage DECIMAL(5,2),
                    variance_amount DECIMAL(15,2),
                    department VARCHAR(255),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            print("✅ Enhanced database tables created")
            return True
            
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            return False
    
    def process_all_local_files(self):
        """Process all local PDF and Excel files"""
        print(f"🔄 Processing files from: {self.source_dir}")
        
        if not self.connect_database():
            print("⚠️  Continuing without database integration")
        else:
            self.create_enhanced_tables()
        
        # Process files by year directories
        for year_path in sorted(self.source_dir.glob("*")):
            if year_path.is_dir() and year_path.name.isdigit():
                year = int(year_path.name)
                print(f"\n📁 Processing year {year}...")
                self.process_year_directory(year_path, year)
        
        # Process files in root directory
        root_files = list(self.source_dir.glob("*.pdf")) + list(self.source_dir.glob("*.xlsx")) + list(self.source_dir.glob("*.xls"))
        if root_files:
            print(f"\n📁 Processing root directory files...")
            for file_path in root_files:
                self.process_single_file(file_path, self.extract_year_from_filename(file_path.name))
        
        return self.stats
    
    def process_year_directory(self, year_path: Path, year: int):
        """Process all files in a year directory"""
        files = list(year_path.glob("*.pdf")) + list(year_path.glob("*.xlsx")) + list(year_path.glob("*.xls"))
        
        for file_path in files:
            self.process_single_file(file_path, year)
    
    def process_single_file(self, file_path: Path, year: int):
        """Process a single file and extract data"""
        try:
            print(f"  📄 Processing: {file_path.name}")
            
            # Generate file hash
            file_hash = self.calculate_file_hash(file_path)
            
            # Categorize document
            category_info = self.categorize_document(file_path.name)
            
            # Extract content based on file type
            if file_path.suffix.lower() == '.pdf':
                content_data = self.extract_pdf_content(file_path)
                self.stats['pdfs_processed'] += 1
            elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                content_data = self.extract_excel_content(file_path)
                self.stats['excels_processed'] += 1
            else:
                print(f"    ⚠️  Unsupported file type: {file_path.suffix}")
                return
            
            # Save to database
            if self.db_connection and content_data:
                document_id = self.save_document_to_database(
                    file_path, file_hash, category_info, year, content_data
                )
                
                # Extract and save structured data
                if document_id:
                    self.extract_and_save_structured_data(document_id, content_data, category_info)
                    self.stats['data_extracted'] += 1
            
            self.stats['files_processed'] += 1
            print(f"    ✅ Processed successfully")
            
        except Exception as e:
            error_msg = f"Error processing {file_path.name}: {str(e)}"
            print(f"    ❌ {error_msg}")
            self.stats['errors'].append(error_msg)
    
    def extract_pdf_content(self, file_path: Path) -> Dict[str, Any]:
        """Extract content from PDF file"""
        if not PDF_AVAILABLE:
            return {'text': 'PDF processing not available', 'tables': []}
        
        content = {
            'text': '',
            'tables': [],
            'metadata': {},
            'financial_data': {}
        }
        
        try:
            # Use pdfplumber for better table extraction
            with pdfplumber.open(file_path) as pdf:
                full_text = ""
                for page in pdf.pages:
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n"
                    
                    # Extract tables
                    tables = page.extract_tables()
                    for table in tables:
                        if table and len(table) > 1:  # At least header + 1 row
                            content['tables'].append({
                                'headers': table[0] if table[0] else [],
                                'rows': table[1:],
                                'row_count': len(table) - 1
                            })
                
                content['text'] = full_text
                
                # Extract financial patterns
                content['financial_data'] = self.extract_financial_patterns(full_text)
                
                content['metadata'] = {
                    'pages': len(pdf.pages),
                    'char_count': len(full_text),
                    'table_count': len(content['tables'])
                }
                
        except Exception as e:
            print(f"    ⚠️  PDF extraction error: {e}")
            # Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    content['text'] = text
                    content['financial_data'] = self.extract_financial_patterns(text)
            except Exception as e2:
                print(f"    ❌ Fallback PDF extraction failed: {e2}")
        
        return content
    
    def extract_excel_content(self, file_path: Path) -> Dict[str, Any]:
        """Extract content from Excel file"""
        content = {
            'text': '',
            'tables': [],
            'metadata': {},
            'financial_data': {}
        }
        
        try:
            # Read Excel file
            if file_path.suffix.lower() == '.xlsx':
                xl_file = pd.ExcelFile(file_path, engine='openpyxl')
            else:
                xl_file = pd.ExcelFile(file_path, engine='xlrd')
            
            all_text = []
            
            for sheet_name in xl_file.sheet_names:
                df = pd.read_excel(xl_file, sheet_name=sheet_name)
                
                # Convert DataFrame to table format
                if not df.empty:
                    # Clean and prepare data
                    df = df.fillna('')
                    
                    # Extract table
                    headers = [str(col) for col in df.columns]
                    rows = df.values.tolist()
                    
                    content['tables'].append({
                        'sheet_name': sheet_name,
                        'headers': headers,
                        'rows': [[str(cell) for cell in row] for row in rows],
                        'row_count': len(rows)
                    })
                    
                    # Extract text content
                    sheet_text = df.to_string()
                    all_text.append(f"=== {sheet_name} ===\n{sheet_text}")
            
            content['text'] = '\n\n'.join(all_text)
            content['financial_data'] = self.extract_financial_patterns(content['text'])
            
            content['metadata'] = {
                'sheets': len(xl_file.sheet_names),
                'sheet_names': xl_file.sheet_names,
                'table_count': len(content['tables'])
            }
            
        except Exception as e:
            print(f"    ❌ Excel extraction error: {e}")
        
        return content
    
    def extract_financial_patterns(self, text: str) -> Dict[str, Any]:
        """Extract financial patterns from text"""
        patterns_found = {}
        
        for pattern_name, pattern in self.financial_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                patterns_found[pattern_name] = matches[:10]  # Limit to first 10 matches
        
        return patterns_found
    
    def categorize_document(self, filename: str) -> Dict[str, str]:
        """Categorize document based on filename"""
        filename_lower = filename.lower()
        
        # Document type mapping
        categories = {
            # Salary information
            ('sueldo', 'salari', 'escala', 'remuner'): {
                'category': 'Información Salarial',
                'type': 'salary_report'
            },
            # Budget and execution
            ('presupuesto', 'budget'): {
                'category': 'Presupuesto Municipal',
                'type': 'budget'
            },
            ('ejecucion', 'estado.*gasto', 'estado.*recurso'): {
                'category': 'Ejecución Presupuestaria',
                'type': 'budget_execution'
            },
            # Tenders and contracts
            ('licitacion', 'tender', 'contrat'): {
                'category': 'Licitaciones y Contratos',
                'type': 'public_tender'
            },
            # Financial statements
            ('balance', 'situacion.*econom', 'situacion.*financ'): {
                'category': 'Estados Financieros',
                'type': 'financial_statement'
            },
            ('deuda', 'debt', 'stock.*deuda'): {
                'category': 'Información de Deuda',
                'type': 'debt_report'
            },
            # Legal documents
            ('resolucion', 'decreto', 'ordenanza'): {
                'category': 'Normativa Legal',
                'type': 'legal_document'
            },
            # Statistics and reports
            ('estadistica', 'informe', 'reporte'): {
                'category': 'Reportes e Informes',
                'type': 'statistical_report'
            }
        }
        
        for keywords, category_info in categories.items():
            if any(keyword in filename_lower for keyword in keywords):
                return category_info
        
        return {'category': 'Documentos Generales', 'type': 'general_document'}
    
    def extract_year_from_filename(self, filename: str) -> int:
        """Extract year from filename"""
        # Look for 4-digit year pattern
        year_match = re.search(r'(20\d{2})', filename)
        if year_match:
            return int(year_match.group(1))
        
        # Default to current year if no year found
        return datetime.now().year
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        return sha256_hash.hexdigest()
    
    def save_document_to_database(self, file_path: Path, file_hash: str, 
                                category_info: Dict, year: int, content_data: Dict) -> Optional[int]:
        """Save document information to database"""
        if not self.db_connection:
            return None
        
        try:
            cursor = self.db_connection.cursor()
            
            # Extract period information
            quarter = self.extract_quarter_from_content(content_data['text'])
            month = self.extract_month_from_content(content_data['text'])
            
            cursor.execute("""
                INSERT INTO transparency_documents (
                    filename, original_path, category, document_type, year, quarter, month,
                    content_preview, file_hash, file_size, processing_status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (file_hash) DO UPDATE SET
                    processing_status = 'updated'
                RETURNING id
            """, (
                file_path.name,
                str(file_path),
                category_info['category'],
                category_info['type'],
                year,
                quarter,
                month,
                content_data['text'][:1000],  # First 1000 chars as preview
                file_hash,
                file_path.stat().st_size,
                'processed'
            ))
            
            result = cursor.fetchone()
            if result:
                document_id = result[0]
                self.stats['database_records'] += 1
                return document_id
                
        except Exception as e:
            print(f"    ❌ Database save error: {e}")
        
        return None
    
    def extract_and_save_structured_data(self, document_id: int, content_data: Dict, category_info: Dict):
        """Extract and save structured data based on document type"""
        if not self.db_connection:
            return
        
        try:
            cursor = self.db_connection.cursor()
            
            # Save general extracted financial data
            cursor.execute("""
                INSERT INTO extracted_financial_data (
                    document_id, data_type, category, extracted_text, amounts, dates, entities, metadata
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                document_id,
                category_info['type'],
                category_info['category'],
                content_data['text'][:2000],  # Limit text size
                json.dumps(content_data['financial_data'].get('amounts', [])),
                json.dumps(content_data['financial_data'].get('dates', [])),
                json.dumps(content_data['financial_data'].get('employee_names', [])),
                json.dumps(content_data['metadata'])
            ))
            
            # Extract specific structured data based on type
            if category_info['type'] == 'salary_report':
                self.extract_salary_data(document_id, content_data)
            elif category_info['type'] == 'public_tender':
                self.extract_contract_data(document_id, content_data)
            elif category_info['type'] == 'budget_execution':
                self.extract_budget_data(document_id, content_data)
                
        except Exception as e:
            print(f"    ⚠️  Structured data extraction error: {e}")
    
    def extract_salary_data(self, document_id: int, content_data: Dict):
        """Extract salary-specific data"""
        # This would extract specific salary information from tables/text
        # Implementation depends on the specific format of salary documents
        pass
    
    def extract_contract_data(self, document_id: int, content_data: Dict):
        """Extract contract/tender specific data"""
        # Extract tender numbers, amounts, contractors, etc.
        pass
    
    def extract_budget_data(self, document_id: int, content_data: Dict):
        """Extract budget execution specific data"""
        # Extract budget categories, executed amounts, percentages, etc.
        pass
    
    def extract_quarter_from_content(self, text: str) -> Optional[int]:
        """Extract quarter information from text"""
        quarter_patterns = [
            r'(\d)[°º]?\s*(trimestre|tri)',
            r'quarter\s*(\d)',
            r'q(\d)'
        ]
        
        for pattern in quarter_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                quarter = int(match.group(1))
                if 1 <= quarter <= 4:
                    return quarter
        return None
    
    def extract_month_from_content(self, text: str) -> Optional[str]:
        """Extract month information from text"""
        months_spanish = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ]
        
        for month in months_spanish:
            if month in text.lower():
                return month.capitalize()
        return None
    
    def generate_processing_report(self) -> Dict[str, Any]:
        """Generate comprehensive processing report"""
        return {
            'timestamp': datetime.now().isoformat(),
            'processing_stats': self.stats,
            'source_directory': str(self.source_dir),
            'files_found': len(list(self.source_dir.rglob("*.pdf")) + list(self.source_dir.rglob("*.xlsx")) + list(self.source_dir.rglob("*.xls"))),
            'database_connected': self.db_connection is not None,
            'success_rate': (self.stats['files_processed'] / max(1, self.stats['files_processed'] + len(self.stats['errors']))) * 100
        }

def main():
    print("🚀 Enhanced Local File Processor for Carmen de Areco Transparency Investigation")
    print("=" * 80)
    
    processor = EnhancedLocalProcessor()
    
    # Process all local files
    stats = processor.process_all_local_files()
    
    # Generate report
    report = processor.generate_processing_report()
    
    print(f"\n✅ Processing Complete!")
    print(f"📊 Statistics:")
    print(f"   • Files processed: {stats['files_processed']}")
    print(f"   • PDFs processed: {stats['pdfs_processed']}")
    print(f"   • Excel files processed: {stats['excels_processed']}")
    print(f"   • Data extracted: {stats['data_extracted']}")
    print(f"   • Database records: {stats['database_records']}")
    print(f"   • Processing errors: {len(stats['errors'])}")
    
    if stats['errors']:
        print(f"\n❌ Errors encountered:")
        for error in stats['errors'][:5]:  # Show first 5 errors
            print(f"   • {error}")
    
    print(f"\n🎯 Success rate: {report['success_rate']:.1f}%")
    
    if processor.db_connection:
        processor.db_connection.close()

if __name__ == "__main__":
    main()
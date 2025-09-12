#!/usr/bin/env python3
"""
Comprehensive Data Import Script for Carmen de Areco Transparency Portal
Imports all JSON data into PostgreSQL database
"""

import json
import os
import psycopg2
from datetime import datetime
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'transparency_portal', 
    'user': 'postgres',
    'password': 'postgres'
}

class TransparencyDataImporter:
    def __init__(self):
        self.conn = None
        self.cursor = None
        self.data_path = Path("data/preserved/json")
        self.stats = {
            'documents': 0,
            'budget_records': 0,
            'salary_records': 0,
            'contracts': 0,
            'errors': 0
        }

    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.cursor = self.conn.cursor()
            logger.info("Connected to database successfully")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def import_complete_transparency_data(self):
        """Import main transparency data file"""
        file_path = self.data_path / "complete_transparency_data.json"
        
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        logger.info(f"Processing {len(data.get('files', []))} documents from complete_transparency_data.json")

        for file_info in data.get('files', []):
            try:
                # Extract document info
                filename = file_info.get('filename', '')
                year = file_info.get('year')
                file_type = file_info.get('file_type', '')
                size_bytes = file_info.get('size_bytes', 0)
                
                # Determine category from filename
                category = self._categorize_document(filename)
                
                # Insert document record
                insert_query = """
                INSERT INTO transparency.documents 
                (filename, year, file_type, size_bytes, category, document_type, 
                 sha256_hash, processing_date, verification_status, integrity_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (sha256_hash) DO NOTHING
                """
                
                values = (
                    filename,
                    year,
                    file_type,
                    size_bytes,
                    category,
                    self._get_document_type(filename),
                    file_info.get('sha256_hash'),
                    file_info.get('processing_date'),
                    'verified',
                    True
                )
                
                self.cursor.execute(insert_query, values)
                self.stats['documents'] += 1
                
            except Exception as e:
                logger.error(f"Error importing document {filename}: {e}")
                self.stats['errors'] += 1

        self.conn.commit()
        logger.info(f"Imported {self.stats['documents']} documents")

    def import_budget_data(self):
        """Import budget data from budget_data.json"""
        file_path = self.data_path / "budget_data.json"
        
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        logger.info(f"Processing {len(data)} budget records")

        for record in data:
            try:
                # Get document ID
                doc_id = self._get_document_id(record.get('filename'))
                if not doc_id:
                    continue

                # Extract financial info if available
                extracted_info = record.get('extracted_info', {})
                financial_summary = extracted_info.get('financial_summary', {})
                
                # Insert budget record
                insert_query = """
                INSERT INTO transparency.budget_data 
                (document_id, year, category, extraction_method, confidence_score)
                VALUES (%s, %s, %s, %s, %s)
                """
                
                values = (
                    doc_id,
                    record.get('year'),
                    self._categorize_document(record.get('filename', '')),
                    'pdf_extraction',
                    0.8
                )
                
                self.cursor.execute(insert_query, values)
                self.stats['budget_records'] += 1
                
            except Exception as e:
                logger.error(f"Error importing budget record: {e}")
                self.stats['errors'] += 1

        self.conn.commit()
        logger.info(f"Imported {self.stats['budget_records']} budget records")

    def import_salary_data(self):
        """Import salary data from salaries_data.json"""
        file_path = self.data_path / "salaries_data.json"
        
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        logger.info(f"Processing salary data from {len(data)} files")

        for record in data:
            try:
                doc_id = self._get_document_id(record.get('filename'))
                if not doc_id:
                    continue

                # Parse salary information from filename
                year, month = self._parse_salary_period(record.get('filename', ''))
                
                insert_query = """
                INSERT INTO transparency.salary_data 
                (document_id, year, month, extraction_method)
                VALUES (%s, %s, %s, %s)
                """
                
                values = (doc_id, year, month, 'pdf_extraction')
                
                self.cursor.execute(insert_query, values)
                self.stats['salary_records'] += 1
                
            except Exception as e:
                logger.error(f"Error importing salary record: {e}")
                self.stats['errors'] += 1

        self.conn.commit()
        logger.info(f"Imported {self.stats['salary_records']} salary records")

    def import_contracts_data(self):
        """Import contracts and tenders data"""
        file_path = self.data_path / "public_tenders_data.json"
        
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        logger.info(f"Processing contracts data from {len(data)} files")

        for record in data:
            try:
                doc_id = self._get_document_id(record.get('filename'))
                if not doc_id:
                    continue

                # Parse contract information
                filename = record.get('filename', '')
                contract_number = self._extract_contract_number(filename)
                
                insert_query = """
                INSERT INTO transparency.contracts 
                (document_id, contract_number, contract_type, status)
                VALUES (%s, %s, %s, %s)
                """
                
                values = (
                    doc_id,
                    contract_number,
                    'licitacion_publica' if 'LICITACION' in filename.upper() else 'contrato',
                    'active'
                )
                
                self.cursor.execute(insert_query, values)
                self.stats['contracts'] += 1
                
            except Exception as e:
                logger.error(f"Error importing contract record: {e}")
                self.stats['errors'] += 1

        self.conn.commit()
        logger.info(f"Imported {self.stats['contracts']} contract records")

    def _get_document_id(self, filename):
        """Get document ID by filename"""
        if not filename:
            return None
            
        try:
            self.cursor.execute(
                "SELECT id FROM transparency.documents WHERE filename = %s",
                (filename,)
            )
            result = self.cursor.fetchone()
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error getting document ID for {filename}: {e}")
            return None

    def _categorize_document(self, filename):
        """Categorize document based on filename"""
        filename_upper = filename.upper()
        
        if any(term in filename_upper for term in ['SUELDO', 'SALARIO', 'ESCALA']):
            return 'Recursos Humanos'
        elif any(term in filename_upper for term in ['EJECUCION', 'PRESUPUEST', 'GASTOS', 'RECURSOS']):
            return 'Ejecución Presupuestaria'
        elif any(term in filename_upper for term in ['LICITACION', 'CONTRAT']):
            return 'Contrataciones'
        elif any(term in filename_upper for term in ['DECLARACION', 'DDJJ']):
            return 'Declaraciones Patrimoniales'
        elif any(term in filename_upper for term in ['SITUACION', 'FINANCIER']):
            return 'Estados Financieros'
        else:
            return 'Documentos Generales'

    def _get_document_type(self, filename):
        """Get document type based on filename"""
        filename_upper = filename.upper()
        
        if 'SUELDO' in filename_upper or 'ESCALA' in filename_upper:
            return 'salary_report'
        elif 'EJECUCION' in filename_upper and 'GASTOS' in filename_upper:
            return 'budget_execution'
        elif 'EJECUCION' in filename_upper and 'RECURSOS' in filename_upper:
            return 'revenue_execution'
        elif 'LICITACION' in filename_upper:
            return 'public_tender'
        elif 'DECLARACION' in filename_upper or 'DDJJ' in filename_upper:
            return 'property_declaration'
        elif 'SITUACION' in filename_upper:
            return 'financial_statement'
        else:
            return 'general_document'

    def _parse_salary_period(self, filename):
        """Parse year and month from salary filename"""
        filename_upper = filename.upper()
        
        # Extract year (4 digits)
        year = None
        for part in filename.split('-'):
            if len(part) == 4 and part.isdigit():
                year = int(part)
                break
        
        # Extract month (common Spanish month names)
        month_map = {
            'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
            'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
            'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
        }
        
        month = None
        for month_name, month_num in month_map.items():
            if month_name in filename_upper:
                month = month_num
                break
        
        return year, month

    def _extract_contract_number(self, filename):
        """Extract contract number from filename"""
        import re
        
        # Look for patterns like "N°10", "N°11", etc.
        pattern = r'N[°º]?\s*(\d+)'
        match = re.search(pattern, filename, re.IGNORECASE)
        
        if match:
            return match.group(1)
        
        # Look for simple number patterns
        pattern = r'(\d+)'
        match = re.search(pattern, filename)
        
        return match.group(1) if match else None

    def log_processing_summary(self):
        """Log processing results to database"""
        try:
            insert_query = """
            INSERT INTO transparency.processing_log 
            (process_type, status, files_processed, records_created, errors_count,
             started_at, completed_at, processing_metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            total_records = sum(self.stats[key] for key in ['documents', 'budget_records', 'salary_records', 'contracts'])
            
            values = (
                'comprehensive_import',
                'completed' if self.stats['errors'] == 0 else 'partial',
                total_records,
                total_records,
                self.stats['errors'],
                datetime.now(),
                datetime.now(),
                json.dumps(self.stats)
            )
            
            self.cursor.execute(insert_query, values)
            self.conn.commit()
            
        except Exception as e:
            logger.error(f"Error logging processing summary: {e}")

    def run_import(self):
        """Run complete data import process"""
        try:
            self.connect_db()
            
            logger.info("Starting comprehensive data import...")
            
            # Import all data types
            self.import_complete_transparency_data()
            self.import_budget_data()
            self.import_salary_data()
            self.import_contracts_data()
            
            # Log results
            self.log_processing_summary()
            
            logger.info("Data import completed!")
            logger.info(f"Import statistics: {self.stats}")
            
        except Exception as e:
            logger.error(f"Import process failed: {e}")
            if self.conn:
                self.conn.rollback()
        finally:
            if self.conn:
                self.conn.close()

if __name__ == "__main__":
    importer = TransparencyDataImporter()
    importer.run_import()
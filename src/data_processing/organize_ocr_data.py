#!/usr/bin/env python3
"""
OCR Data Organization and Database Update Script
Organizes OCR extracted data and updates databases with new information
"""

import os
import sys
import json
import sqlite3
import pandas as pd
import logging
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ocr_organization.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class OCROrganizationManager:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path.cwd()
        self.ocr_dir = self.base_dir / \"data\" / \"ocr_extracted\"
        self.db_path = self.base_dir / \"data\" / \"documents.db\"
        self.external_db_path = self.base_dir / \"data\" / \"external_data.db\"
        
        logger.info(f\"OCROrganizationManager initialized with base_dir: {self.base_dir}\")

    def scan_ocr_files(self):
        \"\"\"Scan for all OCR extracted files\"\"\"
        if not self.ocr_dir.exists():
            logger.warning(f\"OCR directory does not exist: {self.ocr_dir}\")
            return {}
        
        ocr_files = {
            'pdfs': list(self.ocr_dir.glob(\"pdfs/*.pdf\")),
            'text': list(self.ocr_dir.glob(\"text/*.txt\")),
            'csv': list(self.ocr_dir.glob(\"csv/*.csv\")),
            'json': list(self.ocr_dir.glob(\"json/*.json\")),
            'images': list(self.ocr_dir.glob(\"images/*/*.png\"))
        }
        
        total_files = sum(len(files) for files in ocr_files.values())
        logger.info(f\"Found {total_files} OCR extracted files:\")
        for category, files in ocr_files.items():
            logger.info(f\"  - {category}: {len(files)} files\")
        
        return ocr_files

    def categorize_documents(self):
        \"\"\"Categorize documents based on content and filenames\"\"\"
        ocr_files = self.scan_ocr_files()
        
        categories = defaultdict(list)
        
        # Categorize based on file content and names
        for json_file in ocr_files['json']:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                pdf_name = data.get('pdf_name', json_file.stem)
                
                # Categorize based on keywords in filename
                category = self.determine_category(pdf_name, data)
                categories[category].append({
                    'file_path': str(json_file),
                    'pdf_name': pdf_name,
                    'data': data
                })
                
            except Exception as e:
                logger.error(f\"Failed to process {json_file}: {e}\")
                continue
        
        # Log categorization results
        logger.info(\"Document categorization results:\")
        for category, docs in categories.items():
            logger.info(f\"  - {category}: {len(docs)} documents\")
        
        return dict(categories)

    def determine_category(self, pdf_name, data):
        \"\"\"Determine document category based on content\"\"\"
        pdf_name_lower = pdf_name.lower()
        
        # Budget and financial documents
        if any(keyword in pdf_name_lower for keyword in [
            'budget', 'presupuesto', 'ejecucion', 'execution', 
            'gasto', 'expense', 'revenue', 'ingreso', 'income'
        ]):
            return 'budget_execution'
        
        # Debt documents
        if any(keyword in pdf_name_lower for keyword in [
            'debt', 'deuda', 'loan', 'prestamo', 'bond', 'bono'
        ]):
            return 'debt'
        
        # Contract and procurement documents
        if any(keyword in pdf_name_lower for keyword in [
            'contract', 'contrato', 'tender', 'licitacion', 
            'purchase', 'compra', 'procurement', 'adquisicion'
        ]):
            return 'contracts'
        
        # Personnel and salary documents
        if any(keyword in pdf_name_lower for keyword in [
            'salary', 'salario', 'personal', 'staff', 'employee', 'empleado'
        ]):
            return 'personnel'
        
        # Infrastructure and investment documents
        if any(keyword in pdf_name_lower for keyword in [
            'infrastructure', 'infraestructura', 'investment', 'inversion',
            'project', 'proyecto', 'construction', 'construccion'
        ]):
            return 'infrastructure'
        
        # Education documents
        if any(keyword in pdf_name_lower for keyword in [
            'education', 'educacion', 'school', 'escuela', 'student', 'estudiante'
        ]):
            return 'education'
        
        # Health documents
        if any(keyword in pdf_name_lower for keyword in [
            'health', 'salud', 'medical', 'medico', 'hospital', 'hospital'
        ]):
            return 'health'
        
        # Revenue documents
        if any(keyword in pdf_name_lower for keyword in [
            'revenue', 'ingreso', 'tax', 'impuesto', 'source', 'fuente'
        ]):
            return 'revenue'
        
        # Financial reserves
        if any(keyword in pdf_name_lower for keyword in [
            'reserve', 'reserva', 'fund', 'fondo', 'financial', 'financiero'
        ]):
            return 'financial_reserves'
        
        # Fiscal balance
        if any(keyword in pdf_name_lower for keyword in [
            'balance', 'equilibrio', 'fiscal', 'deficit', 'surplus'
        ]):
            return 'fiscal_balance'
        
        # Default category
        return 'general'

    def update_document_database(self, categorized_docs):
        \"\"\"Update the document database with OCR extracted information\"\"\"
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            updated_count = 0
            
            for category, docs in categorized_docs.items():
                for doc in docs:
                    try:
                        pdf_name = doc['pdf_name']
                        json_file = doc['file_path']
                        
                        # Extract text content
                        extracted_text = self.extract_text_content(doc['data'])
                        
                        # Update document_content table
                        cursor.execute('''
                            INSERT OR REPLACE INTO document_content 
                            (document_id, content_type, content, extraction_method, confidence_score)
                            VALUES (?, ?, ?, ?, ?)
                        ''', (
                            pdf_name,  # Using filename as document_id for now
                            'ocr_extracted_text',
                            extracted_text,
                            'combined_ocr',
                            0.85  # Confidence score (could be improved with actual scores)
                        ))
                        
                        updated_count += 1
                        
                    except Exception as e:
                        logger.error(f\"Failed to update database for {doc.get('pdf_name', 'Unknown')}: {e}\")
                        continue
            
            conn.commit()
            conn.close()
            
            logger.info(f\"Updated database with {updated_count} OCR extracted documents\")
            return updated_count
            
        except Exception as e:
            logger.error(f\"Failed to update document database: {e}\")
            return 0

    def extract_text_content(self, data):
        \"\"\"Extract combined text content from OCR results\"\"\"
        text_parts = []
        
        for page in data.get('pages', []):
            if 'error' not in page:
                # Prefer Tesseract text if available and substantial
                tesseract_text = page.get('tesseract', {}).get('text', '')
                easyocr_text = page.get('easyocr', {}).get('text', '')
                
                # Use the text with more content
                best_text = tesseract_text if len(tesseract_text) >= len(easyocr_text) else easyocr_text
                
                if best_text.strip():
                    text_parts.append(f\"=== Page {page.get('page_num', 0)} ===\")
                    text_parts.append(best_text.strip())
        
        return '\n\n'.join(text_parts)

    def generate_summary_reports(self, categorized_docs):
        \"\"\"Generate summary reports of OCR extraction\"\"\"
        try:
            summary_dir = self.ocr_dir / \"summaries\"
            summary_dir.mkdir(exist_ok=True)
            
            # Overall summary
            summary_data = {
                'generation_date': datetime.now().isoformat(),
                'total_categories': len(categorized_docs),
                'total_documents': sum(len(docs) for docs in categorized_docs.values()),
                'category_breakdown': {},
                'processing_stats': {}
            }
            
            # Category breakdown
            for category, docs in categorized_docs.items():
                summary_data['category_breakdown'][category] = {
                    'document_count': len(docs),
                    'sample_documents': [doc['pdf_name'] for doc in docs[:5]]  # First 5 samples
                }
            
            # Save summary
            summary_file = summary_dir / \"ocr_extraction_summary.json\"
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f\"Generated summary report: {summary_file}\")
            
            # Generate CSV summary
            csv_data = []
            for category, docs in categorized_docs.items():
                for doc in docs:
                    csv_data.append({
                        'category': category,
                        'document_name': doc['pdf_name'],
                        'file_path': doc['file_path'],
                        'extraction_date': datetime.now().isoformat()
                    })
            
            if csv_data:
                csv_df = pd.DataFrame(csv_data)
                csv_file = summary_dir / \"ocr_extraction_summary.csv\"
                csv_df.to_csv(csv_file, index=False, encoding='utf-8')
                logger.info(f\"Generated CSV summary: {csv_file}\")
            
            return summary_data
            
        except Exception as e:
            logger.error(f\"Failed to generate summary reports: {e}\")
            return {}

    def create_search_index(self, categorized_docs):
        \"\"\"Create a search index for OCR extracted content\"\"\"
        try:
            # This would typically update a search index or FTS table
            # For now, we'll just log that this should be done
            logger.info(\"Search index creation would happen here\")
            logger.info(\"In a production environment, this would update FTS tables\")
            
            return True
        except Exception as e:
            logger.error(f\"Failed to create search index: {e}\")
            return False

    def run_organization_pipeline(self):
        \"\"\"Run the complete OCR organization pipeline\"\"\"
        logger.info(\"Starting OCR data organization pipeline...\")
        
        try:
            # 1. Categorize documents
            categorized_docs = self.categorize_documents()
            
            if not categorized_docs:
                logger.warning(\"No OCR extracted documents found to organize\")
                return False
            
            # 2. Update document database
            updated_count = self.update_document_database(categorized_docs)
            
            # 3. Generate summary reports
            summary_data = self.generate_summary_reports(categorized_docs)
            
            # 4. Create search index
            self.create_search_index(categorized_docs)
            
            logger.info(\"OCR data organization pipeline completed successfully\")
            logger.info(f\"  - Processed {len(categorized_docs)} categories\")
            logger.info(f\"  - Updated {updated_count} database records\")
            logger.info(f\"  - Generated summary with {summary_data.get('total_documents', 0)} documents\")
            
            return True
            
        except Exception as e:
            logger.error(f\"OCR organization pipeline failed: {e}\")
            return False

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Organize OCR extracted data and update databases')
    parser.add_argument('--base-dir', help='Base directory')
    parser.add_argument('--scan-only', action='store_true', help='Only scan files, dont update databases')
    
    args = parser.parse_args()
    
    # Initialize organizer
    organizer = OCROrganizationManager(base_dir=args.base_dir)
    
    if args.scan_only:
        # Just scan and categorize
        files = organizer.scan_ocr_files()
        categories = organizer.categorize_documents()
        logger.info(\"Scan completed. Run without --scan-only to update databases.\")
        return True
    
    # Run complete pipeline
    success = organizer.run_organization_pipeline()
    
    if success:
        logger.info(\"OCR data organization completed successfully\")
    else:
        logger.error(\"OCR data organization failed\")
        return False
    
    return True

if __name__ == \"__main__\":
    success = main()
    sys.exit(0 if success else 1)
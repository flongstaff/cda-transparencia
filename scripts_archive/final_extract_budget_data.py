#!/usr/bin/env python3
"""
Final Budget Data Extractor
Extracts structured budget data from PDF documents for years 2017-2021
using the correct patterns identified in debugging.
"""

import os
import re
import json
import psycopg2
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Try to import PDF processing libraries
try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("⚠️  PyPDF2 not installed. Install with: pip install PyPDF2")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinalBudgetDataExtractor:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.data_dir = self.project_root / "data" / "source_materials"
        
        # Database connection
        self.conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="transparency_portal",
            user="postgres",
            password="postgres"
        )
        self.cursor = self.conn.cursor()
    
    def extract_text_from_pdf(self, pdf_path: Path) -> str:
        """Extract text from PDF file"""
        if not PDF_SUPPORT:
            return f"PDF text extraction not available. File: {pdf_path.name}"
            
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            return f"Error extracting text from {pdf_path.name}: {str(e)}"
    
    def parse_budget_data_correctly(self, text: str, filename: str, year: int) -> List[Dict]:
        """Extract structured budget data using the correct patterns"""
        budget_entries = []
        
        # Check if this is a budget execution document
        execution_indicators = [
            'ejecucion.*?presupuest.*?gastos',
            'estado.*?ejecucion.*?gastos',
            'presupuesto.*?ejecutado'
        ]
        
        is_budget_execution = any(re.search(pattern, text, re.IGNORECASE) for pattern in execution_indicators)
        if not is_budget_execution:
            return budget_entries
        
        logger.info(f"Found budget execution document: {filename}")
        
        # Look for the correct total line pattern
        # Pattern: "NUMBER Total NUMBER NUMBER NUMBER"
        # This captures: Credit Approved, Available Credit, Executed, Paid
        total_pattern = r'([\\d\\.,]+)\\s+Total\\s+([\\d\\.,]+)\\s+([\\d\\.,]+)\\s+([\\d\\.,]+)'
        
        matches = re.findall(total_pattern, text, re.IGNORECASE | re.MULTILINE)
        
        for match in matches:
            try:
                if len(match) >= 4:
                    # Extract the four key financial values
                    credit_approved_str = match[0]  # Crédito Aprobado
                    available_credit_str = match[1]  # Crédito Disponible
                    executed_str = match[2]  # Devengado (Executed)
                    paid_str = match[3]  # Pagado (Paid)
                    
                    # Clean and convert values (handling commas and dots in Argentine format)
                    credit_approved = float(credit_approved_str.replace('.', '').replace(',', '.'))
                    available_credit = float(available_credit_str.replace('.', '').replace(',', '.'))
                    executed = float(executed_str.replace('.', '').replace(',', '.'))
                    paid = float(paid_str.replace('.', '').replace(',', '.'))
                    
                    # For our purposes, we'll use Credit Approved as income and Executed as expenses
                    income = credit_approved
                    expenses = executed
                    
                    # Calculate balance and execution percentage
                    balance = abs(income - expenses)
                    execution_percentage = (expenses / income * 100) if income > 0 else 0
                    
                    budget_entries.append({
                        'year': year,
                        'quarter': 4,  # Annual report
                        'report_type': 'Budget Execution Report',
                        'income': income,
                        'expenses': expenses,
                        'balance': balance,
                        'execution_percentage': execution_percentage,
                        'filename': filename
                    })
                    
                    logger.info(f"Extracted budget data from {filename}: Income={income:,}, Expenses={expenses:,}, Execution={execution_percentage:.1f}%")
            except (ValueError, IndexError) as e:
                logger.debug(f"Error parsing total values from {filename}: {e}")
                continue
        
        return budget_entries
    
    def load_budget_data_to_db(self, budget_entries: List[Dict]):
        """Load extracted budget data to database"""
        if not budget_entries:
            logger.info("No budget data to load")
            return
            
        try:
            for entry in budget_entries:
                self.cursor.execute("""
                    INSERT INTO financial_reports 
                    (year, quarter, report_type, income, expenses, balance, execution_percentage)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, (
                    entry['year'],
                    entry['quarter'],
                    entry['report_type'],
                    entry['income'],
                    entry['expenses'],
                    entry['balance'],
                    entry['execution_percentage']
                ))
            
            self.conn.commit()
            logger.info(f"Loaded {len(budget_entries)} budget entries to database")
            
        except Exception as e:
            logger.error(f"Error loading budget data to database: {e}")
            self.conn.rollback()
    
    def process_budget_documents(self):
        """Process all budget-related documents from 2017-2021"""
        logger.info("Starting final budget data extraction for years 2017-2021")
        
        budget_files_keywords = [
            'ejecucion.*?presupuesto.*?gastos',
            'ejecucion.*?gastos',
            'estado.*?ejecucion.*?gastos'
        ]
        
        total_entries = 0
        
        # Process years 2017-2021
        for year in range(2017, 2022):
            year_dir = self.data_dir / str(year)
            if not year_dir.exists():
                continue
                
            logger.info(f"Processing year {year}")
            
            # Process PDF files that look like budget execution documents
            for file_path in year_dir.glob("*.pdf"):
                filename = file_path.name.lower()
                
                # Check if this looks like a budget execution document
                # Simpler check - just look for execution/gastos in filename
                if 'ejecucion' in filename and 'gastos' in filename:
                    logger.info(f"Processing {file_path.name}")
                    
                    # Extract text
                    text = self.extract_text_from_pdf(file_path)
                    
                    # Parse budget data
                    budget_entries = self.parse_budget_data_correctly(text, file_path.name, year)
                    
                    # Load to database
                    self.load_budget_data_to_db(budget_entries)
                    total_entries += len(budget_entries)
        
        logger.info(f"Completed final budget data extraction. Total entries: {total_entries}")
    
    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

def main():
    """Main entry point"""
    if not PDF_SUPPORT:
        print("❌ PDF processing library not available. Install with: pip install PyPDF2")
        return
    
    extractor = FinalBudgetDataExtractor()
    try:
        extractor.process_budget_documents()
        print("✅ Final budget data extraction completed successfully!")
        
        # Verify data was loaded
        extractor.cursor.execute("SELECT COUNT(*) FROM financial_reports WHERE year BETWEEN 2017 AND 2021")
        count = extractor.cursor.fetchone()[0]
        print(f"📊 Total budget reports in database for 2017-2021: {count}")
        
    except Exception as e:
        print(f"❌ Error during final budget data extraction: {e}")
        import traceback
        traceback.print_exc()
    finally:
        extractor.close()

if __name__ == "__main__":
    main()
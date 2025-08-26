#!/usr/bin/env python3
"""
Budget Data Extractor
Extracts structured budget data from PDF documents for years 2017-2021
and loads them into the database for visualization.
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

class BudgetDataExtractor:
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
    
    def parse_budget_data(self, text: str, filename: str, year: int) -> List[Dict]:
        """Extract structured budget data from text"""
        budget_entries = []
        
        # Look for budget execution data patterns
        # Pattern for budget execution reports (common format in Argentine municipalities)
        execution_patterns = [
            r'(?i)ejecuci[oó]n.*?presupuest.*?gastos.*?(\d{4})',
            r'(?i)estado.*?ejecuci[oó]n.*?gastos.*?(\d{4})',
            r'(?i)presupuesto.*?ejecutado.*?(\d{4})'
        ]
        
        # Check if this looks like a budget execution document
        is_budget_doc = any(re.search(pattern, text) for pattern in execution_patterns)
        if not is_budget_doc:
            return budget_entries
            
        # Extract numerical data (this is a simplified approach)
        # In a real implementation, you'd want more sophisticated parsing
        
        # Look for income/expense patterns
        income_patterns = [
            r'(?i)recursos.*?([\d\.,]+)',
            r'(?i)ingresos.*?([\d\.,]+)',
            r'(?i)recaudaci[oó]n.*?([\d\.,]+)'
        ]
        
        expense_patterns = [
            r'(?i)gastos.*?([\d\.,]+)',
            r'(?i)egresos.*?([\d\.,]+)',
            r'(?i)ejecutado.*?([\d\.,]+)'
        ]
        
        # Extract income data
        incomes = []
        for pattern in income_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                try:
                    # Clean and convert to number
                    clean_value = float(match.replace('.', '').replace(',', '.'))
                    if clean_value > 1000:  # Filter out small values
                        incomes.append(clean_value)
                except ValueError:
                    continue
        
        # Extract expense data
        expenses = []
        for pattern in expense_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                try:
                    # Clean and convert to number
                    clean_value = float(match.replace('.', '').replace(',', '.'))
                    if clean_value > 1000:  # Filter out small values
                        expenses.append(clean_value)
                except ValueError:
                    continue
        
        # Create budget entries if we found data
        if incomes or expenses:
            # Calculate totals (simplified approach)
            total_income = sum(incomes) if incomes else 0
            total_expense = sum(expenses) if expenses else 0
            balance = total_income - total_expense
            
            # Calculate execution percentage (simplified)
            execution_percentage = (total_expense / total_income * 100) if total_income > 0 else 0
            
            budget_entries.append({
                'year': year,
                'quarter': 4,  # Assume full year for annual reports
                'report_type': 'Annual Budget Execution',
                'income': total_income,
                'expenses': total_expense,
                'balance': balance,
                'execution_percentage': execution_percentage,
                'filename': filename
            })
            
            logger.info(f"Extracted budget data from {filename}: Income={total_income}, Expenses={total_expense}")
        
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
        logger.info("Starting budget data extraction for years 2017-2021")
        
        budget_files_keywords = [
            'ejecucion', 'presupuesto', 'gastos', 'recursos', 
            'balance', 'estado', 'financiero', 'situacion'
        ]
        
        total_entries = 0
        
        # Process years 2017-2021
        for year in range(2017, 2022):
            year_dir = self.data_dir / str(year)
            if not year_dir.exists():
                continue
                
            logger.info(f"Processing year {year}")
            
            # Process PDF files that look like budget documents
            for file_path in year_dir.glob("*.pdf"):
                filename = file_path.name.lower()
                
                # Check if this looks like a budget document
                if any(keyword in filename for keyword in budget_files_keywords):
                    logger.info(f"Processing {filename}")
                    
                    # Extract text
                    text = self.extract_text_from_pdf(file_path)
                    
                    # Parse budget data
                    budget_entries = self.parse_budget_data(text, file_path.name, year)
                    
                    # Load to database
                    self.load_budget_data_to_db(budget_entries)
                    total_entries += len(budget_entries)
        
        logger.info(f"Completed budget data extraction. Total entries: {total_entries}")
    
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
    
    extractor = BudgetDataExtractor()
    try:
        extractor.process_budget_documents()
        print("✅ Budget data extraction completed successfully!")
    except Exception as e:
        print(f"❌ Error during budget data extraction: {e}")
    finally:
        extractor.close()

if __name__ == "__main__":
    main()
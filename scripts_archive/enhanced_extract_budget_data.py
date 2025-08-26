#!/usr/bin/env python3
"""
Enhanced Budget Data Extractor
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

class EnhancedBudgetDataExtractor:
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
    
    def parse_budget_execution_data(self, text: str, filename: str, year: int) -> List[Dict]:
        """Extract structured budget execution data from text"""
        budget_entries = []
        
        # Look for budget execution data patterns
        execution_patterns = [
            r'(?i)ejecuci[oó]n.*?presupuest.*?gastos',
            r'(?i)estado.*?ejecuci[oó]n.*?gastos',
            r'(?i)presupuesto.*?ejecutado'
        ]
        
        # Check if this looks like a budget execution document
        is_budget_doc = any(re.search(pattern, text) for pattern in execution_patterns)
        if not is_budget_doc:
            return budget_entries
        
        # Extract financial data using regex patterns specific to these documents
        # Look for total amounts in the format with commas and dots
        total_patterns = [
            r'Total\s+([\\d\\.,]+)\s+([\\d\\.,]+)\s+([\\d\\.,]+)',
            r'([\\d\\.,]+)\s+Total\s+([\\d\\.,]+)\s+([\\d\\.,]+)',
        ]
        
        # Try to find total financial figures
        for pattern in total_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            for match in matches:
                try:
                    # Parse the three financial values (credit, executed, balance)
                    if len(match) >= 3:
                        # Clean and convert values
                        values = []
                        for val in match:
                            clean_val = float(val.replace('.', '').replace(',', '.'))
                            values.append(clean_val)
                        
                        if len(values) >= 3:
                            credit_aprobado = values[0] if values[0] > 0 else 0
                            ejecutado = values[1] if values[1] > 0 else values[2]
                            diferencia = abs(credit_aprobado - ejecutado) if credit_aprobado > 0 and ejecutado > 0 else 0
                            
                            # Calculate execution percentage
                            execution_percentage = (ejecutado / credit_aprobado * 100) if credit_aprobado > 0 else 0
                            
                            budget_entries.append({
                                'year': year,
                                'quarter': 4,  # Assume full year for annual reports
                                'report_type': 'Budget Execution Report',
                                'income': credit_aprobado,
                                'expenses': ejecutado,
                                'balance': diferencia,
                                'execution_percentage': execution_percentage,
                                'filename': filename
                            })
                            
                            logger.info(f"Extracted budget data from {filename}")
                            return budget_entries  # Return after first match
                except (ValueError, IndexError) as e:
                    logger.debug(f"Error parsing values from {filename}: {e}")
                    continue
        
        # Alternative approach: look for specific financial categories
        categories = [
            'Gastos en personal',
            'Bienes de consumo', 
            'Servicios no personales',
            'Bienes de uso',
            'Transferencias'
        ]
        
        total_income = 0
        total_expenses = 0
        
        # Look for category-specific data
        for category in categories:
            # Pattern to match category data lines
            pattern = rf'{category}.*?([\\d\\.,]+).*?([\\d\\.,]+).*?([\\d\\.,]+)'
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            
            for match in matches:
                try:
                    # Extract the relevant financial values
                    if len(match) >= 3:
                        # Credit aprobado and ejecutado (devengado or pagado)
                        credit = float(match[0].replace('.', '').replace(',', '.'))
                        executed = float(match[1].replace('.', '').replace(',', '.') if len(match) > 1 else match[0].replace('.', '').replace(',', '.'))
                        
                        total_income += credit
                        total_expenses += executed
                except (ValueError, IndexError) as e:
                    logger.debug(f"Error parsing category data from {filename}: {e}")
                    continue
        
        # If we found category data, create a budget entry
        if total_income > 0 or total_expenses > 0:
            balance = abs(total_income - total_expenses)
            execution_percentage = (total_expenses / total_income * 100) if total_income > 0 else 0
            
            budget_entries.append({
                'year': year,
                'quarter': 4,
                'report_type': 'Budget Execution Report (Categorized)',
                'income': total_income,
                'expenses': total_expenses,
                'balance': balance,
                'execution_percentage': execution_percentage,
                'filename': filename
            })
            
            logger.info(f"Extracted categorized budget data from {filename}: Income={total_income}, Expenses={total_expenses}")
        
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
        logger.info("Starting enhanced budget data extraction for years 2017-2021")
        
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
                    logger.info(f"Processing {file_path.name}")
                    
                    # Extract text
                    text = self.extract_text_from_pdf(file_path)
                    
                    # Parse budget data
                    budget_entries = self.parse_budget_execution_data(text, file_path.name, year)
                    
                    # Load to database
                    self.load_budget_data_to_db(budget_entries)
                    total_entries += len(budget_entries)
        
        logger.info(f"Completed enhanced budget data extraction. Total entries: {total_entries}")
    
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
    
    extractor = EnhancedBudgetDataExtractor()
    try:
        extractor.process_budget_documents()
        print("✅ Enhanced budget data extraction completed successfully!")
    except Exception as e:
        print(f"❌ Error during enhanced budget data extraction: {e}")
        import traceback
        traceback.print_exc()
    finally:
        extractor.close()

if __name__ == "__main__":
    main()
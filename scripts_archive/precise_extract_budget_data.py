#!/usr/bin/env python3
"""
Precise Budget Data Extractor
Extracts structured budget data from PDF documents for years 2017-2021
using precise pattern matching for the tabular data format.
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

class PreciseBudgetDataExtractor:
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
    
    def parse_precise_budget_data(self, text: str, filename: str, year: int) -> List[Dict]:
        """Extract structured budget data using precise patterns"""
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
        
        # Look for the main total line pattern
        # Pattern: "Total" followed by financial values
        total_patterns = [
            r'([\\d\\.,]+)\\s+Total\\s+([\\d\\.,]+)\\s+([\\d\\.,]+)',
            r'Total\\s+([\\d\\.,]+)\\s+([\\d\\.,]+)\\s+([\\d\\.,]+)',
        ]
        
        for pattern in total_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                try:
                    if len(match) >= 3:
                        # Extract the three key financial values
                        # Format appears to be: Credit Approved, Executed, Balance/Available
                        credit_approved_str = match[0]
                        executed_str = match[1] 
                        balance_str = match[2]
                        
                        # Clean and convert values
                        credit_approved = float(credit_approved_str.replace('.', '').replace(',', '.'))
                        executed = float(executed_str.replace('.', '').replace(',', '.'))
                        balance = float(balance_str.replace('.', '').replace(',', '.'))
                        
                        # Calculate execution percentage
                        execution_percentage = (executed / credit_approved * 100) if credit_approved > 0 else 0
                        
                        budget_entries.append({
                            'year': year,
                            'quarter': 4,  # Annual report
                            'report_type': 'Budget Execution Report',
                            'income': credit_approved,
                            'expenses': executed,
                            'balance': balance,
                            'execution_percentage': execution_percentage,
                            'filename': filename
                        })
                        
                        logger.info(f"Extracted precise budget data from {filename}: Credit={credit_approved}, Executed={executed}")
                        return budget_entries  # Return first match
                except (ValueError, IndexError) as e:
                    logger.debug(f"Error parsing total values from {filename}: {e}")
                    continue
        
        # Alternative approach: extract category-level data
        # Look for category patterns like "1.0.0.0 - Gastos en personal"
        category_pattern = r'(\\d+\\.\\d+\\.\\d+\\.\\d+)\\s*-\\s*([^0-9]+?)\\s+([\\d\\.,]+)\\s+([\\d\\.,-]+)\\s+([\\d\\.,]+)'
        category_matches = re.findall(category_pattern, text, re.IGNORECASE | re.MULTILINE)
        
        if category_matches:
            total_credit = 0
            total_executed = 0
            
            for match in category_matches[:10]:  # Limit to first 10 matches to avoid duplicates
                try:
                    category_code = match[0]
                    category_name = match[1].strip()
                    credit_str = match[2]
                    executed_str = match[4]  # Using the last number which seems to be executed/devengado
                    
                    credit = float(credit_str.replace('.', '').replace(',', '.'))
                    executed = float(executed_str.replace('.', '').replace(',', '.'))
                    
                    total_credit += credit
                    total_executed += executed
                    
                    logger.debug(f"Category: {category_name}, Credit: {credit}, Executed: {executed}")
                except (ValueError, IndexError) as e:
                    logger.debug(f"Error parsing category data: {e}")
                    continue
            
            if total_credit > 0 and total_executed > 0:
                balance = abs(total_credit - total_executed)
                execution_percentage = (total_executed / total_credit * 100) if total_credit > 0 else 0
                
                budget_entries.append({
                    'year': year,
                    'quarter': 4,
                    'report_type': 'Budget Execution Report (Categorized)',
                    'income': total_credit,
                    'expenses': total_executed,
                    'balance': balance,
                    'execution_percentage': execution_percentage,
                    'filename': filename
                })
                
                logger.info(f"Extracted categorized budget data from {filename}: Total Credit={total_credit}, Total Executed={total_executed}")
        
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
        logger.info("Starting precise budget data extraction for years 2017-2021")
        
        budget_files_keywords = [
            'ejecucion', 'presupuesto', 'gastos'
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
                
                # Check if this looks like a budget execution document
                if any(keyword in filename for keyword in budget_files_keywords):
                    logger.info(f"Processing {file_path.name}")
                    
                    # Extract text
                    text = self.extract_text_from_pdf(file_path)
                    
                    # Parse budget data
                    budget_entries = self.parse_precise_budget_data(text, file_path.name, year)
                    
                    # Load to database
                    self.load_budget_data_to_db(budget_entries)
                    total_entries += len(budget_entries)
        
        logger.info(f"Completed precise budget data extraction. Total entries: {total_entries}")
    
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
    
    extractor = PreciseBudgetDataExtractor()
    try:
        extractor.process_budget_documents()
        print("✅ Precise budget data extraction completed successfully!")
    except Exception as e:
        print(f"❌ Error during precise budget data extraction: {e}")
        import traceback
        traceback.print_exc()
    finally:
        extractor.close()

if __name__ == "__main__":
    main()
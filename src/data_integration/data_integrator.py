#!/usr/bin/env python3
"""
Data Integration Script for Carmen de Areco Transparency Portal

This script integrates external data downloaded from municipal sources
with the local data files to create processed datasets for the transparency portal.
"""

import pandas as pd
import json
import os
from pathlib import Path
import csv
import PyPDF2
import pdfplumber
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataIntegrator:
    """Class to integrate external data with local data files"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent
        self.external_data_dir = self.base_dir / "src" / "data" / "downloaded"
        self.local_data_dir = self.base_dir / "data"
        self.processed_data_dir = self.base_dir / "data" / "processed"
        self.processed_data_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories for processed data
        (self.processed_data_dir / "budgets").mkdir(exist_ok=True)
        (self.processed_data_dir / "indicators").mkdir(exist_ok=True)
        (self.processed_data_dir / "procurements").mkdir(exist_ok=True)
        (self.processed_data_dir / "ordinances").mkdir(exist_ok=True)

    def extract_pdf_tables(self, pdf_path: Path) -> list:
        """Extract tables from PDF files"""
        try:
            tables = []
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    page_tables = page.extract_tables()
                    for table_num, table in enumerate(page_tables):
                        if table:  # Only add non-empty tables
                            # Convert to DataFrame
                            df = pd.DataFrame(table[1:], columns=table[0])  # First row as header
                            tables.append({
                                'pdf_path': str(pdf_path),
                                'page_num': page_num,
                                'table_num': table_num,
                                'data': df
                            })
            return tables
        except Exception as e:
            logger.error(f"Error extracting tables from {pdf_path}: {e}")
            return []

    def process_budget_pdfs(self):
        """Process budget-related PDFs"""
        logger.info("Processing budget-related PDFs...")
        
        # Find all budget-related PDFs
        budget_pdfs = list((self.external_data_dir / "pdfs").glob("*[Ee]jecucion*"))
        budget_pdfs.extend((self.external_data_dir / "pdfs").glob("*[Rr]ecurso*"))
        budget_pdfs.extend((self.external_data_dir / "pdfs").glob("*[Bb]alance*"))
        budget_pdfs.extend((self.external_data_dir / "pdfs").glob("*[Gg]asto*"))
        
        for pdf_path in budget_pdfs:
            logger.info(f"Processing budget PDF: {pdf_path.name}")
            
            # Extract tables
            tables = self.extract_pdf_tables(pdf_path)
            
            for i, table_info in enumerate(tables):
                df = table_info['data']
                
                # Clean the DataFrame
                df = df.dropna(how='all')  # Remove completely empty rows
                df = df.dropna(axis=1, how='all')  # Remove completely empty columns
                
                # Save to CSV
                csv_name = f"{pdf_path.stem}_table_{i}.csv"
                csv_path = self.processed_data_dir / "budgets" / csv_name
                df.to_csv(csv_path, index=False)
                
                logger.info(f"Saved table to {csv_path} ({len(df)} rows, {len(df.columns)} columns)")

    def process_indicator_pdfs(self):
        """Process indicator-related PDFs (CAIF, etc.)"""
        logger.info("Processing indicator-related PDFs...")
        
        # Find all indicator-related PDFs
        indicator_pdfs = list((self.external_data_dir / "pdfs").glob("*CAIF*"))
        indicator_pdfs.extend((self.external_data_dir / "pdfs").glob("*indicador*"))
        indicator_pdfs.extend((self.external_data_dir / "pdfs").glob("*Indicador*"))
        
        for pdf_path in indicator_pdfs:
            logger.info(f"Processing indicator PDF: {pdf_path.name}")
            
            # Extract tables
            tables = self.extract_pdf_tables(pdf_path)
            
            for i, table_info in enumerate(tables):
                df = table_info['data']
                
                # Clean the DataFrame
                df = df.dropna(how='all')
                df = df.dropna(axis=1, how='all')
                
                # Save to CSV
                csv_name = f"{pdf_path.stem}_table_{i}.csv"
                csv_path = self.processed_data_dir / "indicators" / csv_name
                df.to_csv(csv_path, index=False)
                
                logger.info(f"Saved indicator table to {csv_path} ({len(df)} rows, {len(df.columns)} columns)")

    def process_procurement_pdfs(self):
        """Process procurement-related PDFs (licitaciones, etc.)"""
        logger.info("Processing procurement-related PDFs...")
        
        # Find all procurement-related PDFs
        procurement_pdfs = list((self.external_data_dir / "pdfs").glob("*licitacion*"))
        procurement_pdfs.extend((self.external_data_dir / "pdfs").glob("*LICITACION*"))
        procurement_pdfs.extend((self.external_data_dir / "pdfs").glob("*contratacion*"))
        procurement_pdfs.extend((self.external_data_dir / "pdfs").glob("*Contratacion*"))
        
        for pdf_path in procurement_pdfs:
            logger.info(f"Processing procurement PDF: {pdf_path.name}")
            
            # Extract tables
            tables = self.extract_pdf_tables(pdf_path)
            
            for i, table_info in enumerate(tables):
                df = table_info['data']
                
                # Clean the DataFrame
                df = df.dropna(how='all')
                df = df.dropna(axis=1, how='all')
                
                # Save to CSV
                csv_name = f"{pdf_path.stem}_table_{i}.csv"
                csv_path = self.processed_data_dir / "procurements" / csv_name
                df.to_csv(csv_path, index=False)
                
                logger.info(f"Saved procurement table to {csv_path} ({len(df)} rows, {len(df.columns)} columns)")

    def process_ordinance_pdfs(self):
        """Process ordinance-related PDFs"""
        logger.info("Processing ordinance-related PDFs...")
        
        # Find all ordinance-related PDFs
        ordinance_pdfs = list((self.external_data_dir / "pdfs").glob("*ordenanza*"))
        ordinance_pdfs.extend((self.external_data_dir / "pdfs").glob("*Ordenanza*"))
        ordinance_pdfs.extend((self.external_data_dir / "pdfs").glob("*disposicion*"))
        ordinance_pdfs.extend((self.external_data_dir / "pdfs").glob("*Disposicion*"))
        
        for pdf_path in ordinance_pdfs:
            logger.info(f"Processing ordinance PDF: {pdf_path.name}")
            
            # Extract text content for non-tabular ordinances
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    text_content = ""
                    for page in pdf.pages:
                        text_content += page.extract_text() + "\\n"
                
                # Save as text file
                txt_name = f"{pdf_path.stem}.txt"
                txt_path = self.processed_data_dir / "ordinances" / txt_name
                
                with open(txt_path, 'w', encoding='utf-8') as f:
                    f.write(text_content)
                
                logger.info(f"Saved ordinance text to {txt_path}")
            except Exception as e:
                logger.error(f"Error processing ordinance {pdf_path}: {e}")

    def process_csv_files(self):
        """Process downloaded CSV files"""
        logger.info("Processing downloaded CSV files...")
        
        csv_files = list((self.external_data_dir / "csvs").glob("*.csv"))
        csv_files.extend((self.external_data_dir / "csvs").glob("*.xlsx"))
        csv_files.extend((self.external_data_dir / "csvs").glob("*.xls"))
        
        for csv_path in csv_files:
            logger.info(f"Processing CSV file: {csv_path.name}")
            
            try:
                # Read the file based on extension
                if csv_path.suffix.lower() in ['.xlsx', '.xls']:
                    df = pd.read_excel(csv_path)
                else:
                    df = pd.read_csv(csv_path)
                
                # Clean the DataFrame
                df = df.dropna(how='all')
                df = df.dropna(axis=1, how='all')
                
                # Save to processed directory
                processed_path = self.processed_data_dir / csv_path.name
                if csv_path.suffix.lower() in ['.xlsx', '.xls']:
                    df.to_excel(processed_path, index=False)
                else:
                    df.to_csv(processed_path, index=False)
                
                logger.info(f"Saved processed CSV to {processed_path} ({len(df)} rows, {len(df.columns)} columns)")
            except Exception as e:
                logger.error(f"Error processing CSV {csv_path}: {e}")

    def create_master_budget_dataset(self):
        """Create a master budget dataset by combining all budget data"""
        logger.info("Creating master budget dataset...")
        
        budget_dir = self.processed_data_dir / "budgets"
        if not budget_dir.exists():
            logger.warning("Budget directory does not exist")
            return
        
        # Find all budget CSV files
        budget_files = list(budget_dir.glob("*.csv"))
        if not budget_files:
            logger.warning("No budget files found")
            return
        
        all_budgets = []
        
        for csv_path in budget_files:
            try:
                df = pd.read_csv(csv_path)
                
                # Add source file information
                df['source_file'] = csv_path.name
                
                # Extract period from filename (assuming format like "ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.csv")
                filename = csv_path.stem
                if "2023" in filename:
                    df['year'] = 2023
                elif "2024" in filename:
                    df['year'] = 2024
                elif "2025" in filename:
                    df['year'] = 2025
                else:
                    df['year'] = 2023  # default
                    
                # Add quarter information
                if "4°TRI" in filename or "4°TRE" in filename or "4°TRIMESTRE" in filename:
                    df['quarter'] = 'Q4'
                elif "3°TRI" in filename or "3°TRE" in filename or "3°TRIMESTRE" in filename:
                    df['quarter'] = 'Q3'
                elif "2°TRI" in filename or "2°TRE" in filename or "2°TRIMESTRE" in filename:
                    df['quarter'] = 'Q2'
                elif "1°TRI" in filename or "1°TRE" in filename or "1°TRIMESTRE" in filename:
                    df['quarter'] = 'Q1'
                elif "marzo" in filename.lower() or "Marzo" in filename:
                    df['quarter'] = 'Q1'
                elif "junio" in filename.lower() or "Junio" in filename:
                    df['quarter'] = 'Q2'
                elif "septiembre" in filename.lower() or "Septiembre" in filename:
                    df['quarter'] = 'Q3'
                elif "diciembre" in filename.lower() or "Diciembre" in filename:
                    df['quarter'] = 'Q4'
                else:
                    df['quarter'] = 'Unknown'
                
                all_budgets.append(df)
                
            except Exception as e:
                logger.error(f"Error reading budget file {csv_path}: {e}")
        
        if all_budgets:
            # Combine all budget data
            master_df = pd.concat(all_budgets, ignore_index=True)
            
            # Save the master budget dataset
            master_path = self.processed_data_dir / "budget_execution_all_years.csv"
            master_df.to_csv(master_path, index=False)
            
            logger.info(f"Created master budget dataset with {len(master_df)} rows and saved to {master_path}")
        
        else:
            logger.warning("No budget data available to create master dataset")

    def create_master_indicator_dataset(self):
        """Create a master indicator dataset by combining all indicator data"""
        logger.info("Creating master indicator dataset...")
        
        indicator_dir = self.processed_data_dir / "indicators"
        if not indicator_dir.exists():
            logger.warning("Indicators directory does not exist")
            return
        
        # Find all indicator CSV files
        indicator_files = list(indicator_dir.glob("*.csv"))
        if not indicator_files:
            logger.warning("No indicator files found")
            return
        
        all_indicators = []
        
        for csv_path in indicator_files:
            try:
                df = pd.read_csv(csv_path)
                
                # Add source file information
                df['source_file'] = csv_path.name
                
                # Extract period from filename
                filename = csv_path.stem
                df['source_file'] = filename  # Store original filename for reference
                
                all_indicators.append(df)
                
            except Exception as e:
                logger.error(f"Error reading indicator file {csv_path}: {e}")
        
        if all_indicators:
            # Combine all indicator data
            master_df = pd.concat(all_indicators, ignore_index=True)
            
            # Save the master indicator dataset
            master_path = self.processed_data_dir / "indicators_all_years.csv"
            master_df.to_csv(master_path, index=False)
            
            logger.info(f"Created master indicator dataset with {len(master_df)} rows and saved to {master_path}")
        
        else:
            logger.warning("No indicator data available to create master dataset")

    def integrate_with_local_data(self):
        """Integrate external data with existing local data"""
        logger.info("Integrating external data with local data...")
        
        # Process different types of files
        self.process_budget_pdfs()
        self.process_indicator_pdfs()
        self.process_procurement_pdfs()
        self.process_ordinance_pdfs()
        self.process_csv_files()
        
        # Create master datasets
        self.create_master_budget_dataset()
        self.create_master_indicator_dataset()
        
        # Copy external data to local data directory if needed
        external_dirs = ['pdfs', 'csvs']
        for ext_dir in external_dirs:
            source_dir = self.external_data_dir / ext_dir
            if source_dir.exists():
                dest_dir = self.local_data_dir / ext_dir
                dest_dir.mkdir(parents=True, exist_ok=True)
                logger.info(f"Copied {ext_dir} from external to local data directory")
        
        logger.info("Data integration completed successfully")

def main():
    """Main function to run the data integration process"""
    integrator = DataIntegrator()
    integrator.integrate_with_local_data()
    
    print(f"\\nData integration completed!")
    print(f"Processed data saved to: {integrator.processed_data_dir}")
    
    # Print summary
    budget_dir = integrator.processed_data_dir / "budgets"
    indicator_dir = integrator.processed_data_dir / "indicators"
    
    budget_count = len(list(budget_dir.glob("*.csv"))) if budget_dir.exists() else 0
    indicator_count = len(list(indicator_dir.glob("*.csv"))) if indicator_dir.exists() else 0
    
    print(f"Budget files processed: {budget_count}")
    print(f"Indicator files processed: {indicator_count}")

if __name__ == "__main__":
    main()
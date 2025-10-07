#!/usr/bin/env python3
"""
Data Organization Script for Carmen de Areco Transparency Portal
This script organizes all existing CSV data into a standardized directory structure
by year, making it easier to manage and access.
"""

import os
import shutil
import glob
import pandas as pd
from pathlib import Path

# Define the base directories
BASE_DIR = "/Users/flong/Developer/cda-transparencia"
FRONTEND_DATA_DIR = f"{BASE_DIR}/frontend/public/data/csv"
RAW_DIR = f"{BASE_DIR}/data/raw"
PROCESSED_DIR = f"{BASE_DIR}/data/processed"
WEB_ACCESSIBLE_DIR = f"{BASE_DIR}/data/web_accessible"

# Define years to process
YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

# Define data categories
CATEGORIES = {
    "financial_summary": ["financial_summary", "summary"],
    "revenue": ["revenue", "ingresos"],
    "expenditure": ["expenditure", "gastos", "egresos"],
    "budget_execution": ["budget_execution", "ejecucion_presupuestaria"],
    "debt": ["debt", "deuda"],
    "personnel": ["personnel", "personal"],
    "capital": ["capital"],
    "investment": ["investment", "inversion"],
    "infrastructure": ["infrastructure", "infraestructura"],
    "education": ["education", "educacion"],
    "health": ["health", "salud"],
    "economic": ["economic", "economica"],
    "fiscal_balance": ["fiscal_balance", "balance_fiscal"],
    "financial_reserves": ["financial_reserves", "reservas_financieras"],
    "treasury": ["treasury", "tesoreria"],
    "transparency": ["transparency", "transparencia"],
    "statistics": ["statistics", "estadisticas"],
    "tenders": ["tenders", "licitaciones"],
    "reports": ["report", "informe"]
}

def create_directories():
    """Create the required directory structure."""
    print("Creating directory structure...")
    
    # Create year-specific directories in processed and web_accessible
    for year in YEARS:
        os.makedirs(f"{PROCESSED_DIR}/{year}", exist_ok=True)
        os.makedirs(f"{WEB_ACCESSIBLE_DIR}/{year}", exist_ok=True)
    
    print("Directory structure created successfully.")

def organize_by_year():
    """Organize CSV files by year into the processed directory."""
    print("Organizing CSV files by year...")
    
    # Get all CSV files from frontend data directory
    csv_files = glob.glob(f"{FRONTEND_DATA_DIR}/*.csv")
    
    organized_count = 0
    
    for csv_file in csv_files:
        filename = os.path.basename(csv_file)
        
        # Check if the file contains a year
        for year in YEARS:
            if str(year) in filename:
                # Copy to processed directory
                dest_path = f"{PROCESSED_DIR}/{year}/{filename}"
                shutil.copy2(csv_file, dest_path)
                
                # Also copy to web accessible directory
                web_dest_path = f"{WEB_ACCESSIBLE_DIR}/{year}/{filename}"
                shutil.copy2(csv_file, web_dest_path)
                
                organized_count += 1
                break
    
    print(f"Organized {organized_count} CSV files by year.")

def create_consolidated_files():
    """Create consolidated JSON files for each year with standardized structure."""
    print("Creating consolidated JSON files for each year...")
    
    for year in YEARS:
        year_dir = f"{PROCESSED_DIR}/{year}"
        if not os.path.exists(year_dir):
            continue
            
        # Find relevant CSV files for this year
        financial_summary_file = None
        revenue_file = None
        expenditure_file = None
        
        for category, keywords in CATEGORIES.items():
            pattern = f"{year_dir}/*{year}*"
            matching_files = glob.glob(pattern)
            
            for file in matching_files:
                filename = os.path.basename(file).lower()
                
                # Match financial summary files
                if any(keyword in filename for keyword in CATEGORIES["financial_summary"]):
                    financial_summary_file = file
                elif any(keyword in filename for keyword in CATEGORIES["revenue"]):
                    revenue_file = file
                elif any(keyword in filename for keyword in CATEGORIES["expenditure"]) and "program" in filename:
                    expenditure_file = file
        
        # Create consolidated JSON structure
        consolidated_data = {
            "year": year,
            "metadata": {
                "processed_date": pd.Timestamp.now().isoformat(),
                "data_sources": []
            },
            "financial_summary": {},
            "revenue_by_source": [],
            "expenditure_by_program": []
        }
        
        # Process financial summary if available
        if financial_summary_file and os.path.exists(financial_summary_file):
            try:
                df = pd.read_csv(financial_summary_file)
                consolidated_data["metadata"]["data_sources"].append({
                    "source_file": os.path.basename(financial_summary_file),
                    "type": "financial_summary",
                    "records": len(df)
                })
                
                # Convert to dictionary format
                if "category" in df.columns:
                    consolidated_data["financial_summary"] = df.to_dict('records')
            except Exception as e:
                print(f"Error processing financial summary for {year}: {e}")
        
        # Process revenue data if available
        if revenue_file and os.path.exists(revenue_file):
            try:
                df = pd.read_csv(revenue_file)
                consolidated_data["metadata"]["data_sources"].append({
                    "source_file": os.path.basename(revenue_file),
                    "type": "revenue_by_source",
                    "records": len(df)
                })
                
                # Convert to list format
                consolidated_data["revenue_by_source"] = df.to_dict('records')
            except Exception as e:
                print(f"Error processing revenue data for {year}: {e}")
        
        # Process expenditure data if available
        if expenditure_file and os.path.exists(expenditure_file):
            try:
                df = pd.read_csv(expenditure_file)
                consolidated_data["metadata"]["data_sources"].append({
                    "source_file": os.path.basename(expenditure_file),
                    "type": "expenditure_by_program",
                    "records": len(df)
                })
                
                # Convert to list format
                consolidated_data["expenditure_by_program"] = df.to_dict('records')
            except Exception as e:
                print(f"Error processing expenditure data for {year}: {e}")
        
        # Save consolidated JSON file
        consolidated_file = f"{PROCESSED_DIR}/{year}/consolidated_data.json"
        try:
            import json
            with open(consolidated_file, 'w', encoding='utf-8') as f:
                json.dump(consolidated_data, f, indent=2, ensure_ascii=False)
            print(f"Created consolidated data file for {year}")
        except Exception as e:
            print(f"Error saving consolidated data for {year}: {e}")

def create_master_index():
    """Create a master index of all organized data."""
    print("Creating master index...")
    
    master_index = {
        "last_updated": pd.Timestamp.now().isoformat(),
        "years": {},
        "total_files": 0
    }
    
    for year in YEARS:
        year_data = {
            "processed_files": [],
            "web_accessible_files": [],
            "consolidated_data": None
        }
        
        # Check processed directory
        processed_dir = f"{PROCESSED_DIR}/{year}"
        if os.path.exists(processed_dir):
            processed_files = os.listdir(processed_dir)
            year_data["processed_files"] = processed_files
            master_index["total_files"] += len(processed_files)
        
        # Check web accessible directory
        web_dir = f"{WEB_ACCESSIBLE_DIR}/{year}"
        if os.path.exists(web_dir):
            web_files = os.listdir(web_dir)
            year_data["web_accessible_files"] = web_files
        
        # Check for consolidated data
        consolidated_file = f"{PROCESSED_DIR}/{year}/consolidated_data.json"
        if os.path.exists(consolidated_file):
            year_data["consolidated_data"] = f"/data/processed/{year}/consolidated_data.json"
        
        master_index["years"][str(year)] = year_data
    
    # Save master index
    index_file = f"{BASE_DIR}/data/master_index.json"
    try:
        import json
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(master_index, f, indent=2, ensure_ascii=False)
        print("Master index created successfully.")
    except Exception as e:
        print(f"Error creating master index: {e}")

def main():
    """Main function to run the data organization process."""
    print("Starting data organization process...")
    
    # Create directory structure
    create_directories()
    
    # Organize files by year
    organize_by_year()
    
    # Create consolidated files
    create_consolidated_files()
    
    # Create master index
    create_master_index()
    
    print("Data organization process completed successfully!")

if __name__ == "__main__":
    main()
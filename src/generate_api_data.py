#!/usr/bin/env python3
"""
API Data Generator Script
This script generates API-compatible JSON files from the organized data structure
"""

import os
import json
import glob
from datetime import datetime
from pathlib import Path

# Define paths
BASE_DIR = "/Users/flong/Developer/cda-transparencia"
PROCESSED_DIR = f"{BASE_DIR}/data/processed"
API_DIR = f"{BASE_DIR}/frontend/public/api"

# Create API directory structure
os.makedirs(API_DIR, exist_ok=True)
os.makedirs(f"{API_DIR}/financial", exist_ok=True)
os.makedirs(f"{API_DIR}/transparency", exist_ok=True)
os.makedirs(f"{API_DIR}/statistics", exist_ok=True)
os.makedirs(f"{API_DIR}/tenders", exist_ok=True)

# Years to process
YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

def generate_financial_api_data():
    """Generate financial data API endpoints"""
    print("Generating financial API data...")
    
    for year in YEARS:
        year_dir = f"{PROCESSED_DIR}/{year}"
        api_year_dir = f"{API_DIR}/financial/{year}"
        os.makedirs(api_year_dir, exist_ok=True)
        
        # Check if consolidated data exists
        consolidated_file = f"{year_dir}/consolidated_data.json"
        if os.path.exists(consolidated_file):
            try:
                with open(consolidated_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Create financial summary endpoint
                financial_summary = {
                    "year": year,
                    "generated_at": datetime.now().isoformat(),
                    "data": data.get("financial_summary", [])
                }
                
                with open(f"{api_year_dir}/financial_summary.json", 'w', encoding='utf-8') as f:
                    json.dump(financial_summary, f, indent=2, ensure_ascii=False)
                
                # Create revenue by source endpoint
                revenue_by_source = {
                    "year": year,
                    "generated_at": datetime.now().isoformat(),
                    "data": data.get("revenue_by_source", [])
                }
                
                with open(f"{api_year_dir}/revenue_by_source.json", 'w', encoding='utf-8') as f:
                    json.dump(revenue_by_source, f, indent=2, ensure_ascii=False)
                
                # Create expenditure by program endpoint
                expenditure_by_program = {
                    "year": year,
                    "generated_at": datetime.now().isoformat(),
                    "data": data.get("expenditure_by_program", [])
                }
                
                with open(f"{api_year_dir}/expenditure_by_program.json", 'w', encoding='utf-8') as f:
                    json.dump(expenditure_by_program, f, indent=2, ensure_ascii=False)
                
                # Copy consolidated data to API
                with open(f"{api_year_dir}/consolidated_data.json", 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    
                print(f"Generated API data for {year}")
                
            except Exception as e:
                print(f"Error processing data for {year}: {e}")

def generate_api_index():
    """Generate API index file"""
    print("Generating API index...")
    
    api_index = {
        "api_version": "1.0",
        "generated_at": datetime.now().isoformat(),
        "endpoints": {
            "financial": {
                "base": "/api/financial",
                "description": "Financial data organized by year",
                "available_years": []
            },
            "transparency": {
                "base": "/api/transparency",
                "description": "Transparency portal data",
                "routes": {}
            },
            "statistics": {
                "base": "/api/statistics",
                "description": "Statistical reports and data",
                "routes": {}
            },
            "tenders": {
                "base": "/api/tenders",
                "description": "Public tender data",
                "routes": {}
            }
        }
    }
    
    # Add available years for financial data
    for year in YEARS:
        api_year_dir = f"{API_DIR}/financial/{year}"
        if os.path.exists(api_year_dir):
            api_index["endpoints"]["financial"]["available_years"].append(year)
    
    # Save API index
    with open(f"{API_DIR}/index.json", 'w', encoding='utf-8') as f:
        json.dump(api_index, f, indent=2, ensure_ascii=False)
    
    print("API index generated successfully")

def main():
    """Main function to generate all API data"""
    print("Starting API data generation process...")
    
    # Generate financial API data
    generate_financial_api_data()
    
    # Generate API index
    generate_api_index()
    
    print("API data generation process completed successfully!")

if __name__ == "__main__":
    main()
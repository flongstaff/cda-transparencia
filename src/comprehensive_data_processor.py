#!/usr/bin/env python3
"""
Comprehensive data processing script for Carmen de Areco transparency data
"""

import pandas as pd
import os
import json
from pathlib import Path
import glob

def main():
    """Main function to process all transparency data"""
    print("📊 Starting comprehensive data processing...")
    
    # Create directories
    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("data/cleaned", exist_ok=True)
    os.makedirs("public/charts", exist_ok=True)
    
    # Process 2019 budget execution data
    process_2019_data()
    
    # Process 2021 budget execution data
    process_2021_data()
    
    # Process programmatic indicators
    process_programmatic_indicators()
    
    print("✅ Data processing complete!")

def process_2019_data():
    """Process 2019 budget execution data"""
    try:
        # Look for 2019 data files
        data_files = glob.glob("data/raw/csv/*2019*article*44*.csv") + \
                     glob.glob("data/raw/csv/*2019*Article*44*.csv") + \
                     glob.glob("frontend/public/data/csv/*2019*article*44*.csv")
        
        if data_files:
            df_2019 = pd.read_csv(data_files[0])
            df_2019["year"] = 2019
            df_2019.to_csv("data/processed/budget_execution_2019.csv", index=False)
            print(f"✅ Processed 2019 data from {data_files[0]}")
        else:
            print("⚠️ No 2019 data files found")
    except Exception as e:
        print(f"❌ Error processing 2019 data: {e}")

def process_2021_data():
    """Process 2021 budget execution data"""
    try:
        # Look for 2021 data files
        data_files = glob.glob("data/raw/csv/*2021*budget*execution*.csv") + \
                     glob.glob("data/raw/csv/*2021*Budget*Execution*.csv") + \
                     glob.glob("frontend/public/data/csv/*2021*budget*execution*.csv")
        
        if data_files:
            df_2021 = pd.read_csv(data_files[0])
            
            # Clean monetary columns if they exist
            monetary_cols = ['Budgeted', 'Executed', 'Percentage']
            for col in monetary_cols:
                if col in df_2021.columns:
                    if col in ['Budgeted', 'Executed']:
                        df_2021[col] = df_2021[col].astype(str).str.replace(r"[$,]", "", regex=True).astype(float)
                    elif col == 'Percentage':
                        df_2021[col] = df_2021[col].astype(str).str.replace("%", "").astype(float)
            
            df_2021["year"] = 2021
            df_2021.to_csv("data/processed/budget_execution_2021.csv", index=False)
            print(f"✅ Processed 2021 data from {data_files[0]}")
        else:
            print("⚠️ No 2021 data files found")
    except Exception as e:
        print(f"❌ Error processing 2021 data: {e}")

def process_programmatic_indicators():
    """Process programmatic indicators from category_caif.csv"""
    try:
        # Look for category_caif.csv
        caif_files = glob.glob("data/raw/csv/category_caif.csv") + \
                     glob.glob("frontend/public/data/csv/category_caif.csv")
        
        if caif_files:
            df = pd.read_csv(caif_files[0])
            
            # Extract programmatic indicators
            indicators = []
            
            for _, row in df.iterrows():
                desc = str(row.get("col_2", ""))
                source = row.get("source_file", "unknown")
                
                # Extract year from source filename
                year = 2023  # Default year
                if "2022" in source:
                    year = 2022
                elif "2024" in source:
                    year = 2024
                elif "2025" in source:
                    year = 2025
                
                # Extract quarter from source filename
                quarter = "Q4"  # Default quarter
                if any(term in source.lower() for term in ["marzo", "ene-mar", "1er", "q1", "jan-mar"]):
                    quarter = "Q1"
                elif any(term in source.lower() for term in ["junio", "abr-jun", "ene-jun", "2do", "q2", "apr-jun"]):
                    quarter = "Q2"
                elif any(term in source.lower() for term in ["3er", "jul-sep", "q3", "jul-sep"]):
                    quarter = "Q3"
                elif any(term in source.lower() for term in ["4to", "oct-dic", "q4", "oct-dec"]):
                    quarter = "Q4"
                
                # Families assisted
                if "asistencias a vecinos" in desc.lower() or "familias asistidas" in desc.lower():
                    planned = clean_number(row.get("col_3"))
                    executed = clean_number(row.get("col_4"))
                    if executed is not None:
                        indicators.append({
                            "indicator": "families_assisted",
                            "year": year,
                            "quarter": quarter,
                            "source_file": source,
                            "description": desc,
                            "planned": planned,
                            "executed": executed
                        })
                
                # Security cameras
                elif "cámaras" in desc.lower() or "centro operativo" in desc.lower():
                    planned = clean_number(row.get("col_3"))
                    executed = clean_number(row.get("col_4"))
                    if executed is not None:
                        indicators.append({
                            "indicator": "security_cameras",
                            "year": year,
                            "quarter": quarter,
                            "source_file": source,
                            "description": desc,
                            "planned": planned,
                            "executed": executed
                        })
            
            # Save indicators
            if indicators:
                df_indicators = pd.DataFrame(indicators)
                df_indicators.to_csv("data/processed/programmatic_indicators.csv", index=False)
                df_indicators.to_json("data/processed/programmatic_indicators.json", orient="records", indent=2)
                print(f"✅ Extracted {len(indicators)} programmatic indicators")
            else:
                print("⚠️ No programmatic indicators found")
        else:
            print("⚠️ No category_caif.csv file found")
    except Exception as e:
        print(f"❌ Error processing programmatic indicators: {e}")

def clean_number(value):
    """Clean numeric values from various formats"""
    if pd.isna(value) or value == "" or value == "0":
        return None
    
    # Convert to string
    s = str(value)
    
    # Handle Argentinian number format: "1.234,56" → 1234.56
    # Remove dots (thousands separator) and replace comma with dot (decimal separator)
    s = s.replace(".", "").replace(",", ".")
    
    try:
        return float(s)
    except:
        return None

if __name__ == "__main__":
    main()
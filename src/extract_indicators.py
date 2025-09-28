#!/usr/bin/env python3
"""
Simple indicator extraction script using only built-in Python libraries
"""

import csv
import os

def extract_indicators():
    """Extract programmatic indicators from category_caif.csv"""
    try:
        # Read the category_caif file
        with open("data/raw/csv/category_caif.csv", "r", encoding="utf-8") as infile:
            reader = csv.reader(infile)
            rows = list(reader)
            
        # Extract headers
        headers = rows[0] if rows else []
        
        # Find columns of interest
        # Based on the sample data, we need to find the right columns
        # Let's look for columns that might contain our data
        col_with_data = None
        source_file_col = None
        
        for i, header in enumerate(headers):
            if "source_file" in header:
                source_file_col = i
            # Look for columns that might contain our descriptive text
            if "col_" in header and i > 5:  # Skip early columns which seem to be metadata
                col_with_data = i
                
        # If we can't find specific column names, let's look at all columns for data
        if col_with_data is None:
            # Try to find the column with the actual data by looking at row content
            for i in range(len(headers)):
                if i > 5:  # Skip metadata columns
                    col_with_data = i
                    break
        
        # Extract indicators
        indicators = []
        
        for row in rows[1:]:  # Skip header
            if len(row) > col_with_data if col_with_data else 0:
                # Look through all columns in the row for our keywords
                for i, cell in enumerate(row):
                    if isinstance(cell, str):
                        desc = cell
                        
                        # 1. Families assisted
                        if "Asistencias a vecinos" in desc or "Familias asistidas" in desc:
                            # Try to extract numerical values from nearby columns
                            planned = ""
                            executed = ""
                            
                            # Look in adjacent columns for numerical values
                            if i + 1 < len(row) and row[i + 1].replace('.', '').isdigit():
                                planned = row[i + 1]
                            if i + 2 < len(row) and row[i + 2].replace('.', '').isdigit():
                                executed = row[i + 2]
                                
                            source_file = row[source_file_col] if source_file_col and source_file_col < len(row) else "unknown"
                            
                            indicators.append({
                                "indicator": "families_assisted",
                                "source_file": source_file,
                                "period": "Unknown",
                                "planned": planned,
                                "executed": executed
                            })
                        
                        # 2. Security cameras
                        elif "cámaras de monitoreo" in desc or "Centro operativo de seguridad" in desc:
                            # Try to extract numerical values from nearby columns
                            planned = ""
                            executed = ""
                            
                            # Look in adjacent columns for numerical values
                            if i + 1 < len(row) and row[i + 1].replace('.', '').isdigit():
                                planned = row[i + 1]
                            if i + 2 < len(row) and row[i + 2].replace('.', '').isdigit():
                                executed = row[i + 2]
                                
                            source_file = row[source_file_col] if source_file_col and source_file_col < len(row) else "unknown"
                            
                            indicators.append({
                                "indicator": "security_cameras",
                                "source_file": source_file,
                                "period": "Unknown",
                                "planned": planned,
                                "executed": executed
                            })
        
        # Write indicators to CSV
        os.makedirs("data/processed", exist_ok=True)
        if indicators:
            with open("data/processed/programmatic_indicators.csv", "w", newline="", encoding="utf-8") as outfile:
                fieldnames = ["indicator", "source_file", "period", "planned", "executed"]
                writer = csv.DictWriter(outfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(indicators)
                
            print(f"✅ Extracted {len(indicators)} indicators and saved to processed directory")
        else:
            print("⚠️ No indicators found in the data")
            
    except FileNotFoundError:
        print("⚠️ category_caif.csv file not found")
    except Exception as e:
        print(f"⚠️ Error extracting indicators: {e}")

if __name__ == "__main__":
    extract_indicators()
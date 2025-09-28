#!/usr/bin/env python3
"""
Simple data cleaning script using only built-in Python libraries
"""

import os
import csv
import shutil

def clean_2019_data():
    """Clean 2019 budget execution data"""
    try:
        # Copy the 2019 data file to processed directory
        os.makedirs("data/processed", exist_ok=True)
        shutil.copy("data/raw/csv/2019_article_44_result.csv", "data/processed/budget_execution_2019.csv")
        print("✅ Copied 2019 data to processed directory")
    except FileNotFoundError:
        print("⚠️ 2019 data file not found")

def clean_2021_data():
    """Clean 2021 budget execution data"""
    try:
        # Read and process the 2021 data
        os.makedirs("data/processed", exist_ok=True)
        
        with open("data/raw/csv/Budget_Execution_2021_table_0.csv", "r") as infile:
            reader = csv.reader(infile)
            rows = list(reader)
            
        # Process the data to clean monetary values
        header = rows[0]
        processed_rows = [header]
        
        for row in rows[1:]:  # Skip header
            if len(row) >= 4:
                # Clean Budgeted column (index 1)
                if row[1].startswith('"$') and row[1].endswith('"'):
                    row[1] = row[1][2:-1].replace(",", "")  # Remove "$" and quotes and commas
                elif row[1].startswith("$"):
                    row[1] = row[1][1:].replace(",", "")  # Remove "$" and commas
                    
                # Clean Executed column (index 2)
                if row[2].startswith('"$') and row[2].endswith('"'):
                    row[2] = row[2][2:-1].replace(",", "")  # Remove "$" and quotes and commas
                elif row[2].startswith("$"):
                    row[2] = row[2][1:].replace(",", "")  # Remove "$" and commas
                    
                # Clean Percentage column (index 3)
                if row[3].endswith("%"):
                    row[3] = row[3][:-1]  # Remove "%"
                    
            processed_rows.append(row)
        
        # Write processed data
        with open("data/processed/budget_execution_2021.csv", "w", newline="") as outfile:
            writer = csv.writer(outfile)
            writer.writerows(processed_rows)
            
        print("✅ Cleaned 2021 data and saved to processed directory")
    except FileNotFoundError:
        print("⚠️ 2021 data file not found")
    except Exception as e:
        print(f"⚠️ Error processing 2021 data: {e}")

if __name__ == "__main__":
    clean_2019_data()
    clean_2021_data()
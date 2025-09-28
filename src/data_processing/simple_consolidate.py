#!/usr/bin/env python3
\"\"\"
Generate CSV files for all 13 chart types across all years (2019-2025)
\"\"\"

import os
import pandas as pd
from pathlib import Path
import glob

def generate_chart_type_csvs():
    \"\"\"Generate consolidated CSVs for each chart type across all years\"\"\"
    
    extracted_dir = Path(\"data/extracted_csv\")
    output_dir = Path(\"data/consolidated_charts\")
    output_dir.mkdir(exist_ok=True)
    
    # Define the chart types we expect
    chart_types = [
        \"Revenue_Report\",
        \"Expenditure_Report\", 
        \"Fiscal_Balance_Report\",
        \"Personnel_Expenses\",
        \"Investment_Report\",
        \"Debt_Report\",
        \"Budget_Execution\",
        \"Revenue_Sources\",
        \"Financial_Reserves\",
        \"Economic_Report\",
        \"Health_Statistics\",
        \"Education_Data\",
        \"Infrastructure_Projects\"
    ]
    
    print(f\"Generating consolidated CSV files for {len(chart_types)} chart types...\")
    
    for chart_type in chart_types:
        print(f\"Processing: {chart_type}\")
        
        # Find all CSV files for this chart type
        pattern = f\"{extracted_dir}/{chart_type}_*.csv\"
        chart_files = glob.glob(pattern)
        
        if not chart_files:
            print(f\"  No CSV files found for {chart_type}\")
            continue
        
        # Read and combine all CSV files for this chart type
        combined_data = []
        
        for csv_file in chart_files:
            try:
                df = pd.read_csv(csv_file)
                
                # Extract year from filename
                filename = Path(csv_file).stem
                # Extract year from filename like \"Revenue_Report_2019_table_0\"
                year = None
                for part in filename.split(\"_\"):
                    if part.isdigit() and 2019 <= int(part) <= 2025:
                        year = int(part)
                        break
                
                if year:
                    # Add year column to the dataframe
                    df[\"year\"] = year
                    combined_data.append(df)
                else:
                    print(f\"  Could not extract year from {filename}\")
            except Exception as e:
                print(f\"  Error reading {csv_file}: {str(e)}\")
        
        if combined_data:
            # Concatenate all dataframes
            final_df = pd.concat(combined_data, ignore_index=True)
            
            # Sort by year if the column exists
            if \"year\" in final_df.columns:
                final_df = final_df.sort_values(\"year\")
            
            # Save to consolidated CSV
            output_file = output_dir / f\"{chart_type}_consolidated_2019-2025.csv\"
            final_df.to_csv(output_file, index=False)
            
            print(f\"  Saved: {output_file} ({len(final_df)} rows)\")
        else:
            print(f\"  No valid data found for {chart_type}\")

def main():
    print(\"Starting consolidation of CSV files by chart type...\")
    
    # Generate consolidated files by chart type
    generate_chart_type_csvs()
    
    print(\"\\nAll CSV files have been organized by chart type!\")

if __name__ == \"__main__\":
    main()
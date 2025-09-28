#!/usr/bin/env python3
"""
Generate CSV files for all 13 chart types across all years (2019-2025)
"""

import os
import pandas as pd
from pathlib import Path
import glob

def generate_chart_type_csvs():
    """Generate consolidated CSVs for each chart type across all years"""

    extracted_dir = Path("data/extracted_csv")
    output_dir = Path("data/consolidated_charts")
    output_dir.mkdir(exist_ok=True)

    # Define the chart types we expect
    chart_types = [
        "Revenue_Report",
        "Expenditure_Report", 
        "Fiscal_Balance_Report",
        "Personnel_Expenses",
        "Investment_Report",
        "Debt_Report",
        "Budget_Execution",
        "Revenue_Sources",
        "Financial_Reserves",
        "Economic_Report",
        "Health_Statistics",
        "Education_Data",
        "Infrastructure_Projects"
    ]

    print(f"Generating consolidated CSV files for {len(chart_types)} chart types...")

    for chart_type in chart_types:
        print(f"Processing: {chart_type}")

        # Find all CSV files for this chart type
        pattern = f"{extracted_dir}/{chart_type}_*.csv"
        chart_files = glob.glob(pattern)

        if not chart_files:
            print(f"  No CSV files found for {chart_type}")
            continue

        # Read and combine all CSV files for this chart type
        combined_data = []

        for csv_file in chart_files:
            try:
                df = pd.read_csv(csv_file)

                # Extract year from filename
                filename = Path(csv_file).stem
                # Extract year from filename like "Revenue_Report_2019_table_0"
                year = None
                for part in filename.split("_"):
                    if part.isdigit() and 2019 <= int(part) <= 2025:
                        year = int(part)
                        break

                if year:
                    # Add year column to the dataframe
                    df["year"] = year
                    combined_data.append(df)
                else:
                    print(f"  Could not extract year from {filename}")
            except Exception as e:
                print(f"  Error reading {csv_file}: {str(e)}")

        if combined_data:
            # Concatenate all dataframes
            final_df = pd.concat(combined_data, ignore_index=True)

            # Sort by year if the column exists
            if "year" in final_df.columns:
                final_df = final_df.sort_values("year")

            # Save to consolidated CSV
            output_file = output_dir / f"{chart_type}_consolidated_2019-2025.csv"
            final_df.to_csv(output_file, index=False)

            print(f"  Saved: {output_file} ({len(final_df)} rows)")
        else:
            print(f"  No valid data found for {chart_type}")

def generate_yearly_summary():
    """Generate summary files for each year across all chart types"""

    extracted_dir = Path("data/extracted_csv")
    output_dir = Path("data/yearly_summaries")
    output_dir.mkdir(exist_ok=True)

    # Process each year from 2019 to 2025
    for year in range(2019, 2026):
        print(f"Generating yearly summary for {year}")

        # Find all CSV files for this year
        pattern = f"{extracted_dir}/*_{year}_table_*.csv"
        year_files = glob.glob(pattern)

        yearly_data = []
        for csv_file in year_files:
            try:
                df = pd.read_csv(csv_file)

                # Extract chart type from filename
                filename = Path(csv_file).stem
                # Extract chart type part before the year
                parts = filename.split("_")
                if str(year) in parts:
                    year_idx = parts.index(str(year))
                    chart_type = "_".join(parts[:year_idx])  # Everything before the year
                else:
                    chart_type = "Unknown"

                # Add chart type column
                df["chart_type"] = chart_type
                df["year"] = year
                yearly_data.append(df)
            except Exception as e:
                print(f"  Error reading {csv_file}: {str(e)}")

        if yearly_data:
            # Concatenate all dataframes for the year
            final_df = pd.concat(yearly_data, ignore_index=True)

            # Save to yearly summary CSV
            output_file = output_dir / f"all_chart_types_{year}.csv"
            final_df.to_csv(output_file, index=False)

            print(f"  Saved: {output_file} ({len(final_df)} rows)")
        else:
            print(f"  No data found for year {year}")

def generate_master_file():
    """Generate a master file with all data"""

    extracted_dir = Path("data/extracted_csv")
    output_dir = Path("data")

    # Find all extracted CSV files
    all_csv_files = list(extracted_dir.glob("*.csv"))

    if not all_csv_files:
        print("No CSV files found in extracted directory")
        return

    all_data = []
    for csv_file in all_csv_files:
        try:
            df = pd.read_csv(csv_file)

            # Extract year and chart type from filename
            filename = csv_file.stem
            parts = filename.split("_")

            year = None
            chart_type = None

            # Extract year
            for part in parts:
                if part.isdigit() and 2019 <= int(part) <= 2025:
                    year = int(part)
                    break

            # Extract chart type (everything before the year)
            if year and str(year) in parts:
                year_idx = parts.index(str(year))
                chart_type = "_".join(parts[:year_idx])

            # Add year and chart type columns
            if year:
                df["year"] = year
            if chart_type:
                df["chart_type"] = chart_type

            all_data.append(df)
        except Exception as e:
            print(f"Error reading {csv_file}: {str(e)}")

    if all_data:
        # Concatenate all dataframes
        master_df = pd.concat(all_data, ignore_index=True)

        # Save to master CSV
        output_file = output_dir / "master_financial_data_2019-2025.csv"
        master_df.to_csv(output_file, index=False)

        print(f"Master file created: {output_file} ({len(master_df)} rows)")

        # Also create a summary with just key metrics by year
        if "year" in master_df.columns:
            # Create a summary table
            summary_df = master_df.groupby("year").size().reset_index(name="total_records")

            # If there"s budgeted and executed data, add summary metrics
            for col in ["Budgeted", "Executed", "Amount", "Total"]:
                if col in master_df.columns:
                    # Try to convert to numeric
                    try:
                        year_summary = master_df.groupby("year")[col].sum().reset_index()
                        # Rename the column to indicate it"s a sum
                        year_summary = year_summary.rename(columns={col: f"total_{col.lower()}"})

                        # Merge with the summary
                        summary_df = summary_df.merge(year_summary, on="year", how="left")
                    except:
                        pass

            summary_file = output_dir / "financial_summary_by_year_2019-2025.csv"
            summary_df.to_csv(summary_file, index=False)
            print(f"Summary file created: {summary_file} ({len(summary_df)} rows)")

def main():
    print("Starting consolidation of CSV files by chart type...")

    # Generate consolidated files by chart type
    generate_chart_type_csvs()

    # Generate yearly summaries
    generate_yearly_summary()

    # Generate master file
    generate_master_file()

    print("\nAll CSV files have been organized by chart type and year!")
All CSV files have been organized by chart type and year!")

if __name__ == "__main__":
    main()

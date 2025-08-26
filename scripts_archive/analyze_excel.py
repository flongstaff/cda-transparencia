import pandas as pd
import sys

def analyze_excel_file(file_path):
    """Analyze the structure of an Excel file"""
    print(f"Analyzing Excel file: {file_path}")
    
    try:
        # Read all sheets
        excel_file = pd.ExcelFile(file_path)
        
        print(f"Number of sheets: {len(excel_file.sheet_names)}")
        print(f"Sheet names: {excel_file.sheet_names}")
        
        # Analyze each sheet
        for sheet_name in excel_file.sheet_names:
            print(f"\n--- Sheet: {sheet_name} ---")
            # Read without header to see raw data
            df_raw = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
            
            print(f"Raw shape: {df_raw.shape}")
            print("Raw first 10 rows:")
            print(df_raw.head(10))
            
            # Try to find header row
            print("\nTrying to identify header row...")
            for i in range(min(10, len(df_raw))):
                row = df_raw.iloc[i]
                non_null_count = row.count()
                print(f"Row {i}: {non_null_count} non-null values - {list(row[:5])}")
                
    except Exception as e:
        print(f"Error analyzing file: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_excel.py <excel_file_path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    analyze_excel_file(file_path)
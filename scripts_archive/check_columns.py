import pandas as pd
import sys

def check_columns(file_path):
    # Check columns in the Excel file
    print(f"Checking columns in Excel file: {file_path}")
    
    try:
        # Read the Excel file with header at row 7
        df = pd.read_excel(file_path, sheet_name='Planilla C ', header=7)
        
        print(f"Shape: {df.shape}")
        print("Columns:")
        for i, col in enumerate(df.columns):
            print(f"  {i}: '{col}' (type: {type(col)})")
        
        # Show a few rows to understand the data
        print("\nFirst 5 rows:")
        print(df.head())
        
    except Exception as e:
        print(f"Error analyzing file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_columns.py <excel_file_path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    check_columns(file_path)
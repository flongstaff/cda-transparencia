import pandas as pd
import sys

def detailed_analysis(file_path):
    # Detailed analysis of the Excel file
    print(f"Analyzing Excel file: {file_path}")
    
    try:
        # Read the Excel file with header at row 7
        df = pd.read_excel(file_path, sheet_name='Planilla C ', header=7)
        
        print(f"Shape: {df.shape}")
        print("Columns:")
        for i, col in enumerate(df.columns):
            print(f"  {i}: '{col}' (type: {type(col)})")
        
        print("\nFirst 10 rows:")
        print(df.head(10))
        
        print("\nData types:")
        print(df.dtypes)
        
        print("\nNon-null counts:")
        print(df.count())
        
        # Check for rows with data
        print("\nChecking for rows with data in first column:")
        for i in range(min(20, len(df))):
            val = df.iloc[i, 1]  # Second column (ORGANISMO ACREEDOR)
            print(f"Row {i}: '{val}' (type: {type(val)})")
            
    except Exception as e:
        print(f"Error analyzing file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python detailed_analysis.py <excel_file_path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    detailed_analysis(file_path)
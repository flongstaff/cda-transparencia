import pandas as pd
import os
import sys
from datetime import datetime
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file in the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT', '5432')
    )

def extract_debt_from_excel(excel_path: str):
    """
    Extract municipal debt data from Excel file
    """
    debt_data = []
    
    try:
        # Read the Excel file with header at row 7
        df = pd.read_excel(excel_path, sheet_name='Planilla C ', header=7)
        
        print(f"Processing sheet: Planilla C")
        print(f"Rows: {len(df)}, Columns: {len(df.columns)}")
        
        # Remove completely empty rows
        df = df.dropna(how='all')
        
        # Find the amount column (it changes based on the date)
        amount_column = None
        for col in df.columns:
            # Check for datetime objects or strings containing dates
            if isinstance(col, datetime):
                amount_column = col
                break
            elif isinstance(col, str) and ('/' in col or ('2024' in col and '-' in col)):
                amount_column = col
                break
        
        if not amount_column:
            print("Warning: Could not find amount column. Looking for columns with dates...")
            # Try to find any column that might contain amounts
            for col in df.columns:
                if isinstance(col, str) and ('31' in col or '30' in col) and '/' in col:
                    amount_column = col
                    break
        
        if not amount_column:
            print("Error: Could not identify amount column in the Excel file.")
            print("Available columns:")
            for i, col in enumerate(df.columns):
                print(f"  {i}: '{col}' (type: {type(col)})")
            return []
        
        print(f"Using '{amount_column}' as the amount column")
        
        # Process each row
        for index, row in df.iterrows():
            # Get the debtor name from the second column
            debtor = row['ORGANISMO ACREEDOR'] if 'ORGANISMO ACREEDOR' in row else None
            
            # Skip empty rows or header-like rows
            if pd.isna(debtor) or str(debtor).strip() == '' or str(debtor).strip().startswith('nan'):
                continue
            
            # Get amount and other data
            amount = row[amount_column] if amount_column in row else None
            amortization = row['AMORTIZ.'] if 'AMORTIZ.' in row else None
            interest = row['INTERESES'] if 'INTERESES' in row else None
            
            # Create debt record
            debt_record = {
                'debtor': str(debtor).strip() if debtor else '',
                'total_amount': amount,
                'amortization': amortization,
                'interest': interest
            }
            
            debt_data.append(debt_record)
                
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        import traceback
        traceback.print_exc()
        return []
    
    return debt_data

def transform_debt_data(raw_data: list, year: int):
    """
    Transform raw debt data to match database schema
    """
    transformed_data = []
    
    for record in raw_data:
        # Extract and clean values
        debtor = record.get('debtor', '')
        total_amount_val = record.get('total_amount', None)
        amortization_val = record.get('amortization', None)
        interest_val = record.get('interest', None)
        
        # Clean and convert amount
        amount = None
        if total_amount_val is not None and not (pd.isna(total_amount_val)):
            try:
                amount = float(total_amount_val)
            except (ValueError, TypeError):
                pass
        
        # Create description
        description_parts = []
        if amortization_val is not None and not (pd.isna(amortization_val)):
            description_parts.append(f"Amortización: {amortization_val}")
        if interest_val is not None and not (pd.isna(interest_val)):
            description_parts.append(f"Intereses: {interest_val}")
        
        description = "; ".join(description_parts) if description_parts else "Deuda municipal"
        
        # Create transformed record
        transformed_record = {
            'year': year,
            'debt_type': debtor[:100] if debtor else 'Deuda Municipal',  # Truncate to fit VARCHAR(100)
            'description': description[:500] if description else 'Deuda municipal',
            'amount': amount,
            'interest_rate': None,  # Not directly available in this format
            'due_date': None,  # Not directly available in this format
            'status': 'active'
        }
        
        transformed_data.append(transformed_record)
    
    return transformed_data

def load_debt_to_db(debt_data: list):
    """
    Load debt data into PostgreSQL database
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        inserted_count = 0
        for debt in debt_data:
            # Skip records without essential data
            if not debt['debt_type'] or debt['amount'] is None:
                print(f"Skipping incomplete record: {debt['debt_type']}")
                continue
            
            # Simple insert without ON CONFLICT since we don't have a unique constraint
            query = """
            INSERT INTO municipal_debt (year, debt_type, description, amount, interest_rate, due_date, status)
            VALUES (%(year)s, %(debt_type)s, %(description)s, %(amount)s, %(interest_rate)s, %(due_date)s, %(status)s)
            """
            try:
                cur.execute(query, debt)
                inserted_count += 1
                print(f"Loaded debt record: {debt['debt_type']} ({debt['year']}) - ${debt['amount']}")
            except Exception as e:
                print(f"Error loading record {debt['debt_type']}: {e}")
        
        conn.commit()
        print(f"Successfully loaded {inserted_count} debt records into the database.")
        
    except Exception as e:
        print(f"An error occurred during database loading: {e}")
        import traceback
        traceback.print_exc()
        if conn:
            conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()

def main():
    if len(sys.argv) < 4:
        print("Usage: python extract_municipal_debt.py <excel_file_path> <category> <year>")
        print("Example: python extract_municipal_debt.py 'data/source_materials/2024/03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2024.xlsx' municipal_debt 2024")
        sys.exit(1)
    
    excel_file_path = sys.argv[1]
    category = sys.argv[2]  # This would be 'municipal_debt'
    year = int(sys.argv[3])
    
    # Verify file exists
    if not os.path.exists(excel_file_path):
        print(f"Error: File not found: {excel_file_path}")
        sys.exit(1)
    
    print(f"Starting Excel data processing...")
    print(f"Processing Excel file: {excel_file_path} for category: {category}, year: {year}")
    
    # Extract data
    extracted_data = extract_debt_from_excel(excel_file_path)
    
    if not extracted_data:
        print("No data extracted from Excel file.")
        sys.exit(1)
    
    print(f"\n--- Summary of Extracted Data ---")
    print(f"Total records extracted: {len(extracted_data)}")
    if extracted_data:
        print(f"Sample records:")
        for i, record in enumerate(extracted_data[:3]):
            print(f"  {i+1}: {record}")
    
    # Transform data
    print("\n--- Transforming data ---")
    transformed_data = transform_debt_data(extracted_data, year)
    
    print(f"Total records transformed: {len(transformed_data)}")
    
    # Display sample data
    print("\n--- Sample of Transformed Data ---")
    for i, item in enumerate(transformed_data[:3]):
        print(f"Record {i+1}: {item}")
    
    # Load data into database
    print("\n--- Loading data into PostgreSQL ---")
    load_debt_to_db(transformed_data)
    
    print("\nProcessing completed.")

if __name__ == "__main__":
    main()
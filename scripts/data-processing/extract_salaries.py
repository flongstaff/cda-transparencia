import pdfplumber
import os
import re
import json
import psycopg2
from psycopg2 import extras
from dotenv import load_dotenv

# Load environment variables from .env file in the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env'))

def get_db_connection():
    return psycopg2.connect(
        host='127.0.0.1', # Explicitly set host to loopback IP
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=int(os.getenv('DB_PORT')) # Ensure port is an integer
    )

def extract_salaries_from_pdf(pdf_path: str):
    salaries_data = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                print(f"--- Processing Page {page_num + 1} of {pdf_path} ---")
                
                table_settings = {
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "snap_tolerance": 3 
                }
                tables = page.extract_tables(table_settings=table_settings)
                
                if tables:
                    for table_num, table in enumerate(tables):
                        print(f"  Table {table_num + 1} on Page {page_num + 1}:")
                        headers = [header.strip() if header else f"Col{i}" for i, header in enumerate(table[0])]
                        for row_num, row in enumerate(table[1:]): 
                            if any(cell and cell.strip() for cell in row): 
                                salary_entry = {}
                                for i, cell in enumerate(row):
                                    if i < len(headers):
                                        salary_entry[headers[i]] = cell.strip() if cell else ""
                                salaries_data.append(salary_entry)
                else:
                    text = page.extract_text()
                    if text:
                        print(f"  No tables found on Page {page_num + 1}. Extracting text...")
                        for line in text.split('\n')[:5]: 
                            print(f"    Text Line: {line}")
                        
    except Exception as e:
        print(f"An error occurred during PDF extraction: {e}")
        
    return salaries_data

def load_salaries_to_db(salaries: list[dict]):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        for salary in salaries:
            # --- Data Cleaning and Validation ---
            cargos = salary.get('CARGOS', '').strip()
            sueldo_bruto_str = salary.get('SUELDO\nBRUTO', '').strip()
            
            # Skip rows that are clearly not salary entries (e.g., headers, empty rows)
            if not cargos or not sueldo_bruto_str or cargos in ['CARGOS', 'PERSONAL SUPERIOR', 'DE LEY', '02 - JERARQUICO', '03 - PROFESIONAL', '04 - TECNICOS', '05 - ADMINISTRATIVO', '06 - OBRERO', '07 - SERVICIOS', 'TEMPORARIOS']:
                print(f"Skipping non-data row: {salary}")
                continue

            # Map extracted data to DB schema
            official_name = cargos # Using CARGOS as official_name for now
            role = cargos # Using CARGOS as role for now, will need refinement
            
            # Clean and convert basic_salary
            basic_salary = None
            if sueldo_bruto_str:
                cleaned_salary_str = sueldo_bruto_str.replace('

            # --- Load into PostgreSQL ---
            # Use upsert (ON CONFLICT) to avoid duplicates if running multiple times
            # Assumes (official_name, year) is a unique constraint or primary key for upsert
            query = """
            INSERT INTO salaries (official_name, year, role, basic_salary)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (official_name, year) DO UPDATE SET
                role = EXCLUDED.role,
                basic_salary = EXCLUDED.basic_salary;
            """
            cur.execute(query, (official_name, year, role, basic_salary))
            print(f"Loaded/Updated salary for {official_name} ({year}) - Basic Salary: {basic_salary}")
                                
        conn.commit()
        print(f"Successfully loaded {len(salaries)} salaries into the database.")
            
    except Exception as e:
        print(f"An error occurred during database loading: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    pdf_file_path = "/Users/flong/Developer/cda-transparencia/data/source_materials/Salarios-DDJ/Salarios/ESCALA-SALARIAL-OCTUBRE-2024.pdf"
    
    extracted_data = extract_salaries_from_pdf(pdf_file_path)
    
    if extracted_data:
        print("\n--- Summary of Extracted Salaries ---")
        for item in extracted_data:
            print(item)
        print(f"\nTotal salaries extracted: {len(extracted_data)}")
        
        print("\n--- Loading data into PostgreSQL ---")
        load_salaries_to_db(extracted_data)
    else:
        print("\nNo salaries extracted. Nothing to load into database."), '').replace('.', '').replace(',', '.').strip()
                try:
                    basic_salary = float(cleaned_salary_str)
                except ValueError:
                    pass # Do not print warning here, it will be skipped by the next check

            # Extract year from filename or context if not in table (assuming 2024 for this PDF)
            year = 2024 # Hardcoding for ESCALA-SALARIAL-OCTUBRE-2024.pdf
            
            # Basic validation for essential fields
            # Only proceed if official_name, year, and basic_salary are all valid
            if not all([official_name, year, basic_salary is not None]):
                print(f"Skipping invalid salary entry (missing essential data after cleaning): {salary}")
                continue

            print(f"DEBUG: Loading - Name: {official_name}, Year: {year}, Role: {role}, Basic Salary: {basic_salary}")

            # --- Load into PostgreSQL ---
            # Use upsert (ON CONFLICT) to avoid duplicates if running multiple times
            # Assumes (official_name, year) is a unique constraint or primary key for upsert
            query = """
            INSERT INTO salaries (official_name, year, role, basic_salary)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (official_name, year) DO UPDATE SET
                role = EXCLUDED.role,
                basic_salary = EXCLUDED.basic_salary;
            """
            cur.execute(query, (official_name, year, role, basic_salary))
            print(f"Loaded/Updated salary for {official_name} ({year}) - Basic Salary: {basic_salary}")
                                
        conn.commit()
        print(f"Successfully loaded {len(salaries)} salaries into the database.")
            
    except Exception as e:
        print(f"An error occurred during database loading: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    pdf_file_path = "/Users/flong/Developer/cda-transparencia/data/source_materials/Salarios-DDJ/Salarios/ESCALA-SALARIAL-OCTUBRE-2024.pdf"
    
    extracted_data = extract_salaries_from_pdf(pdf_file_path)
    
    if extracted_data:
        print("\n--- Summary of Extracted Salaries ---")
        for item in extracted_data:
            print(item)
        print(f"\nTotal salaries extracted: {len(extracted_data)}")
        
        print("\n--- Loading data into PostgreSQL ---")
        load_salaries_to_db(extracted_data)
    else:
        print("\nNo salaries extracted. Nothing to load into database.")
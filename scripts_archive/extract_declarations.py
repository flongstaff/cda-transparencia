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
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT')
    )

def extract_declarations_from_pdf(pdf_path: str):
    declarations_data = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # print(f"--- Processing Page {page_num + 1} of {pdf_path} ---")
                
                table_settings = {
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "snap_tolerance": 3 
                }
                tables = page.extract_tables(table_settings=table_settings)
                
                if tables:
                    for table_num, table in enumerate(tables):
                        # Assuming the first row is the header
                        headers = [header.strip() if header else f"Col{i}" for i, header in enumerate(table[0])]
                        for row_num, row in enumerate(table[1:]): 
                            if any(cell and cell.strip() for cell in row): 
                                declaration = {}
                                for i, cell in enumerate(row):
                                    if i < len(headers):
                                        declaration[headers[i]] = cell.strip() if cell else ""
                                declarations_data.append(declaration)
                else:
                    # If no tables, try to extract text and use regex (not implemented for this example)
                    pass
                    
    except Exception as e:
        print(f"An error occurred during PDF extraction: {e}")
        
    return declarations_data

def load_declarations_to_db(declarations: list[dict]):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        for declaration in declarations:
            # Map extracted data to DB schema
            uuid = declaration.get('UUID')
            fecha = declaration.get('Fecha')
            nombre_apellido = declaration.get('Nombre y Apellido')
            cuil = declaration.get('Cuil')
            tipo_ddjj = declaration.get('Tipo DDJJ')
            año = declaration.get('Año')
            cargo = declaration.get('Cargo')

            # Basic validation and type conversion
            try:
                year = int(año) if año else None
                # Convert 'Fecha' to 'YYYY-MM-DD' format if it's 'YYYY-MM-DD'.
                # If it's 'YYYY-MM-DD', it's fine. If it's 'YYYY-MM-DD', it's fine.
                # If it's 'YYYY-MM-DD', it's fine.
                declaration_date = fecha # Assuming it's already in 'YYYY-MM-DD' format
            except ValueError:
                year = None
                declaration_date = None

            if not all([nombre_apellido, year]):
                print(f"Skipping invalid declaration (missing name or year): {declaration}")
                continue

            # Use upsert (ON CONFLICT) to avoid duplicates if running multiple times
            # Assumes (uuid) is a unique constraint or primary key for upsert
            # If not, you might need to adjust your table or upsert logic
            query = """
            INSERT INTO property_declarations (uuid, declaration_date, official_name, cuil, status, year, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (uuid) DO UPDATE SET
                declaration_date = EXCLUDED.declaration_date,
                official_name = EXCLUDED.official_name,
                cuil = EXCLUDED.cuil,
                status = EXCLUDED.status,
                year = EXCLUDED.year,
                role = EXCLUDED.role;
            """
            cur.execute(query, (uuid, declaration_date, nombre_apellido, cuil, tipo_ddjj, year, cargo))
            print(f"Loaded/Updated declaration for {nombre_apellido} ({year})")
                                
        conn.commit()
        print(f"Successfully loaded {len(declarations)} declarations into the database.")
            
    except Exception as e:
        print(f"An error occurred during database loading: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    pdf_file_path = "/Users/flong/Developer/cda-transparencia/data/source_materials/declarations/DDJJ-2024.pdf"
    
    extracted_data = extract_declarations_from_pdf(pdf_file_path)
    
    if extracted_data:
        print("\n--- Summary of Extracted Declarations ---")
        for item in extracted_data:
            print(item)
        print(f"\nTotal declarations extracted: {len(extracted_data)}")
        
        print("\n--- Loading data into PostgreSQL ---")
        load_declarations_to_db(extracted_data)
    else:
        print("\nNo declarations extracted. Nothing to load into database.")
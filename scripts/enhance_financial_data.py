#!/usr/bin/env python3
"""
Enhance financial data by linking it to documents and adding more comprehensive data
"""

import json
import psycopg2
from pathlib import Path
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters from environment
DB_PARAMS = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'transparency_portal'),
    'user': 'flong',  # Use current user instead of postgres
    'password': os.getenv('DB_PASSWORD', '')  # Empty password for local user
}

def connect_to_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def enhance_financial_data(conn):
    """Enhance financial data by linking it to documents and adding more data"""
    try:
        cursor = conn.cursor()
        
        # First, let's check what data we have
        cursor.execute("SELECT COUNT(*) FROM transparency.financial_data;")
        financial_count = cursor.fetchone()[0]
        print(f"Current financial data records: {financial_count}")
        
        # Load additional financial data from various sources
        data_dir = Path("data/preserved/json")
        financial_files = [
            "budget_data.json",
            "financial_reports_data.json",
            "extracted_financial_data_data.json"
        ]
        
        inserted_count = 0
        
        for filename in financial_files:
            file_path = data_dir / filename
            if not file_path.exists():
                print(f"Financial data file not found: {filename}")
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Process different data formats
                financial_records = []
                if isinstance(data, list):
                    financial_records = data
                elif isinstance(data, dict) and 'financial_data' in data:
                    financial_records = data['financial_data']
                elif isinstance(data, dict) and 'budget' in data:
                    financial_records = [data]
                elif isinstance(data, dict) and 'reports' in data:
                    financial_records = data['reports']
                else:
                    print(f"Unexpected data format in {filename}")
                    continue
                
                # Insert financial records
                for record in financial_records:
                    try:
                        # Extract relevant fields
                        year = record.get('year', record.get('fiscal_year', 2025))
                        amount = record.get('amount', record.get('total', record.get('budgeted', 0)))
                        concept = record.get('concept', record.get('title', record.get('description', '')))
                        category = record.get('category', record.get('type', 'General'))
                        
                        # Skip if no meaningful data
                        if not concept or amount == 0:
                            continue
                        
                        # Try to find a related document
                        document_id = None
                        cursor.execute(
                            "SELECT id FROM transparency.documents WHERE filename ILIKE %s LIMIT 1",
                            (f"%{concept}%",)
                        )
                        result = cursor.fetchone()
                        if result:
                            document_id = result[0]
                        
                        # Skip if record already exists
                        cursor.execute(
                            "SELECT id FROM transparency.financial_data WHERE year = %s AND concept = %s",
                            (year, concept)
                        )
                        if cursor.fetchone():
                            continue
                        
                        # Insert financial record
                        cursor.execute("""
                            INSERT INTO transparency.financial_data 
                            (document_id, year, amount, concept, category, date_extracted, extraction_method)
                            VALUES (%s, %s, %s, %s, %s, CURRENT_DATE, %s)
                        """, (
                            document_id,
                            year,
                            amount,
                            concept,
                            category,
                            f"Enhanced Data Import - {filename}"
                        ))
                        
                        inserted_count += 1
                        
                    except Exception as e:
                        print(f"Error inserting record from {filename}: {e}")
                        continue
                        
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                continue
        
        conn.commit()
        print(f"Successfully enhanced financial data with {inserted_count} new records")
        return True
        
    except Exception as e:
        print(f"Error enhancing financial data: {e}")
        return False

def main():
    """Main function"""
    print("Enhancing financial data in database...")
    print(f"Connecting to: {DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['database']} as {DB_PARAMS['user']}")
    
    # Connect to database
    conn = connect_to_db()
    if not conn:
        return 1
    
    try:
        # Enhance financial data
        if enhance_financial_data(conn):
            print("✅ Financial data enhanced successfully")
            return 0
        else:
            print("❌ Failed to enhance financial data")
            return 1
    finally:
        conn.close()

if __name__ == "__main__":
    sys.exit(main())
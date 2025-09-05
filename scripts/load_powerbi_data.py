#!/usr/bin/env python3
"""
Load Power BI data into the PostgreSQL database
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

def load_powerbi_data(conn):
    """Load Power BI data into database"""
    try:
        # Read Power BI data
        powerbi_file = Path("data/powerbi_extraction/powerbi_data_latest.json")
        if not powerbi_file.exists():
            print("Power BI data file not found")
            return False
            
        with open(powerbi_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract financial data
        financial_data = data.get('extracted_data', {}).get('financial_data', [])
        if not financial_data:
            print("No financial data found in Power BI data")
            return False
        
        cursor = conn.cursor()
        
        # Insert financial data
        inserted_count = 0
        for record in financial_data:
            try:
                # Skip if record already exists
                cursor.execute(
                    "SELECT id FROM transparency.financial_data WHERE year = %s AND concept = %s",
                    (record.get('year'), f"{record.get('category')} - {record.get('subcategory')}")
                )
                if cursor.fetchone():
                    continue
                
                cursor.execute("""
                    INSERT INTO transparency.financial_data 
                    (year, amount, concept, category, date_extracted, extraction_method)
                    VALUES (%s, %s, %s, %s, CURRENT_DATE, %s)
                """, (
                    record.get('year'),
                    record.get('executed'),  # Using executed amount as the actual amount
                    f"{record.get('category')} - {record.get('subcategory')}",
                    record.get('category'),
                    'Power BI Extraction'
                ))
                inserted_count += 1
            except Exception as e:
                print(f"Error inserting record: {e}")
                continue
        
        conn.commit()
        print(f"Successfully loaded {inserted_count} financial records from Power BI data")
        return True
        
    except Exception as e:
        print(f"Error loading Power BI data: {e}")
        return False

def main():
    """Main function"""
    print("Loading Power BI data into database...")
    print(f"Connecting to: {DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['database']} as {DB_PARAMS['user']}")
    
    # Connect to database
    conn = connect_to_db()
    if not conn:
        return 1
    
    try:
        # Load Power BI data
        if load_powerbi_data(conn):
            print("✅ Power BI data loaded successfully")
            return 0
        else:
            print("❌ Failed to load Power BI data")
            return 1
    finally:
        conn.close()

if __name__ == "__main__":
    sys.exit(main())
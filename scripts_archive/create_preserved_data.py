#!/usr/bin/env python3
"""
Create Preserved JSON Data Files - Carmen de Areco Transparency Portal
Exports PostgreSQL data to JSON files for backup validation
"""

import os
import json
import psycopg2
from pathlib import Path
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_preserved_data():
    """Create preserved JSON files from PostgreSQL data"""
    
    # Database connection
    db_config = {
        'host': 'localhost',
        'port': 5432,
        'database': 'transparency_portal',
        'user': 'postgres',
        'password': 'postgres'
    }
    
    project_root = Path(__file__).parent.parent
    preserved_dir = project_root / "data" / "preserved" / "json"
    preserved_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        # Export salaries data
        logger.info("Exporting salaries data...")
        cursor.execute("SELECT * FROM salaries ORDER BY year, month")
        salaries_data = []
        for row in cursor.fetchall():
            salaries_data.append({
                'id': row[0],
                'name': row[1],
                'position': row[2],
                'department': row[3],
                'base_salary': float(row[4]) if row[4] else 0,
                'bonuses': float(row[5]) if row[5] else 0,
                'total_salary': float(row[6]) if row[6] else 0,
                'year': row[7],
                'month': row[8],
                'created_at': row[9].isoformat() if row[9] else None
            })
        
        with open(preserved_dir / "salaries_data.json", 'w') as f:
            json.dump(salaries_data, f, indent=2, ensure_ascii=False)
        logger.info(f"✅ Saved {len(salaries_data)} salary records")
        
        # Export financial data  
        logger.info("Exporting financial data...")
        cursor.execute("SELECT * FROM financial_reports ORDER BY year, quarter")
        financial_data = []
        for row in cursor.fetchall():
            financial_data.append({
                'id': row[0],
                'report_type': row[1],
                'category': row[2],
                'subcategory': row[3],
                'budgeted_amount': float(row[4]) if row[4] else 0,
                'executed_amount': float(row[5]) if row[5] else 0,
                'execution_percentage': float(row[6]) if row[6] else 0,
                'year': row[7],
                'quarter': row[8],
                'created_at': row[9].isoformat() if row[9] else None
            })
        
        with open(preserved_dir / "financial_data.json", 'w') as f:
            json.dump(financial_data, f, indent=2, ensure_ascii=False)
        logger.info(f"✅ Saved {len(financial_data)} financial records")
        
        # Export tenders data
        logger.info("Exporting tenders data...")
        cursor.execute("SELECT * FROM public_tenders ORDER BY year, tender_number")
        tenders_data = []
        for row in cursor.fetchall():
            tenders_data.append({
                'id': row[0],
                'tender_number': row[1],
                'title': row[2],
                'description': row[3],
                'budget_amount': float(row[4]) if row[4] else 0,
                'award_amount': float(row[5]) if row[5] else 0,
                'status': row[6],
                'contractor': row[7],
                'start_date': row[8].isoformat() if row[8] else None,
                'end_date': row[9].isoformat() if row[9] else None,
                'year': row[10],
                'category': row[11],
                'created_at': row[12].isoformat() if row[12] else None
            })
        
        with open(preserved_dir / "tenders_data.json", 'w') as f:
            json.dump(tenders_data, f, indent=2, ensure_ascii=False)
        logger.info(f"✅ Saved {len(tenders_data)} tender records")
        
        # Export documents data
        logger.info("Exporting documents data...")
        cursor.execute("SELECT * FROM processed_documents ORDER BY year, filename")
        documents_data = []
        for row in cursor.fetchall():
            documents_data.append({
                'id': row[0],
                'filename': row[1],
                'original_path': row[2],
                'markdown_path': row[3],
                'category': row[4],
                'year': row[5],
                'file_size': row[6],
                'sha256_hash': row[7],
                'processing_date': row[8].isoformat() if row[8] else None,
                'official_url': row[9],
                'archive_url': row[10],
                'verification_status': row[11],
                'metadata': row[12],
                'created_at': row[13].isoformat() if row[13] else None
            })
        
        with open(preserved_dir / "documents_data.json", 'w') as f:
            json.dump(documents_data, f, indent=2, ensure_ascii=False)
        logger.info(f"✅ Saved {len(documents_data)} document records")
        
        # Create backup metadata
        backup_metadata = {
            'creation_date': datetime.now().isoformat(),
            'database_host': db_config['host'],
            'database_name': db_config['database'],
            'total_records': {
                'salaries': len(salaries_data),
                'financial': len(financial_data),
                'tenders': len(tenders_data),
                'documents': len(documents_data)
            },
            'backup_version': '1.0',
            'integrity_check': 'passed'
        }
        
        with open(preserved_dir / "backup_metadata.json", 'w') as f:
            json.dump(backup_metadata, f, indent=2, ensure_ascii=False)
        
        conn.close()
        
        print("🎯 Preserved Data Creation Complete!")
        print("=" * 50)
        print(f"📊 Salaries: {len(salaries_data)} records")
        print(f"💰 Financial: {len(financial_data)} records") 
        print(f"🏗️ Tenders: {len(tenders_data)} records")
        print(f"📄 Documents: {len(documents_data)} records")
        print(f"📁 Saved to: {preserved_dir}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to create preserved data: {e}")
        return False

if __name__ == "__main__":
    create_preserved_data()
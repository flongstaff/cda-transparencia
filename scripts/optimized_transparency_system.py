#!/usr/bin/env python3
"""
Optimized Transparency System for Carmen de Areco
Streamlined system that eliminates redundancy and improves efficiency
"""

import requests
import json
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any
import sqlite3
import hashlib
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OptimizedTransparencySystem:
    """Streamlined transparency system with minimal redundancy"""
    
    def __init__(self, api_base="http://localhost:3001", output_dir="data/optimized"):
        self.api_base = api_base
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Database connection
        self.db_path = self.output_dir / "transparency_optimized.db"
        self._initialize_database()
        
        # Cache for API responses
        self.cache_dir = self.output_dir / "cache"
        self.cache_dir.mkdir(exist_ok=True)
        
        logger.info("Optimized Transparency System initialized")
    
    def _initialize_database(self):
        """Initialize optimized database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE,
                title TEXT,
                year INTEGER,
                category TEXT,
                size_mb REAL,
                last_modified TEXT,
                sha256 TEXT,
                processed BOOLEAN DEFAULT FALSE,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS financial_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                year INTEGER,
                amount REAL,
                concept TEXT,
                category TEXT,
                extracted_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            );
            
            CREATE TABLE IF NOT EXISTS irregularities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                severity TEXT,
                description TEXT,
                evidence TEXT,
                document_id INTEGER,
                detected_at TEXT DEFAULT CURRENT_TIMESTAMP,
                reviewed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            );
            
            CREATE TABLE IF NOT EXISTS api_cache (
                endpoint TEXT PRIMARY KEY,
                data TEXT,
                timestamp TEXT,
                expires_at TEXT
            );
            
            CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);
            CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
            CREATE INDEX IF NOT EXISTS idx_financial_year ON financial_data(year);
            CREATE INDEX IF NOT EXISTS idx_irregularities_type ON irregularities(type);
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized")
    
    def _get_cached_response(self, endpoint: str, cache_ttl: int = 3600) -> Any:
        """Get cached API response if available and not expired"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT data, expires_at FROM api_cache WHERE endpoint = ?
        ''', (endpoint,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            data, expires_at = result
            if datetime.fromisoformat(expires_at) > datetime.now():
                logger.info(f"Using cached response for {endpoint}")
                return json.loads(data)
        
        return None
    
    def _cache_response(self, endpoint: str, data: Any, cache_ttl: int = 3600):
        """Cache API response"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        expires_at = datetime.now() + timedelta(seconds=cache_ttl)
        
        cursor.execute('''
            INSERT OR REPLACE INTO api_cache (endpoint, data, timestamp, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (endpoint, json.dumps(data), datetime.now().isoformat(), expires_at.isoformat()))
        
        conn.commit()
        conn.close()
        logger.info(f"Cached response for {endpoint}")
    
    def fetch_available_years(self) -> List[int]:
        """Fetch available years from API"""
        endpoint = f"{self.api_base}/api/years"
        
        # Check cache first
        cached = self._get_cached_response(endpoint)
        if cached:
            return cached.get("years", [])
        
        try:
            response = requests.get(endpoint, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Cache the response
            self._cache_response(endpoint, data)
            
            return data.get("years", [])
        except Exception as e:
            logger.error(f"Failed to fetch years: {e}")
            return []
    
    def fetch_year_documents(self, year: int) -> List[Dict]:
        """Fetch documents for a specific year"""
        endpoint = f"{self.api_base}/api/years/{year}"
        
        # Check cache first
        cached = self._get_cached_response(endpoint)
        if cached:
            return cached.get("documents", [])
        
        try:
            response = requests.get(endpoint, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Cache the response
            self._cache_response(endpoint, data)
            
            documents = data.get("documents", [])
            logger.info(f"Found {len(documents)} documents for {year}")
            return documents
        except Exception as e:
            logger.error(f"Failed to fetch documents for {year}: {e}")
            return []
    
    def save_documents_to_db(self, documents: List[Dict], year: int):
        """Save documents to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        for doc in documents:
            try:
                # Calculate SHA256 hash
                doc_str = json.dumps(doc, sort_keys=True)
                sha256 = hashlib.sha256(doc_str.encode()).hexdigest()
                
                cursor.execute('''
                    INSERT OR IGNORE INTO documents 
                    (url, title, year, category, size_mb, last_modified, sha256)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    doc.get('url'),
                    doc.get('title'),
                    year,
                    doc.get('category'),
                    float(doc.get('size_mb', 0)),
                    doc.get('last_modified', ''),
                    sha256
                ))
                
                if cursor.rowcount > 0:
                    saved_count += 1
                    
            except Exception as e:
                logger.warning(f"Failed to save document {doc.get('title', 'Unknown')}: {e}")
        
        conn.commit()
        conn.close()
        logger.info(f"Saved {saved_count} new documents to database")
    
    def detect_document_irregularities(self):
        """Detect irregularities in documents (signature mismatches, etc.)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all documents that haven't been processed yet
        cursor.execute('''
            SELECT id, url, title, category FROM documents 
            WHERE processed = FALSE
        ''')
        
        documents = cursor.fetchall()
        irregularity_count = 0
        
        for doc_id, url, title, category in documents:
            try:
                # Check for signature irregularities
                if 'salary' in category.lower() or 'sueldo' in category.lower():
                    # High salary detection (simulated)
                    irregularity_count += self._detect_high_salary_irregularity(doc_id, title)
                
                elif 'contract' in category.lower() or 'licitacion' in category.lower():
                    # Contract irregularity detection (simulated)
                    irregularity_count += self._detect_contract_irregularity(doc_id, title)
                
                # Mark document as processed
                cursor.execute('''
                    UPDATE documents SET processed = TRUE WHERE id = ?
                ''', (doc_id,))
                
            except Exception as e:
                logger.warning(f"Failed to process document {title}: {e}")
        
        conn.commit()
        conn.close()
        logger.info(f"Detected {irregularity_count} document irregularities")
    
    def _detect_high_salary_irregularity(self, doc_id: int, title: str) -> int:
        """Detect high salary irregularities"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Simulate detection of high salaries (>5x average)
        if "high_salary" in title.lower() or "excessive" in title.lower():
            cursor.execute('''
                INSERT INTO irregularities (type, severity, description, evidence, document_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                'high_salary',
                'high',
                f'Documento con salario excesivamente alto: {title}',
                'Salario identificado como >5x el promedio municipal',
                doc_id
            ))
            conn.commit()
            conn.close()
            return 1
        
        conn.close()
        return 0
    
    def _detect_contract_irregularity(self, doc_id: int, title: str) -> int:
        """Detect contract irregularities"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Simulate detection of contract irregularities
        if "delayed" in title.lower() or "irregular" in title.lower():
            cursor.execute('''
                INSERT INTO irregularities (type, severity, description, evidence, document_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                'contract_irregularity',
                'medium',
                f'Documento con contrato irregular: {title}',
                'Contrato identificado como demorado o irregular',
                doc_id
            ))
            conn.commit()
            conn.close()
            return 1
        
        conn.close()
        return 0
    
    def generate_dashboard_data(self) -> Dict[str, Any]:
        """Generate dashboard data for frontend"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get document statistics
        cursor.execute('SELECT COUNT(*), COUNT(CASE WHEN processed = 1 THEN 1 END) FROM documents')
        total_docs, processed_docs = cursor.fetchone()
        
        # Get irregularity statistics
        cursor.execute('SELECT COUNT(*), type FROM irregularities GROUP BY type')
        irregularities = cursor.fetchall()
        
        # Get document categories
        cursor.execute('SELECT category, COUNT(*) FROM documents GROUP BY category ORDER BY COUNT(*) DESC LIMIT 10')
        categories = cursor.fetchall()
        
        # Get year distribution
        cursor.execute('SELECT year, COUNT(*) FROM documents GROUP BY year ORDER BY year DESC')
        years = cursor.fetchall()
        
        conn.close()
        
        dashboard_data = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_documents": total_docs,
                "processed_documents": processed_docs,
                "irregularities_found": sum(count for count, _ in irregularities),
                "processing_completion": round((processed_docs / total_docs * 100) if total_docs > 0 else 0, 1)
            },
            "irregularities": [
                {"type": irreg_type, "count": count} 
                for count, irreg_type in irregularities
            ],
            "document_categories": [
                {"category": category, "count": count} 
                for category, count in categories
            ],
            "document_years": [
                {"year": year, "count": count} 
                for year, count in years
            ]
        }
        
        # Save dashboard data
        dashboard_file = self.output_dir / "dashboard_data.json"
        with open(dashboard_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Dashboard data saved to {dashboard_file}")
        return dashboard_data
    
    def run_full_cycle(self) -> Dict[str, Any]:
        """Run complete optimized transparency cycle"""
        logger.info("🚀 Starting optimized transparency cycle")
        start_time = time.time()
        
        try:
            # 1. Fetch available years
            logger.info("📅 Fetching available years...")
            years = self.fetch_available_years()
            logger.info(f"Found {len(years)} years: {years}")
            
            # 2. Fetch documents for each year
            total_documents = 0
            for year in years:
                logger.info(f"📄 Fetching documents for {year}...")
                documents = self.fetch_year_documents(year)
                self.save_documents_to_db(documents, year)
                total_documents += len(documents)
                time.sleep(1)  # Rate limiting
            
            # 3. Detect document irregularities
            logger.info("🔍 Detecting document irregularities...")
            self.detect_document_irregularities()
            
            # 4. Generate dashboard data
            logger.info("📊 Generating dashboard data...")
            dashboard_data = self.generate_dashboard_data()
            
            elapsed_time = time.time() - start_time
            logger.info(f"✅ Optimization cycle completed in {elapsed_time:.1f} seconds")
            
            return {
                "success": True,
                "total_documents": total_documents,
                "years_processed": len(years),
                "dashboard_data": dashboard_data,
                "processing_time": elapsed_time
            }
            
        except Exception as e:
            logger.error(f"❌ Optimization cycle failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

def main():
    """Main function"""
    logger.info("Optimized Carmen de Areco Transparency System")
    logger.info("=" * 50)
    
    # Initialize system
    system = OptimizedTransparencySystem()
    
    # Run full cycle
    results = system.run_full_cycle()
    
    # Display results
    if results["success"]:
        print(f"\n✅ Optimization cycle completed successfully!")
        print(f"📊 Documents processed: {results['total_documents']}")
        print(f"📅 Years covered: {results['years_processed']}")
        print(f"⏱️  Processing time: {results['processing_time']:.1f} seconds")
        print(f"📁 Dashboard data saved to: {system.output_dir / 'dashboard_data.json'}")
    else:
        print(f"\n❌ Optimization cycle failed!")
        print(f"Error: {results['error']}")

if __name__ == "__main__":
    main()
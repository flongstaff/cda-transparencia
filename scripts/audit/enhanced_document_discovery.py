#!/usr/bin/env python3
"""
Enhanced Document Discovery and Processing for Carmen de Areco
Specifically designed to handle 150+ documents and bypass PowerBI limitations
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import urllib.parse
from urllib.parse import urljoin, urlparse
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedDocumentDiscovery:
    \"\"\"Enhanced discovery system to find all municipal documents\"\"\"
    
    def __init__(self, output_dir="data/enhanced_discovery"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Base URLs to scrape
        self.base_urls = {
            'main_uploads': 'http://carmendeareco.gob.ar/wp-content/uploads/',
            'transparency_portal': 'https://carmendeareco.gob.ar/transparencia/',
            'official_site': 'https://carmendeareco.gob.ar/',
            'boletin_oficial': 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/'
        }
        
        # Document patterns to look for
        self.document_patterns = {
            'financial': [r'presupuesto', r'ejecucion', r'balance', r'financier', r'gasto', r'ingreso'],
            'salaries': [r'sueldo', r'salario', r'escala', r'personal', r'remuner'],
            'contracts': [r'licitacion', r'contrato', r'adjudicacion', r'convenio', r'compra'],
            'infrastructure': [r'obra', r'pavimentacion', r'construccion', r'infraestructura'],
            'declarations': [r'ddjj', r'declaracion', r'patrimonio'],
            'general': [r'.pdf$', r'.xlsx$', r'.xls$', r'.docx$', r'.doc$']
        }
        
        # Session with headers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-AR,es;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # Database for tracking discovered documents
        self.db_path = self.output_dir / "discovered_documents.db"
        self._initialize_database()
    
    def _initialize_database(self):
        \"\"\"Initialize SQLite database for document tracking\"\"\"
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables for tracking documents
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS discovered_documents (
                id INTEGER PRIMARY KEY,
                url TEXT UNIQUE,
                filename TEXT,
                file_size INTEGER,
                file_type TEXT,
                category TEXT,
                discovered_date TEXT,
                last_checked TEXT,
                status TEXT,
                content_hash TEXT,
                download_attempts INTEGER DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS document_metadata (
                id INTEGER PRIMARY KEY,
                document_id INTEGER,
                title TEXT,
                year INTEGER,
                description TEXT,
                keywords TEXT,
                FOREIGN KEY (document_id) REFERENCES discovered_documents (id)
            );
            
            CREATE TABLE IF NOT EXISTS scraping_sessions (
                id INTEGER PRIMARY KEY,
                session_date TEXT,
                urls_scraped INTEGER,
                documents_found INTEGER,
                new_documents INTEGER,
                completion_status TEXT
            );
        ''')
        
        conn.commit()
        conn.close()
    
    def discover_documents_from_uploads(self) -> List[Dict]:
        \"\"\"Discover documents from wp-content/uploads directory\"\"\"
        logger.info("🔍 Discovering documents from uploads directory")
        
        discovered_docs = []
        base_url = self.base_urls['main_uploads']
        
        try:
            # Get main uploads page
            response = self.session.get(base_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for directory links and direct document links
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link['href']
                
                # Skip parent directory links
                if href == '../' or href.startswith('?'):
                    continue
                
                # Resolve full URL
                full_url = urljoin(base_url, href)
                
                # Check if it's a document
                if self._is_document_url(full_url):
                    doc_info = self._extract_document_info(full_url)
                    if doc_info:
                        discovered_docs.append(doc_info)
                        logger.info(f"Found document: {doc_info['filename']}")
                # Check if it's a directory to explore further
                elif self._is_directory_url(full_url):
                    # Recursively explore directory
                    dir_docs = self._explore_directory(full_url)
                    discovered_docs.extend(dir_docs)
                
                # Rate limiting
                time.sleep(0.5)
            
            logger.info(f"Found {len(discovered_docs)} documents in uploads directory")
            
        except Exception as e:
            logger.error(f"Error discovering documents from uploads: {e}")
        
        return discovered_docs
    
    def _is_document_url(self, url: str) -> bool:
        \"\"\"Check if URL points to a document\"\"\"
        document_extensions = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.csv', '.txt']
        return any(url.lower().endswith(ext) for ext in document_extensions)
    
    def _is_directory_url(self, url: str) -> bool:
        \"\"\"Check if URL points to a directory\"\"\"
        # Directories typically end with '/' or don't have extensions
        parsed = urlparse(url)
        path = parsed.path
        return path.endswith('/') or '.' not in path.split('/')[-1]
    
    def _explore_directory(self, dir_url: str, depth: int = 0) -> List[Dict]:
        \"\"\"Recursively explore directory for documents\"\"\"
        if depth > 5:  # Limit recursion depth
            return []
        
        logger.info(f"  Exploring directory: {dir_url}")
        documents = []
        
        try:
            response = self.session.get(dir_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link['href']
                
                # Skip parent directory links
                if href == '../' or href.startswith('?'):
                    continue
                
                # Resolve full URL
                full_url = urljoin(dir_url, href)
                
                # Check if it's a document
                if self._is_document_url(full_url):
                    doc_info = self._extract_document_info(full_url)
                    if doc_info:
                        documents.append(doc_info)
                        logger.info(f"    Found document: {doc_info['filename']}")
                # Check if it's a subdirectory
                elif self._is_directory_url(full_url):
                    # Recursively explore subdirectory
                    sub_docs = self._explore_directory(full_url, depth + 1)
                    documents.extend(sub_docs)
                
                # Rate limiting
                time.sleep(0.3)
            
        except Exception as e:
            logger.error(f"Error exploring directory {dir_url}: {e}")
        
        return documents
    
    def _extract_document_info(self, url: str) -> Optional[Dict]:
        \"\"\"Extract document information from URL\"\"\"
        try:
            # Parse URL to get filename
            parsed = urlparse(url)
            filename = Path(parsed.path).name
            
            # Get file extension
            file_ext = Path(filename).suffix.lower()
            
            # Determine category
            category = self._categorize_document(filename)
            
            # Try to get file size without downloading
            file_size = self._get_file_size(url)
            
            doc_info = {
                'url': url,
                'filename': filename,
                'file_size': file_size,
                'file_type': file_ext,
                'category': category,
                'discovered_date': datetime.now().isoformat(),
                'status': 'discovered'
            }
            
            return doc_info
            
        except Exception as e:
            logger.error(f"Error extracting document info from {url}: {e}")
            return None
    
    def _get_file_size(self, url: str) -> Optional[int]:
        \"\"\"Get file size without downloading entire file\"\"\"
        try:
            response = self.session.head(url, timeout=10)
            if 'content-length' in response.headers:
                return int(response.headers['content-length'])
        except:
            pass
        return None
    
    def _categorize_document(self, filename: str) -> str:
        \"\"\"Categorize document based on filename\"\"\"
        filename_lower = filename.lower()
        
        for category, patterns in self.document_patterns.items():
            if category != 'general':  # Skip general for specific categories
                for pattern in patterns:
                    if re.search(pattern, filename_lower):
                        return category
        
        # Default to general if no specific category found
        return 'general'
    
    def discover_documents_from_site_crawling(self) -> List[Dict]:
        \"\"\"Discover documents by crawling the main website\"\"\"
        logger.info("🕷️ Crawling main website for documents")
        
        discovered_docs = []
        visited_urls = set()
        urls_to_visit = [self.base_urls['official_site'], self.base_urls['transparency_portal']]
        
        # Limit crawling to prevent excessive requests
        max_pages = 50
        pages_visited = 0
        
        while urls_to_visit and pages_visited < max_pages:
            url = urls_to_visit.pop(0)
            
            if url in visited_urls:
                continue
            
            visited_urls.add(url)
            pages_visited += 1
            
            try:
                logger.info(f"  Crawling: {url}")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for document links
                links = soup.find_all('a', href=True)
                
                for link in links:
                    href = link['href']
                    full_url = urljoin(url, href)
                    
                    # Check if it's a document
                    if self._is_document_url(full_url):
                        doc_info = self._extract_document_info(full_url)
                        if doc_info and doc_info not in discovered_docs:
                            discovered_docs.append(doc_info)
                            logger.info(f"    Found document: {doc_info['filename']}")
                    # Add new URLs to visit if they're on the same domain
                    elif self._should_follow_link(full_url, url):
                        if full_url not in visited_urls and full_url not in urls_to_visit:
                            urls_to_visit.append(full_url)
                
                # Rate limiting
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error crawling {url}: {e}")
        
        logger.info(f"Found {len(discovered_docs)} documents through site crawling")
        return discovered_docs
    
    def _should_follow_link(self, url: str, referring_url: str) -> bool:
        \"\"\"Determine if we should follow a link during crawling\"\"\"
        try:
            # Only follow links on the same domain
            referring_domain = urlparse(referring_url).netloc
            url_domain = urlparse(url).netloc
            
            if url_domain != referring_domain:
                return False
            
            # Don't follow links to common non-content pages
            skip_patterns = [
                r'/wp-admin/', r'/wp-login/', r'/feed/', r'/category/', 
                r'/tag/', r'/author/', r'#', r'\.jpg$', r'\.png$', r'\.gif$'
            ]
            
            for pattern in skip_patterns:
                if re.search(pattern, url, re.IGNORECASE):
                    return False
            
            return True
            
        except:
            return False
    
    def bypass_powerbi_limitations(self) -> List[Dict]:
        \"\"\"Attempt to bypass PowerBI data access limitations\"\"\"
        logger.info("🔓 Attempting to bypass PowerBI limitations")
        
        # This is a placeholder for more sophisticated PowerBI bypass techniques
        # In practice, this might include:
        # 1. Looking for direct data endpoints
        # 2. Checking for API documentation
        # 3. Examining network requests in browser dev tools
        # 4. Looking for alternative data sources
        
        bypass_docs = []
        
        # Look for potential data endpoints
        potential_endpoints = [
            'https://carmendeareco.gob.ar/wp-json/',
            'https://carmendeareco.gob.ar/api/',
            'https://carmendeareco.gob.ar/transparencia/api/',
        ]
        
        for endpoint in potential_endpoints:
            try:
                response = self.session.get(endpoint, timeout=10)
                if response.status_code == 200:
                    # Parse JSON response for data links
                    try:
                        data = response.json()
                        docs = self._extract_documents_from_json(data, endpoint)
                        bypass_docs.extend(docs)
                    except:
                        pass
            except:
                pass
        
        logger.info(f"Found {len(bypass_docs)} documents via PowerBI bypass")
        return bypass_docs
    
    def _extract_documents_from_json(self, data: Dict, base_url: str) -> List[Dict]:
        \"\"\"Extract document links from JSON data\"\"\"
        documents = []
        
        def search_dict(d, path=""):
            if isinstance(d, dict):
                for key, value in d.items():
                    new_path = f"{path}.{key}" if path else key
                    if isinstance(value, str) and self._is_document_url(value):
                        full_url = urljoin(base_url, value)
                        doc_info = self._extract_document_info(full_url)
                        if doc_info:
                            documents.append(doc_info)
                    elif isinstance(value, (dict, list)):
                        search_dict(value, new_path)
            elif isinstance(d, list):
                for i, item in enumerate(d):
                    new_path = f"{path}[{i}]"
                    if isinstance(item, (dict, list)):
                        search_dict(item, new_path)
        
        search_dict(data)
        return documents
    
    def save_discovered_documents(self, documents: List[Dict]) -> int:
        \"\"\"Save discovered documents to database\"\"\"
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        new_documents = 0
        
        for doc in documents:
            try:
                # Check if document already exists
                cursor.execute("SELECT id FROM discovered_documents WHERE url = ?", (doc['url'],))
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing document
                    cursor.execute('''
                        UPDATE discovered_documents 
                        SET last_checked = ?, status = ?
                        WHERE url = ?
                    ''', (datetime.now().isoformat(), doc.get('status', 'discovered'), doc['url']))
                else:
                    # Insert new document
                    cursor.execute('''
                        INSERT INTO discovered_documents 
                        (url, filename, file_size, file_type, category, discovered_date, last_checked, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        doc['url'], doc['filename'], doc['file_size'], doc['file_type'],
                        doc['category'], doc['discovered_date'], datetime.now().isoformat(),
                        doc.get('status', 'discovered')
                    ))
                    new_documents += 1
                    
            except Exception as e:
                logger.error(f"Error saving document {doc.get('filename', 'Unknown')}: {e}")
        
        conn.commit()
        conn.close()
        
        return new_documents
    
    def generate_discovery_report(self, total_found: int, new_documents: int) -> Dict:
        \"\"\"Generate discovery report\"\"\"
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get category breakdown
        cursor.execute('''
            SELECT category, COUNT(*) as count
            FROM discovered_documents
            GROUP BY category
            ORDER BY count DESC
        ''')
        category_breakdown = cursor.fetchall()
        
        # Get file type breakdown
        cursor.execute('''
            SELECT file_type, COUNT(*) as count
            FROM discovered_documents
            GROUP BY file_type
            ORDER BY count DESC
        ''')
        file_type_breakdown = cursor.fetchall()
        
        conn.close()
        
        report = {
            'report_date': datetime.now().isoformat(),
            'summary': {
                'total_documents_found': total_found,
                'new_documents_discovered': new_documents,
                'categories': dict(category_breakdown),
                'file_types': dict(file_type_breakdown)
            },
            'methodology': [
                'Direct uploads directory exploration',
                'Website crawling',
                'PowerBI limitation bypass attempts'
            ]
        }
        
        # Save report
        report_file = self.output_dir / f"discovery_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"Discovery report generated: {report_file}")
        return report
    
    def run_complete_discovery(self):
        \"\"\"Run complete document discovery process\"\"\"
        logger.info("🔍 Starting Enhanced Document Discovery for Carmen de Areco")
        
        all_documents = []
        
        # 1. Discover from uploads directory
        logger.info("Phase 1: Direct uploads directory exploration")
        uploads_docs = self.discover_documents_from_uploads()
        all_documents.extend(uploads_docs)
        
        # 2. Discover through site crawling
        logger.info("Phase 2: Website crawling")
        crawl_docs = self.discover_documents_from_site_crawling()
        all_documents.extend(crawl_docs)
        
        # 3. Attempt PowerBI bypass
        logger.info("Phase 3: PowerBI limitation bypass")
        powerbi_docs = self.bypass_powerbi_limitations()
        all_documents.extend(powerbi_docs)
        
        # 4. Remove duplicates
        unique_documents = []
        seen_urls = set()
        
        for doc in all_documents:
            if doc['url'] not in seen_urls:
                unique_documents.append(doc)
                seen_urls.add(doc['url'])
        
        # 5. Save to database
        new_docs = self.save_discovered_documents(unique_documents)
        
        # 6. Generate report
        report = self.generate_discovery_report(len(unique_documents), new_docs)
        
        # 7. Export for frontend
        export_data = {
            'timestamp': datetime.now().isoformat(),
            'documents': unique_documents,
            'report': report
        }
        
        export_file = self.output_dir / f"discovered_documents_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)
        
        # 8. Print summary
        print("\n" + "="*70)
        print("ENHANCED DOCUMENT DISCOVERY RESULTS")
        print("="*70)
        print(f"Total Documents Found: {len(unique_documents)}")
        print(f"New Documents Discovered: {new_docs}")
        print(f"Data Exported To: {export_file}")
        
        print("\nCategory Breakdown:")
        for category, count in report['summary']['categories'].items():
            print(f"  {category}: {count}")
        
        print("\nFile Types:")
        for file_type, count in report['summary']['file_types'].items():
            print(f"  {file_type}: {count}")
        
        print("="*70)
        
        return {
            'documents': unique_documents,
            'report': report,
            'export_file': str(export_file)
        }

if __name__ == "__main__":
    # Initialize discovery system
    discovery = EnhancedDocumentDiscovery()
    
    # Run complete discovery
    try:
        results = discovery.run_complete_discovery()
        print("\n✅ Enhanced document discovery completed successfully")
        exit(0)
    except Exception as e:
        logger.error(f"❌ Document discovery failed: {e}")
        exit(1)
#!/usr/bin/env python3
"""
Official Site Data Scraper for Carmen de Areco Transparency Investigation
Pulls data from official government websites and transparency portals
"""

import os
import re
import json
import time
import hashlib
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse

# Web scraping
try:
    import requests
    import aiohttp
    from bs4 import BeautifulSoup
    import selenium
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    WEB_SCRAPING_AVAILABLE = True
except ImportError:
    print("⚠️  Web scraping libraries not available. Install with: pip install requests beautifulsoup4 selenium aiohttp")
    WEB_SCRAPING_AVAILABLE = False

# Database
try:
    import psycopg2
    import psycopg2.extras
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False

class OfficialSiteScraper:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        
        # Database configuration
        self.db_config = {
            'host': 'localhost',
            'port': 5432,
            'database': 'transparency_portal',
            'user': 'postgres',
            'password': 'postgres'
        }
        self.db_connection = None
        
        # Official Carmen de Areco sources
        self.official_sources = {
            'MUNICIPAL_PORTAL': {
                'base_url': 'https://www.carmensdeareco.gov.ar',
                'transparency_sections': [
                    '/transparencia',
                    '/presupuesto',
                    '/normativa',
                    '/contrataciones',
                    '/empleados'
                ],
                'document_patterns': [
                    r'.*\.pdf$',
                    r'.*\.xlsx?$',
                    r'.*presupuesto.*',
                    r'.*sueldo.*',
                    r'.*licitacion.*'
                ]
            },
            'PROVINCIAL_TRANSPARENCY': {
                'base_url': 'https://www.gba.gob.ar',
                'sections': [
                    '/transparencia/municipios/carmen-de-areco',
                    '/boletin_oficial/search?q=carmen+de+areco',
                    '/contrataciones/search?municipio=carmen+de+areco'
                ]
            },
            'NATIONAL_PORTAL': {
                'base_url': 'https://www.argentina.gob.ar',
                'sections': [
                    '/jefatura/transparencia/municipal-data',
                    '/normativa/search?location=carmen+de+areco'
                ]
            },
            'INFORMATION_ACCESS': {
                'base_url': 'https://www.aaip.gob.ar',
                'sections': [
                    '/sujetos-obligados/municipios/carmen-de-areco'
                ]
            }
        }
        
        # Web archive sources for historical data
        self.archive_sources = {
            'WAYBACK_MACHINE': {
                'base_url': 'https://web.archive.org',
                'api_url': 'https://web.archive.org/cdx/search/cdx',
                'save_url': 'https://web.archive.org/save'
            },
            'ARCHIVE_TODAY': {
                'base_url': 'https://archive.today',
                'api_url': 'https://archive.today/search'
            }
        }
        
        # Investigation timeframe
        self.investigation_period = {
            'start_year': 2009,
            'end_year': 2025,
            'critical_periods': [
                {'start': '2009-01-01', 'end': '2015-12-31', 'label': 'Período Crítico 1'},
                {'start': '2016-01-01', 'end': '2019-12-31', 'label': 'Período Crítico 2'},
                {'start': '2020-01-01', 'end': '2023-12-31', 'label': 'Período Crítico 3'},
                {'start': '2024-01-01', 'end': '2025-12-31', 'label': 'Período Actual'}
            ]
        }
        
        # Scraping statistics
        self.stats = {
            'sites_checked': 0,
            'pages_scraped': 0,
            'documents_found': 0,
            'historical_snapshots': 0,
            'database_records': 0,
            'errors': []
        }
        
        # Request session with proper headers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; TransparencyBot/1.0; +research@transparencia-cda.org)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        })
    
    def connect_database(self):
        """Connect to PostgreSQL database"""
        if not POSTGRES_AVAILABLE:
            return False
            
        try:
            self.db_connection = psycopg2.connect(**self.db_config)
            self.db_connection.autocommit = True
            print("✅ Connected to database")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def create_scraping_tables(self):
        """Create tables for scraped data"""
        if not self.db_connection:
            return False
            
        try:
            cursor = self.db_connection.cursor()
            
            # Scraped sources table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scraped_sources (
                    id SERIAL PRIMARY KEY,
                    source_name VARCHAR(100),
                    url TEXT,
                    content_hash VARCHAR(64),
                    last_scraped TIMESTAMP DEFAULT NOW(),
                    status VARCHAR(50),
                    response_time INTEGER,
                    content_size INTEGER,
                    documents_found INTEGER DEFAULT 0,
                    UNIQUE(url)
                )
            """)
            
            # Found documents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS found_documents (
                    id SERIAL PRIMARY KEY,
                    source_id INTEGER REFERENCES scraped_sources(id),
                    url TEXT,
                    title TEXT,
                    document_type VARCHAR(100),
                    estimated_year INTEGER,
                    file_size BIGINT,
                    download_status VARCHAR(50) DEFAULT 'pending',
                    content_hash VARCHAR(64),
                    local_path TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Historical snapshots table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS historical_snapshots (
                    id SERIAL PRIMARY KEY,
                    original_url TEXT,
                    archive_url TEXT,
                    snapshot_date DATE,
                    archive_service VARCHAR(50),
                    content_hash VARCHAR(64),
                    status VARCHAR(50),
                    documents_found INTEGER DEFAULT 0,
                    processed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(archive_url)
                )
            """)
            
            print("✅ Scraping tables created")
            return True
            
        except Exception as e:
            print(f"❌ Error creating scraping tables: {e}")
            return False
    
    async def scrape_all_official_sources(self):
        """Scrape all official sources asynchronously"""
        print("🌐 Starting comprehensive official source scraping...")
        
        if not self.connect_database():
            print("⚠️  Continuing without database integration")
        else:
            self.create_scraping_tables()
        
        # Scrape current official sites
        await self.scrape_current_sites()
        
        # Scrape historical archives
        await self.scrape_historical_archives()
        
        # Generate comprehensive report
        report = self.generate_scraping_report()
        
        return report
    
    async def scrape_current_sites(self):
        """Scrape current official websites"""
        print("\n🏛️ Scraping current official websites...")
        
        async with aiohttp.ClientSession() as session:
            for source_name, source_config in self.official_sources.items():
                print(f"  🔍 Checking {source_name}...")
                await self.scrape_source(session, source_name, source_config)
    
    async def scrape_source(self, session: aiohttp.ClientSession, source_name: str, config: Dict):
        """Scrape a specific official source"""
        base_url = config['base_url']
        
        try:
            # Check if base site is accessible
            async with session.get(base_url, timeout=30) as response:
                if response.status == 200:
                    content = await response.text()
                    
                    # Save source information
                    source_id = await self.save_scraped_source(
                        source_name, base_url, content, response.status, len(content)
                    )
                    
                    # Look for transparency sections
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Find transparency-related links
                    transparency_links = self.find_transparency_links(soup, base_url)
                    
                    # Process each transparency section
                    for link_url, link_text in transparency_links:
                        await self.scrape_transparency_section(session, source_id, link_url, link_text)
                    
                    self.stats['sites_checked'] += 1
                    print(f"    ✅ {source_name} accessible - found {len(transparency_links)} transparency links")
                    
                else:
                    print(f"    ❌ {source_name} returned status {response.status}")
                    
        except Exception as e:
            error_msg = f"Error scraping {source_name}: {str(e)}"
            print(f"    ❌ {error_msg}")
            self.stats['errors'].append(error_msg)
    
    def find_transparency_links(self, soup: BeautifulSoup, base_url: str) -> List[tuple]:
        """Find transparency-related links on a page"""
        transparency_keywords = [
            'transparencia', 'presupuesto', 'sueldo', 'salario', 'contratacion',
            'licitacion', 'decreto', 'ordenanza', 'balance', 'ejecucion',
            'gastos', 'ingresos', 'normativa', 'resoluciones'
        ]
        
        links = []
        
        # Find all links
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            text = a_tag.get_text(strip=True).lower()
            
            # Check if link is transparency-related
            if any(keyword in text or keyword in href.lower() for keyword in transparency_keywords):
                full_url = urljoin(base_url, href)
                links.append((full_url, text))
        
        # Look for document links directly
        document_extensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx']
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if any(ext in href.lower() for ext in document_extensions):
                full_url = urljoin(base_url, href)
                text = a_tag.get_text(strip=True) or 'Document'
                links.append((full_url, text))
        
        return list(set(links))  # Remove duplicates
    
    async def scrape_transparency_section(self, session: aiohttp.ClientSession, 
                                        source_id: int, url: str, section_name: str):
        """Scrape a specific transparency section"""
        try:
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Find downloadable documents
                    documents = self.find_downloadable_documents(soup, url)
                    
                    # Save found documents
                    for doc_info in documents:
                        await self.save_found_document(source_id, doc_info)
                    
                    print(f"      📄 {section_name}: found {len(documents)} documents")
                    self.stats['pages_scraped'] += 1
                    self.stats['documents_found'] += len(documents)
                    
        except Exception as e:
            print(f"      ❌ Error scraping section {section_name}: {e}")
    
    def find_downloadable_documents(self, soup: BeautifulSoup, base_url: str) -> List[Dict]:
        """Find downloadable documents on a page"""
        documents = []
        document_extensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx']
        
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            
            # Check if it's a document
            if any(ext in href.lower() for ext in document_extensions):
                full_url = urljoin(base_url, href)
                title = a_tag.get_text(strip=True) or a_tag.get('title', '') or 'Untitled Document'
                
                # Extract metadata
                doc_info = {
                    'url': full_url,
                    'title': title,
                    'document_type': self.classify_document_type(title, href),
                    'estimated_year': self.extract_year_from_text(title + ' ' + href),
                    'extension': Path(href).suffix.lower()
                }
                
                documents.append(doc_info)
        
        return documents
    
    def classify_document_type(self, title: str, url: str) -> str:
        """Classify document type based on title and URL"""
        text = (title + ' ' + url).lower()
        
        classifications = {
            'salary': ['sueldo', 'salari', 'remuner', 'escala'],
            'budget': ['presupuesto', 'budget'],
            'execution': ['ejecucion', 'estado.*gasto', 'estado.*recurso'],
            'tender': ['licitacion', 'contrat', 'tender'],
            'financial': ['balance', 'situacion.*econom', 'deuda'],
            'legal': ['decreto', 'ordenanza', 'resolucion'],
            'report': ['informe', 'reporte', 'estadistica']
        }
        
        for doc_type, keywords in classifications.items():
            if any(re.search(keyword, text) for keyword in keywords):
                return doc_type
        
        return 'general'
    
    def extract_year_from_text(self, text: str) -> Optional[int]:
        """Extract year from text"""
        year_match = re.search(r'(20\d{2})', text)
        if year_match:
            year = int(year_match.group(1))
            if 2009 <= year <= 2025:  # Within investigation period
                return year
        return None
    
    async def scrape_historical_archives(self):
        """Scrape historical archives using Wayback Machine API"""
        print("\n🕒 Scraping historical web archives...")
        
        # Target URLs to check in archives
        target_urls = [
            'https://www.carmensdeareco.gov.ar',
            'https://www.carmensdeareco.gov.ar/transparencia',
            'https://carmensdeareco.gob.ar',
            'http://carmensdeareco.gov.ar'
        ]
        
        for url in target_urls:
            await self.check_wayback_snapshots(url)
    
    async def check_wayback_snapshots(self, url: str):
        """Check Wayback Machine for historical snapshots"""
        try:
            wayback_api = self.archive_sources['WAYBACK_MACHINE']['api_url']
            
            # Query CDX API for snapshots
            params = {
                'url': url + '*',
                'output': 'json',
                'from': str(self.investigation_period['start_year']),
                'to': str(self.investigation_period['end_year']),
                'filter': 'statuscode:200',
                'collapse': 'timestamp:6'  # Monthly snapshots
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(wayback_api, params=params, timeout=60) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if len(data) > 1:  # First row is headers
                            snapshots = self.parse_cdx_response(data)
                            print(f"    📸 Found {len(snapshots)} historical snapshots for {url}")
                            
                            # Process representative snapshots
                            representative_snapshots = self.select_representative_snapshots(snapshots)
                            
                            for snapshot in representative_snapshots:
                                await self.process_historical_snapshot(snapshot)
                            
                            self.stats['historical_snapshots'] += len(representative_snapshots)
                        
        except Exception as e:
            print(f"    ❌ Error checking Wayback snapshots for {url}: {e}")
    
    def parse_cdx_response(self, cdx_data: List[List[str]]) -> List[Dict]:
        """Parse CDX API response into structured snapshots"""
        if len(cdx_data) < 2:
            return []
        
        headers = cdx_data[0]
        snapshots = []
        
        for row in cdx_data[1:]:
            if len(row) >= len(headers):
                snapshot = dict(zip(headers, row))
                
                # Parse timestamp
                if 'timestamp' in snapshot:
                    try:
                        ts = snapshot['timestamp']
                        date_str = f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}"
                        snapshot['date'] = datetime.strptime(date_str, '%Y-%m-%d').date()
                        snapshot['year'] = int(ts[:4])
                        
                        # Create archive URL
                        wayback_base = self.archive_sources['WAYBACK_MACHINE']['base_url']
                        snapshot['archive_url'] = f"{wayback_base}/web/{ts}/{snapshot['original']}"
                        
                        snapshots.append(snapshot)
                    except ValueError:
                        continue
        
        return snapshots
    
    def select_representative_snapshots(self, snapshots: List[Dict]) -> List[Dict]:
        """Select representative snapshots from each year/period"""
        # Group by year
        by_year = {}
        for snapshot in snapshots:
            year = snapshot['year']
            if year not in by_year:
                by_year[year] = []
            by_year[year].append(snapshot)
        
        # Select best snapshot per year (prefer end of year, then mid-year)
        representative = []
        for year, year_snapshots in by_year.items():
            # Sort by date, prefer December, then June
            year_snapshots.sort(key=lambda s: (
                s['date'].month == 12,  # Prefer December
                s['date'].month == 6,   # Then June
                s['date']
            ), reverse=True)
            
            representative.append(year_snapshots[0])
        
        return representative[:20]  # Limit to 20 snapshots max
    
    async def process_historical_snapshot(self, snapshot: Dict):
        """Process a historical snapshot"""
        try:
            # Save snapshot metadata to database
            if self.db_connection:
                cursor = self.db_connection.cursor()
                cursor.execute("""
                    INSERT INTO historical_snapshots (
                        original_url, archive_url, snapshot_date, archive_service, status
                    ) VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (archive_url) DO NOTHING
                """, (
                    snapshot['original'],
                    snapshot['archive_url'],
                    snapshot['date'],
                    'wayback_machine',
                    'discovered'
                ))
            
            print(f"      📅 {snapshot['year']}: {snapshot['archive_url']}")
            
        except Exception as e:
            print(f"      ❌ Error processing snapshot: {e}")
    
    async def save_scraped_source(self, source_name: str, url: str, content: str, 
                                status: int, content_size: int) -> Optional[int]:
        """Save scraped source information to database"""
        if not self.db_connection:
            return None
        
        try:
            cursor = self.db_connection.cursor()
            content_hash = hashlib.sha256(content.encode()).hexdigest()
            
            cursor.execute("""
                INSERT INTO scraped_sources (
                    source_name, url, content_hash, status, content_size
                ) VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (url) DO UPDATE SET
                    content_hash = %s,
                    last_scraped = NOW(),
                    status = %s,
                    content_size = %s
                RETURNING id
            """, (
                source_name, url, content_hash, f'HTTP_{status}', content_size,
                content_hash, f'HTTP_{status}', content_size
            ))
            
            result = cursor.fetchone()
            self.stats['database_records'] += 1
            return result[0] if result else None
            
        except Exception as e:
            print(f"      ❌ Error saving source: {e}")
            return None
    
    async def save_found_document(self, source_id: int, doc_info: Dict):
        """Save found document information to database"""
        if not self.db_connection:
            return
        
        try:
            cursor = self.db_connection.cursor()
            
            cursor.execute("""
                INSERT INTO found_documents (
                    source_id, url, title, document_type, estimated_year
                ) VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                source_id,
                doc_info['url'],
                doc_info['title'][:500],  # Limit title length
                doc_info['document_type'],
                doc_info['estimated_year']
            ))
            
        except Exception as e:
            print(f"      ❌ Error saving document: {e}")
    
    def generate_scraping_report(self) -> Dict[str, Any]:
        """Generate comprehensive scraping report"""
        return {
            'timestamp': datetime.now().isoformat(),
            'investigation_period': self.investigation_period,
            'scraping_stats': self.stats,
            'sources_configured': len(self.official_sources),
            'archive_sources': len(self.archive_sources),
            'success_summary': {
                'sites_accessible': self.stats['sites_checked'],
                'pages_scraped': self.stats['pages_scraped'],
                'documents_discovered': self.stats['documents_found'],
                'historical_snapshots': self.stats['historical_snapshots'],
                'database_records': self.stats['database_records'],
                'error_count': len(self.stats['errors'])
            }
        }

async def main():
    print("🌐 Official Site Scraper for Carmen de Areco Transparency Investigation")
    print("=" * 80)
    
    if not WEB_SCRAPING_AVAILABLE:
        print("❌ Web scraping libraries not available. Please install required packages.")
        return
    
    scraper = OfficialSiteScraper()
    
    try:
        # Run comprehensive scraping
        report = await scraper.scrape_all_official_sources()
        
        print(f"\n✅ Scraping Complete!")
        print(f"📊 Summary:")
        print(f"   • Sites checked: {report['success_summary']['sites_accessible']}")
        print(f"   • Pages scraped: {report['success_summary']['pages_scraped']}")
        print(f"   • Documents found: {report['success_summary']['documents_discovered']}")
        print(f"   • Historical snapshots: {report['success_summary']['historical_snapshots']}")
        print(f"   • Database records: {report['success_summary']['database_records']}")
        print(f"   • Errors: {report['success_summary']['error_count']}")
        
        if report['success_summary']['error_count'] > 0:
            print(f"\n❌ Errors encountered:")
            for error in scraper.stats['errors'][:5]:
                print(f"   • {error}")
        
        # Save report
        report_path = scraper.project_root / "data" / "scraping_reports" / f"official_scraping_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path.parent.mkdir(exist_ok=True, parents=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n📋 Report saved: {report_path}")
        
    except Exception as e:
        print(f"❌ Scraping failed: {e}")
    
    finally:
        if scraper.db_connection:
            scraper.db_connection.close()

if __name__ == "__main__":
    asyncio.run(main())
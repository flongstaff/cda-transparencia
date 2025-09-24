#!/usr/bin/env python3
"""
Enhanced External Data Collector for Carmen de Areco Transparency Portal
Integrates with all available external data sources to capture comprehensive data
"""

import asyncio
import aiohttp
import requests
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import logging
import re
import time
from typing import Dict, List, Tuple, Optional
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_collection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EnhancedExternalDataCollector:
    def __init__(self, db_path="data/external_data.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; TransparencyBot/1.0; +https://github.com/carmen-transparencia)'
        })
        self.data_sources = self._initialize_data_sources()
        self._initialize_database()

    def _initialize_data_sources(self) -> Dict:
        """Initialize all available data sources"""
        return {
            "carmen_de_areco_official": {
                "name": "Carmen de Areco Official Portal",
                "url": "https://carmendeareco.gob.ar",
                "endpoints": [
                    "/transparencia/",
                    "/presupuesto/",
                    "/licitaciones/",
                    "/declaraciones-juradas/",
                    "/boletin-oficial/",
                    "/ordenanzas/",
                    "/resoluciones/"
                ],
                "priority": 1
            },
            "boletin_oficial_nacional": {
                "name": "Boletín Oficial Nacional",
                "url": "https://www.boletinoficial.gob.ar",
                "endpoints": ["/buscadoravanzado"],
                "priority": 2
            },
            "datos_gob_ar": {
                "name": "Datos Argentina",
                "url": "https://datos.gob.ar",
                "endpoints": [
                    "/api/3/action/package_search",
                    "/dataset"
                ],
                "priority": 3
            },
            "presupuesto_abierto": {
                "name": "Presupuesto Abierto Nacional",
                "url": "https://www.presupuestoabierto.gob.ar",
                "endpoints": ["/sici/api"],
                "priority": 3
            },
            "tribunal_cuentas_ba": {
                "name": "Tribunal de Cuentas Buenos Aires",
                "url": "http://www.tcdp.gba.gov.ar",
                "endpoints": ["/"],
                "priority": 2
            },
            "gba_transparencia": {
                "name": "Provincia Buenos Aires - Transparencia",
                "url": "https://www.gba.gob.ar/transparencia_institucional",
                "endpoints": ["/"],
                "priority": 3
            },
            "contrataciones_argentina": {
                "name": "Sistema Nacional de Contrataciones",
                "url": "https://contrataciones.gov.ar",
                "endpoints": ["/consultas/consultarProcedimiento.html"],
                "priority": 3
            },
            "afip_padron": {
                "name": "AFIP - Padrón de Contribuyentes",
                "url": "https://seti.afip.gob.ar/padron-puc-constancia-internet/",
                "endpoints": ["/ConsultaConstanciaAction.do"],
                "priority": 3
            },
            "poder_ciudadano": {
                "name": "Poder Ciudadano - Transparencia",
                "url": "https://poderciudadano.org",
                "endpoints": ["/"],
                "priority": 4
            },
            "acij": {
                "name": "ACIJ - Transparencia",
                "url": "https://acij.org.ar",
                "endpoints": ["/"],
                "priority": 4
            }
        }

    def _initialize_database(self):
        """Initialize SQLite database for storing collected data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create table for external data sources
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS external_data_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_name TEXT NOT NULL,
                source_url TEXT,
                last_scraped TIMESTAMP,
                data_collected INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create table for collected data
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS collected_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id INTEGER,
                data_type TEXT NOT NULL,
                title TEXT,
                url TEXT,
                content TEXT,
                metadata TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES external_data_sources (id)
            )
        ''')

        # Create table for audit logs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data_collection_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_name TEXT,
                endpoint TEXT,
                status TEXT,
                records_processed INTEGER DEFAULT 0,
                errors_count INTEGER DEFAULT 0,
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                notes TEXT
            )
        ''')

        conn.commit()
        conn.close()

    def _insert_source(self, source_name: str, source_url: str) -> int:
        """Insert or update source in database and return ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO external_data_sources 
            (source_name, source_url, last_scraped, data_collected, status)
            VALUES (?, ?, ?, 0, 'active')
        ''', (source_name, source_url, datetime.now()))

        source_id = cursor.lastrowid
        if not source_id:
            cursor.execute('''
                SELECT id FROM external_data_sources WHERE source_name = ?
            ''', (source_name,))
            source_id = cursor.fetchone()[0]

        conn.commit()
        conn.close()
        return source_id

    def _log_collection_audit(self, source_name: str, endpoint: str, status: str, 
                            records_processed: int = 0, errors_count: int = 0, notes: str = ""):
        """Log data collection audit"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO data_collection_audit
            (source_name, endpoint, status, records_processed, errors_count, start_time, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (source_name, endpoint, status, records_processed, errors_count, datetime.now(), notes))

        conn.commit()
        conn.close()

    def _insert_collected_data(self, source_id: int, data_type: str, title: str, 
                             url: str, content: str, metadata: str = None):
        """Insert collected data into database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO collected_data (source_id, data_type, title, url, content, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (source_id, data_type, title, url, content, json.dumps(metadata) if metadata else None))

        conn.commit()
        conn.close()

    def collect_carmen_de_areco_data(self) -> Dict:
        """Collect data from Carmen de Areco official website"""
        source_name = "Carmen de Areco Official Portal"
        logger.info(f"Collecting data from {source_name}")
        
        start_time = datetime.now()
        records_collected = 0
        errors = 0
        
        try:
            source_id = self._insert_source(source_name, self.data_sources["carmen_de_areco_official"]["url"])
            
            for endpoint in self.data_sources["carmen_de_areco_official"]["endpoints"]:
                try:
                    full_url = self.data_sources["carmen_de_areco_official"]["url"] + endpoint
                    response = self.session.get(full_url, timeout=30)
                    
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Extract page title
                        title = soup.find('title')
                        title_text = title.get_text().strip() if title else f"Carmen de Areco - {endpoint}"
                        
                        # Extract all links
                        links = soup.find_all('a', href=True)
                        for link in links:
                            link_url = link['href']
                            if link_url.startswith('/'):
                                link_url = self.data_sources["carmen_de_areco_official"]["url"] + link_url
                            elif not link_url.startswith('http'):
                                link_url = self.data_sources["carmen_de_areco_official"]["url"] + '/' + link_url
                                
                            link_text = link.get_text().strip()
                            
                            self._insert_collected_data(
                                source_id=source_id,
                                data_type="link",
                                title=link_text,
                                url=link_url,
                                content="",
                                metadata={"parent_page": full_url, "text": link_text}
                            )
                            records_collected += 1
                        
                        # Store page content
                        self._insert_collected_data(
                            source_id=source_id,
                            data_type="page_content",
                            title=title_text,
                            url=full_url,
                            content=soup.get_text()[:5000],  # Limit content size
                            metadata={"page_type": "main_content", "response_status": response.status_code}
                        )
                        records_collected += 1
                        
                        logger.info(f"  Processed: {full_url} - {len(links)} links found")
                    else:
                        logger.warning(f"  Failed to access {full_url} - Status: {response.status_code}")
                        errors += 1
                        
                except Exception as e:
                    logger.error(f"  Error processing endpoint {endpoint}: {e}")
                    errors += 1
                    continue
        
        except Exception as e:
            logger.error(f"Error collecting Carmen de Areco data: {e}")
            errors += 1

        end_time = datetime.now()
        duration = end_time - start_time
        
        self._log_collection_audit(
            source_name=source_name,
            endpoint="all endpoints",
            status="completed" if errors == 0 else "partial",
            records_processed=records_collected,
            errors_count=errors,
            notes=f"Duration: {duration}, Errors: {errors}"
        )
        
        logger.info(f"Collected {records_collected} records from {source_name} with {errors} errors")
        return {
            "source": source_name,
            "records_collected": records_collected,
            "errors": errors,
            "duration": duration.total_seconds()
        }

    def collect_boletin_oficial_data(self) -> Dict:
        """Collect data from Boletín Oficial Nacional"""
        source_name = "Boletín Oficial Nacional"
        logger.info(f"Collecting data from {source_name}")
        
        start_time = datetime.now()
        records_collected = 0
        errors = 0
        
        try:
            source_id = self._insert_source(source_name, self.data_sources["boletin_oficial_nacional"]["url"])
            
            # Search for Carmen de Areco related entries
            search_params = {
                'busqueda': 'Carmen de Areco',
                'f_desde': '2020-01-01',
                'f_hasta': datetime.now().strftime('%Y-%m-%d')
            }
            
            search_url = self.data_sources["boletin_oficial_nacional"]["url"] + "/buscadoravanzado"
            response = self.session.get(search_url, params=search_params, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find results (the structure may vary, so we'll try multiple selectors)
                result_items = soup.find_all(['div', 'section'], class_=re.compile(r'resultado|busqueda|item', re.I))
                
                if not result_items:
                    result_items = soup.find_all('article')
                
                for item in result_items:
                    title_elem = item.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'div'], 
                                         class_=re.compile(r'title|titulo|name', re.I))
                    title = title_elem.get_text().strip() if title_elem else "No Title"
                    
                    link_elem = item.find('a', href=True)
                    url = link_elem['href'] if link_elem else ""
                    
                    if url and not url.startswith('http'):
                        url = self.data_sources["boletin_oficial_nacional"]["url"] + url
                    
                    content_elem = item.find(['p', 'div', 'span'], 
                                           class_=re.compile(r'description|excerpt|content', re.I))
                    content = content_elem.get_text().strip() if content_elem else ""
                    
                    if title:  # Only store if we have a title (meaningful content)
                        self._insert_collected_data(
                            source_id=source_id,
                            data_type="boletin_entry",
                            title=title,
                            url=url,
                            content=content,
                            metadata={"search_term": "Carmen de Areco", "search_date": datetime.now().isoformat()}
                        )
                        records_collected += 1
                        logger.info(f"  Found BO entry: {title[:50]}...")
            
            logger.info(f"  Found {records_collected} Boletín Oficial entries")
        except Exception as e:
            logger.error(f"Error collecting Boletín Oficial data: {e}")
            errors += 1

        end_time = datetime.now()
        duration = end_time - start_time
        
        self._log_collection_audit(
            source_name=source_name,
            endpoint="buscadoravanzado",
            status="completed" if errors == 0 else "partial",
            records_processed=records_collected,
            errors_count=errors
        )
        
        logger.info(f"Collected {records_collected} records from {source_name} with {errors} errors")
        return {
            "source": source_name,
            "records_collected": records_collected,
            "errors": errors,
            "duration": duration.total_seconds()
        }

    def collect_datos_gob_ar_data(self) -> Dict:
        """Collect data from Datos Argentina portal"""
        source_name = "Datos Argentina"
        logger.info(f"Collecting data from {source_name}")
        
        start_time = datetime.now()
        records_collected = 0
        errors = 0
        
        try:
            source_id = self._insert_source(source_name, self.data_sources["datos_gob_ar"]["url"])
            
            # API endpoint for searching datasets
            api_url = f"{self.data_sources['datos_gob_ar']['url']}/api/3/action/package_search"
            search_queries = [
                "Carmen de Areco",
                "municipio Carmen de Areco", 
                "presupuesto municipal Buenos Aires",
                "transparencia fiscal",
                "compras",
                "contrataciones",
                "licitaciones",
                "obra pública"
            ]
            
            for query in search_queries:
                try:
                    params = {
                        'q': query,
                        'rows': 100,
                        'fq': 'organization:carmen-de-areco OR tags:carmen-de-areco'
                    }
                    
                    response = self.session.get(api_url, params=params, timeout=30)
                    
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            
                            if data.get('success') and data.get('result'):
                                for package in data['result']['results']:
                                    dataset_data = {
                                        'id': package.get('id'),
                                        'title': package.get('title'),
                                        'description': package.get('notes'),
                                        'organization': package.get('organization', {}).get('title'),
                                        'tags': [tag['name'] for tag in package.get('tags', [])],
                                        'resources': len(package.get('resources', [])),
                                        'url': f"{self.data_sources['datos_gob_ar']['url']}/dataset/{package.get('name')}",
                                        'search_term': query
                                    }
                                    
                                    self._insert_collected_data(
                                        source_id=source_id,
                                        data_type="dataset",
                                        title=dataset_data['title'],
                                        url=dataset_data['url'],
                                        content=dataset_data['description'][:1000] if dataset_data['description'] else "",
                                        metadata=dataset_data
                                    )
                                    records_collected += 1
                                    logger.info(f"  Found dataset: {dataset_data['title'][:50]}...")
                                    
                        except ValueError:
                            logger.warning(f"  Non-JSON response for query '{query}'")
                            errors += 1
                    else:
                        logger.warning(f"  API request failed for '{query}' - Status: {response.status_code}")
                        errors += 1
                        
                except Exception as e:
                    logger.error(f"  Error in query '{query}': {e}")
                    errors += 1
                    continue
        
        except Exception as e:
            logger.error(f"Error collecting Datos Argentina data: {e}")
            errors += 1

        end_time = datetime.now()
        duration = end_time - start_time
        
        self._log_collection_audit(
            source_name=source_name,
            endpoint="api/3/action/package_search",
            status="completed" if errors == 0 else "partial",
            records_processed=records_collected,
            errors_count=errors
        )
        
        logger.info(f"Collected {records_collected} records from {source_name} with {errors} errors")
        return {
            "source": source_name,
            "records_collected": records_collected,
            "errors": errors,
            "duration": duration.total_seconds()
        }

    def collect_tribunal_cuentas_ba_data(self) -> Dict:
        """Collect data from Tribunal de Cuentas Buenos Aires"""
        source_name = "Tribunal de Cuentas Buenos Aires"
        logger.info(f"Collecting data from {source_name}")
        
        start_time = datetime.now()
        records_collected = 0
        errors = 0
        
        try:
            source_id = self._insert_source(source_name, self.data_sources["tribunal_cuentas_ba"]["url"])
            
            # Try to access the main page and look for Carmen de Areco mentions
            response = self.session.get(self.data_sources["tribunal_cuentas_ba"]["url"], timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for mentions of Carmen de Areco
                search_pattern = re.compile(r'Carmen de Areco', re.IGNORECASE)
                
                # Find paragraphs, links, and other content mentioning Carmen de Areco
                text_elements = soup.find_all(['p', 'a', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'])
                
                for element in text_elements:
                    if search_pattern.search(element.get_text()):
                        title = element.get_text().strip()[:100]
                        link = element.find('a', href=True)
                        url = link['href'] if link else self.data_sources["tribunal_cuentas_ba"]["url"]
                        
                        if url and not url.startswith('http'):
                            url = self.data_sources["tribunal_cuentas_ba"]["url"] + url
                        
                        self._insert_collected_data(
                            source_id=source_id,
                            data_type="tribunal_cuentas_mention",
                            title=title,
                            url=url,
                            content=element.get_text().strip(),
                            metadata={"page_url": self.data_sources["tribunal_cuentas_ba"]["url"]}
                        )
                        records_collected += 1
                        
                        logger.info(f"  Found HTC mention: {title[:50]}...")
            
            logger.info(f"  Found {records_collected} Tribunal Cuentas mentions")
        except Exception as e:
            logger.error(f"Error collecting Tribunal Cuentas data: {e}")
            errors += 1

        end_time = datetime.now()
        duration = end_time - start_time
        
        self._log_collection_audit(
            source_name=source_name,
            endpoint="/",
            status="completed" if errors == 0 else "partial",
            records_processed=records_collected,
            errors_count=errors
        )
        
        logger.info(f"Collected {records_collected} records from {source_name} with {errors} errors")
        return {
            "source": source_name,
            "records_collected": records_collected,
            "errors": errors,
            "duration": duration.total_seconds()
        }

    def collect_presupuesto_abierto_data(self) -> Dict:
        """Collect data from Presupuesto Abierto Nacional"""
        source_name = "Presupuesto Abierto Nacional"
        logger.info(f"Collecting data from {source_name}")
        
        start_time = datetime.now()
        records_collected = 0
        errors = 0
        
        try:
            source_id = self._insert_source(source_name, self.data_sources["presupuesto_abierto"]["url"])
            
            # This is an example implementation - the actual API requires authentication
            # For demonstration, we'll just document the available endpoints
            endpoints_to_check = [
                "/sici/api/busqueda/executeSearch",
                "/sici/api/indicadores",
                "/sici/api/series_tiempo"
            ]
            
            # Just document that these endpoints exist for future implementation
            for endpoint in endpoints_to_check:
                self._insert_collected_data(
                    source_id=source_id,
                    data_type="api_endpoint",
                    title=f"Presupuesto Abierto API - {endpoint}",
                    url=f"{self.data_sources['presupuesto_abierto']['url']}{endpoint}",
                    content="API endpoint available for budget data access",
                    metadata={
                        "endpoint": endpoint,
                        "requires_auth": True,
                        "needs_api_key": True
                    }
                )
                records_collected += 1
                logger.info(f"  Documented endpoint: {endpoint}")
                
        except Exception as e:
            logger.error(f"Error collecting Presupuesto Abierto data: {e}")
            errors += 1

        end_time = datetime.now()
        duration = end_time - start_time
        
        self._log_collection_audit(
            source_name=source_name,
            endpoint="/sici/api",
            status="completed" if errors == 0 else "partial",
            records_processed=records_collected,
            errors_count=errors,
            notes="API endpoints documented - requires authentication for full access"
        )
        
        logger.info(f"Collected {records_collected} records from {source_name} with {errors} errors")
        return {
            "source": source_name,
            "records_collected": records_collected,
            "errors": errors,
            "duration": duration.total_seconds()
        }

    async def collect_all_data(self) -> List[Dict]:
        """Collect data from all external sources"""
        logger.info("Starting comprehensive external data collection for Carmen de Areco")
        
        results = []
        
        # Collect data in priority order
        collection_methods = [
            (self.collect_carmen_de_areco_data, "Carmen de Areco Official Portal"),
            (self.collect_boletin_oficial_data, "Boletín Oficial Nacional"),
            (self.collect_datos_gob_ar_data, "Datos Argentina"),
            (self.collect_tribunal_cuentas_ba_data, "Tribunal de Cuentas Buenos Aires"),
            (self.collect_presupuesto_abierto_data, "Presupuesto Abierto Nacional")
        ]
        
        for method, name in collection_methods:
            logger.info(f"Collecting from: {name}")
            try:
                if asyncio.iscoroutinefunction(method):
                    result = await method()
                else:
                    result = method()
                results.append(result)
            except Exception as e:
                logger.error(f"Error collecting from {name}: {e}")
                results.append({
                    "source": name,
                    "records_collected": 0,
                    "errors": 1,
                    "duration": 0,
                    "error": str(e)
                })
        
        return results

    def generate_collection_report(self) -> str:
        """Generate a report of collected data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get summary of collected data
        cursor.execute('''
            SELECT 
                eds.source_name,
                COUNT(cd.id) as records_count,
                MAX(eds.last_scraped) as last_scraped,
                eds.status
            FROM external_data_sources eds
            LEFT JOIN collected_data cd ON eds.id = cd.source_id
            GROUP BY eds.id, eds.source_name, eds.status
        ''')
        
        sources_summary = cursor.fetchall()
        
        # Get audit summary
        cursor.execute('''
            SELECT 
                source_name,
                SUM(records_processed) as total_records,
                SUM(errors_count) as total_errors,
                COUNT(*) as collection_attempts
            FROM data_collection_audit
            GROUP BY source_name
        ''')
        
        audit_summary = cursor.fetchall()
        
        conn.close()
        
        report = f"""# External Data Collection Report
**Generated on:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Sources Summary
| Source Name | Records Collected | Last Scraped | Status |
|-------------|------------------|--------------|--------|
"""
        
        for source_name, records_count, last_scraped, status in sources_summary:
            report += f"| {source_name} | {records_count} | {last_scraped or 'Never'} | {status} |\n"
        
        report += f"""
## Collection Audit Summary
| Source Name | Total Records | Total Errors | Attempts |
|-------------|---------------|--------------|----------|
"""
        
        for source_name, total_records, total_errors, attempts in audit_summary:
            report += f"| {source_name} | {total_records} | {total_errors} | {attempts} |\n"
        
        report += f"""
## Database Location
- **Database Path:** {self.db_path}
- **Total Sources Monitored:** {len(sources_summary)}
- **Total Records Collected:** {sum(row[1] for row in sources_summary if row[1])}

## Next Steps
1. Expand API access to authenticated sources like Presupuesto Abierto
2. Implement regular monitoring and scheduled data collection
3. Add data validation and integrity checks
4. Create data visualization dashboards
"""
        
        return report

    def run_complete_collection(self):
        """Run complete external data collection and generate report"""
        logger.info("🚀 Starting Enhanced External Data Collection System")
        logger.info("=" * 70)
        
        start_time = datetime.now()
        
        try:
            # Run data collection
            results = asyncio.run(self.collect_all_data())
            
            collection_duration = datetime.now() - start_time
            
            # Generate report
            report = self.generate_collection_report()
            
            # Save report to file
            report_path = Path("data/reports/external_data_collection_report.md")
            report_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report)
            
            # Print summary
            total_records = sum(r.get('records_collected', 0) for r in results)
            total_errors = sum(r.get('errors', 0) for r in results)
            
            print(f"\n📊 COLLECTION SUMMARY:")
            print(f"   🏛️  Sources Processed: {len(results)}")
            print(f"   📄 Total Records: {total_records}")
            print(f"   ⚠️  Total Errors: {total_errors}")
            print(f"   ⏱️  Duration: {collection_duration}")
            print(f"   📋 Report: {report_path}")
            print(f"   💾 Database: {self.db_path}")
            
            print(f"\n📋 PER-SOURCE RESULTS:")
            for result in results:
                status = "❌" if result.get('errors', 0) > 0 else "✅"
                print(f"   {status} {result.get('source', 'Unknown')}: {result.get('records_collected', 0)} records")
            
            if total_errors == 0:
                print(f"\n🎉 All data collection completed successfully!")
            else:
                print(f"\n⚠️  Collection completed with {total_errors} errors. Check logs for details.")
                
            return {
                "results": results,
                "total_records": total_records,
                "total_errors": total_errors,
                "duration": collection_duration.total_seconds(),
                "report_path": str(report_path)
            }
            
        except Exception as e:
            logger.error(f"Error running complete collection: {e}")
            raise


if __name__ == "__main__":
    collector = EnhancedExternalDataCollector()
    collector.run_complete_collection()
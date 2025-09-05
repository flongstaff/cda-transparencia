#!/usr/bin/env python3
"""
Refactored PowerBI Data Extractor for Carmen de Areco
Uses the new base component architecture for better modularity
"""

import requests
import json
import pandas as pd
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import re
from urllib.parse import urljoin, urlparse
import sqlite3

# Import our base component
from base_audit_component import DataProcessor, Reporter


class PowerBIBrowserExtractor(DataProcessor):
    """Extractor that simulates browser interaction with PowerBI"""
    
    def __init__(self, output_dir="data/powerbi_extraction"):
        super().__init__("powerbi_browser_extractor", output_dir)
        
        self.powerbi_endpoints = {
            'carmen_de_areco': {
                'report_url': 'https://app.powerbi.com/view?r=eyJrIjoiYzhjNWNhNmItOWY5Zi00OWExLTliMzAtMjYxZTM0NjM1Y2Y2IiwidCI6Ijk3MDQwMmVmLWNhZGMtNDcyOC05MjI2LTk3ZGRlODY4ZDg2ZCIsImMiOjR9&pageName=ReportSection',
                'api_patterns': [
                    'https://wabi-*.powerbi.com/',
                    'https://analysis.windows.net/powerbi/api'
                ]
            }
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
    
    def process_data(self, data: Any = None) -> Dict:
        """Extract data by simulating browser interaction with PowerBI"""
        self.log_info("🖥️ Simulating browser interaction with PowerBI report")
        
        extracted_data = {
            'datasets': [],
            'tables': [],
            'records': [],
            'metadata': {}
        }
        
        try:
            # Look for data endpoints in the PowerBI report
            report_url = self.powerbi_endpoints['carmen_de_areco']['report_url']
            
            # Try to access the report
            response = self.session.get(report_url, timeout=30)
            if response.status_code == 200:
                self.log_info("✅ Successfully accessed PowerBI report")
                
                # Look for data endpoints in the response
                data_endpoints = self._find_data_endpoints(response.text)
                extracted_data['metadata']['found_endpoints'] = data_endpoints
                
                # Try to extract data from found endpoints
                for endpoint in data_endpoints:
                    try:
                        data_response = self.session.get(endpoint, timeout=30)
                        if data_response.status_code == 200:
                            # Try to parse as JSON
                            try:
                                json_data = data_response.json()
                                parsed_data = self._parse_powerbi_json(json_data)
                                extracted_data['datasets'].extend(parsed_data.get('datasets', []))
                                extracted_data['tables'].extend(parsed_data.get('tables', []))
                                extracted_data['records'].extend(parsed_data.get('records', []))
                                self.log_info(f"✅ Extracted data from endpoint: {endpoint}")
                            except:
                                # If not JSON, save raw data
                                extracted_data['records'].append({
                                    'source': endpoint,
                                    'data': data_response.text[:1000],  # First 1000 chars
                                    'full_data_available': len(data_response.text) <= 1000
                                })
                    except Exception as e:
                        self.log_error(f"Error extracting from endpoint {endpoint}: {e}")
            
        except Exception as e:
            self.log_error(f"Error in browser simulation: {e}")
        
        return extracted_data
    
    def _find_data_endpoints(self, html_content: str) -> List[str]:
        """Find potential data endpoints in HTML content"""
        endpoints = []
        
        # Look for common PowerBI data endpoint patterns
        patterns = [
            r'https://wabi-[^\"\']+',  # WABI endpoints
            r'https://api\.powerbi\.com/[^\"\']+',  # API endpoints
            r'dataSourceUrl[\"\']\\s*:\\s*[\"\']([^\"\']+)[\"\']',  # Data source URLs
            r'endpoint[\"\']\\s*:\\s*[\"\']([^\"\']+)[\"\']',  # Generic endpoints
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            endpoints.extend(matches)
        
        # Remove duplicates
        return list(set(endpoints))
    
    def _parse_powerbi_json(self, json_data: Dict) -> Dict:
        """Parse PowerBI JSON data structure"""
        parsed = {
            'datasets': [],
            'tables': [],
            'records': []
        }
        
        # Look for common PowerBI data structures
        def search_data(obj, path=""):
            if isinstance(obj, dict):
                # Check if this looks like a dataset
                if 'name' in obj and 'id' in obj and 'tables' in obj:
                    parsed['datasets'].append({
                        'name': obj.get('name'),
                        'id': obj.get('id'),
                        'table_count': len(obj.get('tables', []))
                    })
                
                # Check if this looks like a table
                if 'name' in obj and ('rows' in obj or 'columns' in obj):
                    table_data = {
                        'name': obj.get('name'),
                        'column_count': len(obj.get('columns', [])),
                        'row_count': len(obj.get('rows', []))
                    }
                    parsed['tables'].append(table_data)
                    
                    # Extract actual data rows
                    if 'rows' in obj:
                        for row in obj['rows']:
                            parsed['records'].append({
                                'table': obj.get('name'),
                                'data': row
                            })
                
                # Recursively search nested objects
                for key, value in obj.items():
                    search_data(value, f"{path}.{key}" if path else key)
            
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    search_data(item, f"{path}[{i}]")
        
        search_data(json_data)
        return parsed


class PowerBIAlternativeSourceExtractor(DataProcessor):
    """Extractor that gets data from alternative sources that might contain PowerBI data"""
    
    def __init__(self, output_dir="data/powerbi_extraction"):
        super().__init__("powerbi_alternative_extractor", output_dir)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def process_data(self, data: Any = None) -> Dict:
        """Extract data from alternative sources that might contain PowerBI data"""
        self.log_info("🔄 Extracting data from alternative sources")
        
        alternative_data = {
            'datasets': [],
            'tables': [],
            'records': [],
            'sources': []
        }
        
        # Look for alternative data sources that might contain the same data
        alternative_urls = [
            'https://carmendeareco.gob.ar/wp-content/uploads/',
            'https://carmendeareco.gob.ar/transparencia/datos-abiertos/',
            'https://carmendeareco.gob.ar/datos/',
            'https://datos.gob.ar/organization/carmen-de-areco',
        ]
        
        for url in alternative_urls:
            try:
                response = self.session.get(url, timeout=30)
                if response.status_code == 200:
                    # Look for data files that might contain PowerBI data
                    data_files = self._find_data_files(response.text, url)
                    alternative_data['sources'].extend(data_files)
                    
                    # Try to download and parse data files
                    for file_url in data_files:
                        try:
                            file_response = self.session.get(file_url, timeout=30)
                            if file_response.status_code == 200:
                                parsed_data = self._parse_data_file(file_response.content, file_url)
                                alternative_data['datasets'].extend(parsed_data.get('datasets', []))
                                alternative_data['tables'].extend(parsed_data.get('tables', []))
                                alternative_data['records'].extend(parsed_data.get('records', []))
                        except Exception as e:
                            self.log_error(f"Error parsing data file {file_url}: {e}")
            except Exception as e:
                self.log_error(f"Error accessing alternative source {url}: {e}")
        
        return alternative_data
    
    def _find_data_files(self, html_content: str, base_url: str) -> List[str]:
        """Find data files in HTML content"""
        file_patterns = [
            r'href=[\"\']([^\"\']*?\.(?:xlsx?|csv|json|xml))[\"\']',
            r'src=[\"\']([^\"\']*?\.(?:xlsx?|csv|json|xml))[\"\']',
        ]
        
        files = []
        for pattern in file_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                full_url = urljoin(base_url, match)
                files.append(full_url)
        
        return list(set(files))  # Remove duplicates
    
    def _parse_data_file(self, content: bytes, file_url: str) -> Dict:
        """Parse data file content"""
        parsed = {
            'datasets': [],
            'tables': [],
            'records': []
        }
        
        try:
            file_extension = Path(urlparse(file_url).path).suffix.lower()
            
            if file_extension in ['.xlsx', '.xls']:
                # Parse Excel file
                df = pd.read_excel(content)
                parsed['tables'].append({
                    'name': Path(urlparse(file_url).path).stem,
                    'column_count': len(df.columns),
                    'row_count': len(df)
                })
                
                # Convert first few rows to records
                for _, row in df.head(100).iterrows():
                    parsed['records'].append({
                        'source': file_url,
                        'data': row.to_dict()
                    })
            
            elif file_extension == '.csv':
                # Parse CSV file
                df = pd.read_csv(content)
                parsed['tables'].append({
                    'name': Path(urlparse(file_url).path).stem,
                    'column_count': len(df.columns),
                    'row_count': len(df)
                })
                
                # Convert first few rows to records
                for _, row in df.head(100).iterrows():
                    parsed['records'].append({
                        'source': file_url,
                        'data': row.to_dict()
                    })
            
            elif file_extension == '.json':
                # Parse JSON file
                json_data = json.loads(content)
                parsed_data = self._parse_powerbi_json(json_data)
                parsed.update(parsed_data)
                
        except Exception as e:
            self.log_error(f"Error parsing data file {file_url}: {e}")
        
        return parsed
    
    def _parse_powerbi_json(self, json_data: Dict) -> Dict:
        """Parse PowerBI JSON data structure"""
        parsed = {
            'datasets': [],
            'tables': [],
            'records': []
        }
        
        # Look for common PowerBI data structures
        def search_data(obj, path=""):
            if isinstance(obj, dict):
                # Check if this looks like a dataset
                if 'name' in obj and 'id' in obj and 'tables' in obj:
                    parsed['datasets'].append({
                        'name': obj.get('name'),
                        'id': obj.get('id'),
                        'table_count': len(obj.get('tables', []))
                    })
                
                # Check if this looks like a table
                if 'name' in obj and ('rows' in obj or 'columns' in obj):
                    table_data = {
                        'name': obj.get('name'),
                        'column_count': len(obj.get('columns', [])),
                        'row_count': len(obj.get('rows', []))
                    }
                    parsed['tables'].append(table_data)
                    
                    # Extract actual data rows
                    if 'rows' in obj:
                        for row in obj['rows']:
                            parsed['records'].append({
                                'table': obj.get('name'),
                                'data': row
                            })
                
                # Recursively search nested objects
                for key, value in obj.items():
                    search_data(value, f"{path}.{key}" if path else key)
            
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    search_data(item, f"{path}[{i}]")
        
        search_data(json_data)
        return parsed


class PowerBIAPIExplorer(DataProcessor):
    """Explores potential API endpoints for data access"""
    
    def __init__(self, output_dir="data/powerbi_extraction"):
        super().__init__("powerbi_api_explorer", output_dir)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def process_data(self, data: Any = None) -> Dict:
        """Explore potential API endpoints for data access"""
        self.log_info("🔍 Exploring API endpoints for data access")
        
        api_data = {
            'datasets': [],
            'tables': [],
            'records': [],
            'endpoints': []
        }
        
        # Common API endpoint patterns for municipal data
        api_patterns = [
            'https://carmendeareco.gob.ar/api/',
            'https://carmendeareco.gob.ar/wp-json/wp/v2/',
            'https://carmendeareco.gob.ar/transparencia/api/',
            'https://datos.gob.ar/api/',
        ]
        
        # Common endpoints to try
        common_endpoints = [
            'presupuesto',
            'gastos',
            'ingresos',
            'salarios',
            'licitaciones',
            'contratos',
            'obras',
            'declaraciones',
            'datos-abiertos',
            'transparencia'
        ]
        
        for base_url in api_patterns:
            for endpoint in common_endpoints:
                try:
                    full_url = urljoin(base_url, endpoint)
                    response = self.session.get(full_url, timeout=10)
                    
                    if response.status_code == 200:
                        api_data['endpoints'].append({
                            'url': full_url,
                            'status': 'accessible',
                            'content_type': response.headers.get('content-type', ''),
                            'size': len(response.content)
                        })
                        
                        # Try to parse JSON response
                        if 'application/json' in response.headers.get('content-type', ''):
                            try:
                                json_data = response.json()
                                parsed_data = self._parse_powerbi_json(json_data)
                                api_data['datasets'].extend(parsed_data.get('datasets', []))
                                api_data['tables'].extend(parsed_data.get('tables', []))
                                api_data['records'].extend(parsed_data.get('records', []))
                            except:
                                pass
                    elif response.status_code == 401:
                        api_data['endpoints'].append({
                            'url': full_url,
                            'status': 'requires_authentication',
                            'content_type': response.headers.get('content-type', ''),
                            'size': 0
                        })
                        
                except Exception as e:
                    self.log_debug(f"Endpoint {full_url} not accessible: {e}")
        
        return api_data
    
    def _parse_powerbi_json(self, json_data: Dict) -> Dict:
        """Parse PowerBI JSON data structure"""
        parsed = {
            'datasets': [],
            'tables': [],
            'records': []
        }
        
        # Look for common PowerBI data structures
        def search_data(obj, path=""):
            if isinstance(obj, dict):
                # Check if this looks like a dataset
                if 'name' in obj and 'id' in obj and 'tables' in obj:
                    parsed['datasets'].append({
                        'name': obj.get('name'),
                        'id': obj.get('id'),
                        'table_count': len(obj.get('tables', []))
                    })
                
                # Check if this looks like a table
                if 'name' in obj and ('rows' in obj or 'columns' in obj):
                    table_data = {
                        'name': obj.get('name'),
                        'column_count': len(obj.get('columns', [])),
                        'row_count': len(obj.get('rows', []))
                    }
                    parsed['tables'].append(table_data)
                    
                    # Extract actual data rows
                    if 'rows' in obj:
                        for row in obj['rows']:
                            parsed['records'].append({
                                'table': obj.get('name'),
                                'data': row
                            })
                
                # Recursively search nested objects
                for key, value in obj.items():
                    search_data(value, f"{path}.{key}" if path else key)
            
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    search_data(item, f"{path}[{i}]")
        
        search_data(json_data)
        return parsed


class PowerBIDataExtractor(DataProcessor):
    """Main PowerBI data extractor that coordinates all extraction methods"""
    
    def __init__(self, output_dir="data/powerbi_extraction"):
        super().__init__("powerbi_data_extractor", output_dir)
        
        # Initialize all extractors
        self.browser_extractor = PowerBIBrowserExtractor(output_dir)
        self.alternative_extractor = PowerBIAlternativeSourceExtractor(output_dir)
        self.api_explorer = PowerBIAPIExplorer(output_dir)
        
        # Database for extracted data
        self.db_path = self.output_dir / "powerbi_data.db"
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize SQLite database for PowerBI data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables for extracted data
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS powerbi_datasets (
                id INTEGER PRIMARY KEY,
                dataset_name TEXT,
                dataset_id TEXT,
                extracted_date TEXT,
                data_size INTEGER,
                record_count INTEGER
            );
            
            CREATE TABLE IF NOT EXISTS powerbi_tables (
                id INTEGER PRIMARY KEY,
                dataset_id INTEGER,
                table_name TEXT,
                column_count INTEGER,
                row_count INTEGER,
                FOREIGN KEY (dataset_id) REFERENCES powerbi_datasets (id)
            );
            
            CREATE TABLE IF NOT EXISTS powerbi_data_records (
                id INTEGER PRIMARY KEY,
                table_id INTEGER,
                record_data TEXT,
                extracted_date TEXT,
                FOREIGN KEY (table_id) REFERENCES powerbi_tables (id)
            );
            
            CREATE TABLE IF NOT EXISTS extraction_sessions (
                id INTEGER PRIMARY KEY,
                session_date TEXT,
                datasets_extracted INTEGER,
                records_extracted INTEGER,
                success_rate REAL,
                notes TEXT
            );
        ''')
        
        conn.commit()
        conn.close()
    
    def process_data(self, data: Any = None) -> Dict:
        """Run complete PowerBI data extraction process"""
        self.log_info("🔓 Starting PowerBI Data Extraction for Carmen de Areco")
        
        all_extracted_data = {
            'datasets': [],
            'tables': [],
            'records': [],
            'sources': [],
            'endpoints': []
        }
        
        # 1. Extract via browser simulation
        self.log_info("Phase 1: Browser simulation extraction")
        browser_data = self.browser_extractor.process_data()
        self._merge_data(all_extracted_data, browser_data)
        
        # 2. Extract via alternative sources
        self.log_info("Phase 2: Alternative source extraction")
        alternative_data = self.alternative_extractor.process_data()
        self._merge_data(all_extracted_data, alternative_data)
        
        # 3. Extract via API exploration
        self.log_info("Phase 3: API exploration")
        api_data = self.api_explorer.process_data()
        self._merge_data(all_extracted_data, api_data)
        
        # 4. Save to database
        records_saved = self.save_extracted_data(all_extracted_data)
        
        # 5. Generate report
        report = self.generate_extraction_report(all_extracted_data, records_saved)
        
        # 6. Export for frontend
        export_file = self.export_for_frontend(all_extracted_data, report)
        
        # 7. Print summary
        print("\n" + "="*70)
        print("POWERBI DATA EXTRACTION RESULTS")
        print("="*70)
        print(f"Datasets Extracted: {report['summary']['datasets_extracted']}")
        print(f"Tables Extracted: {report['summary']['tables_extracted']}")
        print(f"Records Extracted: {report['summary']['records_extracted']}")
        print(f"Records Saved to DB: {records_saved}")
        print(f"Data Exported To: {export_file}")
        print("="*70)
        
        return {
            'data': all_extracted_data,
            'report': report,
            'export_file': export_file
        }
    
    def _merge_data(self, target: Dict, source: Dict):
        """Merge source data into target data structure"""
        for key in ['datasets', 'tables', 'records', 'sources', 'endpoints']:
            if key in source:
                target[key].extend(source[key])
    
    def save_extracted_data(self, data: Dict) -> int:
        """Save extracted data to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        records_saved = 0
        
        try:
            # Save datasets
            for dataset in data.get('datasets', []):
                cursor.execute('''
                    INSERT INTO powerbi_datasets 
                    (dataset_name, dataset_id, extracted_date, data_size, record_count)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    dataset.get('name', 'Unknown'),
                    dataset.get('id', ''),
                    datetime.now().isoformat(),
                    0,  # Would calculate actual size
                    dataset.get('table_count', 0)
                ))
            
            # Save tables
            for table in data.get('tables', []):
                # First get the last dataset ID
                cursor.execute('SELECT id FROM powerbi_datasets ORDER BY id DESC LIMIT 1')
                dataset_result = cursor.fetchone()
                dataset_id = dataset_result[0] if dataset_result else 1
                
                cursor.execute('''
                    INSERT INTO powerbi_tables 
                    (dataset_id, table_name, column_count, row_count)
                    VALUES (?, ?, ?, ?)
                ''', (
                    dataset_id,
                    table.get('name', 'Unknown'),
                    table.get('column_count', 0),
                    table.get('row_count', 0)
                ))
            
            # Save records
            for record in data.get('records', []):
                # First get the last table ID
                cursor.execute('SELECT id FROM powerbi_tables ORDER BY id DESC LIMIT 1')
                table_result = cursor.fetchone()
                table_id = table_result[0] if table_result else 1
                
                cursor.execute('''
                    INSERT INTO powerbi_data_records 
                    (table_id, record_data, extracted_date)
                    VALUES (?, ?, ?)
                ''', (
                    table_id,
                    json.dumps(record.get('data', {}), ensure_ascii=False),
                    datetime.now().isoformat()
                ))
                records_saved += 1
            
            conn.commit()
            
        except Exception as e:
            self.log_error(f"Error saving extracted data: {e}")
            conn.rollback()
        
        conn.close()
        return records_saved
    
    def generate_extraction_report(self, data: Dict, records_saved: int) -> Dict:
        """Generate extraction report"""
        report = {
            'report_date': datetime.now().isoformat(),
            'summary': {
                'datasets_extracted': len(data.get('datasets', [])),
                'tables_extracted': len(data.get('tables', [])),
                'records_extracted': len(data.get('records', [])),
                'records_saved': records_saved,
                'alternative_sources': len(data.get('sources', [])),
                'api_endpoints': len(data.get('endpoints', []))
            },
            'data_sources': {
                'browser_simulation': 'PowerBI report access',
                'alternative_sources': data.get('sources', []),
                'api_exploration': [ep.get('url') for ep in data.get('endpoints', [])]
            },
            'methodology': [
                'Browser simulation to access PowerBI data',
                'Alternative source exploration',
                'API endpoint discovery',
                'Multiple bypass techniques'
            ]
        }
        
        # Save report
        report_file = self.output_dir / f"powerbi_extraction_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        self.log_info(f"Extraction report generated: {report_file}")
        return report
    
    def export_for_frontend(self, data: Dict, report: Dict) -> str:
        """Export data for frontend visualization"""
        export_data = {
            'timestamp': datetime.now().isoformat(),
            'extraction_report': report,
            'extracted_data': {
                'datasets': data.get('datasets', [])[:50],  # Limit for frontend
                'tables': data.get('tables', [])[:100],     # Limit for frontend
                'records_sample': data.get('records', [])[:200]  # Limit for frontend
            },
            'raw_data_available': len(data.get('records', [])) > 200
        }
        
        export_file = self.output_dir / f"powerbi_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)
        
        self.log_info(f"Data exported for frontend: {export_file}")
        return str(export_file)


if __name__ == "__main__":
    # Initialize extractor
    extractor = PowerBIDataExtractor()
    
    # Run complete extraction
    try:
        results = extractor.process_data()
        print("\n✅ PowerBI data extraction completed successfully")
        exit(0)
    except Exception as e:
        logging.error(f"❌ PowerBI data extraction failed: {e}")
        exit(1)
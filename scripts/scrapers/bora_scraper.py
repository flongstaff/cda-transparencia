#!/usr/bin/env python3
"""
BORA (Boletín Oficial) Scraper for Argentine Official Gazette
Based on: https://github.com/juancarlospaco/borapp
Enhanced for Carmen de Areco municipal transparency
"""

import requests
import json
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
import logging
from pathlib import Path
import time
from typing import Dict, List, Optional, Tuple
import urllib.parse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BORAScraperCarmenDeAreco:
    """Enhanced BORA scraper specifically for Carmen de Areco municipal data"""
    
    def __init__(self, output_dir="data/bora_scrape"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Argentine government endpoints
        self.base_urls = {
            'bora_nacional': 'https://www.boletinoficial.gob.ar',
            'bora_pba': 'https://www.gba.gob.ar/boletin_oficial',
            'carmen_areco': 'https://carmendeareco.gob.ar',
            'infoleg': 'http://servicios.infoleg.gob.ar',
            'argentina_datos': 'https://datos.gob.ar'
        }
        
        # Municipal-specific search terms for Carmen de Areco
        self.search_terms = {
            'presupuesto': ['presupuesto municipal', 'ejecucion presupuestaria', 'partidas presupuestarias'],
            'licitaciones': ['licitacion publica', 'concurso de precios', 'contratacion directa'],
            'ordenanzas': ['ordenanza', 'decreto municipal', 'resolucion'],
            'personal': ['designacion', 'personal municipal', 'sueldos', 'escalafon'],
            'obras': ['obra publica', 'infraestructura', 'pavimentacion', 'construccion'],
            'servicios': ['servicios publicos', 'recoleccion', 'alumbrado', 'agua potable']
        }
        
        # Headers to avoid blocking
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        # Rate limiting
        self.delay_between_requests = 2  # seconds
        
    def search_bora_nacional(self, search_term: str, start_date: str, end_date: str) -> List[Dict]:
        """Search national BORA for Carmen de Areco references"""
        results = []
        
        try:
            # Build search URL for national BORA
            search_url = f"{self.base_urls['bora_nacional']}/busqueda/avanzada"
            
            params = {
                'texto': f'"{search_term}" carmen de areco',
                'fecha_desde': start_date,
                'fecha_hasta': end_date,
                'seccion': 'todas',
                'tipo_norma': 'todas'
            }
            
            logger.info(f"Searching BORA Nacional for: {search_term}")
            response = self.session.get(search_url, params=params, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Parse BORA search results
                for result in soup.find_all('div', class_='resultado'):
                    try:
                        title_elem = result.find('h3')
                        date_elem = result.find('span', class_='fecha')
                        content_elem = result.find('p', class_='resumen')
                        link_elem = result.find('a', href=True)
                        
                        if title_elem and date_elem:
                            results.append({
                                'source': 'BORA Nacional',
                                'title': title_elem.get_text(strip=True),
                                'date': self._parse_date(date_elem.get_text(strip=True)),
                                'content': content_elem.get_text(strip=True) if content_elem else '',
                                'url': urllib.parse.urljoin(self.base_urls['bora_nacional'], link_elem['href']) if link_elem else '',
                                'search_term': search_term,
                                'extracted_at': datetime.now().isoformat()
                            })
                    except Exception as e:
                        logger.warning(f"Error parsing BORA result: {e}")
                        continue
            
            time.sleep(self.delay_between_requests)
            
        except Exception as e:
            logger.error(f"Error searching BORA Nacional: {e}")
        
        return results
    
    def search_bora_pba(self, search_term: str, year: int) -> List[Dict]:
        """Search Buenos Aires Province BORA"""
        results = []
        
        try:
            # Buenos Aires Province BORA structure
            search_url = f"{self.base_urls['bora_pba']}/busqueda"
            
            params = {
                'q': f'carmen de areco {search_term}',
                'año': year,
                'tipo': 'decreto,resolucion,disposicion'
            }
            
            logger.info(f"Searching BORA PBA for: {search_term} ({year})")
            response = self.session.get(search_url, params=params, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Parse PBA BORA results
                for result in soup.find_all('article', class_='boletin-item'):
                    try:
                        title_elem = result.find('h2')
                        number_elem = result.find('span', class_='numero')
                        date_elem = result.find('time')
                        summary_elem = result.find('div', class_='resumen')
                        
                        if title_elem:
                            results.append({
                                'source': 'BORA PBA',
                                'title': title_elem.get_text(strip=True),
                                'number': number_elem.get_text(strip=True) if number_elem else '',
                                'date': date_elem.get('datetime') if date_elem else '',
                                'summary': summary_elem.get_text(strip=True) if summary_elem else '',
                                'search_term': search_term,
                                'year': year,
                                'extracted_at': datetime.now().isoformat()
                            })
                    except Exception as e:
                        logger.warning(f"Error parsing PBA BORA result: {e}")
                        continue
            
            time.sleep(self.delay_between_requests)
            
        except Exception as e:
            logger.error(f"Error searching BORA PBA: {e}")
        
        return results
    
    def scrape_municipal_documents(self) -> List[Dict]:
        """Scrape Carmen de Areco municipal website for documents"""
        results = []
        
        # Common municipal document paths
        document_paths = [
            '/transparencia',
            '/presupuesto',
            '/licitaciones', 
            '/ordenanzas',
            '/decretos',
            '/resoluciones',
            '/boletin-municipal',
            '/obras-publicas'
        ]
        
        for path in document_paths:
            try:
                url = f"{self.base_urls['carmen_areco']}{path}"
                logger.info(f"Scraping: {url}")
                
                response = self.session.get(url, timeout=30)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find document links
                    for link in soup.find_all('a', href=True):
                        href = link.get('href')
                        text = link.get_text(strip=True)
                        
                        # Check if it's a document link
                        if any(ext in href.lower() for ext in ['.pdf', '.doc', '.xls']) or \
                           any(keyword in text.lower() for keyword in ['descargar', 'documento', 'archivo', 'pdf']):
                            
                            full_url = urllib.parse.urljoin(url, href)
                            
                            results.append({
                                'source': 'Municipal Website',
                                'section': path.replace('/', ''),
                                'title': text,
                                'url': full_url,
                                'type': self._determine_document_type(text, path),
                                'found_at': url,
                                'extracted_at': datetime.now().isoformat()
                            })
                
                time.sleep(self.delay_between_requests)
                
            except Exception as e:
                logger.error(f"Error scraping {path}: {e}")
                continue
        
        return results
    
    def extract_budget_references(self, year: int = None) -> Dict:
        """Extract specific budget-related information"""
        if year is None:
            year = datetime.now().year
        
        budget_data = {
            'year': year,
            'bora_nacional': [],
            'bora_pba': [],
            'municipal_docs': [],
            'summary': {}
        }
        
        # Search in all BORA sources
        for term in self.search_terms['presupuesto']:
            # National BORA
            start_date = f"{year}-01-01"
            end_date = f"{year}-12-31"
            nacional_results = self.search_bora_nacional(term, start_date, end_date)
            budget_data['bora_nacional'].extend(nacional_results)
            
            # PBA BORA
            pba_results = self.search_bora_pba(term, year)
            budget_data['bora_pba'].extend(pba_results)
        
        # Municipal documents
        municipal_docs = self.scrape_municipal_documents()
        budget_docs = [doc for doc in municipal_docs if 'presupuesto' in doc.get('title', '').lower()]
        budget_data['municipal_docs'] = budget_docs
        
        # Generate summary
        budget_data['summary'] = {
            'total_nacional': len(budget_data['bora_nacional']),
            'total_pba': len(budget_data['bora_pba']),
            'total_municipal': len(budget_data['municipal_docs']),
            'extraction_date': datetime.now().isoformat()
        }
        
        return budget_data
    
    def comprehensive_scrape(self, years: List[int] = None) -> Dict:
        """Comprehensive scrape of all available data"""
        if years is None:
            current_year = datetime.now().year
            years = list(range(2018, current_year + 1))
        
        all_data = {
            'metadata': {
                'scrape_date': datetime.now().isoformat(),
                'years_scraped': years,
                'sources': list(self.base_urls.keys())
            },
            'by_year': {},
            'by_category': {category: [] for category in self.search_terms.keys()},
            'municipal_documents': [],
            'statistics': {}
        }
        
        # Scrape municipal documents once
        logger.info("Scraping municipal documents...")
        all_data['municipal_documents'] = self.scrape_municipal_documents()
        
        # Process each year
        for year in years:
            logger.info(f"Processing year {year}...")
            year_data = {'bora_nacional': [], 'bora_pba': []}
            
            # Search each category
            for category, terms in self.search_terms.items():
                logger.info(f"  Processing category: {category}")
                category_results = []
                
                for term in terms:
                    # BORA Nacional
                    nacional_results = self.search_bora_nacional(
                        term, f"{year}-01-01", f"{year}-12-31"
                    )
                    year_data['bora_nacional'].extend(nacional_results)
                    category_results.extend(nacional_results)
                    
                    # BORA PBA
                    pba_results = self.search_bora_pba(term, year)
                    year_data['bora_pba'].extend(pba_results)
                    category_results.extend(pba_results)
                
                all_data['by_category'][category].extend(category_results)
            
            all_data['by_year'][year] = year_data
        
        # Generate statistics
        all_data['statistics'] = self._generate_statistics(all_data)
        
        return all_data
    
    def save_results(self, data: Dict, filename: str = None):
        """Save scraping results to files"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"bora_scrape_{timestamp}"
        
        # Save as JSON
        json_file = self.output_dir / f"{filename}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Save summary as CSV if applicable
        if 'by_year' in data:
            csv_data = []
            for year, year_data in data['by_year'].items():
                for source, results in year_data.items():
                    for result in results:
                        result['year'] = year
                        result['source'] = source
                        csv_data.append(result)
            
            if csv_data:
                df = pd.DataFrame(csv_data)
                csv_file = self.output_dir / f"{filename}.csv"
                df.to_csv(csv_file, index=False, encoding='utf-8')
        
        logger.info(f"Results saved to {self.output_dir}/{filename}.*")
        return json_file
    
    def _parse_date(self, date_str: str) -> str:
        """Parse various date formats from BORA"""
        try:
            # Common date patterns in Argentine documents
            patterns = [
                r'(\d{1,2})/(\d{1,2})/(\d{4})',  # DD/MM/YYYY
                r'(\d{1,2})-(\d{1,2})-(\d{4})',  # DD-MM-YYYY
                r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
            ]
            
            for pattern in patterns:
                match = re.search(pattern, date_str)
                if match:
                    if len(match.group(1)) == 4:  # YYYY-MM-DD
                        return f"{match.group(1)}-{match.group(2):0>2}-{match.group(3):0>2}"
                    else:  # DD/MM/YYYY or DD-MM-YYYY
                        return f"{match.group(3)}-{match.group(2):0>2}-{match.group(1):0>2}"
        except Exception as e:
            logger.warning(f"Error parsing date '{date_str}': {e}")
        
        return date_str
    
    def _determine_document_type(self, title: str, path: str) -> str:
        """Determine document type based on title and path"""
        title_lower = title.lower()
        path_lower = path.lower()
        
        type_indicators = {
            'presupuesto': ['presupuesto', 'ejecucion', 'partida'],
            'licitacion': ['licitacion', 'concurso', 'contrat'],
            'ordenanza': ['ordenanza', 'decreto', 'resolucion'],
            'personal': ['designacion', 'sueldo', 'personal', 'escalafon'],
            'obra': ['obra', 'infraestructura', 'construccion'],
            'servicio': ['servicio', 'recoleccion', 'agua', 'luz']
        }
        
        for doc_type, indicators in type_indicators.items():
            if any(indicator in title_lower or indicator in path_lower for indicator in indicators):
                return doc_type
        
        return 'general'
    
    def _generate_statistics(self, data: Dict) -> Dict:
        """Generate summary statistics from scraped data"""
        stats = {
            'total_documents': len(data['municipal_documents']),
            'by_source': {},
            'by_year': {},
            'by_category': {},
            'document_types': {}
        }
        
        # Count by source
        for year_data in data['by_year'].values():
            for source, results in year_data.items():
                stats['by_source'][source] = stats['by_source'].get(source, 0) + len(results)
        
        # Count by year
        for year, year_data in data['by_year'].items():
            total = sum(len(results) for results in year_data.values())
            stats['by_year'][year] = total
        
        # Count by category
        for category, results in data['by_category'].items():
            stats['by_category'][category] = len(results)
        
        # Count document types
        for doc in data['municipal_documents']:
            doc_type = doc.get('type', 'unknown')
            stats['document_types'][doc_type] = stats['document_types'].get(doc_type, 0) + 1
        
        return stats

def main():
    """Main execution function"""
    scraper = BORAScraperCarmenDeAreco()
    
    # Comprehensive scrape for the last 5 years
    current_year = datetime.now().year
    years_to_scrape = list(range(2020, current_year + 1))
    
    logger.info("Starting comprehensive BORA scrape for Carmen de Areco...")
    results = scraper.comprehensive_scrape(years_to_scrape)
    
    # Save results
    output_file = scraper.save_results(results)
    
    # Print summary
    stats = results['statistics']
    print("\n" + "="*50)
    print("BORA SCRAPING SUMMARY")
    print("="*50)
    print(f"Total municipal documents found: {stats['total_documents']}")
    print(f"BORA Nacional entries: {stats['by_source'].get('bora_nacional', 0)}")
    print(f"BORA PBA entries: {stats['by_source'].get('bora_pba', 0)}")
    print(f"Years processed: {', '.join(map(str, years_to_scrape))}")
    print(f"Results saved to: {output_file}")
    print("="*50)

if __name__ == "__main__":
    main()
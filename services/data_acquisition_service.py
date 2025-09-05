#!/usr/bin/env python3
"""
Unified Data Acquisition Service
Consolidates web scraping and API integration to eliminate redundancy
"""

import requests
import json
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from urllib.parse import urljoin, urlparse
import time
import hashlib

class UnifiedDataAcquisitionService:
    """Single service for all data acquisition needs"""
    
    def __init__(self, output_dir="data/acquired_data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Session with common headers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Carmen-de-Areco-Transparency-System/1.0'
        })
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 1.0  # seconds
        
        # Source configurations
        self.sources = {
            "municipal_website": {
                "base_url": "https://carmendeareco.gob.ar",
                "paths": ["/transparencia", "/presupuesto", "/licitaciones"],
                "document_types": ["pdf", "xlsx", "docx"]
            },
            "bora_nacional": {
                "base_url": "https://www.boletinoficial.gob.ar",
                "search_endpoint": "/busqueda/avanzada",
                "document_types": ["pdf"]
            },
            "bora_provincial": {
                "base_url": "https://www.gba.gob.ar/boletin_oficial",
                "document_types": ["pdf"]
            },
            "datos_gob_ar": {
                "api_base": "https://datos.gob.ar/api/3/action",
                "endpoints": {
                    "search": "/package_search",
                    "show": "/package_show"
                }
            },
            "presupuesto_abierto": {
                "api_base": "https://www.presupuestoabierto.gob.ar/sici/api",
                "endpoints": {
                    "jurisdiction": "/jurisdiction",
                    "data": "/data"
                }
            }
        }
    
    def _rate_limit(self):
        """Implement basic rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    def discover_documents_municipal(self) -> List[Dict[str, Any]]:
        """Discover documents on the municipal website"""
        self.logger.info("Discovering documents on municipal website")
        
        documents = []
        municipal_config = self.sources["municipal_website"]
        
        for path in municipal_config["paths"]:
            try:
                url = urljoin(municipal_config["base_url"], path)
                self._rate_limit()
                
                response = self.session.get(url, timeout=30)
                if response.status_code == 200:
                    from bs4 import BeautifulSoup
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find document links
                    for link in soup.find_all('a', href=True):
                        href = link.get('href')
                        text = link.get_text(strip=True)
                        
                        # Check if it's a document link
                        if any(href.lower().endswith(ext) for ext in municipal_config["document_types"]):
                            full_url = urljoin(url, href)
                            documents.append({
                                "url": full_url,
                                "title": text,
                                "source": "municipal_website",
                                "path": path,
                                "discovered_at": datetime.now().isoformat()
                            })
                
            except Exception as e:
                self.logger.error(f"Error discovering documents on {path}: {e}")
        
        self.logger.info(f"Found {len(documents)} documents on municipal website")
        return documents
    
    def search_bora_nacional(self, query: str, start_date: str = None, end_date: str = None) -> List[Dict[str, Any]]:
        """Search national BORA for documents"""
        self.logger.info(f"Searching BORA Nacional for: {query}")
        
        try:
            bora_config = self.sources["bora_nacional"]
            search_url = urljoin(bora_config["base_url"], bora_config["search_endpoint"])
            
            params = {"texto": query}
            if start_date:
                params["fecha_desde"] = start_date
            if end_date:
                params["fecha_hasta"] = end_date
            
            self._rate_limit()
            response = self.session.get(search_url, params=params, timeout=30)
            
            if response.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.content, 'html.parser')
                
                documents = []
                # Parse search results (this would need to be adapted to BORA's actual HTML structure)
                for result in soup.find_all('div', class_='resultado'):
                    try:
                        title_elem = result.find('h3')
                        date_elem = result.find('span', class_='fecha')
                        
                        if title_elem:
                            documents.append({
                                "title": title_elem.get_text(strip=True),
                                "date": date_elem.get_text(strip=True) if date_elem else "",
                                "source": "bora_nacional",
                                "query": query,
                                "discovered_at": datetime.now().isoformat()
                            })
                    except Exception as e:
                        continue
                
                self.logger.info(f"Found {len(documents)} documents in BORA Nacional")
                return documents
        
        except Exception as e:
            self.logger.error(f"Error searching BORA Nacional: {e}")
        
        return []
    
    def search_datos_gob_ar(self, query: str) -> List[Dict[str, Any]]:
        """Search datos.gob.ar API for datasets"""
        self.logger.info(f"Searching datos.gob.ar for: {query}")
        
        try:
            datos_config = self.sources["datos_gob_ar"]
            search_url = urljoin(datos_config["api_base"], datos_config["endpoints"]["search"])
            
            params = {"q": query}
            self._rate_limit()
            response = self.session.get(search_url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    datasets = data.get("result", {}).get("results", [])
                    self.logger.info(f"Found {len(datasets)} datasets on datos.gob.ar")
                    return datasets
        
        except Exception as e:
            self.logger.error(f"Error searching datos.gob.ar: {e}")
        
        return []
    
    def get_presupuesto_abierto_data(self, jurisdiction: str = "carmen-de-areco") -> Dict[str, Any]:
        """Get data from Presupuesto Abierto API"""
        self.logger.info(f"Getting Presupuesto Abierto data for: {jurisdiction}")
        
        try:
            pa_config = self.sources["presupuesto_abierto"]
            data_url = urljoin(pa_config["api_base"], pa_config["endpoints"]["data"])
            
            params = {"jurisdiction": jurisdiction}
            self._rate_limit()
            response = self.session.get(data_url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.logger.info("Successfully retrieved Presupuesto Abierto data")
                return data
        
        except Exception as e:
            self.logger.error(f"Error getting Presupuesto Abierto data: {e}")
        
        return {}
    
    def download_document(self, url: str, filename: str = None) -> Optional[Path]:
        """Download a document from URL"""
        try:
            self._rate_limit()
            response = self.session.get(url, timeout=60)
            response.raise_for_status()
            
            if filename is None:
                # Generate filename from URL
                parsed_url = urlparse(url)
                filename = Path(parsed_url.path).name
                if not filename or '.' not in filename:
                    filename = f"document_{hashlib.md5(url.encode()).hexdigest()[:8]}.pdf"
            
            filepath = self.output_dir / filename
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            self.logger.info(f"Downloaded: {filename}")
            return filepath
        
        except Exception as e:
            self.logger.error(f"Error downloading {url}: {e}")
            return None
    
    def acquire_all_sources(self, search_terms: List[str] = None) -> Dict[str, Any]:
        """Acquire data from all configured sources"""
        if search_terms is None:
            search_terms = ["carmen de areco", "municipalidad carmen de areco"]
        
        results = {
            "acquisition_started": datetime.now().isoformat(),
            "sources": {},
            "documents": [],
            "datasets": [],
            "api_data": {}
        }
        
        # 1. Discover municipal documents
        results["sources"]["municipal_website"] = "discovering"
        municipal_docs = self.discover_documents_municipal()
        results["documents"].extend(municipal_docs)
        results["sources"]["municipal_website"] = f"found {len(municipal_docs)} documents"
        
        # 2. Search BORA Nacional
        results["sources"]["bora_nacional"] = "searching"
        for term in search_terms:
            bora_docs = self.search_bora_nacional(term)
            results["documents"].extend(bora_docs)
        results["sources"]["bora_nacional"] = f"found {len([d for d in results['documents'] if d.get('source') == 'bora_nacional'])} documents"
        
        # 3. Search datos.gob.ar
        results["sources"]["datos_gob_ar"] = "searching"
        for term in search_terms:
            datasets = self.search_datos_gob_ar(term)
            results["datasets"].extend(datasets)
        results["sources"]["datos_gob_ar"] = f"found {len(results['datasets'])} datasets"
        
        # 4. Get Presupuesto Abierto data
        results["sources"]["presupuesto_abierto"] = "retrieving"
        pa_data = self.get_presupuesto_abierto_data()
        results["api_data"]["presupuesto_abierto"] = pa_data
        results["sources"]["presupuesto_abierto"] = "completed"
        
        # Save results
        results["acquisition_completed"] = datetime.now().isoformat()
        results_file = self.output_dir / f"acquisition_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Acquisition complete. Results saved to: {results_file}")
        return results

if __name__ == "__main__":
    # Example usage
    service = UnifiedDataAcquisitionService()
    
    # Acquire data from all sources
    # results = service.acquire_all_sources()
    
    print("Unified Data Acquisition Service initialized")
    print(f"Output directory: {service.output_dir}")
    print("Available methods:")
    print("  - discover_documents_municipal()")
    print("  - search_bora_nacional(query)")
    print("  - search_datos_gob_ar(query)")
    print("  - get_presupuesto_abierto_data()")
    print("  - download_document(url)")
    print("  - acquire_all_sources()")
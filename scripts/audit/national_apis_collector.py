#!/usr/bin/env python3
"""
National APIs Data Collector
Comprehensive integration with Argentine government APIs and databases
"""

import requests
import json
import csv
import io
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
import time
import logging
from bs4 import BeautifulSoup
import pandas as pd
import urllib3
urllib3.disable_warnings()

class NationalAPIsCollector:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Carmen-Transparencia-Audit/1.0',
            'Accept': 'application/json, text/html, */*'
        })
        
        self.data_dir = Path("data/national_apis")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Initialize API endpoints from your comprehensive resource list
        self.apis = self._setup_api_endpoints()
        
    def _setup_api_endpoints(self):
        """Setup all API endpoints from the comprehensive resource document"""
        return {
            # National Open Data
            "datos_argentina": {
                "base_url": "https://datos.gob.ar/api/3/action/",
                "search_url": "https://datos.gob.ar/dataset",
                "rate_limit": 1.0,
                "description": "Portal Nacional de Datos Abiertos"
            },
            
            # Budget and Financial APIs
            "presupuesto_abierto": {
                "base_url": "https://www.presupuestoabierto.gob.ar/sici/api/",
                "rate_limit": 1.5,
                "description": "Presupuesto Abierto Nacional"
            },
            
            # Contracting APIs
            "contrataciones_electronicas": {
                "base_url": "https://datos.gob.ar/dataset/modernizacion-sistema-contrataciones-electronicas-argentina",
                "csv_url": "https://infra.datos.gob.ar/catalog/modernizacion/dataset/7/distribution/",
                "rate_limit": 2.0,
                "description": "Sistema de Contrataciones Electrónicas"
            },
            
            # Public Works
            "obras_publicas": {
                "base_url": "https://www.argentina.gob.ar/obras-publicas/api-seguimiento-de-obras",
                "mapas_url": "https://mapa.obraspublicas.gob.ar/",
                "rate_limit": 1.0,
                "description": "Seguimiento de Obras Públicas"
            },
            
            # Geographic API
            "georef": {
                "base_url": "https://apis.datos.gob.ar/georef/api/",
                "rate_limit": 0.5,
                "description": "API del Servicio de Normalización de Datos Geográficos"
            },
            
            # BCRA API
            "bcra": {
                "base_url": "https://api.bcra.gob.ar/",
                "rate_limit": 1.0,
                "description": "Banco Central de la República Argentina"
            },
            
            # INDEC API
            "indec": {
                "base_url": "https://apis.datos.gob.ar/series/api/",
                "rate_limit": 1.5,
                "description": "Instituto Nacional de Estadísticas y Censos"
            },
            
            # Provincial Buenos Aires
            "provincia_ba": {
                "transparencia_url": "https://www.gba.gob.ar/transparencia_fiscal/",
                "datos_abiertos": "https://www.gba.gob.ar/datos_abiertos",
                "municipios": "https://www.gba.gob.ar/municipios",
                "rate_limit": 2.0,
                "description": "Provincia de Buenos Aires"
            },
            
            # Anti-corruption and Legal
            "anticorrupcion": {
                "base_url": "https://www.argentina.gob.ar/anticorrupcion",
                "rate_limit": 2.0,
                "description": "Oficina Anticorrupción"
            },
            
            # Justice Ministry
            "justicia": {
                "datos_url": "https://datos.jus.gob.ar/",
                "rate_limit": 1.5,
                "description": "Ministerio de Justicia y Derechos Humanos"
            }
        }
    
    def search_carmen_de_areco_datasets(self) -> Dict[str, Any]:
        """Search all national databases for Carmen de Areco datasets"""
        self.logger.info("🔍 Searching national datasets for Carmen de Areco...")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "municipality": "Carmen de Areco",
            "searches": {}
        }
        
        search_terms = [
            "carmen de areco",
            "carmen+de+areco", 
            "carmen-de-areco",
            "municipalidad carmen de areco",
            "6900", # Postal code
            "partido de carmen de areco"
        ]
        
        # Search datos.gob.ar
        try:
            datasets = []
            for term in search_terms:
                search_url = f"{self.apis['datos_argentina']['search_url']}?q={term}"
                response = self.session.get(search_url, timeout=30)
                time.sleep(self.apis['datos_argentina']['rate_limit'])
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    dataset_items = soup.find_all('div', class_='dataset-item')
                    
                    for item in dataset_items:
                        title_elem = item.find('h3')
                        desc_elem = item.find('p')
                        link_elem = item.find('a')
                        
                        if title_elem and link_elem:
                            datasets.append({
                                "title": title_elem.get_text().strip(),
                                "description": desc_elem.get_text().strip() if desc_elem else "",
                                "url": f"https://datos.gob.ar{link_elem['href']}",
                                "search_term": term
                            })
            
            # Remove duplicates
            unique_datasets = []
            seen_urls = set()
            for dataset in datasets:
                if dataset["url"] not in seen_urls:
                    unique_datasets.append(dataset)
                    seen_urls.add(dataset["url"])
            
            results["searches"]["datos_gob_ar"] = {
                "found": len(unique_datasets),
                "datasets": unique_datasets,
                "success": True
            }
            
            self.logger.info(f"✅ Found {len(unique_datasets)} datasets on datos.gob.ar")
            
        except Exception as e:
            results["searches"]["datos_gob_ar"] = {
                "error": str(e),
                "success": False
            }
            self.logger.error(f"❌ Error searching datos.gob.ar: {e}")
        
        return results
    
    def get_municipal_geographic_data(self) -> Dict[str, Any]:
        """Get official geographic data for Carmen de Areco"""
        self.logger.info("📍 Getting geographic data from Georef API...")
        
        try:
            url = f"{self.apis['georef']['base_url']}municipios"
            params = {"nombre": "Carmen de Areco", "max": 5}
            
            response = self.session.get(url, params=params, timeout=30)
            time.sleep(self.apis['georef']['rate_limit'])
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("cantidad", 0) > 0:
                    municipality = data["municipios"][0]
                    
                    # Get additional province data
                    province_url = f"{self.apis['georef']['base_url']}provincias"
                    province_params = {"id": municipality["provincia"]["id"]}
                    
                    province_response = self.session.get(province_url, params=province_params, timeout=30)
                    time.sleep(self.apis['georef']['rate_limit'])
                    
                    province_data = province_response.json() if province_response.status_code == 200 else {}
                    
                    return {
                        "success": True,
                        "municipality": municipality,
                        "province": province_data.get("provincias", [{}])[0] if province_data else {},
                        "source": "Georef API"
                    }
                else:
                    return {"success": False, "error": "Municipality not found"}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_national_budget_transfers(self, years: List[int] = None) -> Dict[str, Any]:
        """Get national budget transfers to Carmen de Areco"""
        if not years:
            years = [2022, 2023, 2024]
        
        self.logger.info(f"💰 Getting national budget transfers for {years}...")
        
        results = {
            "transfers_by_year": {},
            "errors": []
        }
        
        for year in years:
            try:
                # Try multiple endpoints for budget data
                endpoints = [
                    "coparticipacion",
                    "transferencias", 
                    "aportes-tesoro-nacional",
                    "recursos-provinciales"
                ]
                
                year_data = {"year": year, "transfers": {}}
                
                for endpoint in endpoints:
                    try:
                        # This is a simplified approach - actual API may have different structure
                        url = f"{self.apis['presupuesto_abierto']['base_url']}{endpoint}"
                        params = {
                            "anio": year,
                            "jurisdiccion": "Buenos Aires",
                            "entidad": "Carmen de Areco"
                        }
                        
                        response = self.session.get(url, params=params, timeout=30)
                        time.sleep(self.apis['presupuesto_abierto']['rate_limit'])
                        
                        if response.status_code == 200:
                            try:
                                data = response.json()
                                year_data["transfers"][endpoint] = data
                            except:
                                # If not JSON, might be CSV or other format
                                year_data["transfers"][endpoint] = {
                                    "raw_response": response.text[:1000],  # First 1000 chars
                                    "content_type": response.headers.get('content-type', 'unknown')
                                }
                        else:
                            year_data["transfers"][endpoint] = {"error": f"HTTP {response.status_code}"}
                            
                    except Exception as e:
                        year_data["transfers"][endpoint] = {"error": str(e)}
                
                results["transfers_by_year"][year] = year_data
                
            except Exception as e:
                results["errors"].append(f"Year {year}: {str(e)}")
        
        return results
    
    def get_public_works_data(self) -> Dict[str, Any]:
        """Get public works data for Carmen de Areco"""
        self.logger.info("🏗️ Getting public works data...")
        
        try:
            # Get geographic data first
            geo_data = self.get_municipal_geographic_data()
            if not geo_data["success"]:
                return {"success": False, "error": "Could not get geographic data"}
            
            municipality_id = geo_data["municipality"]["id"]
            
            # Download public works CSV files
            works_data = []
            
            # Try to get public works data from national portal
            csv_urls = [
                "https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.6/download/onc-contratar-ubicacion-geografica.csv",
                "https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.4/download/onc-contratar-contratos.csv"
            ]
            
            for csv_url in csv_urls:
                try:
                    response = self.session.get(csv_url, timeout=60)
                    if response.status_code == 200:
                        csv_content = io.StringIO(response.text)
                        reader = csv.DictReader(csv_content)
                        
                        for row in reader:
                            # Check if row mentions Carmen de Areco
                            row_text = " ".join(str(v).upper() for v in row.values())
                            if "CARMEN" in row_text and "ARECO" in row_text:
                                works_data.append({
                                    "data": row,
                                    "source_url": csv_url,
                                    "found_at": datetime.now().isoformat()
                                })
                    
                    time.sleep(2.0)  # Respect rate limits
                    
                except Exception as e:
                    self.logger.error(f"Error downloading {csv_url}: {e}")
            
            return {
                "success": True,
                "works_found": len(works_data),
                "works_data": works_data,
                "municipality_id": municipality_id,
                "source": "National Public Works Portal"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_economic_indicators_context(self) -> Dict[str, Any]:
        """Get economic indicators for context"""
        self.logger.info("📊 Getting economic indicators...")
        
        results = {"indicators": {}, "errors": []}
        
        # BCRA indicators
        try:
            bcra_indicators = {
                "usd_official": "estadisticas/v2.0/DatoVariable/1",
                "inflation_monthly": "estadisticas/v2.0/DatoVariable/31", 
                "policy_rate": "estadisticas/v2.0/DatoVariable/1"
            }
            
            for name, endpoint in bcra_indicators.items():
                try:
                    url = f"{self.apis['bcra']['base_url']}{endpoint}"
                    response = self.session.get(url, timeout=30, verify=False)
                    time.sleep(self.apis['bcra']['rate_limit'])
                    
                    if response.status_code == 200:
                        data = response.json()
                        results["indicators"][f"bcra_{name}"] = {
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        }
                        
                except Exception as e:
                    results["errors"].append(f"BCRA {name}: {str(e)}")
                    
        except Exception as e:
            results["errors"].append(f"BCRA error: {str(e)}")
        
        # INDEC series for Buenos Aires Province
        try:
            indec_series = {
                "provincial_gdp": "11.3_DGI_D_0_0_26",
                "employment_rate": "1.1_I_2016_M_14", 
                "population_projection": "2.1_DT_1_0_2"
            }
            
            for name, series_id in indec_series.items():
                try:
                    url = f"{self.apis['indec']['base_url']}series"
                    params = {"ids": series_id, "limit": 12, "start_date": "2022-01-01"}
                    
                    response = self.session.get(url, params=params, timeout=30)
                    time.sleep(self.apis['indec']['rate_limit'])
                    
                    if response.status_code == 200:
                        data = response.json()
                        results["indicators"][f"indec_{name}"] = {
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        }
                        
                except Exception as e:
                    results["errors"].append(f"INDEC {name}: {str(e)}")
                    
        except Exception as e:
            results["errors"].append(f"INDEC error: {str(e)}")
        
        return results
    
    def get_provincial_transparency_data(self) -> Dict[str, Any]:
        """Get Buenos Aires provincial transparency data"""
        self.logger.info("🏛️ Getting Buenos Aires provincial transparency data...")
        
        results = {"provincial_sources": {}, "errors": []}
        
        # Check provincial transparency portal
        try:
            transparency_url = self.apis["provincia_ba"]["transparencia_url"]
            response = self.session.get(transparency_url, timeout=30)
            time.sleep(self.apis['provincia_ba']['rate_limit'])
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for municipal-specific links
                municipal_links = []
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    text = link.get_text()
                    if 'carmen' in text.lower() and 'areco' in text.lower():
                        municipal_links.append({
                            "url": href if href.startswith('http') else f"https://www.gba.gob.ar{href}",
                            "text": text.strip()
                        })
                
                results["provincial_sources"]["transparency_portal"] = {
                    "municipal_links": municipal_links,
                    "total_links": len(municipal_links),
                    "last_checked": datetime.now().isoformat()
                }
                
        except Exception as e:
            results["errors"].append(f"Provincial transparency portal: {str(e)}")
        
        # Check open data portal
        try:
            opendata_url = self.apis["provincia_ba"]["datos_abiertos"]
            response = self.session.get(opendata_url, timeout=30)
            time.sleep(self.apis['provincia_ba']['rate_limit'])
            
            if response.status_code == 200:
                # Search for Carmen de Areco datasets
                soup = BeautifulSoup(response.content, 'html.parser')
                datasets = []
                
                for dataset in soup.find_all('div', class_='dataset'):
                    title = dataset.find('h3')
                    if title and 'carmen' in title.get_text().lower():
                        datasets.append({
                            "title": title.get_text().strip(),
                            "found_at": datetime.now().isoformat()
                        })
                
                results["provincial_sources"]["open_data"] = {
                    "datasets": datasets,
                    "count": len(datasets)
                }
                
        except Exception as e:
            results["errors"].append(f"Provincial open data: {str(e)}")
        
        return results
    
    def collect_all_national_data(self) -> Dict[str, Any]:
        """Collect data from all national sources"""
        self.logger.info("\n🇦🇷 NATIONAL DATA COLLECTION")
        self.logger.info("=" * 50)
        
        collection_results = {
            "timestamp": datetime.now().isoformat(),
            "municipality": "Carmen de Areco",
            "collections": {}
        }
        
        # Collection functions
        collections = [
            ("dataset_search", self.search_carmen_de_areco_datasets),
            ("geographic_data", self.get_municipal_geographic_data),
            ("budget_transfers", self.get_national_budget_transfers),
            ("public_works", self.get_public_works_data),
            ("economic_indicators", self.get_economic_indicators_context),
            ("provincial_transparency", self.get_provincial_transparency_data)
        ]
        
        for collection_name, collection_func in collections:
            try:
                self.logger.info(f"\n📊 Collecting {collection_name}...")
                result = collection_func()
                collection_results["collections"][collection_name] = result
                
                if result.get("success", True):  # Default True for collections without explicit success flag
                    self.logger.info(f"  ✅ {collection_name}: Success")
                else:
                    self.logger.info(f"  ⚠️ {collection_name}: {result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                self.logger.error(f"  ❌ {collection_name}: {e}")
                collection_results["collections"][collection_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Summary
        successful = sum(1 for c in collection_results["collections"].values() 
                        if c.get("success", True) and not c.get("error"))
        total = len(collection_results["collections"])
        
        collection_results["summary"] = {
            "successful_collections": successful,
            "total_collections": total,
            "success_rate": f"{successful/total*100:.1f}%",
            "collection_timestamp": datetime.now().isoformat()
        }
        
        self.logger.info(f"\n📋 NATIONAL DATA COLLECTION SUMMARY:")
        self.logger.info(f"   ✅ Successful: {successful}/{total} collections")
        self.logger.info(f"   📊 Success Rate: {successful/total*100:.1f}%")
        
        # Save results
        output_file = self.data_dir / f"national_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(collection_results, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"💾 Results saved to: {output_file}")
        
        return collection_results

if __name__ == "__main__":
    collector = NationalAPIsCollector()
    results = collector.collect_all_national_data()
    
    print("\n🎯 National APIs data collection completed!")
    print(f"Check the results in: data/national_apis/")
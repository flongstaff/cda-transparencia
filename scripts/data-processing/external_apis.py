#!/usr/bin/env python3
"""
External APIs Integration for Enhanced Transparency Data
Connects to government APIs for real-time data verification and expansion
"""

import requests
import json
from datetime import datetime, date
from typing import Dict, List, Optional, Any
import time
import csv
import io
import urllib3

urllib3.disable_warnings()
class ExternalAPIsClient:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Carmen-Transparencia-Portal/1.0'
        })
        
        # API Endpoints
        self.apis = {
            "datos_argentina": {
                "base_url": "https://datos.gob.ar/api/3/action/",
                "description": "Portal Nacional de Datos Abiertos",
                "rate_limit": 1.0  # seconds between requests
            },
            "afip_ws": {
                "base_url": "https://aws.afip.gov.ar/sr-padron/",
                "description": "AFIP Web Services",
                "rate_limit": 2.0
            },
            "bcra_api": {
                "base_url": "https://api.bcra.gob.ar/",
                "description": "Banco Central República Argentina",
                "rate_limit": 1.0
            },
            "indec_api": {
                "base_url": "https://apis.datos.gob.ar/series/api/",
                "description": "INDEC - Instituto Nacional de Estadísticas",
                "rate_limit": 1.5
            },
            "pami_api": {
                "base_url": "https://www.pami.org.ar/api/",
                "description": "PAMI - Programa de Atención Médica Integral",
                "rate_limit": 2.0
            },
            "georef_api": {
                "base_url": "https://apis.datos.gob.ar/georef/api/",
                "description": "API del Servicio de Normalización de Datos Geográficos de Argentina",
                "rate_limit": 0.5
            }
        }

    def get_georef_data(self, municipality_name: str) -> Dict[str, Any]:
        """Get geographic data for a municipality from Georef API"""
        print(f"📍 Searching Georef for: {municipality_name}")
        
        try:
            url = f"{self.apis['georef_api']['base_url']}municipios"
            params = {"nombre": municipality_name}
            
            response = self.session.get(url, params=params, timeout=30)
            time.sleep(self.apis['georef_api']['rate_limit'])
            
            if response.status_code == 200:
                data = response.json()
                if data and data["cantidad"] > 0:
                    return {"success": True, "data": data["municipios"][0]}
                else:
                    return {"success": False, "error": "Municipality not found"}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_municipal_cuit_data(self, search_terms: List[str] = ["CARMEN DE ARECO", "MUNICIPALIDAD DE CARMEN DE ARECO"]) -> Dict[str, Any]:
        """Get CUIT/tax data for municipality from AFIP"""
        print(f"🏛️ Searching AFIP for: {search_terms}")
        
        results = []
        for search_term in search_terms:
            try:
                # AFIP Padrón consultation
                afip_url = "https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do"
                params = {
                    "method": "buscar",
                    "razonSocial": search_term,
                    "tipoPersona": "J"  # Juridica (legal entity)
                }
                
                response = self.session.get(afip_url, params=params, timeout=30)
                time.sleep(self.apis["afip_ws"]["rate_limit"])
                
                if response.status_code == 200:
                    # Parse HTML response for CUIT data
                    from bs4 import BeautifulSoup
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for CUIT data in response
                    for row in soup.find_all('tr'):
                        cells = row.find_all('td')
                        if len(cells) >= 3:
                            cuit = cells[0].get_text().strip() if cells[0] else ""
                            name = cells[1].get_text().strip() if cells[1] else ""
                            
                            if cuit and "CARMEN" in name.upper():
                                results.append({
                                    "cuit": cuit,
                                    "razon_social": name,
                                    "source": "AFIP",
                                    "timestamp": datetime.now().isoformat()
                                })
                    
            except Exception as e:
                return {"success": False, "error": str(e)}

        return {
            "success": True,
            "data": results,
            "source": "AFIP Padrón"
        }

    def get_national_budget_transfers(self, year: int = 2024) -> Dict[str, Any]:
        """Get national budget transfers to Carmen de Areco"""
        print(f"💰 Getting national budget transfers for {year}")
        
        try:
            # Presupuesto Abierto API
            budget_url = "https://www.presupuestoabierto.gob.ar/sici/api/"
            
            # Search for municipal coparticipation
            endpoints = [
                "coparticipacion-municipal",
                "transferencias-municipios", 
                "aportes-del-tesoro-nacional"
            ]
            
            results = {}
            for endpoint in endpoints:
                try:
                    url = f"{budget_url}{endpoint}"
                    params = {
                        "anio": year,
                        "jurisdiccion": "Buenos Aires",
                        "municipio": "Carmen de Areco"
                    }
                    
                    response = self.session.get(url, params=params, timeout=30)
                    time.sleep(1.0)
                    
                    if response.status_code == 200:
                        data = response.json()
                        results[endpoint] = {
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        results[endpoint] = {"error": f"HTTP {response.status_code}"}
                        
                except Exception as e:
                    results[endpoint] = {"error": str(e)}
            
            return {
                "success": True,
                "year": year,
                "transfers": results,
                "source": "Presupuesto Abierto"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_economic_indicators(self) -> Dict[str, Any]:
        """Get relevant economic indicators from BCRA and INDEC"""
        print("📊 Getting economic indicators")
        
        errors = []
        results = {}
        try:
            # BCRA - Exchange rate and inflation
            bcra_endpoints = {
                "usd_rate": "estadisticas/v2.0/DatoVariable/1",  # USD exchange rate
                "inflation": "estadisticas/v2.0/DatoVariable/31", # Monthly inflation
                "monetary_base": "estadisticas/v2.0/DatoVariable/1"
            }
            
            for name, endpoint in bcra_endpoints.items():
                try:
                    url = f"{self.apis['bcra_api']['base_url']}{endpoint}"
                    response = self.session.get(url, timeout=30, verify=False)
                    time.sleep(self.apis["bcra_api"]["rate_limit"])
                    
                    if response.status_code == 200:
                        data = response.json()
                        results[f"bcra_{name}"] = {
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        error_message = f"BCRA {name}: HTTP {response.status_code}"
                        print(f"  ⚠️ {error_message}")
                        errors.append(error_message)
                except Exception as e:
                    error_message = f"BCRA {name}: {e}"
                    print(f"  ⚠️ {error_message}")
                    errors.append(error_message)
            
            # INDEC - Provincial and municipal indicators
            indec_series = {
                "provincial_gdp": "11.3_DGI_D_0_0_26",  # Buenos Aires GDP
                "municipal_employment": "1.1_I_2016_M_14",  # Employment data
                "population": "2.1_DT_1_0_2"  # Population projections
            }
            
            for name, series_id in indec_series.items():
                try:
                    url = f"{self.apis['indec_api']['base_url']}series"
                    params = {"ids": series_id, "limit": 12}  # Last 12 periods
                    
                    response = self.session.get(url, params=params, timeout=30)
                    time.sleep(self.apis["indec_api"]["rate_limit"])
                    
                    if response.status_code == 200:
                        data = response.json()
                        results[f"indec_{name}"] = {
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        error_message = f"INDEC {name}: HTTP {response.status_code}"
                        print(f"  ⚠️ {error_message}")
                        errors.append(error_message)
                except Exception as e:
                    error_message = f"INDEC {name}: {e}"
                    print(f"  ⚠️ {error_message}")
                    errors.append(error_message)
            
            if errors:
                return {
                    "success": False,
                    "error": ", ".join(errors),
                    "indicators": results,
                    "source": "BCRA + INDEC"
                }

            return {
                "success": True,
                "indicators": results,
                "source": "BCRA + INDEC"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_national_contracting_data(self) -> Dict[str, Any]:
        """Get national contracting data involving Carmen de Areco"""
        print("🏢 Getting national contracting data")
        
        errors = []
        try:
            # Get Carmen de Areco data from Georef API
            georef_data = self.get_georef_data("Carmen de Areco")
            if not georef_data["success"]:
                errors.append(f"Georef API error: {georef_data['error']}")
                return {"success": False, "error": ", ".join(errors)}
            
            carmen_de_areco_id = georef_data["data"]["id"]
            carmen_de_areco_name = georef_data["data"]["nombre"]

            # Download the geographic location CSV file
            geo_csv_url = "https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.6/download/onc-contratar-ubicacion-geografica.csv"
            response = self.session.get(geo_csv_url, timeout=60)
            response.raise_for_status()

            # Parse the geographic CSV data and find obra_numbers for Carmen de Areco
            obra_numbers = set()
            geo_csv_file = io.StringIO(response.text)
            geo_reader = csv.DictReader(geo_csv_file)
            for row in geo_reader:
                if row.get("localidad_nombre", "").upper() == carmen_de_areco_name.upper() or \
                   row.get("departamento_nombre", "").upper() == carmen_de_areco_name.upper():
                    if row.get("numero_obra"):
                        obra_numbers.add(row["numero_obra"])
            
            if not obra_numbers:
                return {"success": True, "contracts": [], "total_found": 0, "source": "datos.gob.ar - Contratos de Obra Pública"}

            # Download the contracts CSV file
            contracts_csv_url = "https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.4/download/onc-contratar-contratos.csv"
            response = self.session.get(contracts_csv_url, timeout=60)
            response.raise_for_status()

            # Parse the contracts CSV data and filter by obra_numbers
            results = []
            contracts_csv_file = io.StringIO(response.text)
            contracts_reader = csv.DictReader(contracts_csv_file)
            for row in contracts_reader:
                if row.get("numero_obra") in obra_numbers:
                    results.append(row)

            return {
                "success": True,
                "contracts": results,
                "total_found": len(results),
                "source": "datos.gob.ar - Contratos de Obra Pública"
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_social_programs_data(self) -> Dict[str, Any]:
        """Get social programs data for Carmen de Areco"""
        print("🏥 Getting social programs data")
        
        try:
            # This would connect to various social program APIs
            programs = {
                "anses": {
                    "url": "https://serviciosjuridicos.anses.gov.ar/",
                    "description": "ANSES - Administración Nacional de Seguridad Social"
                },
                "pami": {
                    "url": "https://www.pami.org.ar/",
                    "description": "PAMI - Atención Médica Integral"
                },
                "progresar": {
                    "url": "https://www.argentina.gob.ar/educacion/progresar",
                    "description": "Becas Progresar"
                }
            }
            
            results = {}
            for program, config in programs.items():
                results[program] = {
                    "status": "configured",
                    "description": config["description"],
                    "url": config["url"],
                    "note": "API integration pending - requires specific credentials"
                }
            
            return {
                "success": True,
                "programs": results,
                "source": "National Social Programs"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def collect_all_external_data(self) -> Dict[str, Any]:
        """Collect data from all external sources"""
        print("\n🌐 EXTERNAL DATA COLLECTION")
        print("=" * 50)
        
        collection_results = {
            "timestamp": datetime.now().isoformat(),
            "municipality": "Carmen de Areco",
            "sources": {}
        }
        
        # Collect from each source
        sources_to_collect = [
            ("afip_cuit", lambda: self.get_municipal_cuit_data()),
            ("budget_transfers", lambda: self.get_national_budget_transfers()),
            ("economic_indicators", lambda: self.get_economic_indicators()),
            ("contracting", lambda: self.get_national_contracting_data()),
            ("social_programs", lambda: self.get_social_programs_data())
        ]
        
        for source_name, collector_func in sources_to_collect:
            try:
                print(f"\n📊 Collecting {source_name}...")
                result = collector_func()
                collection_results["sources"][source_name] = result
                
                if result.get("success"):
                    print(f"  ✅ {source_name}: Success")
                else:
                    print(f"  ⚠️ {source_name}: {result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                print(f"  ❌ {source_name}: {e}")
                collection_results["sources"][source_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Summary
        successful = sum(1 for s in collection_results["sources"].values() if s.get("success"))
        total = len(collection_results["sources"])
        
        collection_results["summary"] = {
            "successful_sources": successful,
            "total_sources": total,
            "success_rate": f"{successful/total*100:.1f}%"
        }
        
        print(f"\n📋 COLLECTION SUMMARY:")
        print(f"   ✅ Successful: {successful}/{total} sources")
        print(f"   📊 Success Rate: {successful/total*100:.1f}%")
        
        return collection_results

if __name__ == "__main__":
    client = ExternalAPIsClient()
    results = client.collect_all_external_data()
    
    # Save results
    output_file = f"external_apis_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {output_file}")
    print("🎯 External APIs integration completed!")
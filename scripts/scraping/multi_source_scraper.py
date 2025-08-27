#!/usr/bin/env python3
"""
Multi-Source Data Scraper for Carmen de Areco Transparency Portal
Integrates data from AFIP, National Government, and Provincial sources
"""

import requests
import re
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime
import json
import time
from typing import Dict, List, Tuple, Optional

class MultiSourceScraper:
    def __init__(self, output_dir="data/multi_source"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Data source configurations
        self.sources = {
            "carmen_local": {
                "url": "https://carmendeareco.gob.ar/transparencia/",
                "name": "Carmen de Areco Official Portal",
                "priority": 1,
                "pattern": r'\.(pdf|xlsx?|docx?)$'
            },
            "afip_cuit": {
                "url": "https://seti.afip.gob.ar/padron-puc-constancia-internet/",
                "name": "AFIP - Padrón de Contribuyentes",
                "priority": 2,
                "pattern": r'\.(pdf|xlsx?|csv)$'
            },
            "boletinoficial": {
                "url": "https://www.boletinoficial.gob.ar/",
                "name": "Boletín Oficial Nacional",
                "priority": 3,
                "pattern": r'\.(pdf|doc)$'
            },
            "provincia_ba": {
                "url": "https://www.gba.gob.ar/transparencia_institucional",
                "name": "Provincia de Buenos Aires - Transparencia",
                "priority": 2,
                "pattern": r'\.(pdf|xlsx?|docx?)$'
            },
            "argentina_datos": {
                "url": "https://datos.gob.ar/",
                "name": "Portal Nacional de Datos Abiertos",
                "priority": 3,
                "pattern": r'\.(csv|json|xlsx?)$'
            },
            "contrataciones": {
                "url": "https://contrataciones.gov.ar/consultas/",
                "name": "Sistema Nacional de Contrataciones",
                "priority": 2,
                "pattern": r'\.(pdf|xlsx?)$'
            },
            "presupuesto_nacional": {
                "url": "https://www.presupuestoabierto.gob.ar/",
                "name": "Presupuesto Abierto Nacional",
                "priority": 3,
                "pattern": r'\.(pdf|xlsx?|csv)$'
            }
        }
        
        # Municipal identification data
        self.municipality_data = {
            "name": "Carmen de Areco",
            "provincia": "Buenos Aires",
            "partido": "Carmen de Areco",
            "cuit_prefix": "30", # Typical municipal CUIT pattern
            "codigo_postal": "2725"
        }

    def search_afip_data(self) -> List[Tuple[str, Optional[Path]]]:
        """Search AFIP for municipal tax and contribution data"""
        print("🏛️ Searching AFIP for municipal data...")
        results = []
        
        try:
            # AFIP Padrón search for municipal entities
            search_terms = [
                "MUNICIPALIDAD DE CARMEN DE ARECO",
                "COMUNA CARMEN DE ARECO", 
                "GOBIERNO MUNICIPAL CARMEN"
            ]
            
            for term in search_terms:
                afip_url = f"https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do?method=buscar&razonSocial={term}"
                
                try:
                    response = requests.get(afip_url, timeout=30)
                    if response.status_code == 200:
                        filename = f"afip_search_{term.lower().replace(' ', '_')}.html"
                        local_path = self.output_dir / "afip" / filename
                        local_path.parent.mkdir(exist_ok=True)
                        
                        with open(local_path, 'w', encoding='utf-8') as f:
                            f.write(response.text)
                        
                        results.append((afip_url, local_path))
                        print(f"  ✅ AFIP data: {term}")
                        time.sleep(2)  # Respectful delay
                        
                except Exception as e:
                    print(f"  ⚠️ AFIP search failed for {term}: {e}")
                    
        except Exception as e:
            print(f"❌ AFIP integration error: {e}")
            
        return results

    def search_national_contracting(self) -> List[Tuple[str, Optional[Path]]]:
        """Search national contracting system for municipal contracts"""
        print("🏢 Searching National Contracting System...")
        results = []
        
        try:
            # Search for contracts involving Carmen de Areco
            search_url = "https://contrataciones.gov.ar/consultas/consultarProcedimiento.html"
            search_params = {
                "entidadContratante": "Carmen de Areco",
                "estado": "todos"
            }
            
            response = requests.get(search_url, params=search_params, timeout=30)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for contract documents
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if re.search(r'\.pdf$', href, re.I):
                        if not href.startswith('http'):
                            full_url = f"https://contrataciones.gov.ar{href}"
                        else:
                            full_url = href
                            
                        filename = Path(href).name
                        local_path = self.output_dir / "contracting" / filename
                        local_path.parent.mkdir(exist_ok=True)
                        
                        try:
                            doc_response = requests.get(full_url, timeout=60)
                            doc_response.raise_for_status()
                            
                            with open(local_path, 'wb') as f:
                                f.write(doc_response.content)
                            
                            results.append((full_url, local_path))
                            print(f"  ✅ Contract: {filename}")
                            time.sleep(1)
                            
                        except Exception as e:
                            print(f"  ⚠️ Failed to download {filename}: {e}")
                            
        except Exception as e:
            print(f"❌ National contracting search error: {e}")
            
        return results

    def search_provincial_data(self) -> List[Tuple[str, Optional[Path]]]:
        """Search Buenos Aires provincial transparency data"""
        print("🏛️ Searching Buenos Aires Provincial Data...")
        results = []
        
        try:
            # Provincial transparency portal
            prov_url = "https://www.gba.gob.ar/transparencia_institucional"
            response = requests.get(prov_url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for municipal-related documents
                municipal_keywords = [
                    "carmen de areco", "municipio", "municipal", 
                    "intendencia", "comuna", "partido"
                ]
                
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    link_text = link.get_text().lower()
                    
                    # Check if link relates to municipalities
                    if any(keyword in link_text for keyword in municipal_keywords):
                        if re.search(r'\.(pdf|xlsx?|docx?)$', href, re.I):
                            if not href.startswith('http'):
                                full_url = f"https://www.gba.gob.ar{href}"
                            else:
                                full_url = href
                                
                            filename = Path(href).name
                            local_path = self.output_dir / "provincial" / filename
                            local_path.parent.mkdir(exist_ok=True)
                            
                            try:
                                doc_response = requests.get(full_url, timeout=60)
                                doc_response.raise_for_status()
                                
                                with open(local_path, 'wb') as f:
                                    f.write(doc_response.content)
                                
                                results.append((full_url, local_path))
                                print(f"  ✅ Provincial: {filename}")
                                time.sleep(1)
                                
                            except Exception as e:
                                print(f"  ⚠️ Failed to download {filename}: {e}")
                                
        except Exception as e:
            print(f"❌ Provincial data search error: {e}")
            
        return results

    def search_national_budget_data(self) -> List[Tuple[str, Optional[Path]]]:
        """Search national budget data for municipal transfers"""
        print("💰 Searching National Budget Data...")
        results = []
        
        try:
            # Presupuesto Abierto - search for municipal transfers
            budget_url = "https://www.presupuestoabierto.gob.ar/sici/"
            
            # Look for coparticipación and municipal transfers
            search_terms = [
                "coparticipacion municipal",
                "transferencias municipios",
                "fondos municipales",
                "carmen de areco"
            ]
            
            for term in search_terms:
                try:
                    search_response = requests.get(
                        f"{budget_url}consulta-dinamica", 
                        params={"q": term}, 
                        timeout=30
                    )
                    
                    if search_response.status_code == 200:
                        filename = f"budget_search_{term.replace(' ', '_')}.json"
                        local_path = self.output_dir / "budget" / filename
                        local_path.parent.mkdir(exist_ok=True)
                        
                        # Save search results as JSON for later processing
                        with open(local_path, 'w', encoding='utf-8') as f:
                            f.write(search_response.text)
                        
                        results.append((f"{budget_url}?q={term}", local_path))
                        print(f"  ✅ Budget data: {term}")
                        time.sleep(2)
                        
                except Exception as e:
                    print(f"  ⚠️ Budget search failed for {term}: {e}")
                    
        except Exception as e:
            print(f"❌ National budget search error: {e}")
            
        return results

    def scrape_all_sources(self) -> Dict[str, List[Tuple[str, Optional[Path]]]]:
        """Scrape all configured data sources"""
        print("🔍 MULTI-SOURCE DATA COLLECTION")
        print("=" * 60)
        
        all_results = {}
        
        # Municipal portal (primary source)
        from live_scrape import LiveScraper
        local_scraper = LiveScraper(str(self.output_dir / "local"))
        local_results = list(local_scraper.scrape_all())
        all_results["local"] = local_results
        print(f"✅ Local portal: {len(local_results)} documents")
        
        # AFIP data
        afip_results = self.search_afip_data()
        all_results["afip"] = afip_results
        
        # National contracting
        contracting_results = self.search_national_contracting()
        all_results["contracting"] = contracting_results
        
        # Provincial data
        provincial_results = self.search_provincial_data()
        all_results["provincial"] = provincial_results
        
        # National budget
        budget_results = self.search_national_budget_data()
        all_results["budget"] = budget_results
        
        # Save comprehensive report
        report = {
            "timestamp": datetime.now().isoformat(),
            "municipality": self.municipality_data,
            "sources": {}
        }
        
        total_documents = 0
        for source_name, results in all_results.items():
            report["sources"][source_name] = {
                "count": len(results),
                "documents": [{"url": url, "file": str(path)} for url, path in results if path]
            }
            total_documents += len(results)
        
        report["summary"] = {
            "total_sources": len(all_results),
            "total_documents": total_documents,
            "status": "multi_source_operational"
        }
        
        # Save report
        report_path = self.output_dir / "multi_source_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 COLLECTION SUMMARY:")
        print(f"   🏛️ Total Sources: {len(all_results)}")
        print(f"   📄 Total Documents: {total_documents}")
        print(f"   📋 Report: {report_path}")
        
        return all_results

if __name__ == "__main__":
    scraper = MultiSourceScraper()
    results = scraper.scrape_all_sources()
    
    print("\n🎯 Multi-source data collection completed!")
    print("   Ready for integration with transparency portal")
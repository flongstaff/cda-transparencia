#!/usr/bin/env python3
"""
External Data Services Integration for Carmen de Areco Transparency Portal

This script connects to various external APIs and data sources to fetch
municipal data for the transparency portal.
"""

import requests
import pandas as pd
import json
import os
from pathlib import Path
import time
from typing import Dict, List, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ExternalDataService:
    """Class to handle external API connections and data downloads"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.data_dir = self.base_dir / "data" / "external"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # API endpoints for Carmen de Areco and related data
        self.api_endpoints = {
            # National level APIs
            "datos_gob_ar": "https://datos.gob.ar/api/3/action/package_search?q=organization:carmen-de-areco",
            "presupuesto_nacional": "https://www.presupuestoabierto.gob.ar/sici/api/",
            
            # Provincial level APIs
            "gba_datos": "https://datos.gba.gob.ar/api/3/action/package_search?q=carmen+de+areco",
            
            # Municipal level (if available)
            "municipal_data": "https://carmendeareco.gob.ar/transparencia/api/",  # Placeholder
        }
        
        # URLs for direct download (when API not available)
        self.download_urls = {
            "datos_gob_ar_catalog": "https://datos.gob.ar/dataset?organization=carmen-de-areco"
        }

    def fetch_datos_gob_ar(self) -> Optional[Dict]:
        """Fetch data from datos.gob.ar for Carmen de Areco"""
        try:
            logger.info("Fetching data from datos.gob.ar...")
            response = requests.get(self.api_endpoints["datos_gob_ar"], timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                output_path = self.data_dir / "datos_gob_ar_carmen_de_areco.json"
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Successfully fetched and saved data to {output_path}")
                return data
            else:
                logger.error(f"Failed to fetch datos.gob.ar data. Status code: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error fetching datos.gob.ar data: {e}")
            return None

    def fetch_presupuesto_nacional(self) -> Optional[Dict]:
        """Fetch data from national budget API"""
        try:
            logger.info("Fetching data from presupuesto nacional API...")
            response = requests.get(self.api_endpoints["presupuesto_nacional"], timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                output_path = self.data_dir / "presupuesto_nacional.json"
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Successfully fetched and saved data to {output_path}")
                return data
            else:
                logger.warning(f"Presupuesto nacional API returned status {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error fetching presupuesto nacional data: {e}")
            return None

    def fetch_gba_datos(self) -> Optional[Dict]:
        """Fetch data from Buenos Aires province open data portal"""
        try:
            logger.info("Fetching data from GBA datos portal...")
            response = requests.get(self.api_endpoints["gba_datos"], timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                output_path = self.data_dir / "gba_datos_carmen_de_areco.json"
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Successfully fetched and saved data to {output_path}")
                return data
            else:
                logger.warning(f"GBA datos API returned status {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error fetching GBA datos: {e}")
            return None

    def download_from_datos_gob_ar(self):
        """Download datasets from datos.gob.ar when API is not available"""
        try:
            logger.info("Attempting to download data from datos.gob.ar...")
            
            # First, get the list of datasets
            catalog_url = self.download_urls["datos_gob_ar_catalog"]
            response = requests.get(catalog_url, timeout=30)
            
            if response.status_code == 200:
                # For now, just save the HTML page for manual inspection
                output_path = self.data_dir / "datos_gob_ar_catalog.html"
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                
                logger.info(f"Saved catalog page to {output_path}")
                
                # In a real implementation, we would parse the HTML to extract dataset links
                # and download the actual data files
                return True
            else:
                logger.error(f"Failed to fetch catalog page. Status: {response.status_code}")
                return False
                
        except requests.RequestException as e:
            logger.error(f"Error downloading from datos.gob.ar: {e}")
            return False

    def fetch_ine_api(self) -> Optional[Dict]:
        """Fetch data from INE (Instituto Nacional de Estadísticas) if available"""
        try:
            logger.info("Attempting to fetch INE data...")
            # This is a placeholder URL - actual INE API endpoints would go here
            url = "https://www.indec.gob.ar/api/datos"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                output_path = self.data_dir / "ine_data.json"
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Successfully fetched and saved INE data to {output_path}")
                return data
            else:
                logger.warning(f"INE API returned status {response.status_code}")
                return None
        except requests.RequestException as e:
            logger.warning(f"INE API not available or error: {e}")
            return None

    def fetch_municipal_data(self) -> Optional[Dict]:
        """Try to fetch direct municipal data from Carmen de Areco website"""
        try:
            logger.info("Attempting to fetch direct municipal data...")
            # Try various possible data endpoints
            endpoints = [
                "https://carmendeareco.gob.ar/transparencia/datos.json",
                "https://carmendeareco.gob.ar/api/transparencia",
                "https://carmendeareco.gob.ar/transparencia/api/data.json"
            ]
            
            for url in endpoints:
                try:
                    response = requests.get(url, timeout=15)
                    if response.status_code == 200:
                        data = response.json()
                        output_path = self.data_dir / "municipal_data.json"
                        
                        with open(output_path, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        
                        logger.info(f"Successfully fetched municipal data from {url}")
                        return data
                except:
                    continue  # Try next endpoint
            
            logger.info("No direct municipal API found")
            return None
        except Exception as e:
            logger.error(f"Error fetching municipal data: {e}")
            return None

    def fetch_all_services(self) -> Dict[str, Optional[Dict]]:
        """Fetch data from all available external services"""
        logger.info("Starting to fetch data from all external services...")
        
        results = {}
        
        # Fetch from various APIs
        results['datos_gob_ar'] = self.fetch_datos_gob_ar()
        time.sleep(1)  # Be respectful to APIs
        
        results['presupuesto_nacional'] = self.fetch_presupuesto_nacional()
        time.sleep(1)
        
        results['gba_datos'] = self.fetch_gba_datos()
        time.sleep(1)
        
        results['ine'] = self.fetch_ine_api()
        time.sleep(1)
        
        results['municipal'] = self.fetch_municipal_data()
        
        # Download from datos.gob.ar if API doesn't work
        if not results['datos_gob_ar']:
            self.download_from_datos_gob_ar()
        
        logger.info("Completed fetching data from all external services")
        return results

def main():
    """Main function to run the external data service integration"""
    service = ExternalDataService()
    
    # Fetch data from all services
    results = service.fetch_all_services()
    
    # Print summary
    print("\\n--- Data Fetching Summary ---")
    for service_name, data in results.items():
        status = "✓ Success" if data else "✗ Failed/Not Available"
        print(f"{service_name}: {status}")
    
    print(f"\\nAll data saved to: {service.data_dir}")
    
    return results

if __name__ == "__main__":
    main()
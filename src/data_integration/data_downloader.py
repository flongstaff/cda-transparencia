#!/usr/bin/env python3
"""
Data Downloader for Carmen de Areco Transparency Portal

This script downloads municipal data from Carmen de Areco's transparency portal
and related sources that can be used with GitHub Pages and Cloudflare.
"""

import requests
import pandas as pd
import json
import os
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
import re
from typing import List, Dict, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CarmenDataDownloader:
    """Class to download data from Carmen de Areco and related sources"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.data_dir = self.base_dir / "data" / "downloaded"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Main URLs for Carmen de Areco data
        self.urls = {
            "municipal_portal": "https://carmendeareco.gob.ar/transparencia",
            "boletin_oficial": "https://carmendeareco.gob.ar/boletin-oficial",
            "licitaciones": "https://carmendeareco.gob.ar/licitaciones",
            "ordenanzas": "https://carmendeareco.gob.ar/ordenanzas"
        }
        
        # Common headers to avoid being blocked
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def get_page_content(self, url: str) -> Optional[str]:
        """Get content from a URL"""
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            if response.status_code == 200:
                return response.text
            else:
                logger.warning(f"Failed to get {url}, status: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error getting {url}: {e}")
            return None

    def extract_pdf_links(self, html_content: str, base_url: str) -> List[str]:
        """Extract PDF links from HTML content"""
        if not html_content:
            return []
        
        # Look for PDF links in the HTML (fixed regex)
        pdf_pattern = r'<a[^>]*href=["\']([^"\']*\.(pdf|PDF))["\'][^>]*>'
        matches = re.findall(pdf_pattern, html_content, re.IGNORECASE)
        
        pdf_links = []
        for match in matches:
            pdf_url = urljoin(base_url, match[0])
            pdf_links.append(pdf_url)
        
        # Also look for other common patterns
        alternative_pattern = r'href=["\']([^"\']*\.(pdf|PDF))["\']'
        alt_matches = re.findall(alternative_pattern, html_content, re.IGNORECASE)
        
        for match in alt_matches:
            pdf_url = urljoin(base_url, match[0])
            if pdf_url not in pdf_links:
                pdf_links.append(pdf_url)
        
        return pdf_links

    def extract_csv_links(self, html_content: str, base_url: str) -> List[str]:
        """Extract CSV links from HTML content"""
        if not html_content:
            return []
        
        # Look for CSV links in the HTML
        csv_pattern = r'<a[^>]*href=["\']([^"\']*\.(csv|CSV|xlsx|XLSX|xls|XLS))["\'][^>]*>'
        matches = re.findall(csv_pattern, html_content, re.IGNORECASE)
        
        csv_links = []
        for match in matches:
            csv_url = urljoin(base_url, match[0])
            csv_links.append(csv_url)
        
        return csv_links

    def download_file(self, url: str, dest_path: Path) -> bool:
        """Download a file from URL to destination path"""
        try:
            logger.info(f"Downloading: {url}")
            response = requests.get(url, headers=self.headers, timeout=60)
            
            if response.status_code == 200:
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                with open(dest_path, 'wb') as f:
                    f.write(response.content)
                
                logger.info(f"Downloaded to: {dest_path}")
                return True
            else:
                logger.warning(f"Failed to download {url}, status: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
            return False

    def download_transparency_data(self):
        """Download transparency data from Carmen de Areco portal"""
        logger.info("Starting to download transparency data...")
        
        # Download main transparency page
        html_content = self.get_page_content(self.urls["municipal_portal"])
        
        if html_content:
            # Save the HTML page
            html_path = self.data_dir / "transparencia_page.html"
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            logger.info(f"Saved transparency page to {html_path}")
            
            # Extract and download PDFs
            pdf_links = self.extract_pdf_links(html_content, self.urls["municipal_portal"])
            logger.info(f"Found {len(pdf_links)} PDF links")
            
            for i, pdf_url in enumerate(pdf_links):
                # Create a safe filename
                filename = f"pdf_{i+1}_{os.path.basename(urlparse(pdf_url).path)}"
                if not filename.lower().endswith(('.pdf')):
                    filename += '.pdf'
                
                pdf_path = self.data_dir / "pdfs" / filename
                self.download_file(pdf_url, pdf_path)
                
                # Be respectful to the server
                time.sleep(1)
            
            # Extract and download CSVs/XLS
            csv_links = self.extract_csv_links(html_content, self.urls["municipal_portal"])
            logger.info(f"Found {len(csv_links)} CSV/XLS links")
            
            for i, csv_url in enumerate(csv_links):
                # Create a safe filename
                filename = f"csv_{i+1}_{os.path.basename(urlparse(csv_url).path)}"
                
                csv_path = self.data_dir / "csvs" / filename
                self.download_file(csv_url, csv_path)
                
                # Be respectful to the server
                time.sleep(1)
        
        # Also try other related URLs
        for name, url in self.urls.items():
            if name != "municipal_portal":  # Already handled
                logger.info(f"Processing {name} at {url}")
                
                html_content = self.get_page_content(url)
                if html_content:
                    # Save the page
                    html_path = self.data_dir / f"{name}_page.html"
                    with open(html_path, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    logger.info(f"Saved {name} page to {html_path}")
                    
                    # Extract and download PDFs
                    pdf_links = self.extract_pdf_links(html_content, url)
                    logger.info(f"Found {len(pdf_links)} PDF links in {name}")
                    
                    for i, pdf_url in enumerate(pdf_links):
                        filename = f"{name}_pdf_{i+1}_{os.path.basename(urlparse(pdf_url).path)}"
                        if not filename.lower().endswith(('.pdf')):
                            filename += '.pdf'
                        
                        pdf_path = self.data_dir / "pdfs" / filename
                        self.download_file(pdf_url, pdf_path)
                        time.sleep(1)

    def download_from_datos_gob_ar(self):
        """Download datasets from datos.gob.ar related to Carmen de Areco"""
        logger.info("Attempting to download data from datos.gob.ar...")
        
        # Try to find datasets related to Carmen de Areco
        search_url = "https://datos.gob.ar/api/3/action/package_search?q=carmen+de+areco"
        
        try:
            response = requests.get(search_url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                
                # Save the search results
                search_results_path = self.data_dir / "datos_gob_ar_search.json"
                with open(search_results_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Saved search results to {search_results_path}")
                
                # If there are results, try to download the resources
                if data.get('success') and data.get('result', {}).get('count', 0) > 0:
                    datasets = data['result']['results']
                    
                    for i, dataset in enumerate(datasets):
                        dataset_title = dataset.get('title', f'dataset_{i}')
                        resources = dataset.get('resources', [])
                        
                        logger.info(f"Found dataset '{dataset_title}' with {len(resources)} resources")
                        
                        for j, resource in enumerate(resources):
                            resource_url = resource.get('url')
                            resource_format = resource.get('format', '').lower()
                            
                            if resource_url and resource_format in ['csv', 'xls', 'xlsx', 'json', 'pdf']:
                                # Create a safe filename
                                filename = f"datos_gob_ar_{dataset_title.replace(' ', '_')}_resource_{j}.{resource_format}"
                                resource_path = self.data_dir / "datos_gob_ar" / filename
                                
                                self.download_file(resource_url, resource_path)
                                time.sleep(1)
                else:
                    logger.info("No datasets found for 'carmen de areco' on datos.gob.ar")
            else:
                logger.warning(f"datos.gob.ar search returned status {response.status_code}")
        except Exception as e:
            logger.error(f"Error downloading from datos.gob.ar: {e}")

    def download_provincial_data(self):
        """Download Buenos Aires provincial data that may include Carmen de Areco"""
        logger.info("Attempting to download provincial data...")
        
        # Search for provincial data that might include Carmen de Areco
        search_terms = [
            "carmen de areco",
            "municipio",
            "transparencia municipal"
        ]
        
        for term in search_terms:
            # This is a placeholder - in reality, we'd need to find the correct provincial API
            logger.info(f"Searching provincial data for: {term}")
            
            # For now, we'll just try to access the Buenos Aires data portal
            try:
                # Try to access the Buenos Aires province open data portal
                response = requests.get("https://datos.gba.gob.ar/", timeout=30)
                if response.status_code == 200:
                    # Save the main page
                    gba_path = self.data_dir / "gba_data_portal.html"
                    with open(gba_path, 'w', encoding='utf-8') as f:
                        f.write(response.text)
                    logger.info(f"Saved Buenos Aires data portal page to {gba_path}")
                else:
                    logger.info("Could not access Buenos Aires data portal")
            except Exception as e:
                logger.warning(f"Could not access Buenos Aires data portal: {e}")
            
            time.sleep(5)  # Delay between searches

    def download_all_data(self):
        """Download all available data from external sources"""
        logger.info("Starting comprehensive data download...")
        
        # Create subdirectories
        (self.data_dir / "pdfs").mkdir(exist_ok=True)
        (self.data_dir / "csvs").mkdir(exist_ok=True)
        (self.data_dir / "datos_gob_ar").mkdir(exist_ok=True)
        
        # Download municipal data
        self.download_transparency_data()
        
        # Download from datos.gob.ar
        self.download_from_datos_gob_ar()
        
        # Download provincial data
        self.download_provincial_data()
        
        logger.info(f"Data download completed. Files saved to: {self.data_dir}")

def main():
    """Main function to run the data downloader"""
    downloader = CarmenDataDownloader()
    downloader.download_all_data()
    
    # Print summary
    pdfs_dir = downloader.data_dir / "pdfs"
    csvs_dir = downloader.data_dir / "csvs"
    
    pdf_count = len(list(pdfs_dir.glob("*.pdf"))) if pdfs_dir.exists() else 0
    csv_count = len(list(csvs_dir.glob("*.csv"))) + len(list(csvs_dir.glob("*.xlsx"))) + len(list(csvs_dir.glob("*.xls"))) if csvs_dir.exists() else 0
    
    print("\n--- Download Summary ---")
    print(f"PDF files downloaded: {pdf_count}")
    print(f"CSV/XLS files downloaded: {csv_count}")
    print(f"Total files saved to: {downloader.data_dir}")
    
    return pdf_count, csv_count

if __name__ == "__main__":
    main()
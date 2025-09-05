#!/usr/bin/env python3
"""
Live Data Scraper - Carmen de Areco Transparency Portal
"""

import requests
import re
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime
import json

class LiveScraper:
    def __init__(self, output_dir="data/live_scrape"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.base_url = "https://carmendeareco.gob.ar/transparencia/"
        self.financial_keywords = [
            "presupuesto", "balance", "ejecucion", "financiero", 
            "ordenanza impositiva", "contrato", "licitacion", "gasto", 
            "ingreso", "deuda", "salario", "declaracion jurada"
        ]
        
    def scrape_all(self):
        """Main scraping function"""
        try:
            response = requests.get(self.base_url, timeout=30)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            documents = []
            doc_pattern = re.compile(r'\.(pdf|xlsx?|docx?)$', re.I)
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                link_text = link.get_text().lower()
                
                # Check if the link is a document and contains financial keywords
                is_financial_document = False
                if doc_pattern.search(href):
                    for keyword in self.financial_keywords:
                        if keyword in link_text or keyword in href.lower():
                            is_financial_document = True
                            break
                
                if is_financial_document:
                    if not href.startswith('http'):
                        full_url = f"{self.base_url.rstrip('/')}/{href.lstrip('/')}"
                    else:
                        full_url = href
                    
                    filename = Path(href).name
                    local_path = self.output_dir / filename
                    
                    # Download document
                    if not local_path.exists():
                        try:
                            doc_response = requests.get(full_url, timeout=60)
                            doc_response.raise_for_status()
                            
                            with open(local_path, 'wb') as f:
                                f.write(doc_response.content)
                            
                            print(f"Downloaded: {filename}")
                        except Exception as e:
                            print(f"Failed to download {filename}: {e}")
                            local_path = None
                    
                    yield (full_url, local_path)
                    
        except Exception as e:
            print(f"Scraping failed: {e}")

if __name__ == "__main__":
    scraper = LiveScraper()
    count = 0
    for url, path in scraper.scrape_all():
        count += 1
    print(f"Processed {count} documents")
#!/usr/bin/env python3
"""
Carmen de Areco Transparency Portal - Web Scraper and Archive Tool
This tool scrapes the current Carmen de Areco website and retrieves historical versions
from the Wayback Machine for cold storage in your transparency portal.
"""

import os
import json
import time
import hashlib
import requests
from datetime import datetime
from urllib.parse import urljoin, urlparse, unquote
from bs4 import BeautifulSoup
import waybackpy
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
from typing import Set, List, Dict, Optional
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CarmenArecoScraper:
    def __init__(self, base_url="https://carmendeareco.gob.ar", storage_dir="cold_storage"):
        self.base_url = base_url
        self.storage_dir = storage_dir
        self.visited_urls: Set[str] = set()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; TransparencyPortalBot/1.0; +https://transparencia.carmendeareco.local)'
        })
        
        # Create storage directories
        self.create_storage_structure()
        
    def create_storage_structure(self):
        """Create directory structure for cold storage"""
        directories = [
            'current_site',
            'archive_versions',
            'documents/pdf',
            'documents/xlsx',
            'documents/doc',
            'documents/other',
            'metadata',
            'checksums'
        ]
        
        for directory in directories:
            path = os.path.join(self.storage_dir, directory)
            os.makedirs(path, exist_ok=True)
            
    from waybackpy import WaybackMachineCDXServerAPI

# ... (rest of the class)

    def get_wayback_snapshots(self, url: str) -> List[Dict]:
        """Get all available Wayback Machine snapshots for a URL"""
        snapshots = []
        try:
            user_agent = "Mozilla/5.0 (compatible; TransparencyPortalBot/1.0; +https://transparencia.carmendeareco.local)"
            cdx_api = WaybackMachineCDXServerAPI(url, user_agent)
            
            for record in cdx_api.snapshots():
                snapshots.append({
                    'timestamp': record.timestamp,
                    'url': record.archive_url,
                    'status_code': record.status_code,
                    'mimetype': record.mimetype
                })
                
            logger.info(f"Found {len(snapshots)} snapshots for {url}")
        except Exception as e:
            logger.error(f"Error getting Wayback snapshots for {url}: {str(e)}")
            
        return snapshots
    
    def download_file(self, url: str, save_path: str) -> bool:
        """Download a file from URL"""
        try:
            response = self.session.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
            # Calculate and save checksum
            self.save_checksum(save_path)
            logger.info(f"Downloaded: {url} -> {save_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error downloading {url}: {str(e)}")
            return False
    
    def save_checksum(self, file_path: str):
        """Calculate and save file checksum for integrity verification"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
                
        checksum = sha256_hash.hexdigest()
        checksum_file = os.path.join(
            self.storage_dir, 
            'checksums', 
            os.path.basename(file_path) + '.sha256'
        )
        
        with open(checksum_file, 'w') as f:
            f.write(checksum)
            
    def scrape_current_site(self):
        """Scrape the current Carmen de Areco website"""
        logger.info("Starting current site scraping...")
        
        # Key pages to scrape
        priority_paths = [
            '/',
            '/transparencia',
            '/presupuesto',
            '/licitaciones',
            '/ordenanzas',
            '/boletin-oficial',
            '/declaraciones-juradas',
            '/presupuesto-participativo',
            '/empleados',
            '/gobierno',
            '/noticias',
            '/servicios'
        ]
        
        # Start with priority pages
        for path in priority_paths:
            url = urljoin(self.base_url, path)
            self.scrape_page(url)
            
        # Save metadata
        self.save_metadata()
        
    def scrape_page(self, url: str, depth: int = 0, max_depth: int = 3):
        """Recursively scrape a page and its links"""
        if url in self.visited_urls or depth > max_depth:
            return
            
        self.visited_urls.add(url)
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Save HTML content
            self.save_html_content(url, response.text, 'current_site')
            
            # Parse for links and documents
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Download documents
            self.download_documents(soup, url)
            
            # Find and scrape internal links
            if depth < max_depth:
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(self.base_url, href)
                    
                    # Only scrape internal links
                    if urlparse(full_url).netloc == urlparse(self.base_url).netloc:
                        self.scrape_page(full_url, depth + 1, max_depth)
                        
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            
    def download_documents(self, soup: BeautifulSoup, base_url: str):
        """Download all documents (PDF, XLSX, DOC, etc.) from a page"""
        document_extensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.csv', '.zip']
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            
            # Check if it's a document
            if any(href.lower().endswith(ext) for ext in document_extensions):
                # Determine file type and save location
                ext = os.path.splitext(href.lower())[1][1:]  # Remove the dot
                if ext in ['pdf']:
                    subdir = 'documents/pdf'
                elif ext in ['xlsx', 'xls']:
                    subdir = 'documents/xlsx'
                elif ext in ['doc', 'docx']:
                    subdir = 'documents/doc'
                else:
                    subdir = 'documents/other'
                    
                filename = os.path.basename(unquote(href))
                save_path = os.path.join(self.storage_dir, subdir, filename)
                
                if not os.path.exists(save_path):
                    self.download_file(full_url, save_path)
                    
    def save_html_content(self, url: str, content: str, subdir: str):
        """Save HTML content to file"""
        # Create filename from URL
        parsed = urlparse(url)
        path = parsed.path.strip('/')
        if not path:
            path = 'index'
        
        filename = path.replace('/', '_') + '.html'
        save_path = os.path.join(self.storage_dir, subdir, filename)
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        # Save metadata
        metadata = {
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'file_path': save_path
        }
        
        metadata_file = os.path.join(
            self.storage_dir, 
            'metadata', 
            filename + '.json'
        )
        
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
            
    def scrape_wayback_versions(self):
        """Scrape historical versions from Wayback Machine"""
        logger.info("Starting Wayback Machine scraping...")
        
        # Get snapshots for main pages
        urls_to_check = [
            self.base_url,
            f"{self.base_url}/transparencia",
            f"{self.base_url}/presupuesto",
            f"{self.base_url}/licitaciones",
            f"{self.base_url}/ordenanzas"
        ]
        
        for url in urls_to_check:
            snapshots = self.get_wayback_snapshots(url)
            
            # Download the most important snapshots (e.g., one per year)
            yearly_snapshots = self.filter_yearly_snapshots(snapshots)
            
            for snapshot in yearly_snapshots:
                self.download_wayback_snapshot(snapshot)
                
    def filter_yearly_snapshots(self, snapshots: List[Dict]) -> List[Dict]:
        """Filter snapshots to get one per year"""
        yearly = {}
        
        for snapshot in snapshots:
            if snapshot['status_code'] == '200':
                year = snapshot['timestamp'][:4]
                if year not in yearly or snapshot['timestamp'] > yearly[year]['timestamp']:
                    yearly[year] = snapshot
                    
        return list(yearly.values())
    
    def download_wayback_snapshot(self, snapshot: Dict):
        """Download a Wayback Machine snapshot"""
        try:
            response = self.session.get(snapshot['url'], timeout=30)
            response.raise_for_status()
            
            # Save with timestamp in filename
            timestamp = snapshot['timestamp']
            year = timestamp[:4]
            
            subdir = f"archive_versions/{year}"
            
            # Parse URL to create filename
            parsed = urlparse(snapshot['url'])
            original_url = parsed.path.split('/http')[1] if '/http' in parsed.path else parsed.path
            
            self.save_html_content(original_url, response.text, subdir)
            
            logger.info(f"Downloaded Wayback snapshot: {snapshot['url']}")
            
        except Exception as e:
            logger.error(f"Error downloading Wayback snapshot {snapshot['url']}: {str(e)}")
            
    def save_metadata(self):
        """Save scraping metadata"""
        metadata = {
            'scrape_date': datetime.now().isoformat(),
            'base_url': self.base_url,
            'total_pages_scraped': len(self.visited_urls),
            'visited_urls': list(self.visited_urls)
        }
        
        metadata_file = os.path.join(self.storage_dir, 'metadata', 'scrape_metadata.json')
        
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
            
    def download_specific_wayback_snapshot(self, url: str):
        """Download a specific Wayback Machine snapshot URL"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Extract timestamp and original URL from the Wayback Machine URL
            # Example: https://web.archive.org/web/20230618000000*/https://carmendeareco.gob.ar/
            match = re.match(r"https://web.archive.org/web/(\d+)\*/(.*)", url)
            if match:
                timestamp = match.group(1)
                original_url = match.group(2)
            else:
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                original_url = url # Fallback to the provided URL
            
            year = timestamp[:4]
            subdir = f"archive_versions/{year}"
            
            self.save_html_content(original_url, response.text, subdir)
            
            logger.info(f"Downloaded specific Wayback snapshot: {url}")
            
        except Exception as e:
            logger.error(f"Error downloading specific Wayback snapshot {url}: {str(e)}")
            
    def generate_report(self):
        """Generate a scraping report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'statistics': {
                'pages_scraped': len(self.visited_urls),
                'documents_downloaded': self.count_files('documents'),
                'archive_versions': self.count_files('archive_versions'),
                'total_size_mb': self.calculate_storage_size()
            },
            'urls_scraped': sorted(list(self.visited_urls))
        }
        
        report_file = os.path.join(self.storage_dir, 'scraping_report.json')
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Report saved to {report_file}")
        
    def count_files(self, directory: str) -> int:
        """Count files in a directory"""
        path = os.path.join(self.storage_dir, directory)
        count = 0
        
        for root, dirs, files in os.walk(path):
            count += len(files)
            
        return count
    
    def calculate_storage_size(self) -> float:
        """Calculate total storage size in MB"""
        total_size = 0
        
        for root, dirs, files in os.walk(self.storage_dir):
            for file in files:
                file_path = os.path.join(root, file)
                total_size += os.path.getsize(file_path)
                
        return round(total_size / (1024 * 1024), 2)

import sys

def main():
    """Main execution function"""
    if len(sys.argv) > 1:
        url = sys.argv[1]
        scraper = CarmenArecoScraper(base_url=url)
        
        # If the provided URL is a Wayback Machine URL, only download that specific snapshot
        if "web.archive.org" in url:
            logger.info(f"Downloading specific Wayback Machine snapshot: {url}")
            scraper.download_specific_wayback_snapshot(url)
            pass
        else:
            logger.info(f"Starting Carmen de Areco transparency portal scraping for {scraper.base_url}...")
            # Scrape current site
            scraper.scrape_current_site()
            # Scrape Wayback Machine versions
            scraper.scrape_wayback_versions()
    else:
        scraper = CarmenArecoScraper()
        logger.info(f"Starting Carmen de Areco transparency portal scraping for {scraper.base_url}...")
        # Scrape current site
        scraper.scrape_current_site()
        # Scrape Wayback Machine versions
        scraper.scrape_wayback_versions()

    # Generate report
    scraper.generate_report()

    logger.info("Scraping completed! Check the 'cold_storage' directory for results.")


if __name__ == "__main__":
    main()
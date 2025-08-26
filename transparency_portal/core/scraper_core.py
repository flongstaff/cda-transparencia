"""
Core functionalities for scraping websites.
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
from typing import Set, List, Dict, Optional, Tuple
import re
from urllib.robotparser import RobotFileParser

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

class ScraperCore:
    def __init__(self, storage_dir="cold_storage", user_agent="Mozilla/5.0 (compatible; TransparencyPortalBot/1.0; +https://transparencia.carmendeareco.local)"):
        self.storage_dir = storage_dir
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': user_agent})
        self.visited_urls: Set[str] = set()
        self.robot_parsers: Dict[str, RobotFileParser] = {}

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

    def get_unique_filename(self, path):
        """Generates a unique filename to prevent overwriting"""
        if not os.path.exists(path):
            return path
        base, ext = os.path.splitext(path)
        counter = 1
        while os.path.exists(f"{base}_{counter}{ext}"):
            counter += 1
        return f"{base}_{counter}{ext}"

    def download_file(self, url: str, save_path: str) -> bool:
        """Download a file from URL"""
        try:
            response = self.session.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
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
            
    def save_html_content(self, url: str, content: str, subdir: str, filename_prefix: str = ''):
        """Save HTML content to file"""
        parsed = urlparse(url)
        path = parsed.path.strip('/')
        if not path:
            path = 'index'
        
        filename = f"{filename_prefix}{path.replace('/', '_')}.html"
        save_path = os.path.join(self.storage_dir, subdir, filename)
        save_path = self.get_unique_filename(save_path)
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        metadata = {
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'file_path': save_path
        }
        
        metadata_file = os.path.join(
            self.storage_dir, 
            'metadata', 
            os.path.basename(save_path) + '.json'
        )
        
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Saved HTML: {url} -> {save_path}")

    def get_robots_parser(self, url: str) -> RobotFileParser:
        """Get or create a RobotFileParser for a given domain"""
        domain = urlparse(url).netloc
        if domain not in self.robot_parsers:
            rp = RobotFileParser()
            robots_url = urljoin(f"http://{domain}", "/robots.txt")
            try:
                rp.set_url(robots_url)
                rp.read()
                logger.info(f"Loaded robots.txt for {domain}")
            except Exception as e:
                logger.warning(f"Could not load robots.txt for {domain}: {e}")
            self.robot_parsers[domain] = rp
        return self.robot_parsers[domain]

    def is_allowed_by_robots(self, url: str) -> bool:
        """Check if a URL is allowed by robots.txt"""
        rp = self.get_robots_parser(url)
        user_agent = self.session.headers.get('User-Agent', '*')
        return rp.can_fetch(user_agent, url)

    def get_wayback_snapshots(self, url: str) -> List[Dict]:
        """Get all available Wayback Machine snapshots for a URL"""
        snapshots = []
        try:
            cdx_api = waybackpy.WaybackMachineCDXServerAPI(url, self.session.headers['User-Agent'])
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

    def download_wayback_snapshot(self, snapshot: Dict, original_url: str):
        """Download a Wayback Machine snapshot"""
        try:
            response = self.session.get(snapshot['url'], timeout=30)
            response.raise_for_status()
            
            timestamp = snapshot['timestamp']
            year = timestamp[:4]
            subdir = f"archive_versions/{year}"
            
            self.save_html_content(original_url, response.text, subdir, filename_prefix=f"web_{timestamp}_")
            logger.info(f"Downloaded Wayback snapshot: {snapshot['url']}")
            
        except Exception as e:
            logger.error(f"Error downloading Wayback snapshot {snapshot['url']}: {str(e)}")

    def extract_links_and_documents(self, html_content: str, base_url: str, document_extensions: List[str]) -> Tuple[List[str], List[str]]:
        """Extracts all links and document URLs from HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        links = []
        document_urls = []

        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            
            if any(full_url.lower().endswith(ext) for ext in document_extensions):
                document_urls.append(full_url)
            else:
                links.append(full_url)
        return links, document_urls

    def count_files(self, directory: str) -> int:
        """Count files in a directory"""
        path = os.path.join(self.storage_dir, directory)
        count = 0
        if os.path.exists(path):
            for root, dirs, files in os.walk(path):
                count += len(files)
        return count
    
    def calculate_storage_size(self) -> float:
        """Calculate total storage size in MB"""
        total_size = 0
        if os.path.exists(self.storage_dir):
            for root, dirs, files in os.walk(self.storage_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    total_size += os.path.getsize(file_path)
        return round(total_size / (1024 * 1024), 2)

    def generate_report(self, total_pages_scraped: int = 0):
        """Generate a scraping report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'statistics': {
                'pages_scraped': total_pages_scraped,
                'documents_downloaded': self.count_files('documents'),
                'archive_versions': self.count_files('archive_versions'),
                'total_size_mb': self.calculate_storage_size()
            },
            'storage_path': os.path.abspath(self.storage_dir)
        }
        
        report_file = os.path.join(self.storage_dir, 'scraping_report.json')
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Report saved to {report_file}")

    def guess_file_urls(self, base_url: str, years: List[int], keywords: List[str], file_extensions: List[str], target_paths: List[str], output_subdir: str = 'documents/other'):
        """Attempts to guess file URLs based on common patterns and downloads them."""
        guessed_urls = set()
        for year in years:
            for month in range(1, 13):
                for path_segment in target_paths:
                    # Construct potential URL paths
                    # Example: https://carmendeareco.gob.ar/wp-content/uploads/2023/01/
                    # Example: https://carmendeareco.gob.ar/estadisticas/2023/
                    
                    # For wp-content/uploads, include month
                    if "wp-content/uploads" in path_segment:
                        subpath = f"{path_segment.strip('/')}/{year}/{month:02d}/"
                    else:
                        subpath = f"{path_segment.strip('/')}/{year}/"
                    
                    for ext in file_extensions:
                        for keyword in keywords:
                            # Common naming conventions
                            potential_filenames = [
                                f"{year}_{keyword.replace(' ', '_')}{ext}",
                                f"{year}-{keyword.replace(' ', '-')}{ext}",
                                f"{keyword.replace(' ', '_')}_{year}{ext}",
                                f"{keyword.replace(' ', '-')}_{year}{ext}",
                                f"{keyword.replace(' ', '')}{year}{ext}",
                                f"{keyword.replace(' ', '-')}-{year}{ext}",
                                f"{keyword.replace(' ', '%20')}{year}{ext}", # URL encoded space
                                f"{keyword.replace(' ', '%20')}-{year}{ext}", # URL encoded space
                            ]
                            
                            for filename in potential_filenames:
                                full_url = urljoin(base_url, f"{subpath}{filename}")
                                if full_url not in guessed_urls:
                                    guessed_urls.add(full_url)
                                    logger.info(f"Attempting to download guessed URL: {full_url}")
                                    
                                    # Determine file type and save location
                                    ext_clean = ext.lstrip('.')
                                    if ext_clean in ['pdf']:
                                        subdir = 'documents/pdf'
                                    elif ext_clean in ['xlsx', 'xls']:
                                        subdir = 'documents/xlsx'
                                    elif ext_clean in ['doc', 'docx']:
                                        subdir = 'documents/doc'
                                    else:
                                        subdir = output_subdir # Fallback for other types
                                        
                                    save_path = os.path.join(self.storage_dir, subdir, os.path.basename(unquote(full_url)))
                                    save_path = self.get_unique_filename(save_path)
                                    
                                    if self.download_file(full_url, save_path):
                                        logger.info(f"Successfully downloaded guessed file: {full_url}")
                                    time.sleep(0.5) # Small delay to be polite
        return list(guessed_urls)

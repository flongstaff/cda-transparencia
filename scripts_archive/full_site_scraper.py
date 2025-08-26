import os
import argparse
import time
import logging
from urllib.parse import urljoin, urlparse, unquote
from typing import Set, List, Dict, Optional

from scraper_core import ScraperCore
from osint_monitor import OSINTComplianceMonitor, ComplianceStatus, integrate_with_osint_tool

logger = logging.getLogger(__name__)

class FullSiteScraper:
    def __init__(self, base_url: str, storage_dir: str = "cold_storage", compliance_monitor: OSINTComplianceMonitor = None):
        self.base_url = base_url
        self.scraper_core = ScraperCore(storage_dir=storage_dir)
        self.compliance_monitor = compliance_monitor or OSINTComplianceMonitor()
        self.visited_urls: Set[str] = set()
                self.compliant_request_func = integrate_with_osint_tool(self.compliance_monitor)

    

    def scrape_page(self, url: str, depth: int = 0, max_depth: int = 3, purpose: str = "Full site crawling"):
        if url in self.visited_urls or depth > max_depth:
            return

        # Check robots.txt compliance before visiting
        robots_checked = True
        robots_allowed = self.scraper_core.is_allowed_by_robots(url)
        if not robots_allowed:
            logger.info(f"Skipping {url} due to robots.txt exclusion.")
            return

        self.visited_urls.add(url)

        response = self.compliant_request_func(url, purpose=purpose, robots_checked=robots_checked, robots_allowed=robots_allowed, timeout=30)
        if not response:
            return

        # Save HTML content
        self.scraper_core.save_html_content(url, response.text, 'current_site')

        # Parse for links and documents
        document_extensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.csv', '.zip']
        links, document_urls = self.scraper_core.extract_links_and_documents(response.text, url, document_extensions)

        # Download documents
        for doc_url in document_urls:
            parsed_url = urlparse(doc_url)
            filename = os.path.basename(unquote(parsed_url.path))
            
            ext_clean = os.path.splitext(filename)[1].lower().lstrip('.')
            if ext_clean in ['pdf']:
                subdir = 'documents/pdf'
            elif ext_clean in ['xlsx', 'xls']:
                subdir = 'documents/xlsx'
            elif ext_clean in ['doc', 'docx']:
                subdir = 'documents/doc'
            else:
                subdir = 'documents/other'

            save_path = os.path.join(self.scraper_core.storage_dir, subdir, filename)
            save_path = self.scraper_core.get_unique_filename(save_path)
            self.scraper_core.download_file(doc_url, save_path)
            time.sleep(0.5) # Be polite

        # Find and scrape internal links
        if depth < max_depth:
            for link in links:
                full_url = urljoin(self.base_url, link)
                # Only scrape internal links
                if urlparse(full_url).netloc == urlparse(self.base_url).netloc:
                    self.scrape_page(full_url, depth + 1, max_depth, purpose=purpose)

    def scrape_current_site(self, max_depth: int = 3, purpose: str = "Current site scraping"):
        logger.info("Starting current site scraping...")
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
        for path in priority_paths:
            url = urljoin(self.base_url, path)
            self.scrape_page(url, max_depth=max_depth, purpose=purpose)

    def scrape_wayback_versions(self, purpose: str = "Wayback Machine archiving"):
        logger.info("Starting Wayback Machine scraping...")
        urls_to_check = [
            self.base_url,
            f"{self.base_url}/transparencia",
            f"{self.base_url}/presupuesto",
            f"{self.base_url}/licitaciones",
            f"{self.base_url}/ordenanzas"
        ]
        for url in urls_to_check:
            snapshots = self.scraper_core.get_wayback_snapshots(url)
            yearly_snapshots = self._filter_yearly_snapshots(snapshots)
            for snapshot in yearly_snapshots:
                self.scraper_core.download_wayback_snapshot(snapshot, url)

    def _filter_yearly_snapshots(self, snapshots: List[Dict]) -> List[Dict]:
        """Filter snapshots to get one per year"""
        yearly = {}
        for snapshot in snapshots:
            if snapshot['status_code'] == '200':
                year = snapshot['timestamp'][:4]
                if year not in yearly or snapshot['timestamp'] > yearly[year]['timestamp']:
                    yearly[year] = snapshot
        return list(yearly.values())

    def download_specific_wayback_snapshot(self, url: str, purpose: str = "Specific Wayback snapshot download"):
        logger.info(f"Downloading specific Wayback Machine snapshot: {url}")
        response = self._make_compliant_request(url, purpose=purpose, timeout=30)
        if not response:
            return

        # Extract timestamp and original URL from the Wayback Machine URL
        match = re.match(r"https://web.archive.org/web/(\d+)\*/(.*)", url)
        if match:
            timestamp = match.group(1)
            original_url = match.group(2)
        else:
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            original_url = url # Fallback to the provided URL
        
        year = timestamp[:4]
        subdir = f"archive_versions/{year}"
        self.scraper_core.save_html_content(original_url, response.text, subdir, filename_prefix=f"web_{timestamp}_")

def main():
    parser = argparse.ArgumentParser(description="Comprehensive Full Site Scraper for Transparency Portal.")
    parser.add_argument("--base_url", type=str, default="https://carmendeareco.gob.ar/", help="Base URL for scraping.")
    parser.add_argument("--storage_dir", type=str, default="cold_storage", help="Directory to store scraped data.")
    parser.add_argument("--max_depth", type=int, default=3, help="Maximum recursion depth for current site scraping.")
    parser.add_argument("--scrape_current", action="store_true", help="Enable current site scraping.")
    parser.add_argument("--scrape_wayback", action="store_true", help="Enable Wayback Machine scraping.")
    parser.add_argument("--specific_wayback_url", type=str, help="Download a specific Wayback Machine snapshot URL.")
    parser.add_argument("--purpose", type=str, default="Government transparency research", help="Purpose for compliance monitoring.")

    args = parser.parse_args()

    scraper = FullSiteScraper(base_url=args.base_url, storage_dir=args.storage_dir)

    if args.specific_wayback_url:
        scraper.download_specific_wayback_snapshot(args.specific_wayback_url, purpose=args.purpose)
    else:
        if args.scrape_current:
            scraper.scrape_current_site(max_depth=args.max_depth, purpose=args.purpose)
        if args.scrape_wayback:
            scraper.scrape_wayback_versions(purpose=args.purpose)

    scraper.scraper_core.generate_report(total_pages_scraped=len(scraper.visited_urls))
    print("Full site scraping process completed.")

if __name__ == "__main__":
    main()

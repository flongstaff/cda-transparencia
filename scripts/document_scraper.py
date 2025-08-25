import os
import argparse
import time
import logging
from urllib.parse import urljoin, urlparse, unquote
from typing import List, Dict

from scraper_core import ScraperCore
from osint_monitor import OSINTComplianceMonitor, ComplianceStatus, integrate_with_osint_tool

logger = logging.getLogger(__name__)

class DocumentScraper:
    def __init__(self, base_url: str, storage_dir: str = "cold_storage", compliance_monitor: OSINTComplianceMonitor = None):
        self.base_url = base_url
        self.scraper_core = ScraperCore(storage_dir=storage_dir)
        self.compliance_monitor = compliance_monitor or OSINTComplianceMonitor()
        self.compliant_request_func = integrate_with_osint_tool(self.compliance_monitor)

    

    def scrape_documents_from_url(self, url: str, document_extensions: List[str], output_subdir: str = 'documents/other', purpose: str = "Document scraping"):
        logger.info(f"Scraping documents from: {url}")
        response = self.compliant_request_func(url, purpose=purpose, timeout=30)
        if not response:
            return

        links, document_urls = self.scraper_core.extract_links_and_documents(response.text, url, document_extensions)

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
                subdir = output_subdir

            save_path = os.path.join(self.scraper_core.storage_dir, subdir, filename)
            save_path = self.scraper_core.get_unique_filename(save_path)
            self.scraper_core.download_file(doc_url, save_path)
            time.sleep(0.5) # Be polite

    def scrape_targeted_directories(self, target_urls: List[str], document_extensions: List[str], purpose: str = "Targeted directory scraping"):
        for url in target_urls:
            self.scrape_documents_from_url(url, document_extensions, purpose=purpose)

    def scrape_google_drive_file(self, file_id: str, output_subdir: str = 'documents/other', purpose: str = "Google Drive file download"):
        gdrive_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        logger.info(f"Downloading Google Drive file: {gdrive_url}")
        
        response = self._make_compliant_request(gdrive_url, purpose=purpose, stream=True, timeout=30)
        if not response:
            return

        # Try to get filename from headers, fallback to file_id
        filename = None
        if "Content-Disposition" in response.headers:
            cd = response.headers["Content-Disposition"]
            fname_match = re.findall(r"filename\*?=UTF-8''(.+)", cd)
            if fname_match:
                filename = unquote(fname_match[0])
            else:
                fname_match = re.findall(r"filename=\"(.+)\"", cd)
                if fname_match:
                    filename = unquote(fname_match[0])
        
        if not filename:
            filename = f"google_drive_file_{file_id}"
            # Try to guess extension if possible
            content_type = response.headers.get("Content-Type", "")
            if "pdf" in content_type: filename += ".pdf"
            elif "excel" in content_type or "spreadsheetml" in content_type: filename += ".xlsx"
            elif "wordprocessingml" in content_type: filename += ".docx"

        save_path = os.path.join(self.scraper_core.storage_dir, output_subdir, filename)
        save_path = self.scraper_core.get_unique_filename(save_path)

        try:
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            self.scraper_core.save_checksum(save_path)
            logger.info(f"Downloaded Google Drive file to: {save_path}")
        except Exception as e:
            logger.error(f"Error saving Google Drive file {gdrive_url}: {str(e)}")

    def run_guess_file_urls(self, base_url: str, years: List[int], keywords: List[str], file_extensions: List[str], target_paths: List[str]):
        logger.info("Attempting to guess file URLs...")
        self.scraper_core.guess_file_urls(base_url, years, keywords, file_extensions, target_paths)

def main():
    parser = argparse.ArgumentParser(description="Comprehensive Document Scraper for Transparency Portal.")
    parser.add_argument("--base_url", type=str, default="https://carmendeareco.gob.ar/", help="Base URL for scraping.")
    parser.add_argument("--storage_dir", type=str, default="cold_storage", help="Directory to store scraped data.")
    parser.add_argument("--target_urls", nargs='+', help="List of specific URLs to scrape for documents.")
    parser.add_argument("--target_paths", nargs='+', help="List of URL paths to target for document scraping (e.g., wp-content/uploads/).")
    parser.add_argument("--file_extensions", nargs='+', default=[".pdf", ".xls", ".xlsx", ".doc", ".docx", ".csv"], help="List of file extensions to download.")
    parser.add_argument("--google_drive_ids", nargs='+', help="List of Google Drive file IDs to download.")
    parser.add_argument("--guess_years", nargs='+', type=int, help="Years to use for guessing file URLs.")
    parser.add_argument("--guess_keywords", nargs='+', help="Keywords to use for guessing file URLs.")
    parser.add_argument("--purpose", type=str, default="Government transparency research", help="Purpose for compliance monitoring.")

    args = parser.parse_args()

    scraper = DocumentScraper(base_url=args.base_url, storage_dir=args.storage_dir)

    if args.target_urls:
        for url in args.target_urls:
            scraper.scrape_documents_from_url(url, args.file_extensions, purpose=args.purpose)

    if args.target_paths:
        # Construct full URLs for target paths if they are relative
        full_target_urls = [urljoin(args.base_url, path) for path in args.target_paths]
        scraper.scrape_targeted_directories(full_target_urls, args.file_extensions, purpose=args.purpose)

    if args.google_drive_ids:
        for file_id in args.google_drive_ids:
            scraper.scrape_google_drive_file(file_id, purpose=args.purpose)

    if args.guess_years and args.guess_keywords and args.target_paths:
        scraper.run_guess_file_urls(args.base_url, args.guess_years, args.guess_keywords, args.file_extensions, args.target_paths)

    scraper.scraper_core.generate_report()
    print("Document scraping process completed.")

if __name__ == "__main__":
    main()

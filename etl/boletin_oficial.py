import os
import sys
import logging
from datetime import datetime
from urllib.parse import urljoin, urlparse, unquote
from bs4 import BeautifulSoup
import re
import json

# Add the scripts directory to the Python path to import custom modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scripts')))

from document_scraper import DocumentScraper
from osint_monitor import OSINTComplianceMonitor
from etl.parsers import parse_boletin_oficial_text # Import the new parser

logger = logging.getLogger(__name__)

class BoletinOficialETL:
    def __init__(self, base_url: str, storage_dir: str = "cold_storage"):
        self.base_url = base_url
        self.compliance_monitor = OSINTComplianceMonitor()
        self.document_scraper = DocumentScraper(base_url=base_url, storage_dir=storage_dir, compliance_monitor=self.compliance_monitor)

    def extract_links_from_page(self, html_content: str) -> list[str]:
        soup = BeautifulSoup(html_content, 'html.parser')
        extracted_links = []

        # Look for links related to 'Contrataciones' or 'Licitaciones'
        # This is a preliminary search, might need refinement
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            text = a_tag.get_text(strip=True)

            if "contrataciones" in href.lower() or "licitaciones" in href.lower() or \
               "contrataciones" in text.lower() or "licitaciones" in text.lower():
                full_url = urljoin(self.base_url, href)
                extracted_links.append(full_url)
        
        # Also look for direct links to PDF/CSV files if they are present on the main page
        document_extensions = ['.pdf', '.csv', '.xlsx', '.xls']
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if any(href.lower().endswith(ext) for ext in document_extensions):
                full_url = urljoin(self.base_url, href)
                extracted_links.append(full_url)

        return list(set(extracted_links)) # Return unique links

    def run_etl(self, url: str):
        logger.info(f"Starting ETL for Boletín Oficial from {url}")
        response = self.document_scraper.compliant_request_func(url, purpose="Extracting links from Official Gazette", timeout=60)
        
        extracted_documents_data = [] # Initialize the list here

        if response:
            extracted_links = self.extract_links_from_page(response.text)
            logger.info(f"Found {len(extracted_links)} relevant links.")
            
            # For now, just print the links. Future: download and process them.
            for link in extracted_links:
                logger.info(f"- {link}")
                # Download the PDF file
                parsed_url = urlparse(link)
                filename = os.path.basename(unquote(parsed_url.path))
                save_path = os.path.join(self.document_scraper.scraper_core.storage_dir, 'documents', 'pdf', filename)
                save_path = self.document_scraper.scraper_core.get_unique_filename(save_path)
                
                # Use compliant request for downloading the file
                response = self.document_scraper.compliant_request_func(link, purpose="Downloading Official Gazette PDF", timeout=60, stream=True)
                if response:
                    try:
                        with open(save_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)
                        self.document_scraper.scraper_core.save_checksum(save_path)
                        logger.info(f"Downloaded PDF: {link} -> {save_path}")

                        # --- Placeholder for PDF Text Extraction ---
                        try:
                            from PyPDF2 import PdfReader
                            reader = PdfReader(save_path)
                            pdf_text = ""
                            for page in reader.pages:
                                pdf_text += page.extract_text() + "\n"
                            logger.info(f"Extracted text from PDF: {save_path} (first 200 chars): {pdf_text[:200]}...")
                            
                            # Parse the extracted text
                            parsed_data = parse_boletin_oficial_text(pdf_text)
                            logger.info(f"Parsed PDF data: {parsed_data}")
                            
                            # Store parsed data along with the link and path
                            extracted_documents_data.append({
                                "link": link,
                                "local_path": save_path,
                                "parsed_data": parsed_data
                            })

                        except Exception as pdf_e:
                            logger.error(f"Error extracting text from PDF {save_path}: {str(pdf_e)}")
                        # --- End Placeholder ---

                    except Exception as e:
                        logger.error(f"Error saving PDF {link}: {str(e)}")
                else:
                    logger.error(f"Failed to download PDF from {link}")

            # Save extracted links to a JSON file for review
            output_file = os.path.join(self.document_scraper.scraper_core.storage_dir, 'metadata', 'boletin_oficial_links.json')
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(extracted_links, f, indent=2, ensure_ascii=False)
            logger.info(f"Extracted links saved to {output_file}")

            # Save extracted documents data to a separate JSON file
            documents_output_file = os.path.join(self.document_scraper.scraper_core.storage_dir, 'metadata', 'boletin_oficial_documents_data.json')
            with open(documents_output_file, 'w', encoding='utf-8') as f:
                json.dump(extracted_documents_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Extracted documents data saved to {documents_output_file}")

        else:
            logger.error(f"Failed to retrieve content from {url}")

if __name__ == "__main__":
    BOLETIN_URL = "https://www.boletinoficial.gob.ar/"
    etl_process = BoletinOficialETL(base_url=BOLETIN_URL)
    etl_process.run_etl(BOLETIN_URL)
    
    # Generate compliance report after all activities
    report = etl_process.compliance_monitor.get_compliance_report()
    print("=== COMPLIANCE REPORT ===")
    print(f"Total Activities: {report['summary']['total_activities']}")
    print(f"Compliance Rate: {report['summary']['compliance_rate']:.2f}%")
    print(f"Violations: {report['summary']['violations']}")
    print(f"Warnings: {report['summary']['warnings']}")
    print(f"Blocked: {report['summary']['blocked']}")
    
    # Save report
    with open('compliance_report_boletin.json', 'w') as f:
        json.dump(report, f, indent=2)
        
    logger.info("Boletín Oficial ETL process completed!")
import os
import sys
import logging
from datetime import datetime
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import re
import json

# Add the scripts directory to the Python path to import custom modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scripts')))

from document_scraper import DocumentScraper
from osint_monitor import OSINTComplianceMonitor

logger = logging.getLogger(__name__)

class TendersETL:
    def __init__(self, base_url: str, storage_dir: str = "cold_storage"):
        self.base_url = base_url
        self.compliance_monitor = OSINTComplianceMonitor()
        self.document_scraper = DocumentScraper(base_url=base_url, storage_dir=storage_dir, compliance_monitor=self.compliance_monitor)

    def extract_tenders_from_page(self, html_content: str) -> list[dict]:
        soup = BeautifulSoup(html_content, 'html.parser')
        tenders_data = []

        # Assuming tenders are in a table or similar structure
        # This part needs to be adapted based on the actual HTML structure of the page
        # For licitacionesv2.gobdigital.gba.gob.ar/obras, it seems to be a table.
        # Find all tender entries, which are within div elements with class 'col-md-6'
        tender_entries = soup.find_all('div', class_='col-md-6')

        if not tender_entries:
            logger.warning("No tender entries found with class 'col-md-6'. Check HTML structure.")
            return tenders_data

        for entry in tender_entries:
            tender = {}
            # Extract the main title/description of the tender
            # This is usually the first strong text or heading
            title_tag = entry.find('h4') # Assuming the title is in an h4 tag
            tender['title'] = title_tag.get_text(strip=True) if title_tag else None

            # Extract fields using a more targeted approach based on the structure
            # Each field seems to be in a <p> tag or directly in the div
            # We can iterate through the text content and extract key-value pairs
            text_content = entry.get_text(separator=' ', strip=True)

            # Use regex to extract specific fields
            tender['Expediente'] = re.search(r'Expediente:\s*(.*?)(Comitente:|Municipio/s:|Fecha de apertura:|Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content).group(1).strip() if re.search(r'Expediente:\s*(.*?)(Comitente:|Municipio/s:|Fecha de apertura:|Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content) else None
            tender['Comitente'] = re.search(r'Comitente:\s*(.*?)(Municipio/s:|Fecha de apertura:|Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content).group(1).strip() if re.search(r'Comitente:\s*(.*?)(Municipio/s:|Fecha de apertura:|Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content) else None
            tender['Municipio/s'] = re.search(r'Municipio/s:\s*(.*?)(Fecha de apertura:|Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content).group(1).strip() if re.search(r'Municipio/s:\s*(.*?)(Fecha de apertura:|Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content) else None
            tender['Fecha de apertura'] = re.search(r'Fecha de apertura:\s*(.*?)(Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content).group(1).strip() if re.search(r'Fecha de apertura:\s*(.*?)(Estado:|Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content) else None
            tender['Estado'] = re.search(r'Estado:\s*(.*?)(Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content).group(1).strip() if re.search(r'Estado:\s*(.*?)(Número de procedimiento:|Ver detalle|Suscribirse|$)', text_content) else None
            tender['Número de procedimiento'] = re.search(r'Número de procedimiento:\s*(.*?)(Ver detalle|Suscribirse|$)', text_content).group(1).strip() if re.search(r'Número de procedimiento:\s*(.*?)(Ver detalle|Suscribirse|$)', text_content) else None

            # Extract detail URL
            detail_link_tag = entry.find('a', string='Ver detalle', href=True)
            if detail_link_tag:
                tender['detail_url'] = urljoin(self.base_url, detail_link_tag['href'])
            else:
                tender['detail_url'] = None

            tenders_data.append(tender)
        return tenders_data

    def transform_tender_data(self, raw_tender: dict) -> dict:
        # Map raw data to the public_tenders schema
        # This is a simplified mapping and needs refinement based on actual data
        transformed = {
            'year': None,
            'title': raw_tender.get('Expediente', 'N/A'), # Using Expediente as title for now
            'description': None,
            'budget': None,
            'awarded_to': None,
            'award_date': None,
            'execution_status': raw_tender.get('Estado', 'N/A'),
            'delay_analysis': None
        }

        # Extract year from 'Fecha de apertura' or 'Expediente'
        opening_date_str = raw_tender.get('Fecha de apertura')
        if opening_date_str:
            try:
                # Assuming DD/MM/YYYY HH:MMhs format
                transformed['award_date'] = datetime.strptime(opening_date_str, '%d/%m/%Y %H:%Mhs').isoformat()
                transformed['year'] = datetime.strptime(opening_date_str, '%d/%m/%Y %H:%Mhs').year
            except ValueError:
                logger.warning(f"Could not parse date: {opening_date_str}")
        
        # Try to extract year from Expediente if not found from date
        if transformed['year'] is None:
            expediente = raw_tender.get('Expediente', '')
            year_match = re.search(r'\b(20\d{2})\b', expediente) # Look for 4-digit year
            if year_match:
                transformed['year'] = int(year_match.group(1))

        # For 'title', 'description', 'budget', 'awarded_to', 'delay_analysis'
        # These would typically come from detail pages or require more complex parsing
        # For now, we'll use placeholders or N/A
        transformed['title'] = raw_tender.get('Expediente', 'N/A') # Placeholder
        transformed['description'] = raw_tender.get('Objeto', None) # If 'Objeto' column exists
        transformed['awarded_to'] = raw_tender.get('Adjudicatario', None) # If 'Adjudicatario' column exists

        # Convert budget if available and in a parsable format
        budget_str = raw_tender.get('Monto') # If 'Monto' column exists
        if budget_str:
            # Remove currency symbols, thousands separators, and replace comma with dot for decimals
            cleaned_budget_str = budget_str.replace('.', '').replace(',', '.').strip()
            cleaned_budget_str = re.sub(r'[^\d.]', '', cleaned_budget_str) # Remove non-numeric except dot
            try:
                transformed['budget'] = float(cleaned_budget_str)
            except ValueError:
                logger.warning(f"Could not parse budget: {budget_str}")

        return transformed

    def load_tender_data(self, transformed_tenders: list[dict]):
        # This function would typically send data to the backend API
        # For now, we'll just print it or save to a JSON file
        logger.info(f"Prepared {len(transformed_tenders)} tenders for loading.")
        output_file = os.path.join(self.document_scraper.scraper_core.storage_dir, 'metadata', 'tenders_extracted.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(transformed_tenders, f, indent=2, ensure_ascii=False)
        logger.info(f"Extracted tenders saved to {output_file}")

    def run_etl(self, url: str):
        logger.info(f"Starting ETL for tenders from {url}")
        response = self.document_scraper.compliant_request_func(url, purpose="Extracting public tenders", timeout=60)
        
        if response:
            raw_tenders = self.extract_tenders_from_page(response.text)
            transformed_tenders = [self.transform_tender_data(rt) for rt in raw_tenders]
            self.load_tender_data(transformed_tenders)
        else:
            logger.error(f"Failed to retrieve content from {url}")

if __name__ == "__main__":
    # Example usage
    TENDERS_URL = "https://licitacionesv2.gobdigital.gba.gob.ar/obras"
    etl_process = TendersETL(base_url=TENDERS_URL)
    etl_process.run_etl(TENDERS_URL)
    
    # Generate compliance report after all activities
    report = etl_process.compliance_monitor.get_compliance_report()
    print("\n=== COMPLIANCE REPORT ===")
    print(f"Total Activities: {report['summary']['total_activities']}")
    print(f"Compliance Rate: {report['summary']['compliance_rate']:.2f}%")
    print(f"Violations: {report['summary']['violations']}")
    print(f"Warnings: {report['summary']['warnings']}")
    print(f"Blocked: {report['summary']['blocked']}")
    
    # Save report
    with open('compliance_report_tenders.json', 'w') as f:
        json.dump(report, f, indent=2)
        
    logger.info("Tenders ETL process completed!")

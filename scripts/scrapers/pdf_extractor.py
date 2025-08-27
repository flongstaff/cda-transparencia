#!/usr/bin/env python3
"""
PDF Data Extraction Pipeline for Argentine Municipal Documents
Uses tabula-py, PyMuPDF, and specialized Argentine document processing
"""

import tabula
import pandas as pd
from pathlib import Path
import requests
from bs4 import BeautifulSoup
import fitz  # PyMuPDF
import re
import logging
from typing import Dict, List, Optional, Tuple, Union
import json
from datetime import datetime
import camelot  # Alternative PDF table extraction
import pdfplumber
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ArgentinePDFProcessor:
    """Specialized PDF processor for Argentine municipal documents"""
    
    def __init__(self, output_dir="data/pdf_extracts"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Argentine-specific patterns for document analysis
        self.currency_patterns = {
            'pesos': [r'\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', r'(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*pesos'],
            'amounts': [r'(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', r'\$\s*(\d+(?:\.\d+)*(?:,\d+)?)'],
            'budget_items': [r'Partida\s+(\d+\.\d+\.\d+)', r'Inciso\s+(\d+)', r'PP\s+(\d+)']
        }
        
        # Document type classification patterns
        self.document_types = {
            'presupuesto': ['presupuesto', 'ejecución presupuestaria', 'partidas', 'inciso'],
            'licitacion': ['licitación', 'concurso', 'cotización', 'adjudicación'],
            'contrato': ['contrato', 'convenio', 'acuerdo', 'adjudicación'],
            'ordenanza': ['ordenanza', 'decreto', 'resolución'],
            'balance': ['balance', 'estado contable', 'activo', 'pasivo'],
            'personal': ['escalafón', 'sueldo', 'personal', 'designación'],
            'obra_publica': ['obra pública', 'infraestructura', 'construcción', 'pavimento']
        }
        
        # Headers for web requests
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def discover_pdf_documents(self, base_url: str = "https://carmendeareco.gob.ar") -> List[Dict]:
        """Discover PDF documents on municipal website"""
        pdf_urls = []
        
        # Common paths where municipalities publish PDFs
        search_paths = [
            "/transparencia",
            "/presupuesto", 
            "/licitaciones",
            "/ordenanzas",
            "/decretos",
            "/boletin-oficial",
            "/obras-publicas",
            "/personal",
            "/contrataciones",
            "/finanzas"
        ]
        
        session = requests.Session()
        session.headers.update(self.headers)
        
        for path in search_paths:
            try:
                url = f"{base_url}{path}"
                logger.info(f"Scanning for PDFs in: {url}")
                
                response = session.get(url, timeout=30)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find PDF links
                    for link in soup.find_all('a', href=True):
                        href = link.get('href', '')
                        text = link.get_text(strip=True)
                        
                        if href.lower().endswith('.pdf') or 'pdf' in href.lower():
                            full_url = requests.compat.urljoin(url, href)
                            
                            pdf_info = {
                                'url': full_url,
                                'title': text,
                                'source_page': url,
                                'section': path.replace('/', ''),
                                'discovered_at': datetime.now().isoformat(),
                                'estimated_type': self._classify_document_type(text)
                            }
                            
                            pdf_urls.append(pdf_info)
                            
            except Exception as e:
                logger.error(f"Error scanning {path}: {e}")
                continue
        
        logger.info(f"Discovered {len(pdf_urls)} PDF documents")
        return pdf_urls
    
    def download_pdf(self, url: str, filename: str = None) -> Optional[Path]:
        """Download PDF document"""
        try:
            response = requests.get(url, headers=self.headers, timeout=60)
            response.raise_for_status()
            
            if filename is None:
                filename = url.split('/')[-1]
                if not filename.endswith('.pdf'):
                    filename += '.pdf'
            
            filepath = self.output_dir / filename
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Downloaded: {filename}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
            return None
    
    def extract_tables_comprehensive(self, pdf_path: Union[str, Path]) -> Dict:
        """Comprehensive table extraction using multiple libraries"""
        pdf_path = Path(pdf_path)
        results = {
            'filename': pdf_path.name,
            'extraction_methods': {},
            'best_method': None,
            'tables': [],
            'metadata': {}
        }
        
        # Method 1: Tabula-py (best for clean, structured tables)
        try:
            logger.info(f"Extracting with tabula-py: {pdf_path.name}")
            tabula_tables = tabula.read_pdf(str(pdf_path), pages='all', multiple_tables=True)
            
            if tabula_tables and len(tabula_tables) > 0:
                results['extraction_methods']['tabula'] = {
                    'success': True,
                    'tables_found': len(tabula_tables),
                    'tables': [df.to_dict('records') for df in tabula_tables if not df.empty]
                }
            else:
                results['extraction_methods']['tabula'] = {'success': False, 'error': 'No tables found'}
                
        except Exception as e:
            results['extraction_methods']['tabula'] = {'success': False, 'error': str(e)}
        
        # Method 2: Camelot (good for complex layouts)
        try:
            logger.info(f"Extracting with camelot: {pdf_path.name}")
            camelot_tables = camelot.read_pdf(str(pdf_path), pages='all')
            
            if len(camelot_tables) > 0:
                results['extraction_methods']['camelot'] = {
                    'success': True,
                    'tables_found': len(camelot_tables),
                    'tables': [table.df.to_dict('records') for table in camelot_tables]
                }
            else:
                results['extraction_methods']['camelot'] = {'success': False, 'error': 'No tables found'}
                
        except Exception as e:
            results['extraction_methods']['camelot'] = {'success': False, 'error': str(e)}
        
        # Method 3: pdfplumber (best for text extraction and simple tables)
        try:
            logger.info(f"Extracting with pdfplumber: {pdf_path.name}")
            with pdfplumber.open(pdf_path) as pdf:
                pdfplumber_tables = []
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        for table in page_tables:
                            if table:  # Non-empty table
                                df = pd.DataFrame(table[1:], columns=table[0])  # First row as headers
                                pdfplumber_tables.append(df.to_dict('records'))
                
                if pdfplumber_tables:
                    results['extraction_methods']['pdfplumber'] = {
                        'success': True,
                        'tables_found': len(pdfplumber_tables),
                        'tables': pdfplumber_tables
                    }
                else:
                    results['extraction_methods']['pdfplumber'] = {'success': False, 'error': 'No tables found'}
                    
        except Exception as e:
            results['extraction_methods']['pdfplumber'] = {'success': False, 'error': str(e)}
        
        # Method 4: PyMuPDF (fallback for complex documents)
        try:
            logger.info(f"Extracting with PyMuPDF: {pdf_path.name}")
            doc = fitz.open(pdf_path)
            pymupdf_tables = []
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                tables = page.find_tables()
                
                for table in tables:
                    try:
                        table_data = table.extract()
                        if table_data and len(table_data) > 1:
                            df = pd.DataFrame(table_data[1:], columns=table_data[0])
                            pymupdf_tables.append(df.to_dict('records'))
                    except:
                        continue
            
            doc.close()
            
            if pymupdf_tables:
                results['extraction_methods']['pymupdf'] = {
                    'success': True,
                    'tables_found': len(pymupdf_tables),
                    'tables': pymupdf_tables
                }
            else:
                results['extraction_methods']['pymupdf'] = {'success': False, 'error': 'No tables found'}
                
        except Exception as e:
            results['extraction_methods']['pymupdf'] = {'success': False, 'error': str(e)}
        
        # Determine best method and compile final tables
        best_method = self._select_best_extraction_method(results['extraction_methods'])
        results['best_method'] = best_method
        
        if best_method and results['extraction_methods'][best_method]['success']:
            results['tables'] = results['extraction_methods'][best_method]['tables']
        
        # Extract metadata
        results['metadata'] = self._extract_pdf_metadata(pdf_path)
        
        return results
    
    def extract_budget_data(self, pdf_path: Union[str, Path]) -> Dict:
        """Extract budget-specific data from PDF"""
        budget_data = {
            'filename': Path(pdf_path).name,
            'document_type': 'presupuesto',
            'extracted_at': datetime.now().isoformat(),
            'budget_items': [],
            'totals': {},
            'year': None,
            'currency': 'ARS',
            'tables': []
        }
        
        # First extract all tables
        extraction_result = self.extract_tables_comprehensive(pdf_path)
        budget_data['tables'] = extraction_result['tables']
        
        # Extract text for additional analysis
        try:
            with pdfplumber.open(pdf_path) as pdf:
                full_text = ""
                for page in pdf.pages:
                    full_text += page.extract_text() or ""
                
                # Extract year from document
                year_match = re.search(r'20\d{2}', full_text)
                if year_match:
                    budget_data['year'] = int(year_match.group())
                
                # Find budget items using Argentine patterns
                budget_items = self._extract_budget_items(full_text)
                budget_data['budget_items'] = budget_items
                
                # Extract totals
                totals = self._extract_financial_totals(full_text)
                budget_data['totals'] = totals
                
        except Exception as e:
            logger.error(f"Error extracting budget text from {pdf_path}: {e}")
        
        return budget_data
    
    def extract_contract_data(self, pdf_path: Union[str, Path]) -> Dict:
        """Extract contract/licitación data from PDF"""
        contract_data = {
            'filename': Path(pdf_path).name,
            'document_type': 'contrato_licitacion',
            'extracted_at': datetime.now().isoformat(),
            'contract_details': {},
            'participants': [],
            'amounts': [],
            'dates': [],
            'tables': []
        }
        
        # Extract tables
        extraction_result = self.extract_tables_comprehensive(pdf_path)
        contract_data['tables'] = extraction_result['tables']
        
        # Extract specific contract information
        try:
            with pdfplumber.open(pdf_path) as pdf:
                full_text = ""
                for page in pdf.pages:
                    full_text += page.extract_text() or ""
                
                # Extract contract numbers
                contract_numbers = re.findall(r'(?:Contrato|Licitación|Expediente)\s+N°?\s*(\d+/\d+)', full_text, re.IGNORECASE)
                if contract_numbers:
                    contract_data['contract_details']['numbers'] = contract_numbers
                
                # Extract amounts
                amounts = self._extract_amounts(full_text)
                contract_data['amounts'] = amounts
                
                # Extract dates
                dates = self._extract_dates(full_text)
                contract_data['dates'] = dates
                
                # Extract participant names (companies, providers)
                participants = self._extract_participants(full_text)
                contract_data['participants'] = participants
                
        except Exception as e:
            logger.error(f"Error extracting contract text from {pdf_path}: {e}")
        
        return contract_data
    
    def process_pdf_batch(self, pdf_list: List[Dict]) -> Dict:
        """Process a batch of PDF documents"""
        batch_results = {
            'processed_at': datetime.now().isoformat(),
            'total_pdfs': len(pdf_list),
            'successful': 0,
            'failed': 0,
            'results': [],
            'summary': {}
        }
        
        for pdf_info in pdf_list:
            try:
                logger.info(f"Processing: {pdf_info['title']}")
                
                # Download PDF
                pdf_path = self.download_pdf(pdf_info['url'])
                if not pdf_path:
                    continue
                
                # Determine processing method based on document type
                doc_type = pdf_info.get('estimated_type', 'general')
                
                if doc_type == 'presupuesto':
                    result = self.extract_budget_data(pdf_path)
                elif doc_type in ['licitacion', 'contrato']:
                    result = self.extract_contract_data(pdf_path)
                else:
                    result = self.extract_tables_comprehensive(pdf_path)
                
                # Add PDF info to result
                result.update({
                    'source_info': pdf_info,
                    'local_path': str(pdf_path)
                })
                
                batch_results['results'].append(result)
                batch_results['successful'] += 1
                
            except Exception as e:
                logger.error(f"Error processing {pdf_info.get('title', 'Unknown')}: {e}")
                batch_results['failed'] += 1
                batch_results['results'].append({
                    'error': str(e),
                    'source_info': pdf_info
                })
        
        # Generate summary
        batch_results['summary'] = self._generate_batch_summary(batch_results)
        
        return batch_results
    
    def save_extraction_results(self, results: Dict, base_filename: str = None) -> Path:
        """Save extraction results to files"""
        if base_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_filename = f"pdf_extraction_{timestamp}"
        
        # Save complete results as JSON
        json_file = self.output_dir / f"{base_filename}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        # Save summary as CSV
        if 'results' in results:
            csv_data = []
            for result in results['results']:
                if 'error' not in result:
                    row = {
                        'filename': result.get('filename', ''),
                        'document_type': result.get('document_type', ''),
                        'tables_found': len(result.get('tables', [])),
                        'source_url': result.get('source_info', {}).get('url', ''),
                        'title': result.get('source_info', {}).get('title', ''),
                        'extraction_method': result.get('best_method', ''),
                        'extracted_at': result.get('extracted_at', '')
                    }
                    csv_data.append(row)
            
            if csv_data:
                df = pd.DataFrame(csv_data)
                csv_file = self.output_dir / f"{base_filename}_summary.csv"
                df.to_csv(csv_file, index=False, encoding='utf-8')
        
        logger.info(f"Results saved to {json_file}")
        return json_file
    
    def _classify_document_type(self, title: str) -> str:
        """Classify document type based on title"""
        title_lower = title.lower()
        
        for doc_type, keywords in self.document_types.items():
            if any(keyword in title_lower for keyword in keywords):
                return doc_type
        
        return 'general'
    
    def _select_best_extraction_method(self, extraction_results: Dict) -> Optional[str]:
        """Select the best extraction method based on results"""
        method_scores = {}
        
        for method, result in extraction_results.items():
            if result.get('success', False):
                tables_found = result.get('tables_found', 0)
                method_scores[method] = tables_found
        
        if method_scores:
            return max(method_scores, key=method_scores.get)
        
        return None
    
    def _extract_pdf_metadata(self, pdf_path: Path) -> Dict:
        """Extract metadata from PDF"""
        metadata = {}
        
        try:
            with fitz.open(pdf_path) as doc:
                metadata = {
                    'title': doc.metadata.get('title', ''),
                    'author': doc.metadata.get('author', ''),
                    'subject': doc.metadata.get('subject', ''),
                    'creator': doc.metadata.get('creator', ''),
                    'producer': doc.metadata.get('producer', ''),
                    'creation_date': doc.metadata.get('creationDate', ''),
                    'modification_date': doc.metadata.get('modDate', ''),
                    'page_count': doc.page_count,
                    'file_size': pdf_path.stat().st_size
                }
        except Exception as e:
            logger.error(f"Error extracting metadata from {pdf_path}: {e}")
        
        return metadata
    
    def _extract_budget_items(self, text: str) -> List[Dict]:
        """Extract budget items using Argentine patterns"""
        budget_items = []
        
        # Pattern for partidas presupuestarias
        partida_pattern = r'Partida\s+(\d+\.?\d*\.?\d*\.?\d*)\s+(.+?)\s+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)'
        matches = re.findall(partida_pattern, text, re.IGNORECASE | re.MULTILINE)
        
        for match in matches:
            budget_items.append({
                'partida': match[0],
                'description': match[1].strip(),
                'amount': self._parse_amount(match[2])
            })
        
        return budget_items
    
    def _extract_financial_totals(self, text: str) -> Dict:
        """Extract total amounts from text"""
        totals = {}
        
        total_patterns = [
            (r'Total\s+General[:\s]+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', 'total_general'),
            (r'Total\s+Presupuesto[:\s]+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', 'total_presupuesto'),
            (r'Total\s+Recursos[:\s]+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', 'total_recursos'),
            (r'Total\s+Gastos[:\s]+\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', 'total_gastos')
        ]
        
        for pattern, key in total_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                totals[key] = self._parse_amount(matches[0])
        
        return totals
    
    def _extract_amounts(self, text: str) -> List[float]:
        """Extract monetary amounts from text"""
        amounts = []
        
        for pattern in self.currency_patterns['amounts']:
            matches = re.findall(pattern, text)
            for match in matches:
                try:
                    amount = self._parse_amount(match)
                    if amount > 0:
                        amounts.append(amount)
                except:
                    continue
        
        return sorted(list(set(amounts)), reverse=True)
    
    def _extract_dates(self, text: str) -> List[str]:
        """Extract dates from text"""
        dates = []
        
        date_patterns = [
            r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{4})',
            r'(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})',
            r'(\w+\s+\d{1,2},?\s+\d{4})'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        return dates
    
    def _extract_participants(self, text: str) -> List[str]:
        """Extract company/participant names"""
        participants = []
        
        # Common patterns for company names in Argentine documents
        company_patterns = [
            r'([A-Z][a-zA-Z\s&]+(?:S\.?A\.?|S\.?R\.?L\.?|S\.?A\.?S\.?))',  # Company suffixes
            r'Empresa[:\s]+([A-Z][a-zA-Z\s&]+)',
            r'Proveedor[:\s]+([A-Z][a-zA-Z\s&]+)',
            r'Adjudicatario[:\s]+([A-Z][a-zA-Z\s&]+)'
        ]
        
        for pattern in company_patterns:
            matches = re.findall(pattern, text)
            participants.extend(matches)
        
        # Clean and deduplicate
        participants = list(set([p.strip() for p in participants if len(p.strip()) > 3]))
        
        return participants
    
    def _parse_amount(self, amount_str: str) -> float:
        """Parse Argentine currency format to float"""
        try:
            # Remove currency symbols and normalize
            clean_amount = re.sub(r'[^\d.,]', '', amount_str)
            
            # Handle Argentine format: 1.234.567,89
            if ',' in clean_amount and clean_amount.count('.') > 0:
                # Split by comma to separate decimals
                parts = clean_amount.rsplit(',', 1)
                integer_part = parts[0].replace('.', '')  # Remove thousand separators
                decimal_part = parts[1] if len(parts) > 1 else '00'
                return float(f"{integer_part}.{decimal_part}")
            else:
                # Simple number
                return float(clean_amount.replace('.', '').replace(',', '.'))
        except:
            return 0.0
    
    def _generate_batch_summary(self, batch_results: Dict) -> Dict:
        """Generate summary statistics for batch processing"""
        summary = {
            'success_rate': (batch_results['successful'] / batch_results['total_pdfs']) * 100,
            'document_types': {},
            'extraction_methods': {},
            'total_tables_extracted': 0
        }
        
        for result in batch_results['results']:
            if 'error' not in result:
                doc_type = result.get('document_type', 'unknown')
                summary['document_types'][doc_type] = summary['document_types'].get(doc_type, 0) + 1
                
                method = result.get('best_method', 'unknown')
                summary['extraction_methods'][method] = summary['extraction_methods'].get(method, 0) + 1
                
                summary['total_tables_extracted'] += len(result.get('tables', []))
        
        return summary

def main():
    """Main execution function"""
    processor = ArgentinePDFProcessor()
    
    logger.info("Starting PDF discovery and extraction...")
    
    # Discover PDFs on Carmen de Areco website
    pdf_documents = processor.discover_pdf_documents()
    
    if not pdf_documents:
        logger.warning("No PDF documents found")
        return
    
    # Process all discovered PDFs
    results = processor.process_pdf_batch(pdf_documents)
    
    # Save results
    output_file = processor.save_extraction_results(results)
    
    # Print summary
    print("\n" + "="*50)
    print("PDF EXTRACTION SUMMARY")
    print("="*50)
    print(f"PDFs discovered: {len(pdf_documents)}")
    print(f"Successfully processed: {results['successful']}")
    print(f"Failed: {results['failed']}")
    print(f"Success rate: {results['summary'].get('success_rate', 0):.1f}%")
    print(f"Total tables extracted: {results['summary'].get('total_tables_extracted', 0)}")
    print(f"Results saved to: {output_file}")
    print("="*50)

if __name__ == "__main__":
    main()
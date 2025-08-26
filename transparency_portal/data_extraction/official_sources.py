"""
This module contains functions for scraping data from official sources, 
such as the municipal website and the "Boletín Oficial".
"""
import os
import logging
from urllib.parse import urljoin, urlparse, unquote
from bs4 import BeautifulSoup
import json
import aiohttp
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Set
import re
import time

# Assuming these modules will be available in the transparency_portal package
from ..core.document_scraper import DocumentScraper
from ..core.osint_monitor import OSINTComplianceMonitor
from ..processing.parsers import parse_boletin_oficial_text

logger = logging.getLogger(__name__)

def scrape_boletin_oficial(base_url: str, storage_dir: str = "cold_storage"):
    """
    Scrapes the "Boletín Oficial" for official documents.
    """
    logger.info(f"Starting ETL for Boletín Oficial from {base_url}")
    
    compliance_monitor = OSINTComplianceMonitor()
    document_scraper = DocumentScraper(base_url=base_url, storage_dir=storage_dir, compliance_monitor=compliance_monitor)
    
    response = document_scraper.compliant_request_func(base_url, purpose="Extracting links from Official Gazette", timeout=60)
    
    extracted_documents_data = []

    if not response:
        logger.error(f"Failed to retrieve content from {base_url}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    extracted_links = []

    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        text = a_tag.get_text(strip=True)

        if "contrataciones" in href.lower() or "licitaciones" in href.lower() or \
           "contrataciones" in text.lower() or "licitaciones" in text.lower():
            full_url = urljoin(base_url, href)
            extracted_links.append(full_url)
    
    document_extensions = ['.pdf', '.csv', '.xlsx', '.xls']
    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        if any(href.lower().endswith(ext) for ext in document_extensions):
            full_url = urljoin(base_url, href)
            extracted_links.append(full_url)

    extracted_links = list(set(extracted_links))
    logger.info(f"Found {len(extracted_links)} relevant links.")

    for link in extracted_links:
        logger.info(f"- {link}")
        parsed_url = urlparse(link)
        filename = os.path.basename(unquote(parsed_url.path))
        save_path = os.path.join(document_scraper.scraper_core.storage_dir, 'documents', 'pdf', filename)
        save_path = document_scraper.scraper_core.get_unique_filename(save_path)
        
        response = document_scraper.compliant_request_func(link, purpose="Downloading Official Gazette PDF", timeout=60, stream=True)
        if not response:
            logger.error(f"Failed to download PDF from {link}")
            continue

        try:
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            document_scraper.scraper_core.save_checksum(save_path)
            logger.info(f"Downloaded PDF: {link} -> {save_path}")

            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(save_path)
                pdf_text = ""
                for page in reader.pages:
                    pdf_text += page.extract_text() + "\n"
                logger.info(f"Extracted text from PDF: {save_path} (first 200 chars): {pdf_text[:200]}...")
                
                parsed_data = parse_boletin_oficial_text(pdf_text)
                logger.info(f"Parsed PDF data: {parsed_data}")
                
                extracted_documents_data.append({
                    "link": link,
                    "local_path": save_path,
                    "parsed_data": parsed_data
                })

            except Exception as pdf_e:
                logger.error(f"Error extracting text from PDF {save_path}: {str(pdf_e)}")

        except Exception as e:
            logger.error(f"Error saving PDF {link}: {str(e)}")

    output_file = os.path.join(document_scraper.scraper_core.storage_dir, 'metadata', 'boletin_oficial_links.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(extracted_links, f, indent=2, ensure_ascii=False)
    logger.info(f"Extracted links saved to {output_file}")

    documents_output_file = os.path.join(document_scraper.scraper_core.storage_dir, 'metadata', 'boletin_oficial_documents_data.json')
    with open(documents_output_file, 'w', encoding='utf-8') as f:
        json.dump(extracted_documents_data, f, indent=2, ensure_ascii=False)
    logger.info(f"Extracted documents data saved to {documents_output_file}")
    
    return extracted_documents_data

async def scrape_official_site():
    """
    Scrapes the official municipal websites for transparency documents.
    """
    logger.info("🌐 Starting comprehensive official source scraping...")
    
    official_sources = {
        'MUNICIPAL_PORTAL': {
            'base_url': 'https://carmendeareco.gob.ar/',
            'transparency_sections': [
                '/transparencia',
                '/presupuesto',
                '/normativa',
                '/contrataciones',
                '/empleados'
            ],
            'document_patterns': [
                r'.*\.pdf$',
                r'.*\.xlsx?$',
                r'.*presupuesto.*',
                r'.*sueldo.*',
                r'.*licitacion.*'
            ]
        },
        'PROVINCIAL_TRANSPARENCY': {
            'base_url': 'https://www.gba.gob.ar',
            'sections': [
                '/transparencia/municipios/carmen-de-areco',
                '/boletin_oficial/search?q=carmen+de+areco',
                '/contrataciones/search?municipio=carmen+de+areco'
            ]
        },
        'NATIONAL_PORTAL': {
            'base_url': 'https://www.argentina.gob.ar',
            'sections': [
                '/jefatura/transparencia/municipal-data',
                '/normativa/search?location=carmen+de+areco'
            ]
        },
        'INFORMATION_ACCESS': {
            'base_url': 'https://www.aaip.gob.ar',
            'sections': [
                '/sujetos-obligados/municipios/carmen-de-areco'
            ]
        }
    }
    
    stats = {
        'sites_checked': 0,
        'pages_scraped': 0,
        'documents_found': 0,
        'errors': []
    }

    async with aiohttp.ClientSession() as session:
        for source_name, source_config in official_sources.items():
            logger.info(f"  🔍 Checking {source_name}...")
            await _scrape_source(session, source_name, source_config, stats)
            
    return stats

async def _scrape_source(session: aiohttp.ClientSession, source_name: str, config: Dict, stats: Dict):
    """
    Scrape a specific official source.
    """
    base_url = config['base_url']
    
    try:
        async with session.get(base_url, timeout=30) as response:
            if response.status == 200:
                # Get raw bytes and try to decode with common encodings
                content_bytes = await response.read()
                content = None
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        content = content_bytes.decode(encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                
                if content is None:
                    content = content_bytes.decode('utf-8', errors='replace')
                    logger.warning(f"Decoding error for {base_url}, used utf-8 with error replacing.")

                soup = BeautifulSoup(content, 'html.parser')
                
                transparency_links = _find_transparency_links(soup, base_url)
                
                for link_url, link_text in transparency_links:
                    await _scrape_transparency_section(session, link_url, link_text, stats)
                
                stats['sites_checked'] += 1
                logger.info(f"    ✅ {source_name} accessible - found {len(transparency_links)} transparency links")
                
            else:
                logger.error(f"    ❌ {source_name} returned status {response.status}")
                
    except Exception as e:
        error_msg = f"Error scraping {source_name}: {str(e)}"
        logger.error(f"    ❌ {error_msg}")
        stats['errors'].append(error_msg)

async def _scrape_transparency_section(session: aiohttp.ClientSession, url: str, section_name: str, stats: Dict):
    """
    Scrape a specific transparency section.
    """
    try:
        async with session.get(url, timeout=30) as response:
            if response.status == 200:
                # Get raw bytes and try to decode with common encodings
                content_bytes = await response.read()
                content = None
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        content = content_bytes.decode(encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                
                if content is None:
                    content = content_bytes.decode('utf-8', errors='replace')
                    logger.warning(f"Decoding error for {url}, used utf-8 with error replacing.")

                soup = BeautifulSoup(content, 'html.parser')
                
                documents = _find_downloadable_documents(soup, url, session) # Pass session to download documents
                
                # For now, we just log the documents found.
                # In the future, we will download them.
                for doc_info in documents:
                    logger.info(f"      📄 Found document: {doc_info['title']} ({doc_info['url']})")

                logger.info(f"      📄 {section_name}: found {len(documents)} documents")
                stats['pages_scraped'] += 1
                stats['documents_found'] += len(documents)
                
    except Exception as e:
        logger.error(f"      ❌ Error scraping section {section_name}: {e}")

async def _scrape_transparency_section(session: aiohttp.ClientSession, url: str, section_name: str, stats: Dict):
    """
    Scrape a specific transparency section.
    """
    try:
        async with session.get(url, timeout=30) as response:
            if response.status == 200:
                # Get raw bytes and try to decode with common encodings
                content_bytes = await response.read()
                content = None
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        content = content_bytes.decode(encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                
                if content is None:
                    content = content_bytes.decode('utf-8', errors='replace')
                    logger.warning(f"Decoding error for {url}, used utf-8 with error replacing.")

                soup = BeautifulSoup(content, 'html.parser')
                
                documents = _find_downloadable_documents(soup, url, session) # Pass session to download documents
                
                # For now, we just log the documents found.
                # In the future, we will download them.
                for doc_info in documents:
                    logger.info(f"      📄 Found document: {doc_info['title']} ({doc_info['url']})")

                logger.info(f"      📄 {section_name}: found {len(documents)} documents")
                stats['pages_scraped'] += 1
                stats['documents_found'] += len(documents)
                
    except Exception as e:
        logger.error(f"      ❌ Error scraping section {section_name}: {e}")

def _find_transparency_links(soup: BeautifulSoup, base_url: str) -> List[Tuple[str, str]]:
    """
    Find transparency-related links on a page.
    """
    transparency_keywords = [
        'transparencia', 'presupuesto', 'sueldo', 'salario', 'contratacion',
        'licitacion', 'decreto', 'ordenanza', 'balance', 'ejecucion',
        'gastos', 'ingresos', 'normativa', 'resoluciones'
    ]
    
    links = []
    
    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        text = a_tag.get_text(strip=True).lower()
        
        if any(keyword in text or keyword in href.lower() for keyword in transparency_keywords):
            full_url = urljoin(base_url, href)
            links.append((full_url, text))
    
    document_extensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx']
    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        if any(ext in href.lower() for ext in document_extensions):
            full_url = urljoin(base_url, href)
            text = a_tag.get_text(strip=True) or 'Document'
            links.append((full_url, text))
    
    return list(set(links))

async def _scrape_transparency_section(session: aiohttp.ClientSession, url: str, section_name: str, stats: Dict):
    """
    Scrape a specific transparency section.
    """
    try:
        async with session.get(url, timeout=30) as response:
            if response.status == 200:
                content = await response.text()
                soup = BeautifulSoup(content, 'html.parser')
                
                documents = _find_downloadable_documents(soup, url, session)
                
                # For now, we just log the documents found.
                # In the future, we will download them.
                for doc_info in documents:
                    logger.info(f"      📄 Found document: {doc_info['title']} ({doc_info['url']})")

                logger.info(f"      📄 {section_name}: found {len(documents)} documents")
                stats['pages_scraped'] += 1
                stats['documents_found'] += len(documents)
                
    except Exception as e:
        logger.error(f"      ❌ Error scraping section {section_name}: {e}")

def _find_downloadable_documents(soup: BeautifulSoup, base_url: str, session: aiohttp.ClientSession) -> List[Dict]:
    """
    Find downloadable documents on a page.
    """
    documents = []
    document_extensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx']
    
    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        
        if any(ext in href.lower() for ext in document_extensions):
            full_url = urljoin(base_url, href)
            title = a_tag.get_text(strip=True) or a_tag.get('title', '') or 'Untitled Document'
            
            doc_info = {
                'url': full_url,
                'title': title,
                'document_type': _classify_document_type(title, href),
                'estimated_year': _extract_year_from_text(title + ' ' + href),
                'extension': Path(href).suffix.lower()
            }
            
            documents.append(doc_info)
    
    return documents

def _classify_document_type(title: str, url: str) -> str:
    """
    Classify document type based on title and URL.
    """
    text = (title + ' ' + url).lower()
    
    classifications = {
        'salary': ['sueldo', 'salari', 'remuner', 'escala'],
        'budget': ['presupuesto', 'budget'],
        'execution': ['ejecucion', 'estado.*gasto', 'estado.*recurso'],
        'tender': ['licitacion', 'contrat', 'tender'],
        'financial': ['balance', 'situacion.*econom', 'deuda'],
        'legal': ['decreto', 'ordenanza', 'resolucion'],
        'report': ['informe', 'reporte', 'estadistica']
    }
    
    for doc_type, keywords in classifications.items():
        if any(re.search(keyword, text) for keyword in keywords):
            return doc_type
    
    return 'general'

def _extract_year_from_text(text: str) -> Optional[int]:
    """
    Extract year from text.
    """
    year_match = re.search(r'(20\\d{2})', text)
    if year_match:
        year = int(year_match.group(1))
        if 2009 <= year <= 2025:
            return year
    return None

async def scrape_full_site(base_url: str, storage_dir: str = "cold_storage", max_depth: int = 3):
    """
    Crawls a website and downloads all linked documents.
    """
    logger.info(f"Starting full site scrape for {base_url}")
    
    compliance_monitor = OSINTComplianceMonitor()
    document_scraper = DocumentScraper(base_url=base_url, storage_dir=storage_dir, compliance_monitor=compliance_monitor)
    visited_urls: Set[str] = set()

    await _scrape_page(base_url, document_scraper, visited_urls, depth=0, max_depth=max_depth)

async def _scrape_page(url: str, document_scraper: DocumentScraper, visited_urls: Set[str], depth: int, max_depth: int):
    """
    Recursively scrapes a page and its internal links.
    """
    if url in visited_urls or depth > max_depth:
        return

    robots_checked = True
    robots_allowed = document_scraper.scraper_core.is_allowed_by_robots(url)
    if not robots_allowed:
        logger.info(f"Skipping {url} due to robots.txt exclusion.")
        return

    visited_urls.add(url)

    response = document_scraper.compliant_request_func(url, purpose="Full site crawling", robots_checked=robots_checked, robots_allowed=robots_allowed, timeout=30)
    if not response:
        return

    document_scraper.scraper_core.save_html_content(url, response.text, 'current_site')

    document_extensions = ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.csv', '.zip']
    links, document_urls = document_scraper.scraper_core.extract_links_and_documents(response.text, url, document_extensions)

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

        save_path = os.path.join(document_scraper.scraper_core.storage_dir, subdir, filename)
        save_path = document_scraper.scraper_core.get_unique_filename(save_path)
        document_scraper.scraper_core.download_file(doc_url, save_path)
        time.sleep(0.5)

    if depth < max_depth:
        for link in links:
            full_url = urljoin(url, link)
            if urlparse(full_url).netloc == urlparse(document_scraper.base_url).netloc:
                await _scrape_page(full_url, document_scraper, visited_urls, depth + 1, max_depth)
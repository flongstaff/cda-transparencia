# __init__.py - Carmen de Areco Transparency Scraper Package
"""
Carmen de Areco Transparency Document Scraper and Processor

This package provides tools for:
- Scraping transparency documents from official sources
- Processing documents (PDF, Excel, Word) into structured formats
- Storing and managing document metadata in SQLite database
- Validating document integrity and extracting financial data
"""

__version__ = "1.0.0"
__author__ = "Carmen de Areco Transparency Project"

from .data_extraction import scrape_live_sync, scrape_wayback_sync
from .processing import (
    convert_table_pdf_to_csv,
    convert_docx_to_txt,
    convert_excel_to_csv,
    convert_excel_to_markdown,
    validate_document_integrity
)
from .database import (
    create_documents_table,
    insert_metadata,
    get_document_stats,
    initialize_database
)

__all__ = [
    'scrape_live_sync',
    'scrape_wayback_sync',
    'convert_table_pdf_to_csv',
    'convert_docx_to_txt',
    'convert_excel_to_csv',
    'convert_excel_to_markdown',
    'validate_document_integrity',
    'create_documents_table',
    'insert_metadata',
    'get_document_stats',
    'initialize_database'
]
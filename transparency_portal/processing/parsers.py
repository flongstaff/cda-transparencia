"""
This module contains parsers for different file formats.
"""

import re
from datetime import datetime
from typing import Dict, Optional

def parse_boletin_oficial_text(pdf_text: str) -> dict:
    parsed_data = {
        'document_type': 'Unknown',
        'publication_date': None,
        'document_number': None,
        'summary': pdf_text[:500], # First 500 chars as a summary
        'is_relevant_to_carmen_de_areco': False,
        'extracted_fields': {} # To store more specific extracted data
    }

    # Relevance check
    if re.search(r'carmen de areco|buenos aires', pdf_text, re.IGNORECASE):
        parsed_data['is_relevant_to_carmen_de_areco'] = True

    # Basic date extraction (DD/MM/YYYY)
    date_match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', pdf_text)
    if date_match:
        try:
            parsed_data['publication_date'] = datetime.strptime(date_match.group(1), '%d/%m/%Y').isoformat()
        except ValueError:
            pass

    # Basic document number extraction
    doc_number_match = re.search(r'(?:Número|Nº)\s*(\d+)', pdf_text, re.IGNORECASE)
    if doc_number_match:
        parsed_data['document_number'] = doc_number_match.group(1)

    # Document type classification
    if re.search(r'licitación pública|contratación|adjudicación', pdf_text, re.IGNORECASE) and not re.search(r'digesto jurídico|ley|decreto|resolución', pdf_text, re.IGNORECASE):
        parsed_data['document_type'] = 'Public Tender'
        # Call a more specific parser for tenders
        parsed_data['extracted_fields'] = _parse_public_tender(pdf_text)

    elif re.search(r'ley|decreto|resolución|digesto jurídico', pdf_text, re.IGNORECASE):
        parsed_data['document_type'] = 'Legislation'
        # Call a more specific parser for legislation
        parsed_data['extracted_fields'] = _parse_legislation(pdf_text)

    elif re.search(r'sociedad|judicial|edictos', pdf_text, re.IGNORECASE):
        parsed_data['document_type'] = 'Societies/Judicial Notice'
        # Call a more specific parser for notices
        parsed_data['extracted_fields'] = _parse_societies_judicial_notice(pdf_text)

    return parsed_data

def _parse_public_tender(pdf_text: str) -> Dict:
    tender_data = {
        'budget': None,
        'object': None,
        'awarded_to': None
    }
    # Example: Budget extraction
    budget_match = re.search(r'monto total.*?\$([\d\.,]+)', pdf_text, re.IGNORECASE)
    if budget_match:
        cleaned_budget = budget_match.group(1).replace('.', '').replace(',', '.')
        try:
            tender_data['budget'] = float(cleaned_budget)
        except ValueError:
            pass
    
    # Example: Object/Description extraction (very basic, needs refinement)
    object_match = re.search(r'objeto:\s*(.*?)(?:\n|\r|\f|\Z)', pdf_text, re.IGNORECASE | re.DOTALL)
    if object_match:
        tender_data['object'] = object_match.group(1).strip()

    return tender_data

def _parse_legislation(pdf_text: str) -> Dict:
    legislation_data = {
        'law_number': None,
        'title': None,
        'issuing_body': None
    }
    # Example: Law number extraction
    law_number_match = re.search(r'(?:ley|decreto|resolución)\s*(?:nº|número)?\s*([\d\./-]+)', pdf_text, re.IGNORECASE)
    if law_number_match:
        legislation_data['law_number'] = law_number_match.group(1).strip()

    # Example: Title extraction (very basic, needs refinement)
    title_match = re.search(r'(?:visto|considerando|el presidente|la presidenta)\s*(.*?)(?:\n|\r|\f|\Z)', pdf_text, re.IGNORECASE | re.DOTALL)
    if title_match:
        legislation_data['title'] = title_match.group(1).strip()

    return legislation_data

def _parse_societies_judicial_notice(pdf_text: str) -> Dict:
    notice_data = {
        'company_name': None,
        'cuit': None
    }
    # Example: Company name extraction
    company_name_match = re.search(r'(?:razón social|denominación):\s*(.*?)(?:\n|\r|\f|\Z)', pdf_text, re.IGNORECASE | re.DOTALL)
    if company_name_match:
        notice_data['company_name'] = company_name_match.group(1).strip()

    # Example: CUIT extraction
    cuit_match = re.search(r'cuit:\s*([\d\-]+)', pdf_text, re.IGNORECASE)
    if cuit_match:
        notice_data['cuit'] = cuit_match.group(1).strip()

    return notice_data

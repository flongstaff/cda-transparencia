# processing.py
"""
Analysis and conversion utilities.
"""

import pathlib
import tabula
import pandas as pd
import docx2txt
import json
import csv
import re
import hashlib

def _calculate_sha256(file_path: str) -> str:
    """Calculate the SHA256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def convert_table_pdf_to_csv(pdf_path: str, output_csv: str) -> bool:
    """
    Convert tables from a PDF into a CSV file.
    Returns True if successful, False otherwise.
    """
    try:
        dfs = tabula.read_pdf(pdf_path, pages="all", multiple_tables=True)
        if not dfs:
            return False
        
        # Combine all tables into one DataFrame
        if len(dfs) == 1:
            df = dfs[0]
        else:
            df = pd.concat(dfs, ignore_index=True)
        
        df.to_csv(output_csv, index=False, encoding='utf-8')
        return True
    except Exception as e:
        print(f"Error converting PDF {pdf_path}: {e}")
        return False

def convert_docx_to_txt(docx_path: str, output_text: str) -> bool:
    """
    Convert a DOCX into plain text with docx2txt.
    Returns True if successful, False otherwise.
    """
    try:
        txt = docx2txt.process(docx_path)
        with open(output_text, "w", encoding="utf-8") as fh:
            fh.write(txt)
        return True
    except Exception as e:
        print(f"Error converting DOCX {docx_path}: {e}")
        return False

def convert_excel_to_markdown(excel_path: str) -> str:
    """
    Convert an Excel sheet into a Markdown table.
    Returns the markdown string.
    """
    try:
        df = pd.read_excel(excel_path, engine='openpyxl')
        
        # Create markdown table
        markdown_lines = []
        
        # Header
        headers = [str(col) for col in df.columns]
        markdown_lines.append("| " + " | ".join(headers) + " |")
        markdown_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
        
        # Rows
        for _, row in df.iterrows():
            row_data = [str(val) if pd.notna(val) else "" for val in row]
            markdown_lines.append("| " + " | ".join(row_data) + " |")
        
        return "\n".join(markdown_lines)
    except Exception as e:
        print(f"Error converting Excel to Markdown {excel_path}: {e}")
        return ""

def convert_excel_to_csv(excel_path: str, output_csv: str) -> bool:
    """
    Convert Excel file to CSV.
    Returns True if successful, False otherwise.
    """
    try:
        df = pd.read_excel(excel_path, engine='openpyxl')
        df.to_csv(output_csv, index=False, encoding='utf-8')
        return True
    except Exception as e:
        print(f"Error converting Excel {excel_path}: {e}")
        return False

def has_expected_columns(csv_path: str, expected: list[str]) -> bool:
    """
    Check that the CSV contains the expected columns.
    """
    try:
        with open(csv_path, encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            if not reader.fieldnames:
                return False
            header = set(reader.fieldnames)
            return set(expected).issubset(header)
    except Exception as e:
        print(f"Error checking CSV columns {csv_path}: {e}")
        return False

def extract_financial_data(text: str) -> dict:
    """
    Extract financial data from processed text using regex patterns.
    Returns a dictionary with extracted financial information.
    """
    financial_data = {
        'amounts': [],
        'dates': [],
        'concepts': []
    }
    
    # Pattern for amounts (Argentine pesos)
    amount_pattern = r'\$?[" + "d,]+\.?\d*'
    amounts = re.findall(amount_pattern, text)
    financial_data['amounts'] = amounts
    
    # Pattern for dates
    date_pattern = r'\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2}'
    dates = re.findall(date_pattern, text)
    financial_data['dates'] = dates
    
    return financial_data

def validate_document_integrity(file_path: str, expected_checksum: str = None) -> dict:
    """
    Validate document integrity and extract metadata.
    Returns a dictionary with validation results.
    """
    path = pathlib.Path(file_path)
    
    result = {
        'valid': False,
        'size': 0,
        'type': '',
        'readable': False,
        'checksum_match': None,
        'error': None
    }
    
    try:
        if not path.exists():
            result['error'] = 'File does not exist'
            return result
        
        result['size'] = path.stat().st_size
        result['type'] = path.suffix.lower()
        
        # Basic readability check based on file type
        if result['type'] == '.pdf':
            # Try to read with tabula to check if it's a valid PDF
            try:
                tabula.read_pdf(str(path), pages=1)
                result['readable'] = True
            except:
                result['readable'] = False
        elif result['type'] in ['.xlsx', '.xls']:
            try:
                pd.read_excel(str(path), nrows=1)
                result['readable'] = True
            except:
                result['readable'] = False
        elif result['type'] == '.docx':
            try:
                docx2txt.process(str(path))
                result['readable'] = True
            except:
                result['readable'] = False
        
        # Checksum verification
        if expected_checksum:
            actual_checksum = _calculate_sha256(file_path)
            result['checksum_match'] = actual_checksum == expected_checksum
        
        result['valid'] = result['size'] > 0 and result['readable']
        
    except Exception as e:
        result['error'] = str(e)
    
    return result

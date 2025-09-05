import pathlib
import tabula
import pandas as pd
import docx2txt
import json
import csv
import re
import hashlib
from carmen_transparencia.data_access import insert_document
from datetime import datetime

def _calculate_sha256(file_path: str) -> str:
    """Calculate the SHA256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def generate_title(filename):
    clean_name = filename.replace('.pdf', '').replace('-', ' ')
    title_mappings = {
        'ESTADO DE EJECUCION DE GASTOS': 'Estado de Ejecución de Gastos',
        'ESTADO DE EJECUCION DE RECURSOS': 'Estado de Ejecución de Recursos',
        'SITUACION ECONOMICA FINANCIERA': 'Situación Económica Financiera',
        'BALANCE GENERAL': 'Balance General Municipal',
        'ESCALA SALARIAL': 'Escala Salarial Municipal',
        'PRESUPUESTO': 'Presupuesto Municipal',
        'LICITACION PUBLICA': 'Licitación Pública',
        'DDJJ': 'Declaración Jurada Patrimonial'
    }
    for key, value in title_mappings.items():
        if key in clean_name.upper():
            return f"{value} - {extract_period(filename)}"
    return clean_name

def categorize_document(filename):
    upper = filename.upper()
    if 'EJECUCION' in upper and 'GASTOS' in upper: return 'Ejecución de Gastos'
    if 'EJECUCION' in upper and 'RECURSOS' in upper: return 'Ejecución de Recursos'
    if 'BALANCE' in upper: return 'Estados Financieros'
    if 'SITUACION' in upper and 'ECONOMICA' in upper: return 'Estados Financieros'
    if 'ESCALA' in upper or 'SUELDO' in upper: return 'Recursos Humanos'
    if 'PRESUPUESTO' in upper: return 'Presupuesto Municipal'
    if 'LICITACION' in upper: return 'Contrataciones'
    if 'DDJJ' in upper: return 'Declaraciones Patrimoniales'
    if 'CAIF' in upper: return 'Salud Pública'
    return 'Documentos Municipales'

def extract_year(filename):
    match = re.search(r'(20\d{2})', filename)
    return int(match.group(1)) if match else None

def extract_quarter(filename):
    upper = filename.upper()
    if '1°TRI' in upper or '1°TRIMESTRE' in upper: return '1Q'
    if '2°TRI' in upper or '2°TRIMESTRE' in upper: return '2Q'
    if '3°TRI' in upper or '3°TRIMESTRE' in upper: return '3Q'
    if '4°TRI' in upper or '4°TRIMESTRE' in upper: return '4Q'
    if 'ENERO' in upper or 'JANUARY' in upper: return 'Q1'
    if 'ABRIL' in upper or 'APRIL' in upper: return 'Q2'
    if 'JULIO' in upper or 'JULY' in upper: return 'Q3'
    if 'OCTUBRE' in upper or 'OCTOBER' in upper: return 'Q4'
    return None

def extract_period(filename):
    year = extract_year(filename)
    quarter = extract_quarter(filename)
    if quarter:
        return f"{year} - {quarter}"
    return str(year) if year else ''

def get_document_type(filename):
    upper = filename.upper()
    if 'EJECUCION' in upper: return 'budget_execution'
    if 'BALANCE' in upper or 'SITUACION' in upper: return 'financial_statement'
    if 'ESCALA' in upper or 'SUELDO' in upper: return 'payroll'
    if 'LICITACION' in upper: return 'contract'
    return 'other'

def get_priority(filename):
    upper = filename.upper()
    if 'EJECUCION' in upper: return 'high'
    if 'BALANCE' in upper: return 'high'
    if 'ESCALA' in upper: return 'medium'
    if 'LICITACION' in upper: return 'medium'
    return 'low'

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
    amount_pattern = r'\$([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)'
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


def process_directory(
        input_dir: str,
        output_dir: str,
        *, 
        formats: list[str] = None,
        validate: bool = False,
) -> list[dict]:
    """
    Process all files in a directory.
    """
    if formats is None:
        formats = ['csv', 'txt']
        
    in_dir = pathlib.Path(input_dir)
    out_dir = pathlib.Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    for path in in_dir.iterdir():
        if not path.is_file():
            continue
            
        doc = {
            'id': path.stem,
            'filename': path.name,
            'title': generate_title(path.name),
            'category': categorize_document(path.name),
            'year': extract_year(path.name),
            'quarter': extract_quarter(path.name),
            'size_mb': round(path.stat().st_size / 1024 / 1024, 2),
            'source': 'local',
            'path': str(path),
            'official_url': f"http://carmendeareco.gob.ar/wp-content/uploads/{path.name}",
            'last_modified': datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
            'processing_date': datetime.now().isoformat(),
            'verification_status': 'verified',
            'document_type': get_document_type(path.name),
            'priority': get_priority(path.name),
            'has_structured_data': False,
            'extracted_data': None
        }

        if validate:
            validation_result = validate_document_integrity(str(path))
            doc['verification_status'] = 'valid' if validation_result['valid'] else 'invalid'

        if 'csv' in formats and path.suffix.lower() == '.pdf':
            out_csv = out_dir / f"{path.stem}.csv"
            if convert_table_pdf_to_csv(str(path), str(out_csv)):
                doc['has_structured_data'] = True
                with open(out_csv, 'r') as f:
                    doc['extracted_data'] = f.read()

        insert_document(doc)
        results.append(doc)
        
    return results
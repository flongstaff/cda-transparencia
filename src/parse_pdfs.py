"""
Module for parsing PDF files and extracting data tables, indicators, and staffing data
"""
import pandas as pd
import pdfplumber
from pathlib import Path
import os
from datetime import datetime
import re


def extract_tables_from_pdf(pdf_path: str, output_csv: str = None) -> list:
    """
    Extract tables from a PDF file using pdfplumber
    
    Args:
        pdf_path: Path to the PDF file
        output_csv: Optional path to save extracted data as CSV
        
    Returns:
        List of DataFrames extracted from the PDF
    """
    print(f"Extracting data from {pdf_path}")
    all_tables = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table_idx, table in enumerate(tables):
                if table and len(table) > 0:  # Check if table is not empty
                    headers = table[0]  # First row as header
                    data_rows = table[1:]  # Remaining rows as data
                    
                    # Handle case where headers might have None values
                    if headers:
                        # Replace None headers with generic names
                        headers = [f"Column_{i}" if h is None else h for i, h in enumerate(headers)]
                        df = pd.DataFrame(data_rows, columns=headers)
                        # Add metadata columns
                        df['extraction_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        df['source_file'] = os.path.basename(pdf_path)
                        df['page'] = page_num + 1
                        df['table_number'] = table_idx + 1
                        all_tables.append(df)
    
    # If output_csv is specified, save the combined data
    if output_csv and all_tables:
        combined_df = pd.concat(all_tables, ignore_index=True)
        combined_df.to_csv(output_csv, index=False)
        print(f"Saved extracted tables to {output_csv}")
        
    return all_tables


def extract_indicators_from_page(page_text):
    """Extract lines like '58 Asistencias a vecinos...' and camera counts"""
    lines = page_text.split("\n")
    indicators = []
    for line in lines:
        if "Asistencias a vecinos" in line or "cámaras de monitoreo" in line or "Asistencias Habitacionale" in line:
            # Clean and split
            clean_line = re.sub(r"\s+", " ", line.strip())
            # Extract description and number
            match = re.search(r"([\d\.,]+)\s*(?:Programado|Ejecutado|Cantidad|Familias)?", clean_line)
            value = None
            if match:
                try:
                    value = float(match.group(1).replace(".", "").replace(",", "."))
                except:
                    value = None
            indicators.append({
                "raw_text": clean_line,
                "indicator_type": "familias" if "vecinos" in line else "camaras" if "cámaras" in line else "viviendas",
                "value": value
            })
    return indicators


def extract_gender_staffing(page_text):
    """Extract monthly gender staffing if present"""
    if "PLANTEL DEL PERSONAL DESAGREGADO SEGÚN GÉNERO" not in page_text:
        return None
    lines = page_text.split("\n")
    # Find the row with months and the next with numbers
    for i, line in enumerate(lines):
        if "ENE" in line and "FEB" in line:
            if i+1 < len(lines):
                numbers = re.findall(r"\d+", lines[i+1])
                if len(numbers) >= 12:
                    return {month: int(n) for month, n in zip(
                        ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"],
                        numbers[:12]
                    )}
    return None


def parse_transparency_pdfs(pdf_dir: str, output_dir: str = "data/processed") -> dict:
    """
    Parse all transparency portal PDFs in a directory and save to processed
    
    Args:
        pdf_dir: Directory containing PDF files
        output_dir: Directory to save processed CSV files
        
    Returns:
        Dictionary mapping file names to extraction results
    """
    pdf_dir = Path(pdf_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    results = {}
    
    # Find all PDF files in the directory and subdirectories
    for pdf_file in pdf_dir.rglob("*.pdf"):
        # Skip cache directories
        if ".cache" in str(pdf_file):
            continue
            
        print(f"Processing: {pdf_file}")
        
        # Generate output filename based on input and add timestamp
        base_name = pdf_file.stem
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_csv = output_dir / f"{base_name}_{timestamp}.csv"
        
        # Extract tables and save to CSV
        tables = extract_tables_from_pdf(str(pdf_file), str(output_csv))
        results[str(pdf_file)] = len(tables)  # Store number of tables extracted
        
    return results


def process_all_pdfs(raw_dir="data/raw", out_dir="data/processed"):
    """
    Process all PDFs for indicators, gender staffing data, and general table extraction
    
    Args:
        raw_dir: Directory containing raw PDFs
        out_dir: Directory to output processed data
    """
    raw_dir = Path(raw_dir)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    all_indicators = []
    all_gender = []
    all_tables = []

    for filename in raw_dir.glob("*.pdf"):
        filepath = raw_dir / filename
        print(f"Processing {filename}...")
        
        with pdfplumber.open(filepath) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                
                # Extract indicators
                indicators = extract_indicators_from_page(text)
                for ind in indicators:
                    all_indicators.append({
                        "source_file": str(filename),
                        "page": page_num + 1,
                        "indicator_type": ind["indicator_type"],
                        "description": ind["raw_text"],
                        "value": ind["value"],
                        "extraction_date": datetime.now().isoformat()
                    })
                
                # Extract gender staffing
                gender = extract_gender_staffing(text)
                if gender:
                    row = {"source_file": str(filename), "page": page_num + 1}
                    row.update(gender)
                    all_gender.append(row)
                
                # Extract tables
                tables_on_page = page.extract_tables()
                for table_idx, table in enumerate(tables_on_page):
                    if table and len(table) > 0:
                        headers = table[0] if table[0] else [f"Column_{i}" for i in range(len(table[1]) if len(table) > 1 else 1)]
                        data_rows = table[1:] if len(table) > 1 else []
                        df = pd.DataFrame(data_rows, columns=headers)
                        df['source_file'] = str(filename)
                        df['page'] = page_num + 1
                        df['table_number'] = table_idx + 1
                        df['extraction_date'] = datetime.now().isoformat()
                        all_tables.append(df)

    # Save extracted data
    if all_indicators:
        indicators_df = pd.DataFrame(all_indicators)
        indicators_df.to_csv(out_dir / "indicators.csv", index=False)
        print(f"Saved {len(all_indicators)} indicators to {out_dir / 'indicators.csv'}")

    if all_gender:
        gender_df = pd.DataFrame(all_gender)
        gender_df.to_csv(out_dir / "gender_staffing.csv", index=False)
        print(f"Saved gender staffing data for {len(all_gender)} documents to {out_dir / 'gender_staffing.csv'}")

    if all_tables:
        combined_tables = pd.concat(all_tables, ignore_index=True)
        combined_tables.to_csv(out_dir / "extracted_tables.csv", index=False)
        print(f"Saved {len(all_tables)} tables to {out_dir / 'extracted_tables.csv'}")


def parse_situacion_economica_pdfs() -> dict:
    """
    Parse all Situacion-Economico-Financiera PDFs specifically
    
    Returns:
        Dictionary mapping file names to extraction results
    """
    # Look for the PDFs in common locations
    possible_paths = [
        "frontend/dist/data/pdfs/",
        "frontend/public/data/pdfs/",
        "data/",
        "frontend/dist/data/organized_by_subject/",
        "frontend/public/data/organized_by_subject/"
    ]
    
    results = {}
    
    for path in possible_paths:
        pdf_path = Path(path)
        if pdf_path.exists():
            # Look specifically for economic situation PDFs
            for pdf_file in pdf_path.rglob("*Situacion-Economico-Financiera*.pdf"):
                if ".cache" not in str(pdf_file):
                    print(f"Processing economic report: {pdf_file}")
                    
                    # Generate output filename
                    base_name = pdf_file.stem
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    output_csv = Path("data/processed") / f"{base_name}_{timestamp}.csv"
                    
                    tables = extract_tables_from_pdf(str(pdf_file), str(output_csv))
                    results[str(pdf_file)] = len(tables)
    
    return results


if __name__ == "__main__":
    # Process all PDFs for indicators, gender staffing, and general tables
    process_all_pdfs()
    
    # Process Situacion-Economico-Financiera PDFs specifically
    situacion_results = parse_situacion_economica_pdfs()
    print(f"Processed Situacion-Economico-Financiera PDFs: {situacion_results}")
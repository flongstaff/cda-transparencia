#!/usr/bin/env python3
"""
Quick PDF Processing Script
Recreated main functionality for immediate use
"""

import os
import json
import hashlib
import pandas as pd
import logging
from pathlib import Path
from datetime import datetime
import pdfplumber

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def process_pdfs():
    """Main PDF processing function"""
    logger.info("🚀 Running PDF processing...")

    # Set up directories
    base_dir = Path(".")
    output_dir = base_dir / "frontend" / "public" / "data"
    csv_dir = output_dir / "csv"

    # Find PDFs
    pdf_files = list(base_dir.rglob("*.pdf"))
    pdf_files = [f for f in pdf_files if "node_modules" not in str(f) and ".git" not in str(f)]

    logger.info(f"Found {len(pdf_files)} PDF files")

    # Extract data
    all_data = []
    for pdf_path in pdf_files[:10]:  # Process first 10 for quick results
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if table and len(table) > 1:
                            headers = [str(cell) if cell else f"col_{i}" for i, cell in enumerate(table[0])]
                            for row_idx, row in enumerate(table[1:]):
                                if any(cell for cell in row):
                                    row_data = {
                                        'source_file': pdf_path.name,
                                        'page_number': page_num + 1,
                                        'table_number': table_idx + 1,
                                        'extraction_date': datetime.now().isoformat()
                                    }
                                    for col_idx, cell in enumerate(row):
                                        header = headers[col_idx] if col_idx < len(headers) else f"col_{col_idx}"
                                        row_data[header] = str(cell) if cell else ""
                                    all_data.append(row_data)
        except Exception as e:
            logger.warning(f"Failed to process {pdf_path.name}: {e}")

    # Save to CSV
    if all_data:
        df = pd.DataFrame(all_data)
        csv_file = csv_dir / "quick_pdf_extract.csv"
        df.to_csv(csv_file, index=False)
        logger.info(f"✅ Saved {len(all_data)} rows to {csv_file}")
    else:
        logger.warning("No data extracted")

if __name__ == "__main__":
    process_pdfs()
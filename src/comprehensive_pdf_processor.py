#!/usr/bin/env python3
"""
Comprehensive PDF Processing with SHA256 Deduplication
Recreated main functionality for processing PDFs with deduplication
"""

import os
import json
import hashlib
import sqlite3
import pandas as pd
import logging
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple
from datetime import datetime
import pdfplumber
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class PDFMetadata:
    file_hash: str
    filename: str
    local_path: str
    original_url: Optional[str] = None
    web_archive_url: Optional[str] = None
    file_size: int = 0
    creation_date: Optional[str] = None
    extraction_date: str = ""
    page_count: int = 0
    extracted_tables: int = 0
    extracted_rows: int = 0

class ComprehensivePDFProcessor:
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.output_dir = self.base_dir / "frontend" / "public" / "data"
        self.api_dir = self.output_dir / "api"
        self.csv_dir = self.output_dir / "csv"
        self.pdfs_dir = self.output_dir / "pdfs"

        # Create directories
        for directory in [self.output_dir, self.api_dir, self.csv_dir, self.pdfs_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        # Data storage
        self.pdf_metadata: Dict[str, PDFMetadata] = {}
        self.processed_hashes: Set[str] = set()
        self.extracted_data: List[Dict] = []
        self.revenue_data: List[Dict] = []
        self.expense_data: List[Dict] = []

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of file"""
        sha256_hash = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except Exception as e:
            logger.error(f"Error calculating hash for {file_path}: {e}")
            return ""

    def find_all_pdfs(self) -> List[Path]:
        """Find all PDF files in the project"""
        pdf_files = []
        search_patterns = ["**/*.pdf", "**/*.PDF"]

        for pattern in search_patterns:
            pdf_files.extend(self.base_dir.glob(pattern))

        # Remove duplicates and filter out unwanted directories
        unique_pdfs = []
        seen_paths = set()

        for pdf in pdf_files:
            if any(exclude in str(pdf) for exclude in ['.git', 'node_modules', '.venv']):
                continue
            if str(pdf) not in seen_paths:
                unique_pdfs.append(pdf)
                seen_paths.add(str(pdf))

        logger.info(f"Found {len(unique_pdfs)} PDF files")
        return unique_pdfs

    def extract_pdf_content(self, pdf_path: Path) -> Tuple[List[Dict], int, int]:
        """Extract content from PDF using pdfplumber"""
        extracted_data = []
        table_count = 0
        row_count = 0

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    # Extract tables
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if table and len(table) > 1:  # Must have header + data
                            table_count += 1

                            # Convert table to records
                            headers = [str(cell).strip() if cell else f"col_{i}"
                                     for i, cell in enumerate(table[0])]

                            for row_idx, row in enumerate(table[1:]):
                                if any(cell and str(cell).strip() for cell in row):
                                    row_data = {
                                        'source_file': pdf_path.name,
                                        'page_number': page_num + 1,
                                        'table_number': table_idx + 1,
                                        'row_number': row_idx + 1,
                                        'extraction_method': 'pdfplumber',
                                        'extraction_date': datetime.now().isoformat()
                                    }

                                    # Add column data
                                    for col_idx, cell in enumerate(row):
                                        header = headers[col_idx] if col_idx < len(headers) else f"col_{col_idx}"
                                        row_data[header] = str(cell).strip() if cell else ""

                                    extracted_data.append(row_data)
                                    row_count += 1

                                    # Categorize financial data
                                    self.categorize_financial_data(row_data)

        except Exception as e:
            logger.warning(f"Extraction failed for {pdf_path}: {e}")

        return extracted_data, table_count, row_count

    def categorize_financial_data(self, row_data: Dict):
        """Categorize extracted data into revenue/expense categories"""
        text_content = ' '.join(str(v).lower() for v in row_data.values())

        # Revenue indicators
        revenue_keywords = [
            'ingresos', 'recursos', 'recaudacion', 'tasas', 'impuestos',
            'coparticipacion', 'transferencias', 'rentas', 'tributos'
        ]

        # Expense indicators
        expense_keywords = [
            'gastos', 'egresos', 'erogaciones', 'pagos', 'sueldos',
            'servicios', 'obras', 'inversiones', 'transferencias'
        ]

        if any(keyword in text_content for keyword in revenue_keywords):
            self.revenue_data.append(row_data.copy())

        if any(keyword in text_content for keyword in expense_keywords):
            self.expense_data.append(row_data.copy())

    def process_pdf(self, pdf_path: Path) -> Optional[PDFMetadata]:
        """Process a single PDF file"""
        file_hash = self.calculate_file_hash(pdf_path)

        if not file_hash:
            return None

        # Check if already processed
        if file_hash in self.processed_hashes:
            logger.debug(f"Skipping already processed PDF: {pdf_path.name}")
            return None

        logger.info(f"Processing PDF: {pdf_path.name}")

        # Get file stats
        stat = pdf_path.stat()

        # Extract content
        extracted_data, table_count, row_count = self.extract_pdf_content(pdf_path)
        self.extracted_data.extend(extracted_data)

        # Create metadata
        metadata = PDFMetadata(
            file_hash=file_hash,
            filename=pdf_path.name,
            local_path=str(pdf_path.relative_to(self.base_dir)),
            file_size=stat.st_size,
            creation_date=datetime.fromtimestamp(stat.st_ctime).isoformat(),
            extraction_date=datetime.now().isoformat(),
            extracted_tables=table_count,
            extracted_rows=row_count
        )

        # Copy to public directory if not already there
        if not str(pdf_path).startswith(str(self.pdfs_dir)):
            dest_path = self.pdfs_dir / pdf_path.name
            if not dest_path.exists():
                try:
                    dest_path.write_bytes(pdf_path.read_bytes())
                    logger.info(f"Copied {pdf_path.name} to public directory")
                except Exception as e:
                    logger.warning(f"Could not copy {pdf_path.name}: {e}")

        self.pdf_metadata[file_hash] = metadata
        self.processed_hashes.add(file_hash)

        return metadata

    def process_all_pdfs(self):
        """Process all PDF files with deduplication"""
        logger.info("🔍 Starting comprehensive PDF processing...")

        pdf_files = self.find_all_pdfs()
        processed_count = 0

        for pdf_path in pdf_files:
            metadata = self.process_pdf(pdf_path)
            if metadata:
                processed_count += 1

        logger.info(f"📊 Processing complete:")
        logger.info(f"  - Processed: {processed_count} unique PDFs")
        logger.info(f"  - Total extracted rows: {len(self.extracted_data)}")
        logger.info(f"  - Revenue data rows: {len(self.revenue_data)}")
        logger.info(f"  - Expense data rows: {len(self.expense_data)}")

    def save_csv_data(self):
        """Save extracted data to CSV files"""
        # Save complete transparency data
        if self.extracted_data:
            df = pd.DataFrame(self.extracted_data)
            csv_file = self.csv_dir / "transparency_data_complete.csv"
            df.to_csv(csv_file, index=False, encoding='utf-8')
            logger.info(f"Saved complete data: {len(self.extracted_data)} rows")

        # Save revenue data
        if self.revenue_data:
            df = pd.DataFrame(self.revenue_data)
            csv_file = self.csv_dir / "revenue_summary.csv"
            df.to_csv(csv_file, index=False, encoding='utf-8')
            logger.info(f"Saved revenue data: {len(self.revenue_data)} rows")

        # Save expense data
        if self.expense_data:
            df = pd.DataFrame(self.expense_data)
            csv_file = self.csv_dir / "expenses_summary.csv"
            df.to_csv(csv_file, index=False, encoding='utf-8')
            logger.info(f"Saved expense data: {len(self.expense_data)} rows")

    def save_metadata(self):
        """Save PDF metadata to JSON"""
        metadata_file = self.api_dir / "pdf_metadata.json"
        metadata_dict = {hash_key: asdict(metadata)
                        for hash_key, metadata in self.pdf_metadata.items()}

        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata_dict, f, indent=2, ensure_ascii=False)

        logger.info(f"Saved metadata for {len(self.pdf_metadata)} PDFs")

    def create_api_endpoints(self):
        """Create JSON API endpoints"""
        # PDF index
        pdf_index = {
            "total_pdfs": len(self.pdf_metadata),
            "pdfs": [asdict(metadata) for metadata in self.pdf_metadata.values()],
            "statistics": {
                "total_files": len(self.pdf_metadata),
                "total_extracted_tables": sum(m.extracted_tables for m in self.pdf_metadata.values()),
                "total_extracted_rows": sum(m.extracted_rows for m in self.pdf_metadata.values()),
            },
            "last_updated": datetime.now().isoformat()
        }

        with open(self.api_dir / "pdfs.json", 'w', encoding='utf-8') as f:
            json.dump(pdf_index, f, indent=2, ensure_ascii=False)

        # CSV data index
        csv_index = {
            "files": [
                {
                    "filename": "transparency_data_complete.csv",
                    "description": "Complete transparency data extracted from all PDFs",
                    "rows": len(self.extracted_data),
                    "url": "/data/csv/transparency_data_complete.csv"
                },
                {
                    "filename": "revenue_summary.csv",
                    "description": "Revenue and income data from financial reports",
                    "rows": len(self.revenue_data),
                    "url": "/data/csv/revenue_summary.csv"
                },
                {
                    "filename": "expenses_summary.csv",
                    "description": "Expense and expenditure data from financial reports",
                    "rows": len(self.expense_data),
                    "url": "/data/csv/expenses_summary.csv"
                }
            ],
            "statistics": {
                "total_csv_files": 3,
                "data_rows_created": len(self.extracted_data)
            },
            "last_updated": datetime.now().isoformat()
        }

        with open(self.api_dir / "csv_data.json", 'w', encoding='utf-8') as f:
            json.dump(csv_index, f, indent=2, ensure_ascii=False)

        logger.info("Created API endpoints for PDF and CSV data")

    def run_complete_processing(self):
        """Run the complete PDF processing pipeline"""
        logger.info("🚀 Starting comprehensive PDF processing pipeline...")

        self.process_all_pdfs()
        self.save_metadata()
        self.save_csv_data()
        self.create_api_endpoints()

        logger.info("✅ Comprehensive PDF processing complete!")
        logger.info(f"📁 Data available at: {self.output_dir}")

def main():
    processor = ComprehensivePDFProcessor()
    processor.run_complete_processing()

if __name__ == "__main__":
    main()
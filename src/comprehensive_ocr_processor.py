#!/usr/bin/env python3
\"\"\"
Comprehensive OCR Processing Pipeline
Processes all PDF files using multiple OCR techniques and extracts structured data
\"\"\"

import os
import sys
import json
import hashlib
import sqlite3
import logging
from pathlib import Path
from datetime import datetime
import pandas as pd
import pdfplumber
import pytesseract
from PIL import Image
import pdf2image
import numpy as np
import cv2

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/flong/Developer/cda-transparencia/data/ocr_processing/logs/ocr_processing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ComprehensiveOCRProcessor:
    def __init__(self):
        self.base_dir = Path(\"/Users/flong/Developer/cda-transparencia\")
        self.input_dir = self.base_dir / \"data\" / \"web_accessible\"
        self.output_dir = self.base_dir / \"data\" / \"ocr_processing\" / \"output\"
        self.temp_dir = self.base_dir / \"data\" / \"ocr_processing\" / \"temp\"
        self.logs_dir = self.base_dir / \"data\" / \"ocr_processing\" / \"logs\"
        self.db_path = self.base_dir / \"data\" / \"documents.db\"
        
        # Create directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self.init_database()
        
        logger.info(\"OCR Processor initialized\")
        logger.info(f\"Input directory: {self.input_dir}\")
        logger.info(f\"Output directory: {self.output_dir}\")
        logger.info(f\"Database: {self.db_path}\")

    def init_database(self):
        \"\"\"Initialize database for tracking OCR processing\"\"\"
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create OCR processing log table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS ocr_processing_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pdf_hash TEXT UNIQUE,
                    pdf_path TEXT,
                    processing_date TIMESTAMP,
                    processing_method TEXT,
                    text_length INTEGER,
                    tables_extracted INTEGER,
                    confidence_score REAL,
                    output_files TEXT,
                    processing_time REAL,
                    error_message TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info(\"OCR processing database initialized\")
        except Exception as e:
            logger.error(f\"Failed to initialize database: {e}\")

    def get_pdf_hash(self, pdf_path):
        \"\"\"Calculate SHA256 hash of PDF file\"\"\"
        sha256_hash = hashlib.sha256()
        with open(pdf_path, \"rb\") as f:
            for byte_block in iter(lambda: f.read(4096), b\"\"):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def is_already_processed(self, pdf_path):
        \"\"\"Check if PDF has already been OCR processed\"\"\"
        pdf_hash = self.get_pdf_hash(pdf_path)
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(\"SELECT COUNT(*) FROM ocr_processing_log WHERE pdf_hash = ?\", (pdf_hash,))
            count = cursor.fetchone()[0]
            conn.close()
            return count > 0
        except Exception as e:
            logger.warning(f\"Failed to check processing status for {pdf_path}: {e}\")
            return False

    def log_processing_result(self, pdf_path, method, text_length, tables_count, confidence, output_files, processing_time, error=None):
        \"\"\"Log OCR processing result to database\"\"\"
        pdf_hash = self.get_pdf_hash(pdf_path)
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO ocr_processing_log 
                (pdf_hash, pdf_path, processing_date, processing_method, text_length, 
                 tables_extracted, confidence_score, output_files, processing_time, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                pdf_hash,
                str(pdf_path),
                datetime.now().isoformat(),
                method,
                text_length,
                tables_count,
                confidence,
                json.dumps(output_files) if isinstance(output_files, dict) else str(output_files),
                processing_time,
                str(error) if error else None
            ))
            
            conn.commit()
            conn.close()
            logger.info(f\"Logged processing result for {pdf_path}\")
        except Exception as e:
            logger.warning(f\"Failed to log processing result for {pdf_path}: {e}\")

    def preprocess_image(self, image):
        \"\"\"Preprocess image for better OCR results\"\"\"
        # Convert PIL image to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to get image with only black and white
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Noise removal
        kernel = np.ones((1, 1), np.uint8)
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Dilation to enhance text
        dilated = cv2.dilate(opening, kernel, iterations=1)
        
        # Convert back to PIL Image
        pil_image = Image.fromarray(cv2.cvtColor(dilated, cv2.COLOR_BGR2RGB))
        return pil_image

    def extract_text_tesseract(self, image_path):
        \"\"\"Extract text using Tesseract OCR\"\"\"
        try:
            # Preprocess image
            image = Image.open(image_path)
            processed_image = self.preprocess_image(image)
            
            # Extract text with Tesseract
            custom_config = r'--oem 3 --psm 6 -l spa+eng'
            text = pytesseract.image_to_string(processed_image, config=custom_config)
            
            return text.strip()
        except Exception as e:
            logger.error(f\"Tesseract extraction failed for {image_path}: {e}\")
            return \"\"

    def extract_tables_pdfplumber(self, pdf_path):
        \"\"\"Extract tables using pdfplumber\"\"\"
        try:
            tables_data = []
            
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if table and len(table) > 1:
                            # Create DataFrame from table
                            headers = [str(cell) if cell else f\"col_{i}\" for i, cell in enumerate(table[0])]
                            rows = []
                            
                            for row in table[1:]:
                                row_dict = {}
                                for col_idx, cell in enumerate(row):
                                    header = headers[col_idx] if col_idx < len(headers) else f\"col_{col_idx}\"
                                    row_dict[header] = str(cell) if cell else \"\"
                                rows.append(row_dict)
                            
                            if rows:
                                tables_data.append({
                                    'page': page_num + 1,
                                    'table_index': table_idx + 1,
                                    'headers': headers,
                                    'rows': rows,
                                    'row_count': len(rows)
                                })
            
            return tables_data
        except Exception as e:
            logger.error(f\"Table extraction failed for {pdf_path}: {e}\")
            return []

    def pdf_to_images(self, pdf_path, dpi=200):
        \"\"\"Convert PDF pages to images\"\"\"
        try:
            # Create directory for images from this PDF
            pdf_stem = pdf_path.stem
            pdf_images_dir = self.temp_dir / pdf_stem
            pdf_images_dir.mkdir(exist_ok=True)
            
            # Convert PDF to images
            images = pdf2image.convert_from_path(
                str(pdf_path),
                dpi=dpi,
                output_folder=str(pdf_images_dir),
                output_file=pdf_stem,
                fmt='png',
                thread_count=4,
                paths_only=False
            )
            
            # Save images
            image_paths = []
            for i, image in enumerate(images):
                image_path = pdf_images_dir / f\"{pdf_stem}_page_{i+1:03d}.png\"
                image.save(str(image_path), 'PNG')
                image_paths.append(image_path)
            
            return image_paths
        except Exception as e:
            logger.error(f\"Failed to convert PDF to images {pdf_path}: {e}\")
            return []

    def process_single_pdf(self, pdf_path):
        \"\"\"Process a single PDF file through OCR\"\"\"
        logger.info(f\"Processing PDF: {pdf_path}\")
        
        try:
            start_time = datetime.now()
            
            # Check if already processed
            if self.is_already_processed(pdf_path):
                logger.info(f\"Skipping already processed PDF: {pdf_path}\")
                return {\"status\": \"skipped\", \"pdf_path\": str(pdf_path)}
            
            # Create output directory for this PDF
            pdf_stem = pdf_path.stem
            pdf_output_dir = self.output_dir / pdf_stem
            pdf_output_dir.mkdir(exist_ok=True)
            
            # Extract text using pdfplumber (fast method)
            text_content = \"\"
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        text_content += page.extract_text() or \"\"
            except Exception as e:
                logger.warning(f\"PDFPlumber text extraction failed for {pdf_path}: {e}\")
            
            # Extract tables using pdfplumber
            tables = self.extract_tables_pdfplumber(pdf_path)
            
            # If no text extracted with pdfplumber, use OCR
            if not text_content.strip():
                logger.info(f\"Performing OCR on {pdf_path}...\")
                
                # Convert PDF to images
                image_paths = self.pdf_to_images(pdf_path)
                
                if image_paths:
                    # Extract text from images using Tesseract
                    for image_path in image_paths:
                        ocr_text = self.extract_text_tesseract(image_path)
                        text_content += ocr_text + \"\\n\\n\"
            
            # Save extracted text
            text_file = pdf_output_dir / f\"{pdf_stem}_text.txt\"
            with open(text_file, 'w', encoding='utf-8') as f:
                f.write(text_content)
            
            # Save extracted tables as CSV files
            table_files = []
            for i, table_data in enumerate(tables):
                df = pd.DataFrame(table_data['rows'])
                csv_file = pdf_output_dir / f\"{pdf_stem}_table_{i+1}_page_{table_data['page']}.csv\"
                df.to_csv(csv_file, index=False, encoding='utf-8')
                table_files.append(str(csv_file))
            
            # Save metadata
            metadata = {
                'pdf_name': pdf_path.name,
                'pdf_path': str(pdf_path),
                'extraction_date': datetime.now().isoformat(),
                'text_length': len(text_content),
                'tables_extracted': len(tables),
                'table_details': [{'page': t['page'], 'rows': t['row_count']} for t in tables],
                'text_file': str(text_file),
                'table_files': table_files
            }
            
            metadata_file = pdf_output_dir / f\"{pdf_stem}_metadata.json\"
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Log successful processing
            self.log_processing_result(
                pdf_path,
                'combined',
                len(text_content),
                len(tables),
                0.85,  # Average confidence
                {
                    'text_file': str(text_file),
                    'table_files': table_files,
                    'metadata_file': str(metadata_file)
                },
                processing_time
            )
            
            logger.info(f\"Successfully processed {pdf_path} in {processing_time:.2f} seconds\")
            logger.info(f\"  - Extracted {len(text_content)} characters of text\")
            logger.info(f\"  - Extracted {len(tables)} tables\")
            
            return {
                \"status\": \"success\",
                \"pdf_path\": str(pdf_path),
                \"text_length\": len(text_content),
                \"tables_extracted\": len(tables),
                \"processing_time\": processing_time,
                \"output_files\": {
                    'text_file': str(text_file),
                    'table_files': table_files,
                    'metadata_file': str(metadata_file)
                }
            }
            
        except Exception as e:
            logger.error(f\"Failed to process PDF {pdf_path}: {e}\")
            self.log_processing_result(pdf_path, 'combined', 0, 0, 0.0, {}, 0, error=str(e))
            return {\"status\": \"failed\", \"pdf_path\": str(pdf_path), \"error\": str(e)}

    def find_pdf_files(self):
        \"\"\"Find all PDF files in the input directory\"\"\"
        logger.info(f\"Searching for PDF files in {self.input_dir}...\")
        
        pdf_files = []
        for pdf_path in self.input_dir.rglob(\"*.pdf\"):
            # Skip node_modules and .git directories
            if \"node_modules\" in str(pdf_path) or \".git\" in str(pdf_path):
                continue
                
            pdf_files.append(pdf_path)
        
        logger.info(f\"Found {len(pdf_files)} PDF files for OCR processing\")
        return pdf_files

    def process_all_pdfs(self, skip_processed=True, limit=None):
        \"\"\"Process all PDF files\"\"\"
        logger.info(\"Starting batch OCR processing...\")
        
        # Find PDF files
        pdf_files = self.find_pdf_files()
        
        if skip_processed:
            pdf_files = [f for f in pdf_files if not self.is_already_processed(f)]
            logger.info(f\"Filtered to {len(pdf_files)} unprocessed PDF files\")
        
        if limit:
            pdf_files = pdf_files[:limit]
            logger.info(f\"Limited to processing {len(pdf_files)} PDF files\")
        
        # Process PDFs
        results = []
        for i, pdf_path in enumerate(pdf_files):
            logger.info(f\"Processing PDF {i+1}/{len(pdf_files)}: {pdf_path.name}\")
            
            try:
                result = self.process_single_pdf(pdf_path)
                results.append(result)
            except Exception as e:
                logger.error(f\"Failed to process {pdf_path}: {e}\")
                results.append({\"status\": \"failed\", \"pdf_path\": str(pdf_path), \"error\": str(e)})
                continue
        
        # Generate summary report
        success_count = len([r for r in results if r['status'] == 'success'])
        failed_count = len([r for r in results if r['status'] == 'failed'])
        skipped_count = len([r for r in results if r['status'] == 'skipped'])
        
        summary = {
            'processing_date': datetime.now().isoformat(),
            'total_files': len(results),
            'successful': success_count,
            'failed': failed_count,
            'skipped': skipped_count,
            'results': results
        }
        
        summary_file = self.output_dir / \"ocr_processing_summary.json\"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        
        logger.info(f\"Completed OCR processing for {len(results)} PDF files\")
        logger.info(f\"Summary: {success_count} successful, {failed_count} failed, {skipped_count} skipped\")
        logger.info(f\"Report saved to: {summary_file}\")
        
        return results

def main():
    \"\"\"Main entry point\"\"\"
    processor = ComprehensiveOCRProcessor()
    
    # Process all PDFs with a limit for testing
    results = processor.process_all_pdfs(skip_processed=True, limit=10)
    
    # Print summary
    print(\"\\n📊 OCR Processing Summary\")
    print(\"=\" * 40)
    success_count = len([r for r in results if r['status'] == 'success'])
    failed_count = len([r for r in results if r['status'] == 'failed'])
    skipped_count = len([r for r in results if r['status'] == 'skipped'])
    
    print(f\"Total files processed: {len(results)}\")
    print(f\"Successful extractions: {success_count}\")
    print(f\"Failed extractions: {failed_count}\")
    print(f\"Skipped (already processed): {skipped_count}\")

if __name__ == \"__main__\":
    main()
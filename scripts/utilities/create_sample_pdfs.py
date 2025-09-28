#!/usr/bin/env python3
\"\"\"Comprehensive PDF OCR Processing Script\nProcesses all PDF files using multiple OCR techniques and extracts structured data\n\"\"\"

import os
import sys
import json
import hashlib
import logging
from pathlib import Path
from datetime import datetime
import pandas as pd
import sqlite3
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
import cv2
import numpy as np
from PIL import Image
import easyocr
from multiprocessing import Pool, cpu_count
import argparse

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
    def __init__(self, base_dir=None, output_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(\"/Users/flong/Developer/cda-transparencia\")
        self.input_dir = self.base_dir / \"data\" / \"web_accessible\"
        self.output_dir = Path(output_dir) if output_dir else self.base_dir / \"data\" / \"ocr_processing\" / \"output\"
        self.temp_dir = self.base_dir / \"data\" / \"ocr_processing\" / \"temp\"
        self.logs_dir = self.base_dir / \"data\" / \"ocr_processing\" / \"logs\"
        
        # Create directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Database connection
        self.db_path = self.base_dir / \"data\" / \"documents.db\"
        self.init_database()
        
        # OCR readers
        self.easyocr_reader = None
        
        logger.info(f\"OCR Processor initialized\")
        logger.info(f\"Input directory: {self.input_dir}\")
        logger.info(f\"Output directory: {self.output_dir}\")

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
                json.dumps(output_files) if isinstance(output_files, (dict, list)) else str(output_files),
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
        # Convert PIL image to OpenCV format if needed
        if isinstance(image, Image.Image):
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        else:
            opencv_image = image
            
        # Convert to grayscale
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive threshold
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        # Convert back to PIL Image
        pil_image = Image.fromarray(denoised)
        return pil_image

    def extract_text_pdfplumber(self, pdf_path):
        \"\"\"Extract text using pdfplumber\"\"\"
        try:
            text = \"\"
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + \"\\n\\n\"
            return text.strip()
        except Exception as e:
            logger.error(f\"pdfplumber text extraction failed for {pdf_path}: {e}\")
            return \"\"

    def extract_text_tesseract(self, image_path):
        \"\"\"Extract text using Tesseract OCR\"\"\"
        try:
            # Preprocess image
            image = Image.open(image_path)
            processed_image = self.preprocess_image(image)
            
            # Extract text with Tesseract
            custom_config = r'--oem 3 --psm 6 -l spa+eng'
            text = pytesseract.image_to_string(processed_image, config=custom_config)
            
            # Get confidence score
            confidence_data = pytesseract.image_to_data(processed_image, config=custom_config, output_type=pytesseract.Output.DICT)
            confidences = [int(conf) for conf in confidence_data['conf'] if int(conf) != -1]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return text.strip(), avg_confidence
        except Exception as e:
            logger.error(f\"Tesseract extraction failed for {image_path}: {e}\")
            return \"\", 0.0

    def extract_text_easyocr(self, image_path):
        \"\"\"Extract text using EasyOCR\"\"\"
        try:
            # Initialize EasyOCR reader if not already done
            if self.easyocr_reader is None:
                self.easyocr_reader = easyocr.Reader(['es', 'en'])
            
            # Extract text with EasyOCR
            results = self.easyocr_reader.readtext(str(image_path))
            
            # Combine text and calculate average confidence
            text_parts = []
            confidences = []
            
            for (bbox, text, confidence) in results:
                text_parts.append(text)
                confidences.append(confidence)
            
            combined_text = ' '.join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return combined_text.strip(), avg_confidence
        except Exception as e:
            logger.error(f\"EasyOCR extraction failed for {image_path}: {e}\")
            return \"\", 0.0

    def extract_tables_pdfplumber(self, pdf_path):
        \"\"\"Extract tables using pdfplumber\"\"\"
        try:
            tables_data = []
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if table and len(table) > 0:
                            # Convert to DataFrame
                            try:
                                headers = table[0] if table else []
                                data_rows = table[1:] if len(table) > 1 else []
                                
                                # Clean headers and data
                                clean_headers = [str(h).strip() if h is not None else f\"col_{i}\" for i, h in enumerate(headers)]
                                clean_data = []
                                for row in data_rows:
                                    clean_row = [str(cell).strip() if cell is not None else \"\" for cell in row]
                                    clean_data.append(clean_row)
                                
                                if clean_headers and clean_data:
                                    df = pd.DataFrame(clean_data, columns=clean_headers)
                                    tables_data.append({
                                        'page': page_num + 1,
                                        'table_index': table_idx + 1,
                                        'headers': clean_headers,
                                        'data': clean_data,
                                        'shape': df.shape
                                    })
                            except Exception as e:
                                logger.warning(f\"Failed to convert table to DataFrame in {pdf_path}: {e}\")
                                continue
            return tables_data
        except Exception as e:
            logger.error(f\"pdfplumber table extraction failed for {pdf_path}: {e}\")
            return []

    def pdf_to_images(self, pdf_path, dpi=200):
        \"\"\"Convert PDF pages to images for OCR\"\"\"
        try:
            # Create directory for images from this PDF
            pdf_stem = pdf_path.stem
            pdf_images_dir = self.temp_dir / pdf_stem
            pdf_images_dir.mkdir(exist_ok=True)
            
            # Convert PDF to images
            images = convert_from_path(
                str(pdf_path),
                dpi=dpi,
                output_folder=str(pdf_images_dir),
                output_file=pdf_stem,
                fmt='png',
                thread_count=min(cpu_count(), 4),
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

    def process_single_page(self, args):
        \"\"\"Process a single PDF page with OCR\"\"\"
        pdf_path, page_num, image_path = args
        
        try:
            start_time = datetime.now()
            
            # Extract text with both methods
            tesseract_text, tesseract_conf = self.extract_text_tesseract(str(image_path))
            easyocr_text, easyocr_conf = self.extract_text_easyocr(str(image_path))
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Create results dictionary
            results = {
                'page_num': page_num,
                'tesseract': {
                    'text': tesseract_text,
                    'confidence': tesseract_conf,
                    'processing_time': processing_time
                },
                'easyocr': {
                    'text': easyocr_text,
                    'confidence': easyocr_conf,
                    'processing_time': processing_time
                }
            }
            
            return results
        except Exception as e:
            logger.error(f\"Failed to process page {page_num} of {pdf_path}: {e}\")
            return {'page_num': page_num, 'error': str(e)}

    def process_pdf(self, pdf_path):
        \"\"\"Process a single PDF file through comprehensive OCR\"\"\"
        logger.info(f\"Processing PDF: {pdf_path}\")
        
        try:
            start_time = datetime.now()
            
            # Check if already processed
            if self.is_already_processed(pdf_path):
                logger.info(f\"Skipping already processed PDF: {pdf_path}\")
                return {\"status\": \"skipped\", \"pdf_path\": str(pdf_path)}
            
            # Extract text with pdfplumber
            pdfplumber_text = self.extract_text_pdfplumber(pdf_path)
            
            # Extract tables with pdfplumber
            tables = self.extract_tables_pdfplumber(pdf_path)
            
            # Convert PDF to images for OCR
            image_paths = self.pdf_to_images(pdf_path)
            
            if not image_paths:
                logger.warning(f\"No images extracted from {pdf_path}\")
                # Still log the pdfplumber results
                processing_time = (datetime.now() - start_time).total_seconds()
                output_files = self.save_extraction_results(pdf_path, {
                    'pdfplumber_text': pdfplumber_text,
                    'tables': tables,
                    'ocr_pages': []
                })
                
                text_length = len(pdfplumber_text)
                tables_count = len(tables)
                avg_confidence = 0.8  # Default for pdfplumber
                
                self.log_processing_result(
                    pdf_path, 
                    'pdfplumber', 
                    text_length, 
                    tables_count, 
                    avg_confidence, 
                    output_files, 
                    processing_time
                )
                
                return {\"status\": \"partial\", \"pdf_path\": str(pdf_path), \"method\": \"pdfplumber\"}
            
            logger.info(f\"Converted {len(image_paths)} pages to images for {pdf_path}\")
            
            # Process images with OCR in parallel
            page_args = [(pdf_path, i+1, img_path) for i, img_path in enumerate(image_paths)]
            
            with Pool(processes=min(cpu_count(), 4)) as pool:  # Limit to 4 processes
                ocr_results = pool.map(self.process_single_page, page_args)
            
            # Aggregate results
            aggregated_results = {
                'pdf_path': str(pdf_path),
                'pdf_name': pdf_path.name,
                'processing_date': datetime.now().isoformat(),
                'pdfplumber_text': pdfplumber_text,
                'tables': tables,
                'ocr_pages': ocr_results
            }
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Save results in multiple formats
            output_files = self.save_extraction_results(pdf_path, aggregated_results)
            
            # Calculate metrics for logging
            text_length = len(pdfplumber_text) + sum(
                len(page.get('tesseract', {}).get('text', '')) + 
                len(page.get('easyocr', {}).get('text', ''))
                for page in ocr_results if 'error' not in page
            )
            
            tables_count = len(tables)
            
            avg_confidence = sum(
                (page.get('tesseract', {}).get('confidence', 0) + 
                 page.get('easyocr', {}).get('confidence', 0)) / 2
                for page in ocr_results if 'error' not in page
            ) / len([p for p in ocr_results if 'error' not in p]) if ocr_results else 0.8  # Default to pdfplumber confidence
            
            # Log successful processing
            self.log_processing_result(
                pdf_path, 
                'combined', 
                text_length, 
                tables_count, 
                avg_confidence, 
                output_files, 
                processing_time
            )
            
            logger.info(f\"Successfully processed {pdf_path} in {processing_time:.2f} seconds\")
            return {\"status\": \"success\", \"pdf_path\": str(pdf_path), \"results\": aggregated_results}
            
        except Exception as e:
            logger.error(f\"Failed to process PDF {pdf_path}: {e}\")
            processing_time = (datetime.now() - start_time).total_seconds() if 'start_time' in locals() else 0
            self.log_processing_result(pdf_path, 'combined', 0, 0, 0.0, {}, processing_time, error=str(e))
            return {\"status\": \"failed\", \"pdf_path\": str(pdf_path), \"error\": str(e)}

    def save_extraction_results(self, pdf_path, results):
        \"\"\"Save OCR extraction results in multiple formats\"\"\"
        try:
            # Create output directory for this PDF
            pdf_stem = pdf_path.stem
            pdf_output_dir = self.output_dir / pdf_stem
            pdf_output_dir.mkdir(exist_ok=True)
            
            output_files = {}
            
            # Save as JSON
            json_path = pdf_output_dir / f\"{pdf_stem}_extraction.json\"
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            output_files['json'] = str(json_path)
            
            # Save as TXT (combined text)
            txt_path = pdf_output_dir / f\"{pdf_stem}_text.txt\"
            with open(txt_path, 'w', encoding='utf-8') as f:
                # Write pdfplumber text
                if results.get('pdfplumber_text'):
                    f.write(\"=== PDFPlumber Extracted Text ===\\n\")
                    f.write(results['pdfplumber_text'] + \"\\n\\n\")
                
                # Write OCR text
                for page in results.get('ocr_pages', []):
                    if 'error' not in page:
                        f.write(f\"=== Page {page.get('page_num', 0)} ===\\n\")
                        tesseract_text = page.get('tesseract', {}).get('text', '')
                        easyocr_text = page.get('easyocr', {}).get('text', '')
                        # Use the better quality text
                        best_text = tesseract_text if len(tesseract_text) >= len(easyocr_text) else easyocr_text
                        if best_text:
                            f.write(best_text + \"\\n\\n\")
            output_files['text'] = str(txt_path)
            
            # Save tables as CSV
            tables = results.get('tables', [])
            if tables:
                tables_dir = pdf_output_dir / \"tables\"
                tables_dir.mkdir(exist_ok=True)
                
                for i, table in enumerate(tables):
                    try:
                        df = pd.DataFrame(table['data'], columns=table['headers'])
                        csv_path = tables_dir / f\"{pdf_stem}_table_{i+1}_page_{table['page']}.csv\"
                        df.to_csv(csv_path, index=False, encoding='utf-8')
                        logger.info(f\"Saved table to {csv_path}\")
                    except Exception as e:
                        logger.error(f\"Failed to save table {i+1} from {pdf_path}: {e}\")
            
            # Copy original PDF to output directory
            pdf_copy_path = pdf_output_dir / pdf_path.name
            if not pdf_copy_path.exists():
                import shutil
                shutil.copy2(pdf_path, pdf_copy_path)
            output_files['pdf'] = str(pdf_copy_path)
            
            logger.info(f\"Saved extraction results for {pdf_path.name}\")
            return output_files
            
        except Exception as e:
            logger.error(f\"Failed to save results for {pdf_path}: {e}\")
            return {}

    def find_pdf_files(self, skip_processed=True):
        \"\"\"Find all PDF files in the input directory\"\"\"
        logger.info(\"Searching for PDF files...\")
        
        pdf_files = []
        for pdf_path in self.input_dir.rglob(\"*.pdf\"):
            # Skip already processed files if requested
            if skip_processed and self.is_already_processed(pdf_path):
                logger.info(f\"Skipping already processed file: {pdf_path}\")
                continue
                
            pdf_files.append(pdf_path)
        
        logger.info(f\"Found {len(pdf_files)} PDF files for OCR processing\")
        return pdf_files

    def process_all_pdfs(self, skip_processed=True, limit=None):
        \"\"\"Process all PDF files\"\"\"
        logger.info(\"Starting comprehensive PDF OCR processing...\")
        
        # Find PDF files
        pdf_files = self.find_pdf_files(skip_processed=skip_processed)
        
        if limit:
            pdf_files = pdf_files[:limit]
            logger.info(f\"Limited to processing {len(pdf_files)} PDF files\")
        
        # Process PDFs
        results = []
        for i, pdf_path in enumerate(pdf_files):
            logger.info(f\"Processing PDF {i+1}/{len(pdf_files)}: {pdf_path.name}\")
            
            try:
                result = self.process_pdf(pdf_path)
                results.append(result)
            except Exception as e:
                logger.error(f\"Failed to process {pdf_path}: {e}\")
                results.append({\"status\": \"failed\", \"pdf_path\": str(pdf_path), \"error\": str(e)})
                continue
        
        # Generate summary report
        self.generate_summary_report(results)
        
        logger.info(f\"Completed OCR processing for {len(results)} PDF files\")
        return results

    def generate_summary_report(self, results):
        \"\"\"Generate a summary report of the OCR processing\"\"\"
        try:
            summary = {
                'generated_at': datetime.now().isoformat(),
                'total_files': len(results),
                'successful_extractions': len([r for r in results if r['status'] == 'success']),
                'partial_extractions': len([r for r in results if r['status'] == 'partial']),
                'failed_extractions': len([r for r in results if r['status'] == 'failed']),
                'skipped_files': len([r for r in results if r['status'] == 'skipped']),
                'processing_details': results
            }
            
            summary_path = self.logs_dir / \"ocr_processing_summary.json\"
            with open(summary_path, 'w', encoding='utf-8') as f:
                json.dump(summary, f, ensure_ascii=False, indent=2)
            
            logger.info(f\"Generated OCR processing summary: {summary_path}\")
        except Exception as e:
            logger.error(f\"Failed to generate summary report: {e}\")

def main():
    parser = argparse.ArgumentParser(description='Extract text and data from PDFs using comprehensive OCR')
    parser.add_argument('--base-dir', help='Base directory for the project')
    parser.add_argument('--output-dir', help='Output directory for extracted data')
    parser.add_argument('--limit', type=int, help='Limit number of PDFs to process')
    parser.add_argument('--skip-processed', action='store_true', 
                        help='Skip already processed PDFs', default=True)
    
    args = parser.parse_args()
    
    # Initialize processor
    processor = ComprehensiveOCRProcessor(
        base_dir=args.base_dir,
        output_dir=args.output_dir
    )
    
    # Process all PDFs
    results = processor.process_all_pdfs(
        skip_processed=args.skip_processed,
        limit=args.limit
    )
    
    # Print summary
    success_count = len([r for r in results if r['status'] == 'success'])
    partial_count = len([r for r in results if r['status'] == 'partial'])
    failed_count = len([r for r in results if r['status'] == 'failed'])
    skipped_count = len([r for r in results if r['status'] == 'skipped'])
    
    print(f\"\\nOCR Processing Summary:\")
    print(f\"======================\")
    print(f\"Total PDFs processed: {len(results)}\")
    print(f\"Successful extractions: {success_count}\")
    print(f\"Partial extractions: {partial_count}\")
    print(f\"Failed extractions: {failed_count}\")
    print(f\"Skipped (already processed): {skipped_count}\")
    
    logger.info(f\"OCR processing completed. Processed {len(results)} PDF files.\")

if __name__ == \"__main__\":
    main()
#!/usr/bin/env python3
"""
Comprehensive PDF OCR Extraction Script
Processes all PDF files in the data directory using both Tesseract and EasyOCR
"""

import os
import sys
import json
import hashlib
import logging
from pathlib import Path
from datetime import datetime
import pandas as pd
import sqlite3
import pytesseract
import pdf2image
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
        logging.FileHandler('ocr_extraction.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Global OCR readers
tesseract_reader = None
easyocr_reader = None

class PDFOCRExtractor:
    def __init__(self, base_dir=None, output_dir=None, languages=['es', 'en']):
        self.base_dir = Path(base_dir) if base_dir else Path.cwd()
        self.output_dir = Path(output_dir) if output_dir else self.base_dir / "data" / "ocr_extracted"
        self.languages = languages
        
        # Create output directories
        self.output_dirs = {
            'pdfs': self.output_dir / 'pdfs',
            'text': self.output_dir / 'text',
            'csv': self.output_dir / 'csv', 
            'json': self.output_dir / 'json',
            'images': self.output_dir / 'images'
        }
        
        for dir_path in self.output_dirs.values():
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Database connection
        self.db_path = self.base_dir / "data" / "documents.db"
        self.init_database()
        
        logger.info(f"PDFOCRExtractor initialized with base_dir: {self.base_dir}")
        logger.info(f"Output directory: {self.output_dir}")
        logger.info(f"Supported languages: {self.languages}")

    def init_database(self):
        """Initialize database for tracking OCR extraction progress"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create OCR extraction tracking table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS ocr_extraction_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pdf_hash TEXT UNIQUE,
                    pdf_path TEXT,
                    extraction_date TIMESTAMP,
                    extraction_method TEXT,
                    text_length INTEGER,
                    confidence_score REAL,
                    output_files TEXT,
                    processing_time REAL,
                    error_message TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("OCR extraction database initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")

    def get_pdf_hash(self, pdf_path):
        """Calculate SHA256 hash of PDF file"""
        sha256_hash = hashlib.sha256()
        with open(pdf_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def is_already_processed(self, pdf_path):
        """Check if PDF has already been OCR processed"""
        pdf_hash = self.get_pdf_hash(pdf_path)
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM ocr_extraction_log WHERE pdf_hash = ?", (pdf_hash,))
            count = cursor.fetchone()[0]
            conn.close()
            return count > 0
        except Exception as e:
            logger.warning(f"Failed to check processing status for {pdf_path}: {e}")
            return False

    def log_extraction_result(self, pdf_path, method, text_length, confidence, output_files, processing_time, error=None):
        """Log OCR extraction result to database"""
        pdf_hash = self.get_pdf_hash(pdf_path)
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO ocr_extraction_log 
                (pdf_hash, pdf_path, extraction_date, extraction_method, text_length, 
                 confidence_score, output_files, processing_time, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                pdf_hash,
                str(pdf_path),
                datetime.now().isoformat(),
                method,
                text_length,
                confidence,
                json.dumps(output_files) if isinstance(output_files, dict) else str(output_files),
                processing_time,
                str(error) if error else None
            ))
            
            conn.commit()
            conn.close()
            logger.info(f"Logged extraction result for {pdf_path}")
        except Exception as e:
            logger.warning(f"Failed to log extraction result for {pdf_path}: {e}")

    def preprocess_image(self, image):
        """Preprocess image for better OCR results"""
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
        pil_image = Image.fromarray(dilated)
        return pil_image

    def extract_text_tesseract(self, image_path):
        """Extract text using Tesseract OCR"""
        try:
            # Preprocess image
            image = Image.open(image_path)
            processed_image = self.preprocess_image(image)
            
            # Extract text with Tesseract
            custom_config = r'--oem 3 --psm 6 -l ' + '+'.join(self.languages)
            text = pytesseract.image_to_string(processed_image, config=custom_config)
            confidence = pytesseract.image_to_confidence(processed_image, config=custom_config)
            
            return text.strip(), confidence
        except Exception as e:
            logger.error(f"Tesseract extraction failed for {image_path}: {e}")
            return "", 0.0

    def extract_text_easyocr(self, image_path):
        """Extract text using EasyOCR"""
        try:
            global easyocr_reader
            
            # Initialize EasyOCR reader if not already done
            if easyocr_reader is None:
                easyocr_reader = easyocr.Reader(self.languages)
            
            # Extract text with EasyOCR
            results = easyocr_reader.readtext(str(image_path))
            
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
            logger.error(f"EasyOCR extraction failed for {image_path}: {e}")
            return "", 0.0

    def pdf_to_images(self, pdf_path, dpi=200):
        """Convert PDF pages to images"""
        try:
            # Create directory for images from this PDF
            pdf_stem = pdf_path.stem
            pdf_images_dir = self.output_dirs['images'] / pdf_stem
            pdf_images_dir.mkdir(exist_ok=True)
            
            # Convert PDF to images
            images = pdf2image.convert_from_path(
                str(pdf_path),
                dpi=dpi,
                output_folder=str(pdf_images_dir),
                output_file=pdf_stem,
                fmt='png',
                thread_count=cpu_count(),
                paths_only=False
            )
            
            # Save images
            image_paths = []
            for i, image in enumerate(images):
                image_path = pdf_images_dir / f"{pdf_stem}_page_{i+1:03d}.png"
                image.save(str(image_path), 'PNG')
                image_paths.append(image_path)
            
            return image_paths
        except Exception as e:
            logger.error(f"Failed to convert PDF to images {pdf_path}: {e}")
            return []

    def extract_tables_from_pdf(self, pdf_path):
        """Extract tables from PDF using multiple methods"""
        try:
            import camelot
            # Try camelot for table extraction
            tables = camelot.read_pdf(str(pdf_path), pages='all')
            return tables
        except Exception as e:
            logger.warning(f"Camelot table extraction failed for {pdf_path}: {e}")
            
        try:
            import tabula
            # Try tabula as fallback
            tables = tabula.read_pdf(str(pdf_path), pages='all', multiple_tables=True)
            return tables
        except Exception as e:
            logger.warning(f"Tabula table extraction failed for {pdf_path}: {e}")
            
        return []

    def process_single_page(self, args):
        """Process a single PDF page"""
        pdf_path, page_num, image_path = args
        
        try:
            start_time = datetime.now()
            
            # Extract text with both methods
            tesseract_text, tesseract_conf = self.extract_text_tesseract(image_path)
            easyocr_text, easyocr_conf = self.extract_text_easyocr(image_path)
            
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
            logger.error(f"Failed to process page {page_num} of {pdf_path}: {e}")
            return {'page_num': page_num, 'error': str(e)}

    def process_pdf(self, pdf_path):
        """Process a single PDF file through OCR"""
        logger.info(f"Processing PDF: {pdf_path}")
        
        try:
            start_time = datetime.now()
            
            # Check if already processed
            if self.is_already_processed(pdf_path):
                logger.info(f"Skipping already processed PDF: {pdf_path}")
                return {"status": "skipped", "pdf_path": str(pdf_path)}
            
            # Convert PDF to images
            image_paths = self.pdf_to_images(pdf_path)
            
            if not image_paths:
                logger.warning(f"No images extracted from {pdf_path}")
                return {"status": "failed", "pdf_path": str(pdf_path), "error": "No images extracted"}
            
            logger.info(f"Converted {len(image_paths)} pages to images for {pdf_path}")
            
            # Process images in parallel
            page_args = [(pdf_path, i+1, img_path) for i, img_path in enumerate(image_paths)]
            
            with Pool(processes=min(cpu_count(), 4)) as pool:  # Limit to 4 processes
                page_results = pool.map(self.process_single_page, page_args)
            
            # Aggregate results
            aggregated_results = {
                'pdf_path': str(pdf_path),
                'pdf_name': pdf_path.name,
                'total_pages': len(image_paths),
                'extraction_date': datetime.now().isoformat(),
                'pages': page_results
            }
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Save results in multiple formats
            output_files = self.save_extraction_results(pdf_path, aggregated_results)
            
            # Log successful extraction
            total_text_length = sum(
                len(page.get('tesseract', {}).get('text', '')) + 
                len(page.get('easyocr', {}).get('text', ''))
                for page in page_results if 'error' not in page
            )
            
            avg_confidence = sum(
                (page.get('tesseract', {}).get('confidence', 0) + 
                 page.get('easyocr', {}).get('confidence', 0)) / 2
                for page in page_results if 'error' not in page
            ) / len([p for p in page_results if 'error' not in p]) if page_results else 0
            
            self.log_extraction_result(
                pdf_path, 
                'combined', 
                total_text_length, 
                avg_confidence, 
                output_files, 
                processing_time
            )
            
            logger.info(f"Successfully processed {pdf_path} in {processing_time:.2f} seconds")
            return {"status": "success", "pdf_path": str(pdf_path), "results": aggregated_results}
            
        except Exception as e:
            logger.error(f"Failed to process PDF {pdf_path}: {e}")
            self.log_extraction_result(pdf_path, 'combined', 0, 0.0, {}, 0, error=str(e))
            return {"status": "failed", "pdf_path": str(pdf_path), "error": str(e)}

    def save_extraction_results(self, pdf_path, results):
        """Save OCR extraction results in multiple formats"""
        try:
            # Create output filenames
            pdf_stem = pdf_path.stem
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            output_files = {}
            
            # Save as JSON
            json_path = self.output_dirs['json'] / f"{pdf_stem}_{timestamp}.json"
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            output_files['json'] = str(json_path)
            
            # Save as TXT (combined text)
            txt_path = self.output_dirs['text'] / f"{pdf_stem}_{timestamp}.txt"
            with open(txt_path, 'w', encoding='utf-8') as f:
                for page in results.get('pages', []):
                    if 'error' not in page:
                        tesseract_text = page.get('tesseract', {}).get('text', '')
                        easyocr_text = page.get('easyocr', {}).get('text', '')
                        # Use the better quality text
                        best_text = tesseract_text if len(tesseract_text) > len(easyocr_text) else easyocr_text
                        if best_text:
                            f.write(f"=== Page {page.get('page_num', 0)} ===\\n")
                            f.write(best_text + "\\n\\n")
            output_files['text'] = str(txt_path)
            
            # Save as CSV (structured data)
            csv_path = self.output_dirs['csv'] / f"{pdf_stem}_{timestamp}.csv"
            csv_rows = []
            
            for page in results.get('pages', []):
                if 'error' not in page:
                    csv_rows.append({
                        'page_num': page.get('page_num'),
                        'tesseract_text': page.get('tesseract', {}).get('text', ''),
                        'tesseract_confidence': page.get('tesseract', {}).get('confidence', 0),
                        'easyocr_text': page.get('easyocr', {}).get('text', ''),
                        'easyocr_confidence': page.get('easyocr', {}).get('confidence', 0)
                    })
            
            if csv_rows:
                df = pd.DataFrame(csv_rows)
                df.to_csv(csv_path, index=False, encoding='utf-8')
                output_files['csv'] = str(csv_path)
            
            # Copy original PDF to ocr_extracted directory
            pdf_copy_path = self.output_dirs['pdfs'] / pdf_path.name
            if not pdf_copy_path.exists():
                import shutil
                shutil.copy2(pdf_path, pdf_copy_path)
            output_files['pdf'] = str(pdf_copy_path)
            
            logger.info(f"Saved extraction results for {pdf_path.name}")
            return output_files
            
        except Exception as e:
            logger.error(f"Failed to save results for {pdf_path}: {str(e)}")
            return {}

    def find_pdf_files(self, skip_processed=True):
        """Find all PDF files in the data directory"""
        logger.info("Searching for PDF files...")
        
        pdf_files = []
        for pdf_path in self.base_dir.rglob("*.pdf"):
            # Skip node_modules and .git directories
            if "node_modules" in str(pdf_path) or ".git" in str(pdf_path):
                continue
                
            # Skip already processed files if requested
            if skip_processed and self.is_already_processed(pdf_path):
                logger.info(f"Skipping already processed file: {pdf_path}")
                continue
                
            pdf_files.append(pdf_path)
        
        logger.info(f"Found {len(pdf_files)} PDF files for OCR processing")
        return pdf_files

    def process_all_pdfs(self, skip_processed=True, limit=None):
        """Process all PDF files"""
        logger.info("Starting batch PDF OCR processing...")
        
        # Find PDF files
        pdf_files = self.find_pdf_files(skip_processed=skip_processed)
        
        if limit:
            pdf_files = pdf_files[:limit]
            logger.info(f"Limited to processing {len(pdf_files)} PDF files")
        
        # Process PDFs
        results = []
        for i, pdf_path in enumerate(pdf_files):
            logger.info(f"Processing PDF {i+1}/{len(pdf_files)}: {pdf_path.name}")
            
            try:
                result = self.process_pdf(pdf_path)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to process {pdf_path}: {e}")
                results.append({"status": "failed", "pdf_path": str(pdf_path), "error": str(e)})
                continue
        
        logger.info(f"Completed OCR processing for {len(results)} PDF files")
        return results

def main():
    parser = argparse.ArgumentParser(description='Extract text from PDFs using OCR')
    parser.add_argument('--base-dir', help='Base directory to search for PDFs')
    parser.add_argument('--output-dir', help='Output directory for extracted text')
    parser.add_argument('--languages', nargs='+', default=['es', 'en'], 
                        help='Languages for OCR (default: es en)')
    parser.add_argument('--limit', type=int, help='Limit number of PDFs to process')
    parser.add_argument('--skip-processed', action='store_true', 
                        help='Skip already processed PDFs')
    
    args = parser.parse_args()
    
    # Initialize extractor
    extractor = PDFOCRExtractor(
        base_dir=args.base_dir,
        output_dir=args.output_dir,
        languages=args.languages
    )
    
    # Process all PDFs
    results = extractor.process_all_pdfs(
        skip_processed=args.skip_processed,
        limit=args.limit
    )
    
    # Generate summary report
    success_count = len([r for r in results if r['status'] == 'success'])
    failed_count = len([r for r in results if r['status'] == 'failed'])
    skipped_count = len([r for r in results if r['status'] == 'skipped'])
    
    print(f"\\nOCR Extraction Summary:")
    print(f"======================")
    print(f"Total PDFs processed: {len(results)}")
    print(f"Successful extractions: {success_count}")
    print(f"Failed extractions: {failed_count}")
    print(f"Skipped (already processed): {skipped_count}")
    
    logger.info(f"OCR extraction completed. Processed {len(results)} PDF files.")

if __name__ == "__main__":
    main()
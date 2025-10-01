#!/usr/bin/env python3
"""
Complete OCR Pipeline Orchestrator
Orchestrates the complete PDF OCR extraction and organization process
"""

import os
import sys
import subprocess
import logging
from pathlib import Path
from datetime import datetime
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ocr_orchestrator.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class OCROrchestrator:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path.cwd()
        self.scripts_dir = self.base_dir / "scripts"
        self.data_dir = self.base_dir / "data"
        self.ocr_dir = self.data_dir / "ocr_extracted"
        
        logger.info(f"OCROrchestrator initialized with base_dir: {self.base_dir}")

    def run_command(self, cmd, description, cwd=None):
        """Run a shell command and handle errors"""
        logger.info(f"Running: {description}")
        logger.debug(f"Command: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        
        try:
            result = subprocess.run(
                cmd,
                cwd=cwd or self.base_dir,
                capture_output=True,
                text=True,
                timeout=3600  # 1 hour timeout
            )
            
            if result.returncode != 0:
                logger.error(f"Command failed: {description}")
                logger.error(f"Error output: {result.stderr}")
                return False
            
            logger.info(f"Command completed successfully: {description}")
            if result.stdout.strip():
                logger.debug(f"Output: {result.stdout}")
            
            return True
            
        except subprocess.TimeoutExpired:
            logger.error(f"Command timed out: {description}")
            return False
        except Exception as e:
            logger.error(f"Command failed with exception: {description}")
            logger.error(f"Exception: {e}")
            return False

    def setup_environment(self):
        """Setup the OCR environment"""
        logger.info("Setting up OCR environment...")
        
        # Create necessary directories
        directories = [
            self.ocr_dir,
            self.ocr_dir / "pdfs",
            self.ocr_dir / "text", 
            self.ocr_dir / "csv",
            self.ocr_dir / "json",
            self.ocr_dir / "images",
            self.ocr_dir / "summaries"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created directory: {directory}")
        
        return True

    def extract_pdfs_with_ocr(self, limit=None, skip_processed=True, prioritize_financial_reports=False):
        """Extract text from PDFs using OCR"""
        ocr_script = self.scripts_dir / "ocr_extraction.py"
        
        if not ocr_script.exists():
            logger.error(f"OCR extraction script not found: {ocr_script}")
            return False
        
        cmd = [
            sys.executable, str(ocr_script),
            "--base-dir", str(self.base_dir),
            "--languages", "es", "en"
        ]
        
        if limit:
            cmd.extend(["--limit", str(limit)])
        
        if skip_processed:
            cmd.append("--skip-processed")
        
        if prioritize_financial_reports:
            cmd.append("--prioritize-financial-reports")
        
        return self.run_command(cmd, "PDF OCR extraction")

    def organize_ocr_data(self):
        """Organize extracted OCR data"""
        organize_script = self.scripts_dir / "organize_ocr_data.py"
        
        if not organize_script.exists():
            logger.error(f"OCR organization script not found: {organize_script}")
            return False
        
        cmd = [
            sys.executable, str(organize_script),
            "--base-dir", str(self.base_dir)
        ]
        
        return self.run_command(cmd, "OCR data organization")

    def update_databases(self):
        """Update databases with OCR extracted information"""
        # The organization script already handles this, but we can add additional updates here
        logger.info("Updating databases with OCR extracted information...")
        
        try:
            # Run database update scripts if they exist
            db_update_script = self.scripts_dir / "database" / "update_ocr_data.py"
            
            if db_update_script.exists():
                cmd = [
                    sys.executable, str(db_update_script),
                    "--base-dir", str(self.base_dir)
                ]
                return self.run_command(cmd, "Database update")
            
            logger.info("No specific database update script found, relying on organization script")
            return True
            
        except Exception as e:
            logger.error(f"Database update failed: {e}")
            return False

    def generate_reports(self):
        """Generate OCR extraction reports"""
        # The organization script already generates reports, but we can add more here
        logger.info("Generating OCR extraction reports...")
        
        try:
            # Generate additional reports if needed
            report_script = self.scripts_dir / "generate_ocr_reports.py"
            
            if report_script.exists():
                cmd = [
                    sys.executable, str(report_script),
                    "--base-dir", str(self.base_dir)
                ]
                return self.run_command(cmd, "Report generation")
            
            logger.info("Using reports generated by organization script")
            return True
            
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            return False

    def verify_extraction_quality(self):
        """Verify OCR extraction quality"""
        logger.info("Verifying OCR extraction quality...")
        
        try:
            # Check if we have extracted files
            text_files = list(self.ocr_dir.glob("text/*.txt"))
            json_files = list(self.ocr_dir.glob("json/*.json"))
            
            logger.info(f"OCR extraction results:")
            logger.info(f"  - Text files: {len(text_files)}")
            logger.info(f"  - JSON files: {len(json_files)}")
            
            if len(text_files) == 0 and len(json_files) == 0:
                logger.warning("No OCR extracted files found")
                return False
            
            # Sample check a few files
            sample_text_files = text_files[:3] if text_files else []
            sample_json_files = json_files[:3] if json_files else []
            
            for text_file in sample_text_files:
                try:
                    with open(text_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if len(content) > 100:  # Arbitrary threshold
                            logger.info(f"✓ Sample text file {text_file.name} has content ({len(content)} chars)")
                        else:
                            logger.warning(f"⚠ Sample text file {text_file.name} has minimal content ({len(content)} chars)")
                except Exception as e:
                    logger.error(f"Failed to read sample text file {text_file}: {e}")
            
            for json_file in sample_json_files:
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        import json
                        data = json.load(f)
                        pages = len(data.get('pages', []))
                        logger.info(f"✓ Sample JSON file {json_file.name} has {pages} pages")
                except Exception as e:
                    logger.error(f"Failed to read sample JSON file {json_file}: {e}")
            
            return True
            
        except Exception as e:
            logger.error(f"Quality verification failed: {e}")
            return False

    def run_complete_pipeline(self, limit=None, skip_processed=True, prioritize_financial_reports=False):
        """Run the complete OCR pipeline"""
        logger.info("Starting complete OCR extraction pipeline...")
        start_time = datetime.now()
        
        try:
            # 1. Setup environment
            if not self.setup_environment():
                logger.error("Environment setup failed")
                return False
            
            # 2. Extract PDFs with OCR
            logger.info("Step 1/5: Extracting PDFs with OCR...")
            if not self.extract_pdfs_with_ocr(limit=limit, skip_processed=skip_processed, prioritize_financial_reports=prioritize_financial_reports):
                logger.error("PDF OCR extraction failed")
                return False
            
            # 3. Organize OCR data
            logger.info("Step 2/5: Organizing OCR extracted data...")
            if not self.organize_ocr_data():
                logger.error("OCR data organization failed")
                return False
            
            # 4. Update databases
            logger.info("Step 3/5: Updating databases...")
            if not self.update_databases():
                logger.error("Database updates failed")
                return False
            
            # 5. Generate reports
            logger.info("Step 4/5: Generating reports...")
            if not self.generate_reports():
                logger.error("Report generation failed")
                return False
            
            # 6. Verify quality
            logger.info("Step 5/5: Verifying extraction quality...")
            if not self.verify_extraction_quality():
                logger.warning("Quality verification found issues")
                # Don't fail the pipeline for quality issues
            
            # Calculate duration
            duration = datetime.now() - start_time
            logger.info(f"Complete OCR pipeline completed in {duration}")
            
            return True
            
        except Exception as e:
            logger.error(f"Complete OCR pipeline failed: {e}")
            return False

    def run_incremental_update(self):
        """Run incremental update for new PDFs only"""
        logger.info("Running incremental OCR update for new PDFs...")
        return self.run_complete_pipeline(skip_processed=True)

    def cleanup_temporary_files(self):
        """Cleanup temporary files generated during OCR processing"""
        logger.info("Cleaning up temporary files...")
        
        try:
            # Remove temporary image files
            temp_images = self.ocr_dir / "images"
            if temp_images.exists():
                import shutil
                for temp_dir in temp_images.iterdir():
                    if temp_dir.is_dir():
                        logger.info(f"Removing temporary image directory: {temp_dir}")
                        shutil.rmtree(temp_dir)
            
            logger.info("Temporary file cleanup completed")
            return True
            
        except Exception as e:
            logger.error(f"Temporary file cleanup failed: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Complete OCR Pipeline Orchestrator')
    parser.add_argument('--base-dir', help='Base directory')
    parser.add_argument('--limit', type=int, help='Limit number of PDFs to process')
    parser.add_argument('--incremental', action='store_true', 
                        help='Only process new PDFs (skip already processed)')
    parser.add_argument('--cleanup', action='store_true',
                        help='Cleanup temporary files after processing')
    parser.add_argument('--verify-only', action='store_true',
                        help='Only verify existing OCR extraction quality')
    parser.add_argument('--prioritize-financial-reports', action='store_true',
                        help='Process financial reports (like Situación Económico-Financiera) first')
    
    args = parser.parse_args()
    
    # Initialize orchestrator
    orchestrator = OCROrchestrator(base_dir=args.base_dir)
    
    if args.verify_only:
        # Only verify existing extraction quality
        success = orchestrator.verify_extraction_quality()
        return success
    
    # Run complete pipeline
    if args.incremental:
        success = orchestrator.run_incremental_update()
    else:
        success = orchestrator.run_complete_pipeline(
            limit=args.limit,
            skip_processed=args.incremental,
            prioritize_financial_reports=args.prioritize_financial_reports
        )
    
    # Cleanup if requested
    if success and args.cleanup:
        orchestrator.cleanup_temporary_files()
    
    if success:
        logger.info("OCR pipeline completed successfully")
    else:
        logger.error("OCR pipeline failed")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
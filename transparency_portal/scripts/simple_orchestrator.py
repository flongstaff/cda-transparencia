#!/usr/bin/env python3
"""
Simple Master Orchestrator for Carmen de Areco Transparency Portal
===============================================================

This script orchestrates all data processing operations by calling existing scripts
in the proper order to ensure all data from 2017-2025 is properly processed.

Usage:
    python master_orchestrator.py --mode setup     # Initial setup
    python master_orchestrator.py --mode extract   # Extract data from documents
    python master_orchestrator.py --mode process   # Process and preserve data
    python master_orchestrator.py --mode load      # Load data into database
    python master_orchestrator.py --mode full      # Complete end-to-end process
"""

import os
import sys
import subprocess
import argparse
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('master_orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SimpleMasterOrchestrator:
    """Simple master orchestrator that calls existing scripts"""
    
    def __init__(self):
        self.base_path = Path("/Users/flong/Developer/cda-transparencia")
        self.scripts_path = self.base_path / "scripts"
        self.transparency_path = self.base_path / "transparency_portal"
        
    def log_phase(self, phase: str, description: str = ""):
        """Log a major phase with formatting"""
        logger.info("=" * 80)
        logger.info(f"🎯 PHASE: {phase}")
        if description:
            logger.info(f"📝 {description}")
        logger.info("=" * 80)
    
    def run_command(self, command: str, cwd: Path = None) -> bool:
        """Run a command and return success status"""
        logger.info(f"🔧 Running: {command}")
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd or self.base_path,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                logger.info(f"✅ Command completed successfully")
                if result.stdout:
                    logger.debug(f"Output: {result.stdout.strip()}")
                return True
            else:
                logger.error(f"❌ Command failed with exit code {result.returncode}")
                if result.stderr:
                    logger.error(f"Error: {result.stderr.strip()}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"❌ Command timed out: {command}")
            return False
        except Exception as e:
            logger.error(f"❌ Command failed: {e}")
            return False
    
    def setup_environment(self) -> bool:
        """Setup the processing environment"""
        self.log_phase("ENVIRONMENT SETUP", "Configuring processing environment")
        
        try:
            # Ensure required directories exist
            required_dirs = [
                self.base_path / "data" / "source_materials",
                self.base_path / "data" / "preserved",
                self.base_path / "data" / "markdown_documents"
            ]
            
            for directory in required_dirs:
                directory.mkdir(parents=True, exist_ok=True)
                logger.info(f"✅ Ensured directory exists: {directory}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Environment setup failed: {e}")
            return False
    
    def extract_budget_data(self) -> bool:
        """Extract budget data from documents"""
        self.log_phase("BUDGET DATA EXTRACTION", "Extracting budget data from PDF documents (2017-2021)")
        
        try:
            # Run the final budget extractor script
            budget_script = self.transparency_path / "data_extraction" / "budget_extractor.py"
            if budget_script.exists():
                success = self.run_command(f"python {budget_script}")
            else:
                # Fallback to original script location
                budget_script = self.scripts_path / "final_extract_budget_data.py"
                if budget_script.exists():
                    success = self.run_command(f"python {budget_script}")
                else:
                    logger.warning("⚠️  Budget extraction script not found, skipping")
                    return True
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Budget data extraction failed: {e}")
            return False
    
    def extract_other_data(self) -> bool:
        """Extract other data types (tenders, salaries, etc.)"""
        self.log_phase("OTHER DATA EXTRACTION", "Extracting tender and salary data")
        
        try:
            success = True
            
            # Extract tender data
            tender_script = self.scripts_path / "extract_tender_data.py"
            if tender_script.exists():
                logger.info("🏗️  Extracting tender data...")
                success &= self.run_command(f"python {tender_script}")
            else:
                logger.warning("⚠️  Tender extraction script not found, skipping")
            
            # Extract salary data
            salary_script = self.scripts_path / "extract_salaries.py"
            if salary_script.exists():
                logger.info("💼 Extracting salary data...")
                success &= self.run_command(f"python {salary_script}")
            else:
                logger.warning("⚠️  Salary extraction script not found, skipping")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Other data extraction failed: {e}")
            return False
    
    def process_and_preserve_data(self) -> bool:
        """Process and preserve all data"""
        self.log_phase("DATA PROCESSING", "Processing and preserving all transparency data")
        
        try:
            # Run data preservation script
            preservation_script = self.scripts_path / "data_preservation.py"
            if preservation_script.exists():
                logger.info("🗄️  Running data preservation...")
                success = self.run_command(f"python {preservation_script}")
                return success
            else:
                logger.error("❌ Data preservation script not found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Data processing failed: {e}")
            return False
    
    def load_data_to_database(self) -> bool:
        """Load processed data into database"""
        self.log_phase("DATABASE LOADING", "Loading processed data into PostgreSQL database")
        
        try:
            # Run database population script
            populate_script = self.scripts_path / "populate_database_from_preserved.py"
            if populate_script.exists():
                logger.info("💾 Loading data into database...")
                success = self.run_command(f"python {populate_script}")
                return success
            else:
                logger.error("❌ Database population script not found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Database loading failed: {e}")
            return False
    
    def verify_data(self) -> bool:
        """Verify that data was loaded correctly"""
        self.log_phase("DATA VERIFICATION", "Verifying data integrity and completeness")
        
        try:
            # Check database contents
            verify_cmd = """
            python3 -c "
import psycopg2
conn = psycopg2.connect(host='localhost', port=5432, database='transparency_portal', user='postgres', password='postgres')
cur = conn.cursor()

print('=== Document counts by year ===')
cur.execute('SELECT year, COUNT(*) FROM processed_documents GROUP BY year ORDER BY year')
for row in cur.fetchall():
    print(f'{row[0]}: {row[1]} documents')

print('\\n=== Financial reports by year ===')
cur.execute('SELECT year, COUNT(*) FROM financial_reports GROUP BY year ORDER BY year')
for row in cur.fetchall():
    print(f'{row[0]}: {row[1]} reports')

cur.close()
conn.close()
"
            """
            
            logger.info("📊 Checking database contents...")
            success = self.run_command(verify_cmd.strip())
            return success
            
        except Exception as e:
            logger.error(f"❌ Data verification failed: {e}")
            return False
    
    def run_mode(self, mode: str) -> bool:
        """Run specific mode"""
        success = True
        
        if mode == 'setup':
            self.log_phase("SETUP MODE", "Initial system setup")
            success &= self.setup_environment()
            
        elif mode == 'extract':
            self.log_phase("EXTRACTION MODE", "Data extraction from documents")
            success &= self.extract_budget_data()
            success &= self.extract_other_data()
            
        elif mode == 'process':
            self.log_phase("PROCESSING MODE", "Data processing and preservation")
            success &= self.process_and_preserve_data()
            
        elif mode == 'load':
            self.log_phase("LOADING MODE", "Loading data into database")
            success &= self.load_data_to_database()
            
        elif mode == 'verify':
            self.log_phase("VERIFICATION MODE", "Verifying data integrity")
            success &= self.verify_data()
            
        elif mode == 'full':
            self.log_phase("FULL MODE", "Complete end-to-end processing")
            success &= self.setup_environment()
            success &= self.extract_budget_data()
            success &= self.extract_other_data()
            success &= self.process_and_preserve_data()
            success &= self.load_data_to_database()
            success &= self.verify_data()
            
        else:
            logger.error(f"❌ Unknown mode: {mode}")
            return False
        
        return success

def main():
    parser = argparse.ArgumentParser(description='Carmen de Areco Transparency Portal Master Orchestrator')
    parser.add_argument('--mode', choices=['setup', 'extract', 'process', 'load', 'verify', 'full'], 
                       default='full', help='Operation mode')
    
    args = parser.parse_args()
    
    orchestrator = SimpleMasterOrchestrator()
    
    try:
        logger.info("🎯 Carmen de Areco Transparency Portal Master Orchestrator Starting...")
        logger.info(f"📍 Base Path: {orchestrator.base_path}")
        logger.info(f"🎮 Mode: {args.mode}")
        
        success = orchestrator.run_mode(args.mode)
        
        if success:
            logger.info("✅ All operations completed successfully!")
        else:
            logger.error("❌ Some operations failed. Check logs above.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("🛑 Interrupted by user")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
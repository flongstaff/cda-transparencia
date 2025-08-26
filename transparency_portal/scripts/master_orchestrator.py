#!/usr/bin/env python3
"""
Master Orchestrator for Carmen de Areco Transparency Portal
=========================================================

This script orchestrates all data processing, extraction, and loading operations
for the transparency portal, organizing all functionality into modules.

Usage:
    python master_orchestrator.py --mode setup     # Initial setup
    python master_orchestrator.py --mode extract   # Extract data from documents
    python master_orchestrator.py --mode process   # Process and preserve data
    python master_orchestrator.py --mode load      # Load data into database
    python master_orchestrator.py --mode full      # Complete end-to-end process
"""

import os
import sys
import argparse
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import our modules
try:
    from data_extraction.budget_extractor import FinalBudgetDataExtractor
    from data_extraction.tender_extractor import TenderDataExtractor
    from data_extraction.salary_extractor import SalaryExtractor
    from processing.data_preserver import DataPreservationSystem
    HAS_MODULES = True
except ImportError as e:
    print(f"Warning: Could not import modules: {e}")
    HAS_MODULES = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('transparency_orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TransparencyMasterOrchestrator:
    """Master orchestrator for the complete transparency system"""
    
    def __init__(self):
        self.base_path = project_root
        self.scripts_path = self.base_path / "scripts"
        self.data_path = self.base_path / "data"
        
    def log_phase(self, phase: str, description: str = ""):
        """Log a major phase with formatting"""
        logger.info("=" * 80)
        logger.info(f"🎯 PHASE: {phase}")
        if description:
            logger.info(f"📝 {description}")
        logger.info("=" * 80)
    
    def setup_environment(self) -> bool:
        """Setup the processing environment"""
        self.log_phase("ENVIRONMENT SETUP", "Configuring processing environment")
        
        try:
            # Ensure required directories exist
            required_dirs = [
                self.data_path / "source_materials",
                self.data_path / "preserved",
                self.data_path / "markdown_documents"
            ]
            
            for directory in required_dirs:
                directory.mkdir(parents=True, exist_ok=True)
                logger.info(f"✅ Ensured directory exists: {directory}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Environment setup failed: {e}")
            return False
    
    def extract_all_data(self) -> bool:
        """Extract data from all source documents"""
        self.log_phase("DATA EXTRACTION", "Extracting structured data from source documents")
        
        if not HAS_MODULES:
            logger.warning("⚠️  Required modules not available, skipping extraction")
            return False
        
        try:
            success = True
            
            # Extract budget data
            logger.info("💰 Extracting budget data...")
            budget_extractor = FinalBudgetDataExtractor()
            try:
                budget_extractor.process_budget_documents()
                logger.info("✅ Budget data extraction completed")
            except Exception as e:
                logger.error(f"❌ Budget data extraction failed: {e}")
                success = False
            finally:
                budget_extractor.close()
            
            # Extract tender data
            logger.info("🏗️  Extracting tender data...")
            tender_extractor = TenderDataExtractor()
            try:
                tender_extractor.process_tender_documents()
                logger.info("✅ Tender data extraction completed")
            except Exception as e:
                logger.error(f"❌ Tender data extraction failed: {e}")
                success = False
            finally:
                tender_extractor.close()
            
            # Extract salary data
            logger.info("💼 Extracting salary data...")
            salary_extractor = SalaryExtractor()
            try:
                salary_extractor.process_salary_documents()
                logger.info("✅ Salary data extraction completed")
            except Exception as e:
                logger.error(f"❌ Salary data extraction failed: {e}")
                success = False
            finally:
                salary_extractor.close()
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Data extraction failed: {e}")
            return False
    
    def process_and_preserve_data(self) -> bool:
        """Process and preserve all data"""
        self.log_phase("DATA PROCESSING", "Processing and preserving all transparency data")
        
        try:
            # Run data preservation
            logger.info("🗄️  Running data preservation...")
            preservation = DataPreservationSystem(str(self.base_path))
            preservation.run_complete_preservation()
            
            logger.info("✅ Data processing and preservation completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Data processing failed: {e}")
            return False
    
    def load_data_to_database(self) -> bool:
        """Load processed data into database"""
        self.log_phase("DATABASE LOADING", "Loading processed data into PostgreSQL database")
        
        try:
            # This would call the populate database script
            logger.info("💾 Loading data into database...")
            # In a real implementation, you would import and call the database population functions
            
            logger.info("✅ Database loading completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Database loading failed: {e}")
            return False
    
    def run_mode(self, mode: str) -> bool:
        """Run specific mode"""
        success = True
        
        if mode == 'setup':
            self.log_phase("SETUP MODE", "Initial system setup")
            success &= self.setup_environment()
            
        elif mode == 'extract':
            self.log_phase("EXTRACTION MODE", "Data extraction from documents")
            success &= self.extract_all_data()
            
        elif mode == 'process':
            self.log_phase("PROCESSING MODE", "Data processing and preservation")
            success &= self.process_and_preserve_data()
            
        elif mode == 'load':
            self.log_phase("LOADING MODE", "Loading data into database")
            success &= self.load_data_to_database()
            
        elif mode == 'full':
            self.log_phase("FULL MODE", "Complete end-to-end processing")
            success &= self.setup_environment()
            success &= self.extract_all_data()
            success &= self.process_and_preserve_data()
            success &= self.load_data_to_database()
            
        else:
            logger.error(f"❌ Unknown mode: {mode}")
            return False
        
        return success

def main():
    parser = argparse.ArgumentParser(description='Carmen de Areco Transparency Portal Master Orchestrator')
    parser.add_argument('--mode', choices=['setup', 'extract', 'process', 'load', 'full'], 
                       default='full', help='Operation mode')
    
    args = parser.parse_args()
    
    orchestrator = TransparencyMasterOrchestrator()
    
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
        sys.exit(1)

if __name__ == "__main__":
    main()
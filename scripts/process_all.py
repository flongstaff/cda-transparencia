#!/usr/bin/env python3
"""
Main processing script for the Carmen de Areco Transparency Portal.
This script orchestrates the entire data processing pipeline.
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path

# Add scripts directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.logger import setup_logger
from processors.document_processor import DocumentProcessor
from validators.data_validator import DataValidator
from converters.format_converter import FormatConverter

def main():
    """Main processing function."""
    # Setup logging
    logger = setup_logger(__name__)
    logger.info("Starting transparency data processing pipeline")
    
    # Record start time
    start_time = datetime.now()
    logger.info(f"Processing started at {start_time}")
    
    try:
        # Initialize components
        processor = DocumentProcessor()
        validator = DataValidator()
        converter = FormatConverter()
        
        # Process documents
        logger.info("Processing documents...")
        processed_data = processor.process_all()
        
        # Validate data
        logger.info("Validating processed data...")
        validation_results = validator.validate_all(processed_data)
        
        # Convert formats
        logger.info("Converting data to different formats...")
        converter.convert_all(processed_data)
        
        # Record completion time
        end_time = datetime.now()
        duration = end_time - start_time
        logger.info(f"Processing completed at {end_time}")
        logger.info(f"Total processing time: {duration}")
        
        print("Data processing pipeline completed successfully!")
        print(f"Start time: {start_time}")
        print(f"End time: {end_time}")
        print(f"Duration: {duration}")
        
    except Exception as e:
        logger.error(f"Processing pipeline failed: {str(e)}", exc_info=True)
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
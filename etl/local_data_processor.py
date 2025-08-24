import os
import sys
import logging
from urllib.parse import unquote
from datetime import datetime
import json

# Add the directory containing 'etl' to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from etl.parsers import parse_boletin_oficial_text # Now this import should work

logger = logging.getLogger(__name__)

class LocalDataProcessor:
    def __init__(self, source_materials_dir: str = "data/source_materials", storage_dir: str = "cold_storage"):
        self.source_materials_dir = source_materials_dir
        self.storage_dir = storage_dir
        self.processed_data = []

    def process_file(self, file_path: str):
        logger.info(f"Processing file: {file_path}")
        file_extension = os.path.splitext(file_path)[1].lower()

        if file_extension == '.pdf':
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(file_path)
                pdf_text = ""
                for page in reader.pages:
                    pdf_text += page.extract_text() + "\n"
                logger.info(f"Extracted text from PDF: {file_path} (first 200 chars): {pdf_text[:200]}...")
                
                # Use the parser developed for Boletin Oficial for now
                # This will need to be generalized or specialized later
                parsed_data = parse_boletin_oficial_text(pdf_text)
                logger.info(f"Parsed data: {parsed_data}")

                self.processed_data.append({
                    "file_path": file_path,
                    "parsed_data": parsed_data
                })

            except Exception as e:
                logger.error(f"Error processing PDF {file_path}: {str(e)}")
        elif file_extension in ['.xls', '.xlsx']:
            logger.info(f"Skipping Excel file for now: {file_path}")
            # TODO: Add Excel parsing logic here
        elif file_extension == '.json':
            logger.info(f"Skipping JSON file for now: {file_path}")
            # TODO: Add JSON parsing logic here
        else:
            logger.info(f"Skipping unsupported file type: {file_path}")

    def run_processor(self):
        logger.info(f"Starting local data processing from {self.source_materials_dir}")
        for root, _, files in os.walk(self.source_materials_dir):
            for file in files:
                file_path = os.path.join(root, file)
                self.process_file(file_path)
        
        # Save processed data to a JSON file
        output_file = os.path.join(self.storage_dir, 'metadata', 'local_processed_data.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.processed_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Processed data saved to {output_file}")

if __name__ == "__main__":
    processor = LocalDataProcessor()
    processor.run_processor()
    logger.info("Local data processing completed!")

"""
Document processor for the transparency portal.
"""
import os
import pandas as pd
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)

class DocumentProcessor:
    """Processor for municipal transparency documents."""
    
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / "data"
        self.source_dir = self.data_dir / "source_materials"
        self.processed_dir = self.data_dir / "processed"
        self.processed_dir.mkdir(exist_ok=True)
        
    def process_all(self):
        """Process all documents in the source directory."""
        logger.info("Starting document processing")
        
        processed_data = []
        
        # Process Excel files
        excel_files = list(self.source_dir.glob("*.xlsx")) + list(self.source_dir.glob("*.xls"))
        logger.info(f"Found {len(excel_files)} Excel files to process")
        
        for excel_file in excel_files:
            try:
                data = self.process_excel(excel_file)
                processed_data.append(data)
                logger.info(f"Processed {excel_file.name}")
            except Exception as e:
                logger.error(f"Failed to process {excel_file.name}: {str(e)}")
        
        # Process PDF files
        pdf_files = list(self.source_dir.glob("*.pdf"))
        logger.info(f"Found {len(pdf_files)} PDF files to process")
        
        for pdf_file in pdf_files:
            try:
                data = self.process_pdf(pdf_file)
                processed_data.append(data)
                logger.info(f"Processed {pdf_file.name}")
            except Exception as e:
                logger.error(f"Failed to process {pdf_file.name}: {str(e)}")
        
        logger.info("Document processing completed")
        return processed_data
    
    def process_excel(self, file_path):
        """Process an Excel file."""
        logger.info(f"Processing Excel file: {file_path.name}")
        
        # Read Excel file
        excel_data = pd.read_excel(file_path, sheet_name=None)
        
        # Process each sheet
        processed_sheets = {}
        for sheet_name, df in excel_data.items():
            logger.info(f"Processing sheet: {sheet_name}")
            # Perform data cleaning and processing
            processed_df = self.clean_dataframe(df)
            processed_sheets[sheet_name] = processed_df
        
        # Save processed data
        output_file = self.processed_dir / f"{file_path.stem}_processed.json"
        self.save_processed_data(processed_sheets, output_file)
        
        return {
            "file_name": file_path.name,
            "file_type": "excel",
            "sheets": list(processed_sheets.keys()),
            "output_file": str(output_file)
        }
    
    def process_pdf(self, file_path):
        """Process a PDF file."""
        logger.info(f"Processing PDF file: {file_path.name}")
        
        # For now, just create a placeholder
        # In a real implementation, you would extract text and tables from the PDF
        processed_data = {
            "file_name": file_path.name,
            "file_type": "pdf",
            "extraction_method": "placeholder"
        }
        
        # Save processed data
        output_file = self.processed_dir / f"{file_path.stem}_processed.json"
        self.save_processed_data(processed_data, output_file)
        
        return {
            "file_name": file_path.name,
            "file_type": "pdf",
            "output_file": str(output_file)
        }
    
    def clean_dataframe(self, df):
        """Clean and standardize a DataFrame."""
        # Remove completely empty rows and columns
        df = df.dropna(how='all').dropna(axis=1, how='all')
        
        # Strip whitespace from string columns
        string_columns = df.select_dtypes(include=['object']).columns
        for col in string_columns:
            df[col] = df[col].astype(str).str.strip()
        
        return df
    
    def save_processed_data(self, data, output_file):
        """Save processed data to a JSON file."""
        import json
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"Saved processed data to {output_file}")
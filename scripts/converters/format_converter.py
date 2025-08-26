"""
Format converter for the transparency portal.
"""
import json
import pandas as pd
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)

class FormatConverter:
    """Converter for different data formats."""
    
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / "data"
        self.preserved_dir = self.data_dir / "preserved"
        self.json_dir = self.preserved_dir / "json"
        self.csv_dir = self.preserved_dir / "csv"
        
        # Create directories
        self.json_dir.mkdir(parents=True, exist_ok=True)
        self.csv_dir.mkdir(parents=True, exist_ok=True)
        
    def convert_all(self, processed_data):
        """Convert all processed data to different formats."""
        logger.info("Starting format conversion")
        
        for data in processed_data:
            try:
                self.convert_data_item(data)
                logger.info(f"Converted {data.get('file_name', 'unknown file')}")
            except Exception as e:
                logger.error(f"Failed to convert data: {str(e)}")
        
        logger.info("Format conversion completed")
    
    def convert_data_item(self, data):
        """Convert a single data item to different formats."""
        output_file = data.get('output_file')
        if not output_file or not Path(output_file).exists():
            logger.warning(f"Output file not found: {output_file}")
            return
        
        # Load processed data
        with open(output_file, 'r', encoding='utf-8') as f:
            processed_data = json.load(f)
        
        # Convert to JSON
        self._save_as_json(processed_data, data['file_name'])
        
        # Convert to CSV where possible
        self._save_as_csv(processed_data, data['file_name'])
    
    def _save_as_json(self, data, file_name):
        """Save data as JSON."""
        json_file = self.json_dir / f"{Path(file_name).stem}.json"
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"Saved JSON data to {json_file}")
    
    def _save_as_csv(self, data, file_name):
        """Save data as CSV where possible."""
        # This is a simplified implementation
        # In reality, you would need to handle different data structures
        
        if isinstance(data, dict):
            # If data is a dictionary with sheets (Excel data)
            for key, value in data.items():
                if isinstance(value, pd.DataFrame):
                    csv_file = self.csv_dir / f"{Path(file_name).stem}_{key}.csv"
                    value.to_csv(csv_file, index=False)
                    logger.info(f"Saved CSV data to {csv_file}")
                elif isinstance(value, list) and value:
                    # Try to convert list of dicts to DataFrame
                    try:
                        df = pd.DataFrame(value)
                        csv_file = self.csv_dir / f"{Path(file_name).stem}_{key}.csv"
                        df.to_csv(csv_file, index=False)
                        logger.info(f"Saved CSV data to {csv_file}")
                    except Exception as e:
                        logger.warning(f"Could not convert {key} to CSV: {str(e)}")
        elif isinstance(data, list):
            # If data is a list
            try:
                df = pd.DataFrame(data)
                csv_file = self.csv_dir / f"{Path(file_name).stem}.csv"
                df.to_csv(csv_file, index=False)
                logger.info(f"Saved CSV data to {csv_file}")
            except Exception as e:
                logger.warning(f"Could not convert list to CSV: {str(e)}")
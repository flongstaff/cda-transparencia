"""
Data validator for the transparency portal.
"""
import pandas as pd
from utils.logger import get_logger

logger = get_logger(__name__)

class DataValidator:
    """Validator for processed transparency data."""
    
    def __init__(self):
        pass
        
    def validate_all(self, processed_data):
        """Validate all processed data."""
        logger.info("Starting data validation")
        
        validation_results = []
        
        for data in processed_data:
            try:
                result = self.validate_data_item(data)
                validation_results.append(result)
                logger.info(f"Validated {data.get('file_name', 'unknown file')}")
            except Exception as e:
                logger.error(f"Failed to validate data: {str(e)}")
        
        logger.info("Data validation completed")
        return validation_results
    
    def validate_data_item(self, data):
        """Validate a single data item."""
        file_name = data.get('file_name', 'unknown')
        file_type = data.get('file_type', 'unknown')
        
        logger.info(f"Validating {file_type} file: {file_name}")
        
        # Perform validation based on file type
        if file_type == 'excel':
            return self.validate_excel_data(data)
        elif file_type == 'pdf':
            return self.validate_pdf_data(data)
        else:
            return {
                "file_name": file_name,
                "status": "unknown_type",
                "issues": ["Unknown file type"],
                "validated_at": pd.Timestamp.now().isoformat()
            }
    
    def validate_excel_data(self, data):
        """Validate Excel data."""
        # Check if required fields are present
        required_fields = ['file_name', 'sheets', 'output_file']
        missing_fields = [field for field in required_fields if field not in data]
        
        issues = []
        if missing_fields:
            issues.append(f"Missing required fields: {missing_fields}")
        
        # Additional validation logic would go here
        # For example, check data types, ranges, etc.
        
        return {
            "file_name": data['file_name'],
            "status": "valid" if not issues else "invalid",
            "issues": issues,
            "sheets_processed": len(data.get('sheets', [])),
            "validated_at": pd.Timestamp.now().isoformat()
        }
    
    def validate_pdf_data(self, data):
        """Validate PDF data."""
        # Check if required fields are present
        required_fields = ['file_name', 'output_file']
        missing_fields = [field for field in required_fields if field not in data]
        
        issues = []
        if missing_fields:
            issues.append(f"Missing required fields: {missing_fields}")
        
        return {
            "file_name": data['file_name'],
            "status": "valid" if not issues else "invalid",
            "issues": issues,
            "validated_at": pd.Timestamp.now().isoformat()
        }
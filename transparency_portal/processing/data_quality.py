"""
This module contains functions for data validation, cleaning, and quality checks.
"""

import pandas as pd
from typing import List, Dict, Any

def analyze_excel_file(file_path: str) -> Dict[str, Any]:
    """
    Analyzes an Excel file and returns a summary of its structure and content.
    """
    try:
        xls = pd.ExcelFile(file_path)
        analysis = {
            'file_path': file_path,
            'sheet_names': xls.sheet_names,
            'sheets': {}
        }
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            sheet_info = {
                'num_rows': len(df),
                'num_cols': len(df.columns),
                'columns': list(df.columns),
                'data_types': {col: str(df[col].dtype) for col in df.columns},
                'missing_values': df.isnull().sum().to_dict(),
                'head': df.head().to_dict('records')
            }
            analysis['sheets'][sheet_name] = sheet_info
        return analysis
    except Exception as e:
        return {'error': str(e)}

def check_csv_columns(file_path: str, expected_schema: Dict[str, str]) -> Dict[str, Any]:
    """
    Checks if the columns of a CSV file match an expected schema.
    """
    try:
        df = pd.read_csv(file_path)
        actual_columns = set(df.columns)
        expected_columns = set(expected_schema.keys())
        
        missing_columns = list(expected_columns - actual_columns)
        extra_columns = list(actual_columns - expected_columns)
        
        mismatched_types = {}
        for col, expected_type in expected_schema.items():
            if col in df.columns:
                actual_type = str(df[col].dtype)
                if actual_type != expected_type:
                    mismatched_types[col] = {
                        'expected': expected_type,
                        'actual': actual_type
                    }
        
        report = {
            'file_path': file_path,
            'columns_match': actual_columns == expected_columns,
            'missing_columns': missing_columns,
            'extra_columns': extra_columns,
            'mismatched_types': mismatched_types
        }
        return report
    except Exception as e:
        return {'error': str(e)}

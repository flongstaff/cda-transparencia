"""
This package contains modules for processing data.
"""

from .data_quality import analyze_excel_file, check_csv_columns
from .markdown_converter import convert_to_markdown, generate_markdown_table
from .data_analysis import detect_anomalies, analyze_budget_data
from .local_processor import process_local_data, process_local_documents
from .parsers import parse_boletin_oficial_text

__all__ = [
    'analyze_excel_file',
    'check_csv_columns',
    'convert_to_markdown',
    'generate_markdown_table',
    'detect_anomalies',
    'analyze_budget_data',
    'process_local_data',
    'process_local_documents',
    'parse_boletin_oficial_text',
]

"""
This module contains functions for processing local data and documents.
"""

import os
import pandas as pd
from typing import List, Dict, Any
from PyPDF2 import PdfReader

def process_local_data(input_dir: str, output_dir: str) -> Dict[str, Any]:
    """
    Processes local data files (CSV, Excel) from an input directory and saves them to an output directory.
    """
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        processed_files = []
        for filename in os.listdir(input_dir):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            if filename.endswith('.csv'):
                df = pd.read_csv(input_path)
                # Example processing: drop duplicates
                df.drop_duplicates(inplace=True)
                df.to_csv(output_path, index=False)
                processed_files.append(output_path)
                
            elif filename.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(input_path)
                # Example processing: fill missing values
                df.fillna(0, inplace=True)
                df.to_excel(output_path, index=False)
                processed_files.append(output_path)
                
        return {'success': True, 'processed_files': processed_files}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def process_local_documents(input_dir: str, output_dir: str) -> Dict[str, Any]:
    """
    Processes local documents (PDF) from an input directory, extracts text, and saves it as markdown.
    """
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        processed_files = []
        for filename in os.listdir(input_dir):
            if filename.endswith('.pdf'):
                input_path = os.path.join(input_dir, filename)
                output_filename = os.path.splitext(filename)[0] + '.md'
                output_path = os.path.join(output_dir, output_filename)
                
                with open(input_path, 'rb') as f:
                    reader = PdfReader(f)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                        
                # Example processing: simple text cleaning
                cleaned_text = text.strip()
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_text)
                
                processed_files.append(output_path)
                
        return {'success': True, 'processed_files': processed_files}
    except Exception as e:
        return {'success': False, 'error': str(e)}

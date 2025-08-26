#!/usr/bin/env python3
"""
Debug script to understand the exact text patterns in budget documents
"""

import re
import PyPDF2
from pathlib import Path

def debug_budget_document():
    """Debug the budget document to understand its structure"""
    
    # Process the 2020 budget execution document
    file_path = Path("data/source_materials/2020/EJECUCION-DEL-PRESUPUESTO-DE-GASTOS-2020.pdf")
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    # Extract text
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for i, page in enumerate(reader.pages):
                text += page.extract_text() + "\n"
                if i >= 3:  # Just first 4 pages for debugging
                    break
    except Exception as e:
        print(f"Error extracting text: {e}")
        return
    
    print("=== FIRST 2000 CHARACTERS ===")
    print(text[:2000])
    
    print("\n=== SEARCHING FOR TOTAL PATTERNS ===")
    
    # Try different patterns to find the total line
    patterns = [
        r'Total\s+([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)',
        r'([\d\.,]+)\s+Total\s+([\d\.,]+)\s+([\d\.,]+)',
        r'257\.668\.883,16\s+Total\s+',
        r'Total.*?257',
        r'Total.*?[\d\.,]+\s+[\d\.,]+\s+[\d\.,]+',
    ]
    
    for i, pattern in enumerate(patterns):
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        print(f"Pattern {i+1}: {pattern}")
        print(f"Matches: {matches}")
        print()

if __name__ == "__main__":
    debug_budget_document()
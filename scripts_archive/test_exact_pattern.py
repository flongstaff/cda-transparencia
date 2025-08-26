#!/usr/bin/env python3
"""
Test script to verify the exact regex pattern matching
"""

import re
import PyPDF2
from pathlib import Path

def test_exact_pattern():
    """Test the exact pattern matching"""
    
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
                if i >= 1:  # Just first 2 pages
                    break
    except Exception as e:
        print(f"Error extracting text: {e}")
        return
    
    print("=== TESTING EXACT PATTERN ===")
    
    # Test the exact pattern we know should work
    pattern = r'([\d\.,]+)\s+Total\s+([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)'
    matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
    
    print(f"Pattern: {pattern}")
    print(f"Number of matches: {len(matches)}")
    
    for i, match in enumerate(matches):
        print(f"Match {i+1}: {match}")
        if len(match) >= 4:
            try:
                credit_approved = float(match[0].replace('.', '').replace(',', '.'))
                available_credit = float(match[1].replace('.', '').replace(',', '.'))
                executed = float(match[2].replace('.', '').replace(',', '.'))
                paid = float(match[3].replace('.', '').replace(',', '.'))
                
                print(f"  Credit Approved: {credit_approved:,}")
                print(f"  Available Credit: {available_credit:,}")
                print(f"  Executed: {executed:,}")
                print(f"  Paid: {paid:,}")
            except ValueError as e:
                print(f"  Error converting values: {e}")

if __name__ == "__main__":
    test_exact_pattern()
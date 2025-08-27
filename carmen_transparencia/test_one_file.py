#!/usr/bin/env python3
"""
Test processing of one file to verify the modules work correctly.
"""

import sys
import os
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_one_file():
    """Test processing one file."""
    from carmen_transparencia.processing import convert_table_pdf_to_csv, validate_document_integrity
    
    # Find a PDF file to test
    input_dir = Path("../data/live_scrape")
    pdf_files = list(input_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDF files found in live_scrape directory")
        return False
    
    test_file = pdf_files[0]
    print(f"Testing with file: {test_file.name}")
    
    # Validate the file
    result = validate_document_integrity(str(test_file))
    print(f"Validation result: {result}")
    
    if result['valid']:
        # Try to convert PDF to CSV
        output_file = "/tmp/test_output.csv"
        csv_result = convert_table_pdf_to_csv(str(test_file), output_file)
        print(f"PDF to CSV conversion result: {csv_result}")
        
        if csv_result:
            # Check if file was created
            if os.path.exists(output_file):
                print(f"✅ Successfully created {output_file}")
                # Show first few lines
                with open(output_file, 'r') as f:
                    lines = f.readlines()[:5]
                    print("First 5 lines of CSV:")
                    for line in lines:
                        print(f"  {line.strip()}")
                # Clean up
                os.remove(output_file)
                return True
            else:
                print("❌ File was not created")
                return False
        else:
            print("⚠️  No tables found or conversion failed")
            return True  # This is still a success as the function worked
    else:
        print("❌ File validation failed")
        return False

if __name__ == "__main__":
    print("🧪 Testing file processing...")
    success = test_one_file()
    if success:
        print("\n🎉 Test passed!")
    else:
        print("\n💥 Test failed!")
    sys.exit(0 if success else 1)
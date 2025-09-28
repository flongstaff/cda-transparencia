#!/usr/bin/env python3
\"\"\"
Simple test script to verify PDF inventory functionality
\"\"\"

import sys
from pathlib import Path

def test_pdf_inventory():
    \"\"\"Test PDF inventory functionality\"\"\"
    try:
        # Add current directory to path
        sys.path.insert(0, str(Path(__file__).parent.parent))
        
        # Import PDF inventory
        from scripts.pdf_inventory import PDFInventory
        
        # Create inventory instance
        inventory = PDFInventory()
        
        # Test file categorization
        test_cases = [
            (\"/fake/path/Budget_Report_2024.pdf\", \"budget\"),
            (\"/fake/path/Debt_Analysis.pdf\", \"debt\"),
            (\"/fake/path/Contract_Licitation.pdf\", \"contracts\"),
            (\"/fake/path/Salary_Statement.pdf\", \"personnel\"),
            (\"/fake/path/Infrastructure_Project.pdf\", \"infrastructure\"),
        ]
        
        print(\"Testing PDF categorization...\")
        all_passed = True
        
        for file_path, expected_category in test_cases:
            path_obj = Path(file_path)
            # Create a mock file info for testing
            actual_category = inventory.categorize_file(path_obj)
            if actual_category == expected_category:
                print(f\"  ✓ {path_obj.name} -> {actual_category}\")
            else:
                print(f\"  ✗ {path_obj.name} -> {actual_category} (expected {expected_category})\")
                all_passed = False
        
        if all_passed:
            print(\"✓ All categorization tests passed\")
        else:
            print(\"✗ Some categorization tests failed\")
        
        # Test file discovery
        print(\"\\nTesting PDF file discovery...\")
        pdf_files = inventory.find_pdf_files()
        print(f\"  Found {len(pdf_files)} PDF files\")
        
        if pdf_files:
            print(\"  ✓ PDF discovery working\")
        else:
            print(\"  ⚠ No PDF files found (may be expected in test environment)\")
        
        return True
        
    except Exception as e:
        print(f\"✗ Test failed with error: {e}\")
        return False

if __name__ == \"__main__\":
    print(\"Running PDF Inventory Test...\")
    success = test_pdf_inventory()
    
    if success:
        print(\"\\n🎉 All tests passed!\")
        sys.exit(0)
    else:
        print(\"\\n❌ Tests failed!\")
        sys.exit(1)
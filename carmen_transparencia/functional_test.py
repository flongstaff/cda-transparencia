#!/usr/bin/env python3
"""
Functional test to verify that the processing functions work correctly.
"""

import sys
import os
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_processing_functions():
    """Test that processing functions work correctly."""
    print("🧪 Testing processing functions...\n")
    
    try:
        from carmen_transparencia.processing import validate_document_integrity
        print("✅ Imported validation function")
    except Exception as e:
        print(f"❌ Failed to import validation function: {e}")
        return False
    
    # Create a test directory
    test_dir = Path("test_data")
    test_dir.mkdir(exist_ok=True)
    
    # Create a simple test file
    test_file = test_dir / "test.txt"
    test_file.write_text("This is a test file for validation.")
    
    try:
        # Test validation function
        result = validate_document_integrity(str(test_file))
        print(f"✅ Validation result: {result}")
        
        # Clean up
        test_file.unlink()
        test_dir.rmdir()
        
        return True
    except Exception as e:
        print(f"❌ Failed to test validation function: {e}")
        # Clean up
        if test_file.exists():
            test_file.unlink()
        if test_dir.exists():
            test_dir.rmdir()
        return False

def main():
    """Run functional tests."""
    if test_processing_functions():
        print("\n🎉 Functional tests passed!")
        return 0
    else:
        print("\n💥 Functional tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
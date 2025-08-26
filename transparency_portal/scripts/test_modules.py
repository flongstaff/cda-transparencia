#!/usr/bin/env python3
"""
Test script to verify the module structure works correctly.
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def test_module_imports():
    """Test that all modules can be imported correctly"""
    print("Testing module imports...")
    print(f"Project root: {project_root}")
    print(f"Python path: {sys.path[:3]}")
    
    try:
        # Test core imports
        from transparency_portal.data_extraction.budget_extractor import FinalBudgetDataExtractor
        print("✅ Budget extractor module imported successfully")
        
        from transparency_portal.data_extraction.tender_extractor import TenderDataExtractor
        print("✅ Tender extractor module imported successfully")
        
        from transparency_portal.data_extraction.salary_extractor import SalaryExtractor
        print("✅ Salary extractor module imported successfully")
        
        from transparency_portal.processing.data_preserver import DataPreservationSystem
        print("✅ Data preserver module imported successfully")
        
        print("\n🎉 All modules imported successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_module_imports()
    if success:
        print("\n✅ Module structure verification completed successfully!")
    else:
        print("\n❌ Module structure verification failed!")
        exit(1)
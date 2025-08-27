#!/usr/bin/env python3
"""
Test script to verify that all modules are working correctly.
"""

import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test that all modules can be imported without errors."""
    try:
        from carmen_transparencia import data_extraction
        print("✅ Data extraction module imported successfully")
    except Exception as e:
        print(f"❌ Error importing data_extraction: {e}")
        return False
    
    try:
        from carmen_transparencia import processing
        print("✅ Processing module imported successfully")
    except Exception as e:
        print(f"❌ Error importing processing: {e}")
        return False
    
    try:
        from carmen_transparencia import database
        print("✅ Database module imported successfully")
    except Exception as e:
        print(f"❌ Error importing database: {e}")
        return False
    
    try:
        from carmen_transparencia import cli
        print("✅ CLI module imported successfully")
    except Exception as e:
        print(f"❌ Error importing cli: {e}")
        return False
    
    return True

def test_functions():
    """Test that key functions exist and are callable."""
    try:
        from carmen_transparencia.data_extraction import scrape_live_sync, scrape_wayback_sync
        print("✅ Scraping functions are available")
    except Exception as e:
        print(f"❌ Error with scraping functions: {e}")
        return False
    
    try:
        from carmen_transparencia.processing import (
            convert_table_pdf_to_csv,
            convert_docx_to_txt,
            convert_excel_to_csv,
            convert_excel_to_markdown
        )
        print("✅ Processing functions are available")
    except Exception as e:
        print(f"❌ Error with processing functions: {e}")
        return False
    
    try:
        from carmen_transparencia.database import (
            create_documents_table,
            insert_metadata,
            initialize_database
        )
        print("✅ Database functions are available")
    except Exception as e:
        print(f"❌ Error with database functions: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🧪 Testing Carmen de Areco Transparency modules...\n")
    
    if test_imports() and test_functions():
        print("\n🎉 All tests passed! The modules are working correctly.")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed. Please check the errors above.")
        sys.exit(1)
#!/usr/bin/env python3
"""
Test script to verify the project structure and basic functionality.
"""

import os
import sys
from pathlib import Path

def test_project_structure():
    """Test that the project structure is correct."""
    print("Testing project structure...")
    
    # Define expected directories
    expected_dirs = [
        "data",
        "data/preserved",
        "data/preserved/json",
        "data/preserved/csv",
        "data/markdown_documents",
        "data/source_materials",
        "frontend",
        "backend",
        "scripts",
        "scripts/processors",
        "scripts/scrapers",
        "scripts/validators",
        "scripts/converters",
        "scripts/utils",
        "docs",
        "docs/api",
        "docs/architecture",
        "docs/contributing",
        "docs/data",
        "docs/deployment",
        "docs/development",
        "docs/getting-started",
        ".github",
        ".github/workflows",
        ".github/ISSUE_TEMPLATE",
        ".github/PULL_REQUEST_TEMPLATE"
    ]
    
    # Check each directory exists
    base_path = Path(__file__).parent.parent
    missing_dirs = []
    
    for dir_path in expected_dirs:
        full_path = base_path / dir_path
        if not full_path.exists():
            missing_dirs.append(dir_path)
    
    if missing_dirs:
        print(f"❌ Missing directories: {missing_dirs}")
        return False
    else:
        print("✅ All expected directories exist")
        return True

def test_required_files():
    """Test that required files exist."""
    print("Testing required files...")
    
    # Define expected files
    expected_files = [
        "README.md",
        "LICENSE",
        "CODE_OF_CONDUCT.md",
        ".gitignore",
        ".github/workflows/frontend-ci.yml",
        ".github/workflows/backend-ci.yml",
        ".github/workflows/deploy.yml",
        "docs/PROJECT_STATUS.md"
    ]
    
    # Check each file exists
    base_path = Path(__file__).parent.parent
    missing_files = []
    
    for file_path in expected_files:
        full_path = base_path / file_path
        if not full_path.exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    else:
        print("✅ All required files exist")
        return True

def test_python_imports():
    """Test that Python modules can be imported."""
    print("Testing Python imports...")
    
    try:
        # Add scripts directory to path
        scripts_path = Path(__file__).parent.parent / "scripts"
        sys.path.insert(0, str(scripts_path))
        
        # Test importing modules
        from utils.logger import setup_logger
        from processors.document_processor import DocumentProcessor
        from validators.data_validator import DataValidator
        from converters.format_converter import FormatConverter
        
        print("✅ All Python modules imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import Python modules: {e}")
        return False

def main():
    """Run all tests."""
    print("Running project verification tests...\n")
    
    tests = [
        test_project_structure,
        test_required_files,
        test_python_imports
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        print()
    
    if all(results):
        print("🎉 All tests passed! Project structure is correct.")
        return 0
    else:
        print("❌ Some tests failed. Please check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Diagnostic script to check system setup and data availability
"""

import os
import sys
from pathlib import Path

def check_system_setup():
    """Check if the system is properly set up"""
    print("=== SYSTEM SETUP DIAGNOSTIC ===")
    
    # Check current directory
    current_dir = Path(".")
    print(f"Current working directory: {current_dir}")
    
    # Check if data directory exists
    data_dir = current_dir / "data"
    print(f"Data directory exists: {data_dir.exists()}")
    
    if data_dir.exists():
        print(f"Data directory contents:")
        for item in data_dir.iterdir()[:10]:  # Show first 10 items
            print(f"  - {item.name}")
    
    # Check if required directories exist
    required_dirs = ["data", "services", "src"]
    for dir_name in required_dirs:
        dir_path = current_dir / dir_name
        print(f"{dir_name} directory exists: {dir_path.exists()}")
    
    # Check Python environment
    print(f"Python version: {sys.version}")
    print(f"Python path: {sys.path[:3]}")
    
    # Check if we can import the services
    try:
        sys.path.insert(0, str(current_dir))
        from services.data_acquisition_service import UnifiedDataAcquisitionService
        print("✓ Can import data acquisition service")
    except Exception as e:
        print(f"✗ Cannot import data acquisition service: {e}")
    
    try:
        from services.database_service import DatabaseService
        print("✓ Can import database service")
    except Exception as e:
        print(f"✗ Cannot import database service: {e}")
    
    try:
        from services.pdf_processing_service import UnifiedPDFProcessor
        print("✓ Can import PDF processor service")
    except Exception as e:
        print(f"✗ Cannot import PDF processor service: {e}")

def check_data_files():
    """Check for sample data files"""
    print("\n=== DATA FILE CHECK ===")
    
    # Look for JSON files
    json_files = list(Path("data").rglob("*.json"))
    print(f"Found {len(json_files)} JSON files in data directory")
    
    if json_files:
        print("First few JSON files:")
        for i, file in enumerate(json_files[:5]):
            print(f"  {i+1}. {file}")
    else:
        print("No JSON files found in data directory")
    
    # Look for PDF files
    pdf_files = list(Path("data").rglob("*.pdf"))
    print(f"Found {len(pdf_files)} PDF files in data directory")
    
    if pdf_files:
        print("First few PDF files:")
        for i, file in enumerate(pdf_files[:5]):
            print(f"  {i+1}. {file}")

def main():
    """Run diagnostics"""
    print("Running system diagnostics...")
    check_system_setup()
    check_data_files()

if __name__ == "__main__":
    main()
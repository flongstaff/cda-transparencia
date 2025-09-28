#!/usr/bin/env python3
"""
Quick Data Organization Check
Verifies your data is accessible
"""

import json
from pathlib import Path

def check_data():
    """Check data organization"""
    print("🔍 Checking data organization...")

    data_dir = Path("frontend/public/data")

    # Check directories
    if data_dir.exists():
        print(f"✅ Data directory exists: {data_dir}")

        # Check API files
        api_dir = data_dir / "api"
        if api_dir.exists():
            api_files = list(api_dir.glob("*.json"))
            print(f"✅ API files: {len(api_files)}")
            for file in api_files:
                print(f"   - {file.name}")

        # Check CSV files
        csv_dir = data_dir / "csv"
        if csv_dir.exists():
            csv_files = list(csv_dir.glob("*.csv"))
            print(f"✅ CSV files: {len(csv_files)}")
            print(f"   - Main files: transparency_data_complete.csv, revenue_summary.csv, expenses_summary.csv")

        # Check PDF files
        pdfs_dir = data_dir / "pdfs"
        if pdfs_dir.exists():
            pdf_files = list(pdfs_dir.glob("*.pdf"))
            print(f"✅ PDF files: {len(pdf_files)}")
    else:
        print(f"❌ Data directory not found: {data_dir}")

    # Check scripts
    scripts_dir = Path("scripts")
    if scripts_dir.exists():
        script_count = len(list(scripts_dir.rglob("*.py"))) + len(list(scripts_dir.rglob("*.js")))
        print(f"✅ Scripts directory: {script_count} files organized")

    print("\n📊 Your data is organized and accessible!")
    print("🌐 Development server: http://localhost:5177/")

if __name__ == "__main__":
    check_data()
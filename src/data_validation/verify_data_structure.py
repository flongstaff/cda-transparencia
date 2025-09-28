#!/usr/bin/env python3
\"\"\"
Data Structure Verification Script
This script verifies the integrity and consistency of the organized data structure.
\"\"\"

import os
import json
import glob
from pathlib import Path

# Define paths
BASE_DIR = \"/Users/flong/Developer/cda-transparencia\"
PROCESSED_DIR = f\"{BASE_DIR}/data/processed\"
WEB_ACCESSIBLE_DIR = f\"{BASE_DIR}/data/web_accessible\"
API_DIR = f\"{BASE_DIR}/frontend/public/api\"

# Define years to verify
YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

def verify_directory_structure():
    \"\"\"Verify that all required directories exist\"\"\"
    print(\"Verifying directory structure...\")
    
    # Check main directories
    required_dirs = [
        PROCESSED_DIR,
        WEB_ACCESSIBLE_DIR,
        API_DIR
    ]
    
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            print(f\"❌ Missing directory: {dir_path}\")
            return False
        print(f\"✅ Directory exists: {dir_path}\")
    
    # Check year directories
    for year in YEARS:
        year_dirs = [
            f\"{PROCESSED_DIR}/{year}\",
            f\"{WEB_ACCESSIBLE_DIR}/{year}\",
            f\"{API_DIR}/financial/{year}\"
        ]
        
        for dir_path in year_dirs:
            if not os.path.exists(dir_path):
                print(f\"❌ Missing directory: {dir_path}\")
                return False
            print(f\"✅ Directory exists: {dir_path}\")
    
    print(\"✅ All directory structure verified successfully\")
    return True

def verify_processed_data():
    \"\"\"Verify processed data files\"\"\"
    print(\"\\nVerifying processed data files...\")
    
    total_files = 0
    verified_files = 0
    
    for year in YEARS:
        year_dir = f\"{PROCESSED_DIR}/{year}\"
        if not os.path.exists(year_dir):
            continue
            
        # Check for consolidated data file
        consolidated_file = f\"{year_dir}/consolidated_data.json\"
        if not os.path.exists(consolidated_file):
            print(f\"❌ Missing consolidated data file for {year}\")
            continue
            
        # Verify consolidated data file is valid JSON
        try:
            with open(consolidated_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f\"✅ Valid consolidated data for {year}\")
            verified_files += 1
        except Exception as e:
            print(f\"❌ Invalid JSON in consolidated data for {year}: {e}\")
        
        total_files += 1
    
    print(f\"Verified {verified_files}/{total_files} consolidated data files\")
    return verified_files == total_files

def verify_api_data():
    \"\"\"Verify API data files\"\"\"
    print(\"\\nVerifying API data files...\")
    
    total_endpoints = 0
    verified_endpoints = 0
    
    for year in YEARS:
        api_year_dir = f\"{API_DIR}/financial/{year}\"
        if not os.path.exists(api_year_dir):
            continue
            
        # Check for required API files
        required_files = [
            \"consolidated_data.json\",
            \"financial_summary.json\",
            \"revenue_by_source.json\",
            \"expenditure_by_program.json\"
        ]
        
        for file_name in required_files:
            file_path = f\"{api_year_dir}/{file_name}\"
            if not os.path.exists(file_path):
                print(f\"❌ Missing API file: {file_path}\")
                continue
                
            # Verify file is valid JSON
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                print(f\"✅ Valid API data: {file_path}\")
                verified_endpoints += 1
            except Exception as e:
                print(f\"❌ Invalid JSON in API file {file_path}: {e}\")
            
            total_endpoints += 1
    
    print(f\"Verified {verified_endpoints}/{total_endpoints} API endpoints\")
    return verified_endpoints == total_endpoints

def verify_api_index():
    \"\"\"Verify API index file\"\"\"
    print(\"\\nVerifying API index...\")
    
    api_index_file = f\"{API_DIR}/index.json\"
    if not os.path.exists(api_index_file):
        print(\"❌ Missing API index file\")
        return False
        
    try:
        with open(api_index_file, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
        
        # Check required fields
        required_fields = [\"api_version\", \"generated_at\", \"endpoints\"]
        for field in required_fields:
            if field not in index_data:
                print(f\"❌ Missing required field in API index: {field}\")
                return False
        
        print(\"✅ API index verified successfully\")
        return True
    except Exception as e:
        print(f\"❌ Error verifying API index: {e}\")
        return False

def main():
    \"\"\"Main verification function\"\"\"
    print(\"Starting data structure verification...\")
    
    # Verify directory structure
    dirs_ok = verify_directory_structure()
    
    # Verify processed data
    processed_ok = verify_processed_data()
    
    # Verify API data
    api_ok = verify_api_data()
    
    # Verify API index
    index_ok = verify_api_index()
    
    # Summary
    print(\"\\n\" + \"=\"*50)
    print(\"VERIFICATION SUMMARY\")
    print(\"=\"*50)
    print(f\"Directory Structure: {'✅ PASS' if dirs_ok else '❌ FAIL'}\")
    print(f\"Processed Data: {'✅ PASS' if processed_ok else '❌ FAIL'}\")
    print(f\"API Data: {'✅ PASS' if api_ok else '❌ FAIL'}\")
    print(f\"API Index: {'✅ PASS' if index_ok else '❌ FAIL'}\")
    
    overall_success = dirs_ok and processed_ok and api_ok and index_ok
    print(f\"\\nOverall Status: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}\")
    
    return overall_success

if __name__ == \"__main__\":
    success = main()
    exit(0 if success else 1)
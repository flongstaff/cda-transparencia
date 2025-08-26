#!/usr/bin/env python3
"""
Script to verify all pages have data for all years with visualizations
"""

import requests
import json
import time

def check_api_endpoint(endpoint):
    \"\"\"Check if an API endpoint is working and has data\"\"\"
    try:
        response = requests.get(f\"http://localhost:3000{endpoint}\", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Get unique years
                if len(data) > 0 and 'year' in data[0]:
                    years = sorted(list(set([item['year'] for item in data])))
                    count = len(data)
                    return True, f\"✅ {count} records, years: {years}\"
                else:
                    return True, f\"✅ {len(data)} records (no year field)\"
            else:
                return False, \"❌ No data returned\"
        else:
            return False, f\"❌ HTTP {response.status_code}\"
    except Exception as e:
        return False, f\"❌ Error: {str(e)}\"

def verify_all_pages():
    \"\"\"Verify all pages have data for all years\"\"\"
    
    print(\"=== Carmen de Areco Transparency Portal - Page Verification ===\\n\")
    
    # API endpoints to check
    endpoints = {
        \"Salaries\": \"/api/salaries\",
        \"Public Tenders\": \"/api/tenders\",
        \"Financial Reports\": \"/api/reports\",
        \"Fees/Rights (Revenue)\": \"/api/fees\",
        \"Property Declarations\": \"/api/declarations\"
    }
    
    # Years to check
    all_years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    
    # Check each endpoint
    for page_name, endpoint in endpoints.items():
        print(f\"--- {page_name} ---\")
        
        # Check overall data
        success, message = check_api_endpoint(endpoint)
        print(f\"  Overall: {message}\")
        
        # Check specific years (for endpoints that support year filtering)
        if success and \"❌\" not in message:
            available_years = []
            
            for year in all_years:
                year_success, year_message = check_api_endpoint(f\"{endpoint}/year/{year}\")
                if year_success and \"0 records\" not in year_message and \"No data\" not in year_message:
                    available_years.append(year)
                    # Only print years with data to avoid clutter
                    if \"records\" in year_message and \"0 records\" not in year_message:
                        print(f\"    {year}: {year_message}\")
                elif not year_success:
                    print(f\"    {year}: {year_message}\")
            
            if available_years:
                print(f\"  Available years with data: {available_years}\")
            else:
                print(f\"  Available years with data: None\")
        
        print()
    
    # Check documents endpoint separately
    print(\"--- Documents ---\")
    success, message = check_api_endpoint(\"/api/documents\")
    print(f\"  Overall: {message}\")
    
    # Check frontend pages accessibility
    print(\"--- Frontend Page Accessibility ---\")
    frontend_pages = [
        \"/\", 
        \"/budget\", 
        \"/spending\", 
        \"/revenue\", 
        \"/contracts\", 
        \"/property-declarations\", 
        \"/salaries\", 
        \"/database\"
    ]
    
    for page in frontend_pages:
        try:
            response = requests.get(f\"http://localhost:5173{page}\", timeout=10)
            if response.status_code == 200:
                print(f\"  {page}: ✅ Accessible\")
            else:
                print(f\"  {page}: ❌ HTTP {response.status_code}\")
        except Exception as e:
            print(f\"  {page}: ❌ Error: {str(e)}\")
    
    print(\"\\n=== Verification Complete ===\")

if __name__ == \"__main__\":
    verify_all_pages()

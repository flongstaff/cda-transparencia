#!/usr/bin/env python3
"""
Script to verify that organized documents are properly linked to their official URLs
"""

import os
import json
import requests
from urllib.parse import urlparse
import time

def verify_document_links(sample_size=10):
    \"\"\"Verify that document links are valid by checking a sample of URLs\"\"\"
    
    base_dir = \"/Users/flong/Developer/cda-transparencia/organized_documents\"
    inventory_file = os.path.join(base_dir, \"document_inventory.json\")
    
    # Load the inventory
    with open(inventory_file, 'r') as f:
        inventory = json.load(f)
    
    print(f\"Loaded inventory with {len(inventory)} documents\")
    
    # Sample a few documents to verify links
    sample_documents = inventory[:sample_size] if len(inventory) > sample_size else inventory
    
    print(f\"Verifying links for {len(sample_documents)} sample documents...\")
    
    verified_count = 0
    error_count = 0
    
    for i, doc in enumerate(sample_documents):
        url = doc['official_url']
        print(f\"{i+1}. Checking: {url}\")
        
        try:
            # Make a HEAD request to check if the URL exists (faster than GET)
            response = requests.head(url, timeout=10)
            
            if response.status_code == 200:
                print(f\"   ✓ Valid (200 OK)\")
                verified_count += 1
            elif response.status_code == 404:
                print(f\"   ✗ Not found (404)\")
                error_count += 1
            else:
                print(f\"   ? Status {response.status_code}\")
                # Try GET request for more information
                try:
                    response = requests.get(url, timeout=10)
                    if response.status_code == 200:
                        print(f\"   ✓ Valid with GET (200 OK)\")
                        verified_count += 1
                    else:
                        print(f\"   ✗ Error with GET ({response.status_code})\")
                        error_count += 1
                except Exception as e:
                    print(f\"   ✗ GET request failed: {e}\")
                    error_count += 1
        except Exception as e:
            print(f\"   ✗ Request failed: {e}\")
            error_count += 1
        
        # Small delay to be respectful to the server
        time.sleep(0.5)
    
    print(f\"\\nVerification complete:\")
    print(f\"  Verified: {verified_count}\")
    print(f\"  Errors: {error_count}\")
    print(f\"  Total checked: {len(sample_documents)}\")

def main():
    \"\"\"Main function\"\"\"
    print(\"Verifying document links...\")
    verify_document_links()
    print(\"Done!\")

if __name__ == \"__main__\":
    main()
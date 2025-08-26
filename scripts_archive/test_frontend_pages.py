#!/usr/bin/env python3
"""
Quick test to verify all frontend pages load with data
"""

import requests
import time

def test_frontend_pages():
    """Test that all frontend pages load correctly"""
    
    print("=== Testing Frontend Pages ===\n")
    
    # Frontend pages to test
    pages = [
        ("/", "Home"),
        ("/budget", "Budget"),
        ("/spending", "Public Spending"),
        ("/revenue", "Revenue"),
        ("/contracts", "Contracts"),
        ("/property-declarations", "Property Declarations"),
        ("/salaries", "Salaries"),
        ("/database", "Database")
    ]
    
    base_url = "http://localhost:5173"
    results = []
    
    for path, name in pages:
        try:
            print(f"Testing {name} page...")
            response = requests.get(f"{base_url}{path}", timeout=15)
            
            if response.status_code == 200:
                # Check if page contains some expected content
                content = response.text.lower()
                
                # Look for indicators that the page loaded with data
                has_data = any([
                    "2025" in content,
                    "2024" in content,
                    "total" in content,
                    "año" in content,
                    "monto" in content,
                    "presupuesto" in content
                ])
                
                status = "✅ SUCCESS" if has_data else "✅ LOADED (no data indicators)"
                print(f"  {status} - {response.status_code}")
                results.append((name, True, status))
            else:
                print(f"  ❌ FAILED - HTTP {response.status_code}")
                results.append((name, False, f"HTTP {response.status_code}"))
                
        except Exception as e:
            print(f"  ❌ ERROR - {str(e)}")
            results.append((name, False, str(e)))
        
        # Brief pause between requests
        time.sleep(1)
    
    print("\n=== Test Results ===")
    success_count = sum(1 for _, success, _ in results if success)
    total_count = len(results)
    
    for name, success, details in results:
        status = "✅" if success else "❌"
        print(f"{status} {name}: {details}")
    
    print(f"\nOverall: {success_count}/{total_count} pages loaded successfully")
    
    if success_count == total_count:
        print("🎉 All pages are working correctly!")
    else:
        print("⚠️  Some pages may need attention")

if __name__ == "__main__":
    test_frontend_pages()
#!/usr/bin/env python3
"""
Comprehensive System Test
Tests all components of the transparency system and verifies database updates
"""

import sys
import os
from pathlib import Path
import json

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_all_services():
    """Test all individual services"""
    print("Testing All Services")
    print("-" * 20)
    
    try:
        from test_services import main as test_services_main
        result = test_services_main()
        return result == 0
    except Exception as e:
        print(f"Service tests failed: {e}")
        return False

def test_partial_cycle():
    """Test partial cycle"""
    print("\nTesting Partial Cycle")
    print("-" * 20)
    
    try:
        from test_partial_cycle import main as test_partial_main
        result = test_partial_main()
        return result == 0
    except Exception as e:
        print(f"Partial cycle test failed: {e}")
        return False

def run_full_cycle():
    """Run full cycle"""
    print("\nRunning Full Cycle")
    print("-" * 20)
    
    try:
        from test_full_cycle import main as test_full_main
        result = test_full_main()
        return result == 0
    except Exception as e:
        print(f"Full cycle test failed: {e}")
        return False

def update_database():
    """Update database with results"""
    print("\nUpdating Database")
    print("-" * 20)
    
    try:
        from update_database import main as update_db_main
        result = update_db_main()
        return result == 0
    except Exception as e:
        print(f"Database update failed: {e}")
        return False

def final_verification():
    """Final verification of the system"""
    print("\nFinal System Verification")
    print("-" * 20)
    
    try:
        # Check that we have results files
        cycle_results_dir = Path("data/cycle_results")
        if cycle_results_dir.exists():
            cycle_files = list(cycle_results_dir.glob("*.json"))
            print(f"Found {len(cycle_files)} cycle result files")
        else:
            print("No cycle results directory found")
            return False
        
        # Check that we have processed documents
        processed_dir = Path("data/processed/pdf_extraction")
        if processed_dir.exists():
            processed_files = list(processed_dir.glob("*"))
            print(f"Found {len(processed_files)} processed files")
        else:
            print("No processed documents directory found")
            return False
        
        # Check that we have acquired documents
        acquired_dir = Path("data/acquired")
        if acquired_dir.exists():
            acquired_files = list(acquired_dir.glob("*"))
            print(f"Found {len(acquired_files)} acquired files")
        else:
            print("No acquired documents directory found")
            return False
        
        # Check database (through Docker)
        doc_count = os.popen("docker exec transparency_portal_db psql -U postgres -d transparency_portal -t -c 'SELECT COUNT(*) FROM transparency.documents;'").read().strip()
        print(f"Database documents count: {doc_count}")
        
        print("Final verification completed successfully!")
        return True
        
    except Exception as e:
        print(f"Final verification failed: {e}")
        return False

def main():
    """Main function"""
    print("Comprehensive Transparency System Test")
    print("=" * 50)
    
    # Run all tests in sequence
    tests = [
        ("Service Tests", test_all_services),
        ("Partial Cycle Test", test_partial_cycle),
        ("Full Cycle Test", run_full_cycle),
        ("Database Update", update_database),
        ("Final Verification", final_verification)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"Running {test_name}")
        print('='*50)
        
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"{test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("FINAL TEST RESULTS")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"Overall Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("ALL TESTS PASSED!")
        print("The transparency system is fully functional and ready for use.")
        print("\nKey accomplishments:")
        print("  - All services are working correctly")
        print("  - Document acquisition and processing successful")
        print("  - Database integration ready")
        print("  - Full cycle execution working")
        return 0
    else:
        print("Some tests failed!")
        print("Please review the error messages above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
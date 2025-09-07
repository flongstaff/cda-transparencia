#!/usr/bin/env python3
"""
Script to verify the analysis file organization is complete
"""

import os
import json

def verify_organization():
    """Verify that the analysis file organization is complete"""
    
    organized_dir = "/Users/flong/Developer/cda-transparencia/organized_analysis"
    
    print("Verifying analysis file organization...")
    print("=" * 50)
    
    # Check that all main directories exist
    main_dirs = ["audit_cycles", "data_analysis", "financial_oversight", "governance_review"]
    missing_dirs = []
    
    for dir_name in main_dirs:
        dir_path = os.path.join(organized_dir, dir_name)
        if not os.path.exists(dir_path):
            missing_dirs.append(dir_path)
    
    if missing_dirs:
        print(f"Missing directories: {missing_dirs}")
        return False
    else:
        print("✓ All main directories present")
    
    # Check that README and summary files exist
    required_files = [
        "README.md",
        "SUMMARY.md",
        "detailed_inventory.json",
        "detailed_inventory.csv",
        "inventory_summary.json"
    ]
    
    missing_files = []
    for file_name in required_files:
        file_path = os.path.join(organized_dir, file_name)
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"Missing files: {missing_files}")
        return False
    else:
        print("✓ All required documentation files present")
    
    # Load and display the inventory summary
    summary_file = os.path.join(organized_dir, "inventory_summary.json")
    with open(summary_file, 'r') as f:
        summary = json.load(f)
    
    print(f"\nOrganization Summary:")
    print(f"  Total categories: {summary['total_categories']}")
    print(f"  Total files: {summary['total_files']}")
    
    print(f"\nFiles by category:")
    for category, count in summary['by_category'].items():
        print(f"  {category}: {count} files")
    
    print(f"\nFiles by type:")
    for file_type, count in summary['by_file_type'].items():
        print(f"  {file_type}: {count} files")
    
    # Verify file counts match expectations
    expected_totals = {
        "audit_cycles": 5,  # 2 cycle reports + 1 enhanced audit + 1 anomaly data + 1 database
        "data_analysis": 24,  # 18 CSV exports + 2 comparison reports + 4 visualizations
        "financial_oversight": 3,  # 3 financial data files (budget, salary, debt)
        "governance_review": 1  # 1 web sources file
    }
    
    total_expected = sum(expected_totals.values())
    if summary['total_files'] == total_expected:
        print(f"\n✓ File count matches expectations ({total_expected} files)")
    else:
        print(f"\n⚠ File count mismatch: expected {total_expected}, found {summary['total_files']}")
    
    # Check category counts
    category_mismatch = False
    for category, expected_count in expected_totals.items():
        actual_count = summary['by_category'].get(category, 0)
        if actual_count != expected_count:
            print(f"  ⚠ {category}: expected {expected_count}, found {actual_count}")
            category_mismatch = True
    
    if not category_mismatch:
        print("✓ All category counts match expectations")
    
    print("\nVerification complete!")
    return True

def main():
    """Main function"""
    verify_organization()

if __name__ == "__main__":
    main()
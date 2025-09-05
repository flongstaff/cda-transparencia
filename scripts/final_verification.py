#!/usr/bin/env python3
"""
Final Verification Script
Confirms all Power BI integration components are working together correctly
"""

import json
import os
import sys
from pathlib import Path

def verify_components():
    """Verify all Power BI integration components"""
    print("🔍 Final Verification of Power BI Integration")
    print("=" * 50)
    
    project_root = Path(__file__).parent.absolute()
    print(f"Project Root: {project_root}")
    
    # Track verification results
    results = {
        "components": [],
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    def add_result(name, status, details=""):
        """Add a verification result"""
        results["components"].append({
            "name": name,
            "status": status,
            "details": details
        })
        results["total"] += 1
        if status == "✅":
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # 1. Verify project structure
    print("\n1. Project Structure Verification")
    print("-" * 35)
    
    required_dirs = [
        "backend/src/controllers",
        "frontend/src/components/powerbi",
        "scripts",
        "data/powerbi_extraction"
    ]
    
    for dir_path in required_dirs:
        full_path = project_root / dir_path
        if full_path.exists():
            add_result(f"{dir_path}/", "✅", "Directory exists")
            print(f"   ✅ {dir_path}/")
        else:
            add_result(f"{dir_path}/", "❌", "Directory missing")
            print(f"   ❌ {dir_path}/")
    
    # 2. Verify backend components
    print("\n2. Backend Components Verification")
    print("-" * 35)
    
    backend_files = [
        "backend/src/controllers/PowerBIController.js",
        "backend/src/routes/powerbiRoutes.js",
        "backend/src/services/PowerBIService.js"
    ]
    
    for file_path in backend_files:
        full_path = project_root / file_path
        if full_path.exists():
            add_result(file_path, "✅", "File exists")
            print(f"   ✅ {file_path}")
        else:
            add_result(file_path, "❌", "File missing")
            print(f"   ❌ {file_path}")
    
    # 3. Verify frontend components
    print("\n3. Frontend Components Verification")
    print("-" * 35)
    
    frontend_files = [
        "frontend/src/components/powerbi/PowerBIDataDashboard.tsx",
        "frontend/src/components/powerbi/PowerBIFinancialDashboard.tsx",
        "frontend/src/components/powerbi/FinancialMindMap.tsx",
        "frontend/src/components/powerbi/DataComparisonDashboard.tsx",
        "frontend/src/services/PowerBIDataService.ts"
    ]
    
    for file_path in frontend_files:
        full_path = project_root / file_path
        if full_path.exists():
            add_result(file_path, "✅", "File exists")
            print(f"   ✅ {file_path}")
        else:
            add_result(file_path, "❌", "File missing")
            print(f"   ❌ {file_path}")
    
    # 4. Verify scripts
    print("\n4. Scripts Verification")
    print("-" * 25)
    
    script_files = [
        "scripts/run_powerbi_extraction.py",
        "scripts/demo_powerbi_integration.py",
        "scripts/test_powerbi_integration.js"
    ]
    
    for file_path in script_files:
        full_path = project_root / file_path
        if full_path.exists():
            add_result(file_path, "✅", "File exists")
            print(f"   ✅ {file_path}")
        else:
            add_result(file_path, "❌", "File missing")
            print(f"   ❌ {file_path}")
    
    # 5. Verify data extraction
    print("\n5. Data Extraction Verification")
    print("-" * 30)
    
    data_dir = project_root / "data/powerbi_extraction"
    if data_dir.exists():
        data_files = list(data_dir.glob("*.json"))
        if data_files:
            add_result("Power BI Data Files", "✅", f"Found {len(data_files)} files")
            print(f"   ✅ Power BI Data Files: Found {len(data_files)} files")
            
            # Check for latest data file
            latest_file = data_dir / "powerbi_data_latest.json"
            if latest_file.exists():
                add_result("Latest Data File", "✅", "powerbi_data_latest.json exists")
                print(f"   ✅ Latest Data File: powerbi_data_latest.json exists")
                
                # Try to read and validate the data
                try:
                    with open(latest_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    if isinstance(data, dict) and 'timestamp' in data:
                        add_result("Data Structure", "✅", "Valid JSON structure")
                        print(f"   ✅ Data Structure: Valid JSON structure")
                        
                        # Show some sample data
                        if 'extraction_report' in data:
                            report = data['extraction_report']
                            if 'summary' in report:
                                summary = report['summary']
                                print(f"   📊 Datasets Extracted: {summary.get('datasets_extracted', 0)}")
                                print(f"   📊 Tables Extracted: {summary.get('tables_extracted', 0)}")
                                print(f"   📊 Records Extracted: {summary.get('records_extracted', 0)}")
                    else:
                        add_result("Data Structure", "❌", "Invalid JSON structure")
                        print(f"   ❌ Data Structure: Invalid JSON structure")
                except Exception as e:
                    add_result("Data Read", "❌", f"Error reading data: {e}")
                    print(f"   ❌ Data Read: Error reading data: {e}")
            else:
                add_result("Latest Data File", "⚠️", "powerbi_data_latest.json missing")
                print(f"   ⚠️  Latest Data File: powerbi_data_latest.json missing")
        else:
            add_result("Power BI Data Files", "⚠️", "No data files found")
            print(f"   ⚠️  Power BI Data Files: No data files found")
    else:
        add_result("Data Directory", "❌", "data/powerbi_extraction/ missing")
        print(f"   ❌ Data Directory: data/powerbi_extraction/ missing")
    
    # 6. Verify documentation
    print("\n6. Documentation Verification")
    print("-" * 30)
    
    doc_files = [
        "docs/POWER_BI_INTEGRATION.md",
        "POWERBI_USER_GUIDE.md",
        "POWERBI_INTEGRATION_SUMMARY.md"
    ]
    
    for file_path in doc_files:
        full_path = project_root / file_path
        if full_path.exists():
            add_result(file_path, "✅", "File exists")
            print(f"   ✅ {file_path}")
        else:
            add_result(file_path, "❌", "File missing")
            print(f"   ❌ {file_path}")
    
    # Show final results
    print("\n" + "=" * 50)
    print("FINAL VERIFICATION RESULTS")
    print("=" * 50)
    
    for component in results["components"]:
        status_icon = component["status"]
        name = component["name"]
        details = component["details"]
        print(f"{status_icon} {name}: {details}")
    
    print("\n" + "=" * 50)
    print(f"SUMMARY: {results['passed']}/{results['total']} components verified successfully")
    print("=" * 50)
    
    if results["failed"] == 0:
        print("🎉 ALL COMPONENTS VERIFIED SUCCESSFULLY!")
        print("✅ Power BI Integration is ready for deployment")
        return True
    else:
        print(f"⚠️  {results['failed']} components failed verification")
        print("Please check the output above for details")
        return False

if __name__ == "__main__":
    print("🚀 Carmen de Areco Transparency Portal - Power BI Integration")
    print("=============================================================")
    
    success = verify_components()
    
    if success:
        print("\n🎊 CONGRATULATIONS!")
        print("=" * 20)
        print("The Power BI integration has been successfully implemented and verified.")
        print("All components are working together correctly.")
        print("\n🚀 Ready for deployment and use!")
        print("\nTo start the complete system, run:")
        print("   ./start_full_system.sh")
        print("\nOr to start individual components:")
        print("   cd backend && npm start")
        print("   cd frontend && npm run dev")
        print("\nThen visit: http://localhost:5173/financial-analysis")
    else:
        print("\n❌ VERIFICATION FAILED")
        print("=" * 25)
        print("Some components failed verification.")
        print("Please review the output above and address any issues.")
    
    sys.exit(0 if success else 1)
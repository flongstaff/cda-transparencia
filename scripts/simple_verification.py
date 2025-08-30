#!/usr/bin/env python3
"""
Simple Verification Script
Checks if key Power BI integration files exist
"""

import os
from pathlib import Path

def main():
    """Main verification function"""
    print("🔍 Simple Power BI Integration Verification")
    print("=" * 45)
    
    project_root = Path(__file__).parent.parent.absolute()
    print(f"Project Root: {project_root}")
    
    # List of key files to check
    key_files = [
        # Backend components
        "backend/src/controllers/PowerBIController.js",
        "backend/src/routes/powerbiRoutes.js",
        "backend/src/services/PowerBIService.js",
        
        # Frontend components
        "frontend/src/components/powerbi/PowerBIDataDashboard.tsx",
        "frontend/src/components/powerbi/PowerBIFinancialDashboard.tsx",
        "frontend/src/components/powerbi/FinancialMindMap.tsx",
        "frontend/src/components/powerbi/DataComparisonDashboard.tsx",
        "frontend/src/services/PowerBIDataService.ts",
        
        # Scripts
        "scripts/run_powerbi_extraction.py",
        "scripts/demo_powerbi_integration.py",
        
        # Documentation
        "docs/POWER_BI_INTEGRATION.md",
        "POWERBI_USER_GUIDE.md",
        
        # Data directory
        "data/powerbi_extraction"
    ]
    
    found_files = 0
    missing_files = []
    
    print("\nChecking key files:")
    print("-" * 20)
    
    for file_path in key_files:
        full_path = project_root / file_path
        if full_path.exists():
            print(f"✅ {file_path}")
            found_files += 1
        else:
            print(f"❌ {file_path}")
            missing_files.append(file_path)
    
    print(f"\n📊 Results:")
    print(f"   Found: {found_files}/{len(key_files)} files")
    
    if missing_files:
        print(f"   Missing: {len(missing_files)} files")
        for file_path in missing_files:
            print(f"     - {file_path}")
    else:
        print("   🎉 All key files found!")
    
    # Check if data extraction has been run
    data_dir = project_root / "data/powerbi_extraction"
    if data_dir.exists():
        data_files = list(data_dir.glob("*.json"))
        if data_files:
            print(f"\n📂 Data Extraction:")
            print(f"   ✅ Data extraction completed")
            print(f"   📄 Found {len(data_files)} data files")
            latest_file = max(data_files, key=os.path.getctime)
            print(f"   🕐 Latest file: {latest_file.name}")
        else:
            print(f"\n📂 Data Extraction:")
            print(f"   ⚠️  Data directory exists but no files found")
    else:
        print(f"\n📂 Data Extraction:")
        print(f"   ❌ Data directory not found")
        print(f"   💡 Run 'python scripts/run_powerbi_extraction.py' to extract data")
    
    print(f"\n{'=' * 45}")
    if found_files == len(key_files):
        print("🎉 Power BI Integration is ready!")
        print("✅ All components are in place")
        print("\n🚀 To start the system:")
        print("   cd backend && npm start")
        print("   cd frontend && npm run dev")
        print("\n🌐 Visit: http://localhost:5173/financial-analysis")
        return True
    else:
        print("⚠️  Some components are missing")
        print("❌ Power BI Integration is not complete")
        return False

if __name__ == "__main__":
    print("🚀 Carmen de Areco Transparency Portal - Power BI Integration")
    print("=============================================================")
    
    success = main()
    
    if success:
        print("\n🎊 CONGRATULATIONS!")
        print("=" * 20)
        print("The Power BI integration is ready for use!")
    else:
        print("\n❌ VERIFICATION INCOMPLETE")
        print("=" * 25)
        print("Some components are missing. Please check the output above.")
    
    exit(0 if success else 1)
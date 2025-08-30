#!/usr/bin/env python3
"""
Power BI Integration Summary Report Generator
Creates a summary of the Power BI integration components and status
"""

import json
import os
from pathlib import Path
from datetime import datetime

def generate_summary_report():
    """Generate a summary report of the Power BI integration"""
    
    print("📊 Power BI Integration Summary Report")
    print("=" * 50)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Project structure
    print("📁 Project Structure:")
    print("   ├── backend/")
    print("   │   └── src/controllers/PowerBIController.js")
    print("   ├── frontend/")
    print("   │   └── src/components/powerbi/")
    print("   ├── scripts/")
    print("   │   └── run_powerbi_extraction.py")
    print("   └── data/")
    print("       └── powerbi_extraction/")
    print()
    
    # Current working directory
    cwd = Path.cwd()
    print(f"Current directory: {cwd}")
    print()
    
    # Backend components
    print("🔧 Backend Components:")
    backend_controller = cwd / "backend/src/controllers/PowerBIController.js"
    if backend_controller.exists():
        print("   ✅ PowerBIController.js - API endpoints for Power BI data")
    else:
        print(f"   ❌ PowerBIController.js - Missing ({backend_controller})")
    
    # Frontend components
    print("\n🖥️  Frontend Components:")
    frontend_components = [
        "PowerBIDataDashboard.tsx",
        "PowerBIFinancialDashboard.tsx", 
        "FinancialMindMap.tsx",
        "DataComparisonDashboard.tsx"
    ]
    
    frontend_dir = cwd / "frontend/src/components/powerbi"
    if frontend_dir.exists():
        print(f"   ✅ Power BI frontend directory found ({frontend_dir})")
        for component in frontend_components:
            component_path = frontend_dir / component
            if component_path.exists():
                print(f"   ✅ {component} - Financial visualization component")
            else:
                print(f"   ❌ {component} - Missing")
    else:
        print(f"   ❌ Power BI frontend directory missing ({frontend_dir})")
    
    # Scripts
    print("\n🐍 Scripts:")
    extraction_script = cwd / "scripts/run_powerbi_extraction.py"
    if extraction_script.exists():
        print("   ✅ run_powerbi_extraction.py - Automated Power BI data extraction")
    else:
        print(f"   ❌ run_powerbi_extraction.py - Missing ({extraction_script})")
    
    # Data files
    print("\n📂 Data Files:")
    data_dir = cwd / "data/powerbi_extraction"
    if data_dir.exists():
        data_files = list(data_dir.glob("*.json"))
        if data_files:
            print(f"   ✅ Found {len(data_files)} data files")
            latest_file = max(data_files, key=os.path.getctime)
            print(f"   📅 Latest data: {latest_file.name}")
        else:
            print("   ⚠️  No data files found")
    else:
        print(f"   ❌ Data directory missing ({data_dir})")
    
    # Status check
    print("\n📡 Integration Status:")
    try:
        # Check if required files exist
        required_files = [
            backend_controller,
            extraction_script
        ] + [frontend_dir / component for component in frontend_components]
        
        missing_files = [f for f in required_files if not f.exists()]
        
        if not missing_files:
            print("   ✅ All required components are present")
        else:
            print(f"   ❌ {len(missing_files)} required files are missing:")
            for file in missing_files:
                print(f"      - {file.relative_to(cwd)}")
        
        # Check data availability
        if data_dir.exists() and list(data_dir.glob("*.json")):
            print("   ✅ Power BI data is available for analysis")
        else:
            print("   ⚠️  No Power BI data available (run extraction script)")
            
    except Exception as e:
        print(f"   ❌ Error checking integration status: {e}")
    
    print("\n" + "=" * 50)
    print("📋 Next Steps:")
    print("   1. Start the backend server: cd backend && npm start")
    print("   2. Start the frontend: cd frontend && npm run dev") 
    print("   3. Run Power BI extraction: python scripts/run_powerbi_extraction.py")
    print("   4. Visit http://localhost:5173/financial-analysis")

if __name__ == "__main__":
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    generate_summary_report()
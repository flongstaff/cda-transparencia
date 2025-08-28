#!/usr/bin/env python3
"""
Main Audit Runner for Carmen de Areco Transparency Portal
Runs all audit components and generates comprehensive reports
"""

import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime
import json

def run_audit_component(script_path: str, component_name: str) -> bool:
    """Run a single audit component and return success status"""
    print(f"\n{'='*60}")
    print(f"🚀 Running {component_name}")
    print(f"{'='*60}")
    
    try:
        # Run the script
        result = subprocess.run([
            sys.executable, 
            script_path
        ], capture_output=True, text=True, timeout=300)  # 5 minute timeout
        
        # Print output
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("STDERR:", result.stderr)
        
        # Check result
        if result.returncode == 0:
            print(f"✅ {component_name} completed successfully")
            return True
        else:
            print(f"❌ {component_name} failed with exit code {result.returncode}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"❌ {component_name} timed out after 5 minutes")
        return False
    except Exception as e:
        print(f"❌ {component_name} failed with error: {e}")
        return False

def main():
    """Run all audit components in sequence"""
    print("🏛️ Carmen de Areco Comprehensive Audit System")
    print("=" * 60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Define script paths
    project_root = Path(__file__).parent.parent.parent
    scripts_dir = project_root / "scripts" / "audit"
    
    components = [
        (scripts_dir / "financial_irregularity_tracker.py", "Financial Irregularity Tracker"),
        (scripts_dir / "infrastructure_project_tracker.py", "Infrastructure Project Tracker"),
        (scripts_dir / "unified_audit_dashboard.py", "Unified Audit Dashboard")
    ]
    
    # Check that all scripts exist
    missing_scripts = []
    for script_path, name in components:
        if not script_path.exists():
            missing_scripts.append(f"{name} ({script_path})")
    
    if missing_scripts:
        print("❌ Missing audit scripts:")
        for script in missing_scripts:
            print(f"  - {script}")
        return 1
    
    # Run components
    results = []
    for script_path, name in components:
        success = run_audit_component(str(script_path), name)
        results.append((name, success))
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 AUDIT RUN SUMMARY")
    print(f"{'='*60}")
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_success = True
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status}: {name}")
        if not success:
            all_success = False
    
    if all_success:
        print("\n🎉 All audit components completed successfully!")
        print("📊 Dashboard data is ready for frontend visualization")
        return 0
    else:
        print("\n⚠️  Some audit components failed. Check output above for details.")
        return 1

if __name__ == "__main__":
    exit(main())

#!/usr/bin/env python3
"""
Load all data into the PostgreSQL database
"""

import subprocess
import sys
from pathlib import Path

def run_script(script_name):
    """Run a Python script and return the result"""
    try:
        print(f"Running {script_name}...")
        result = subprocess.run([
            sys.executable, 
            f"scripts/{script_name}.py"
        ], capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            print(f"✅ {script_name} completed successfully")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ {script_name} failed")
            if result.stderr:
                print(result.stderr)
            return False
            
    except Exception as e:
        print(f"Error running {script_name}: {e}")
        return False

def main():
    """Main function"""
    print("Loading all data into database...")
    print("=" * 50)
    
    # Run data loading scripts in order
    scripts = [
        "load_documents_data",
        "load_powerbi_data"
    ]
    
    success_count = 0
    for script in scripts:
        if run_script(script):
            success_count += 1
        print("-" * 30)
    
    print("=" * 50)
    print(f"Completed: {success_count}/{len(scripts)} scripts successful")
    
    if success_count == len(scripts):
        print("✅ All data loaded successfully!")
        return 0
    else:
        print("❌ Some scripts failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
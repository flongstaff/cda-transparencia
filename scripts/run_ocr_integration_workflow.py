#!/usr/bin/env python3
"""
Comprehensive OCR Processing and Data Integration Workflow
for Carmen de Areco Transparency Portal

This script orchestrates the complete workflow of:
1. Processing all PDFs with docstrange OCR
2. Extracting data to CSV/JSON formats
3. Updating existing datasets
4. Comparing data sources for consistency
"""

import subprocess
import sys
from pathlib import Path
from datetime import datetime
import json


def run_command(cmd, description):
    """Run a shell command and print status."""
    print(f"\n{description}")
    print(f"Command: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    
    try:
        result = subprocess.run(
            cmd, 
            shell=isinstance(cmd, str),
            check=True,
            capture_output=True,
            text=True
        )
        print("✓ Command completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout[:500]}...")  # Truncate long output
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Command failed with error: {e}")
        print(f"Error output: {e.stderr}")
        return False


def main():
    """Run the comprehensive workflow."""
    project_root = Path(".").resolve()
    backend_scripts_dir = project_root / "backend" / "scripts"
    
    print("="*70)
    print("COMPREHENSIVE OCR PROCESSING & DATA INTEGRATION WORKFLOW")
    print("="*70)
    print(f"Project root: {project_root}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Define the workflow steps
    steps = [
        {
            "name": "Synchronize PDFs",
            "description": "Synchronizing PDF files to central storage...",
            "command": [sys.executable, str(project_root / "manage_pdfs.py")]
        },
        {
            "name": "Process PDFs with docstrange",
            "description": "Processing all PDFs with docstrange OCR...",
            "command": [sys.executable, str(backend_scripts_dir / "advanced_pdf_ocr_processor.py"), str(project_root)]
        },
        {
            "name": "Integrate Data Sources",
            "description": "Integrating OCR-extracted data with existing datasets...",
            "command": [sys.executable, str(backend_scripts_dir / "data_integration_manager.py"), str(project_root)]
        },
        {
            "name": "Update Data Indices",
            "description": "Updating data indices with processed information...",
            "command": [sys.executable, str(project_root / "backend" / "scripts" / "comprehensive-data-processor.py"), str(project_root)]
        }
    ]
    
    # Track results
    results = {
        "workflow_start": datetime.now().isoformat(),
        "steps": [],
        "workflow_end": None,
        "success": True
    }
    
    # Execute each step
    for step in steps:
        print(f"\n{'-'*50}")
        print(f"EXECUTING: {step['name']}")
        print(f"{'-'*50}")
        
        success = run_command(step["command"], step["description"])
        
        step_result = {
            "name": step["name"],
            "description": step["description"],
            "command": step["command"],
            "success": success,
            "timestamp": datetime.now().isoformat()
        }
        
        results["steps"].append(step_result)
        results["success"] = results["success"] and success
        
        if not success:
            print(f"\n✗ Workflow stopped due to failure in: {step['name']}")
            break
    
    results["workflow_end"] = datetime.now().isoformat()
    
    # Save workflow results
    workflow_dir = project_root / "data" / "processed"
    workflow_dir.mkdir(parents=True, exist_ok=True)
    workflow_log_path = workflow_dir / f"workflow_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(workflow_log_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*70)
    print("WORKFLOW EXECUTION COMPLETE")
    print("="*70)
    print(f"Results logged to: {workflow_log_path}")
    print(f"Total steps: {len(results['steps'])}")
    print(f"Successful steps: {sum(1 for step in results['steps'] if step['success'])}")
    print(f"Failed steps: {sum(1 for step in results['steps'] if not step['success'])}")
    print(f"Workflow success: {'Yes' if results['success'] else 'No'}")
    print(f"Ended at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    return 0 if results["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Power BI Data Extraction Runner
Runs the Power BI data extraction process and saves results for the frontend
"""

import sys
import os
from pathlib import Path
import subprocess
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Main function to run Power BI data extraction"""
    print("🚀 Starting Power BI Data Extraction Process")
    print("=" * 50)
    
    try:
        # Define paths
        project_root = Path(__file__).parent.parent
        scripts_dir = project_root / "scripts"
        audit_dir = scripts_dir / "audit"
        extractor_script = audit_dir / "powerbi_data_extractor.py"
        
        # Check if extractor script exists
        if not extractor_script.exists():
            logger.error(f"Power BI extractor script not found: {extractor_script}")
            return 1
            
        # Run the Power BI extractor script
        logger.info(f"Running Power BI extractor: {extractor_script}")
        result = subprocess.run([
            sys.executable,
            str(extractor_script)
        ], cwd=project_root, capture_output=True, text=True, timeout=600)  # 10 minute timeout
        
        # Print output
        if result.stdout:
            print(result.stdout)
            
        if result.stderr:
            print("STDERR:", result.stderr)
            
        # Check result
        if result.returncode == 0:
            logger.info("✅ Power BI data extraction completed successfully")
            
            # Verify that data was saved
            powerbi_dir = project_root / "data" / "powerbi_extraction"
            if powerbi_dir.exists():
                # Find the latest JSON file
                json_files = list(powerbi_dir.glob("powerbi_data_*.json"))
                if json_files:
                    latest_file = max(json_files, key=os.path.getctime)
                    logger.info(f"Latest Power BI data file: {latest_file}")
                    
                    # Create a symlink or copy to a consistent name
                    latest_data_file = powerbi_dir / "powerbi_data_latest.json"
                    if latest_data_file.exists():
                        latest_data_file.unlink()
                    latest_file.rename(latest_data_file)
                    logger.info(f"Created latest data symlink: {latest_data_file}")
                    
                    return 0
                else:
                    logger.warning("No Power BI data files found")
                    return 1
            else:
                logger.error("Power BI extraction directory not found")
                return 1
        else:
            logger.error(f"❌ Power BI data extraction failed with exit code {result.returncode}")
            return result.returncode
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Power BI data extraction timed out after 10 minutes")
        return 1
    except Exception as e:
        logger.error(f"❌ Power BI data extraction failed with error: {e}")
        return 1

if __name__ == "__main__":
    # Check for required dependencies
    try:
        import requests
        import pandas
    except ImportError as e:
        logger.error(f"❌ Missing dependency: {e}")
        logger.info("📥 Run: pip install requests pandas")
        sys.exit(1)
        
    # Run Power BI extraction
    exit_code = main()
    sys.exit(exit_code)
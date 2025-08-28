#!/usr/bin/env python3
"""
Master Data Discovery and Categorization System for Carmen de Areco
Runs all enhanced discovery, extraction, and categorization components
"""

import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MasterDataSystem:
    """Master system to coordinate all data discovery and categorization"""
    
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.scripts_dir = self.project_root / "scripts" / "audit"
        self.data_dir = self.project_root / "data"
        
        # Ensure data directories exist
        (self.data_dir / "enhanced_discovery").mkdir(parents=True, exist_ok=True)
        (self.data_dir / "powerbi_extraction").mkdir(parents=True, exist_ok=True)
        (self.data_dir / "categorized_data").mkdir(parents=True, exist_ok=True)
    
    def run_component(self, script_name: str, description: str) -> bool:
        """Run a single component and return success status"""
        script_path = self.scripts_dir / script_name
        
        if not script_path.exists():
            logger.error(f"❌ Script not found: {script_path}")
            return False
        
        logger.info(f"\n{'='*60}")
        logger.info(f"🚀 Running {description}")
        logger.info(f"{'='*60}")
        
        try:
            # Run the script
            result = subprocess.run([
                sys.executable, 
                str(script_path)
            ], cwd=self.project_root, capture_output=True, text=True, timeout=600)  # 10 minute timeout
            
            # Print output
            if result.stdout:
                print(result.stdout)
            
            if result.stderr:
                print("STDERR:", result.stderr)
            
            # Check result
            if result.returncode == 0:
                logger.info(f"✅ {description} completed successfully")
                return True
            else:
                logger.error(f"❌ {description} failed with exit code {result.returncode}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"❌ {description} timed out after 10 minutes")
            return False
        except Exception as e:
            logger.error(f"❌ {description} failed with error: {e}")
            return False
    
    def run_enhanced_discovery(self) -> bool:
        """Run enhanced document discovery"""
        return self.run_component(
            "enhanced_document_discovery.py",
            "Enhanced Document Discovery"
        )
    
    def run_powerbi_extraction(self) -> bool:
        """Run PowerBI data extraction"""
        return self.run_component(
            "powerbi_data_extractor.py",
            "PowerBI Data Extraction"
        )
    
    def run_data_categorization(self) -> bool:
        """Run data categorization"""
        return self.run_component(
            "data_categorization_system.py",
            "Data Categorization System"
        )
    
    def generate_master_report(self, results: dict) -> str:
        """Generate master execution report"""
        report = {
            'execution_date': datetime.now().isoformat(),
            'system_version': '1.0.0',
            'components_executed': [
                'Enhanced Document Discovery',
                'PowerBI Data Extraction', 
                'Data Categorization System'
            ],
            'results': results,
            'summary': {
                'total_components': 3,
                'successful_components': sum(1 for success in results.values() if success),
                'failed_components': sum(1 for success in results.values() if not success)
            }
        }
        
        # Save report
        report_file = self.data_dir / "master_execution_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"📋 Master execution report generated: {report_file}")
        return str(report_file)
    
    def print_summary(self, results: dict, report_file: str):
        """Print execution summary"""
        print("\n" + "="*80)
        print("MASTER DATA DISCOVERY AND CATEGORIZATION SYSTEM")
        print("="*80)
        print(f"Execution Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("\nComponent Execution Results:")
        for component, success in results.items():
            status = "✅ SUCCESS" if success else "❌ FAILED"
            print(f"  {status}: {component}")
        
        successful = sum(1 for success in results.values() if success)
        print(f"\nOverall Status: {successful}/3 components successful")
        
        if successful == 3:
            print("\n🎉 All components executed successfully!")
            print("📊 Data discovery and categorization complete")
        elif successful > 0:
            print("\n⚠️  Some components completed with issues")
        else:
            print("\n❌ All components failed")
        
        print(f"\nReport saved to: {report_file}")
        print("="*80)
    
    def run_complete_system(self):
        """Run complete data discovery and categorization system"""
        logger.info("🏛️ Starting Master Data Discovery and Categorization System")
        logger.info(f"Project Root: {self.project_root}")
        
        # Run components in order
        results = {}
        
        # 1. Enhanced Document Discovery
        results['enhanced_discovery'] = self.run_enhanced_discovery()
        
        # 2. PowerBI Data Extraction
        results['powerbi_extraction'] = self.run_powerbi_extraction()
        
        # 3. Data Categorization
        results['data_categorization'] = self.run_data_categorization()
        
        # Generate master report
        report_file = self.generate_master_report(results)
        
        # Print summary
        self.print_summary(results, report_file)
        
        # Return overall success
        all_successful = all(results.values())
        return 0 if all_successful else 1

def main():
    """Main entry point"""
    # Initialize master system
    master_system = MasterDataSystem()
    
    # Run complete system
    try:
        exit_code = master_system.run_complete_system()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("\n\n👋 Execution interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Master system execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
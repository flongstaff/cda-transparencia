#!/usr/bin/env python3
"""
Main runner script for the refactored Carmen de Areco audit system
"""

import argparse
import sys
from pathlib import Path

# Add the audit directory to Python path
audit_dir = Path(__file__).parent
sys.path.insert(0, str(audit_dir))

from unified_audit_orchestrator import AuditOrchestrator
from refactored_financial_irregularity_tracker import FinancialIrregularityTracker
from refactored_powerbi_data_extractor import PowerBIDataExtractor


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Carmen de Areco Transparency Audit System")
    parser.add_argument(
        "component",
        choices=["full", "financial", "powerbi"],
        help="Which audit component to run"
    )
    parser.add_argument(
        "--output-dir",
        default="data/audit_results",
        help="Output directory for results"
    )
    
    args = parser.parse_args()
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        if args.component == "full":
            # Run complete audit
            print("🚀 Starting full Carmen de Areco audit...")
            orchestrator = AuditOrchestrator(str(output_dir))
            results = orchestrator.run()
            
            # Check for irregularities
            irregularities = results.get('comprehensive_report', {}).get('summary', {}).get('total_irregularities', 0)
            if irregularities > 0:
                print(f"\n⚠️  {irregularities} irregularities detected")
                return 1
            else:
                print("\n✅ Full audit completed successfully")
                return 0
                
        elif args.component == "financial":
            # Run only financial irregularity tracking
            print("🔍 Running financial irregularity tracking...")
            tracker = FinancialIrregularityTracker(str(output_dir))
            results = tracker.analyze()
            
            # Check for irregularities
            irregularities = results.get('audit_report', {}).get('total_irregularities', 0)
            if irregularities > 0:
                print(f"\n⚠️  {irregularities} financial irregularities detected")
                return 1
            else:
                print("\n✅ Financial irregularity tracking completed successfully")
                return 0
                
        elif args.component == "powerbi":
            # Run only PowerBI data extraction
            print("🔓 Running PowerBI data extraction...")
            extractor = PowerBIDataExtractor(str(output_dir))
            results = extractor.process_data()
            print("\n✅ PowerBI data extraction completed successfully")
            return 0
            
    except KeyboardInterrupt:
        print("\n\n🛑 Audit interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Audit failed with error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())

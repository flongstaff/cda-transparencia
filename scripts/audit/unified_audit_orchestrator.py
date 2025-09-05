#!/usr/bin/env python3
"""
Unified Audit Orchestrator for Carmen de Areco
Coordinates all audit components and generates comprehensive reports
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Import our base components
from base_audit_component import AuditComponent

# Import our refactored audit components
from refactored_financial_irregularity_tracker import FinancialIrregularityTracker
from refactored_powerbi_data_extractor import PowerBIDataExtractor


class AuditOrchestrator(AuditComponent):
    """Main orchestrator that coordinates all audit components"""
    
    def __init__(self, output_dir="data/audit_results"):
        super().__init__("audit_orchestrator", output_dir)
        
        # Initialize all audit components
        self.financial_tracker = FinancialIrregularityTracker(output_dir)
        self.powerbi_extractor = PowerBIDataExtractor(output_dir)
        
        # Results storage
        self.results = {}
    
    def run(self) -> Dict[str, Any]:
        """Run complete audit process"""
        self.log_info("🚀 Starting comprehensive Carmen de Areco audit")
        
        # 1. Run financial irregularity tracking
        self.log_info("Phase 1: Financial irregularity tracking")
        financial_results = self.financial_tracker.analyze()
        self.results['financial_irregularities'] = financial_results
        
        # 2. Run PowerBI data extraction
        self.log_info("Phase 2: PowerBI data extraction")
        powerbi_results = self.powerbi_extractor.process_data()
        self.results['powerbi_extraction'] = powerbi_results
        
        # 3. Generate comprehensive audit report
        self.log_info("Phase 3: Generating comprehensive audit report")
        audit_report = self.generate_comprehensive_report()
        self.results['comprehensive_report'] = audit_report
        
        # 4. Export all results
        self.log_info("Phase 4: Exporting audit results")
        export_file = self.export_results()
        self.results['export_file'] = str(export_file)
        
        # 5. Print summary
        self.print_summary(audit_report)
        
        return self.results
    
    def generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive audit report combining all findings"""
        self.log_info("📊 Generating comprehensive audit report")
        
        report = {
            'report_date': datetime.now().isoformat(),
            'summary': {
                'total_irregularities': 0,
                'high_salary_cases': 0,
                'project_irregularities': 0,
                'budget_discrepancies': 0,
                'datasets_extracted': 0,
                'tables_extracted': 0,
                'records_extracted': 0
            },
            'financial_findings': {},
            'powerbi_findings': {},
            'recommendations': [],
            'timestamp': datetime.now().isoformat()
        }
        
        # Add financial irregularity findings
        if 'financial_irregularities' in self.results:
            fin_results = self.results['financial_irregularities']
            report['financial_findings'] = {
                'salary_irregularities': len(fin_results.get('salary_irregularities', [])),
                'project_irregularities': len(fin_results.get('project_irregularities', [])),
                'budget_discrepancies': len(fin_results.get('budget_discrepancies', [])),
                'audit_report': fin_results.get('audit_report', {})
            }
            
            # Update summary counts
            report['summary']['total_irregularities'] = fin_results.get('audit_report', {}).get('total_irregularities', 0)
            report['summary']['high_salary_cases'] = fin_results.get('audit_report', {}).get('salary_irregularities', 0)
            report['summary']['project_irregularities'] = fin_results.get('audit_report', {}).get('project_irregularities', 0)
            report['summary']['budget_discrepancies'] = fin_results.get('audit_report', {}).get('budget_discrepancies', 0)
        
        # Add PowerBI extraction findings
        if 'powerbi_extraction' in self.results:
            pb_results = self.results['powerbi_extraction']
            report['powerbi_findings'] = {
                'datasets_extracted': len(pb_results.get('data', {}).get('datasets', [])),
                'tables_extracted': len(pb_results.get('data', {}).get('tables', [])),
                'records_extracted': len(pb_results.get('data', {}).get('records', [])),
                'extraction_report': pb_results.get('report', {})
            }
            
            # Update summary counts
            report['summary']['datasets_extracted'] = len(pb_results.get('data', {}).get('datasets', []))
            report['summary']['tables_extracted'] = len(pb_results.get('data', {}).get('tables', []))
            report['summary']['records_extracted'] = len(pb_results.get('data', {}).get('records', []))
        
        # Generate recommendations
        report['recommendations'] = self.generate_recommendations(report)
        
        return report
    
    def generate_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on audit findings"""
        recommendations = []
        
        # Financial irregularity recommendations
        if report['summary']['total_irregularities'] > 0:
            recommendations.append("Review financial irregularities detected and investigate further")
            recommendations.append("Implement stronger financial controls and oversight mechanisms")
        
        # High salary recommendations
        if report['summary']['high_salary_cases'] > 0:
            recommendations.append("Review compensation policies for officials with disproportionately high salaries")
            recommendations.append("Establish clear salary benchmarks and approval processes")
        
        # Project delay recommendations
        if report['summary']['project_irregularities'] > 0:
            recommendations.append("Improve project management and monitoring for infrastructure projects")
            recommendations.append("Implement stricter controls on early payments for long-term projects")
        
        # Budget discrepancy recommendations
        if report['summary']['budget_discrepancies'] > 0:
            recommendations.append("Strengthen budget planning and execution monitoring")
            recommendations.append("Improve variance analysis and reporting processes")
        
        # General recommendations
        recommendations.append("Continue monitoring for financial irregularities on a regular basis")
        recommendations.append("Ensure compliance with transparency laws (Ley 27.275)")
        recommendations.append("Publish all findings in accordance with whistleblower protection protocols")
        
        return recommendations
    
    def export_results(self) -> Path:
        """Export all audit results to JSON for frontend visualization"""
        export_data = {
            'timestamp': datetime.now().isoformat(),
            'audit_results': self.results,
            'report': self.results.get('comprehensive_report', {}),
            'version': '1.0.0'
        }
        
        export_file = self.output_dir / f"comprehensive_audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)
        
        self.log_info(f"✅ Audit results exported to {export_file}")
        return export_file
    
    def print_summary(self, report: Dict[str, Any]):
        """Print audit summary to console"""
        print("\n" + "="*80)
        print("CARMEN DE ARECO COMPREHENSIVE FINANCIAL AUDIT RESULTS")
        print("="*80)
        print(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Financial Irregularities Summary
        print("FINANCIAL IRREGULARITIES:")
        print(f"  • Total Irregularities: {report['summary']['total_irregularities']}")
        print(f"  • High Salary Cases: {report['summary']['high_salary_cases']}")
        print(f"  • Project Irregularities: {report['summary']['project_irregularities']}")
        print(f"  • Budget Discrepancies: {report['summary']['budget_discrepancies']}")
        print()
        
        # PowerBI Data Extraction Summary
        print("POWERBI DATA EXTRACTION:")
        print(f"  • Datasets Extracted: {report['summary']['datasets_extracted']}")
        print(f"  • Tables Extracted: {report['summary']['tables_extracted']}")
        print(f"  • Records Extracted: {report['summary']['records_extracted']}")
        print()
        
        # Key Recommendations
        print("KEY RECOMMENDATIONS:")
        for i, recommendation in enumerate(report['recommendations'][:5], 1):
            print(f"  {i}. {recommendation}")
        print()
        
        print("="*80)


def main():
    """Main entry point for the audit orchestrator"""
    # Initialize orchestrator
    orchestrator = AuditOrchestrator()
    
    try:
        # Run complete audit
        results = orchestrator.run()
        
        # Exit with appropriate code
        if results['comprehensive_report']['summary']['total_irregularities'] > 0:
            print(f"\n⚠️  {results['comprehensive_report']['summary']['total_irregularities']} irregularities detected")
            exit(1)  # Exit with error code to indicate findings
        else:
            print("\n✅ No significant irregularities detected")
            exit(0)  # Exit successfully
            
    except KeyboardInterrupt:
        print("\n\n🛑 Audit interrupted by user")
        exit(1)
    except Exception as e:
        logging.error(f"❌ Audit failed with error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
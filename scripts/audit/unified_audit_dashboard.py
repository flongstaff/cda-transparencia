#!/usr/bin/env python3
"""
Unified Financial Audit Dashboard for Carmen de Areco
Combines salary analysis, infrastructure project tracking, and budget discrepancy detection
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import logging

# Local imports
from financial_irregularity_tracker import FinancialIrregularityTracker
from infrastructure_project_tracker import InfrastructureProjectTracker

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UnifiedAuditDashboard:
    """Unified dashboard for all financial audit activities"""
    
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.output_dir = self.data_dir / "dashboard"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.irregularity_tracker = FinancialIrregularityTracker(self.data_dir / "audit_irregularities")
        self.project_tracker = InfrastructureProjectTracker(self.data_dir / "infrastructure_tracking")
        
        # Database for consolidated findings
        self.db_path = self.output_dir / "dashboard.db"
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize SQLite database for dashboard data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables for consolidated dashboard data
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS dashboard_summary (
                id INTEGER PRIMARY KEY,
                report_date TEXT,
                total_irregularities INTEGER,
                high_salary_cases INTEGER,
                delayed_projects INTEGER,
                budget_discrepancies INTEGER,
                flagged_contractors INTEGER,
                total_tracked_projects INTEGER,
                total_budget_tracked REAL
            );
            
            CREATE TABLE IF NOT EXISTS key_findings (
                id INTEGER PRIMARY KEY,
                finding_type TEXT,
                severity TEXT,
                description TEXT,
                amount REAL,
                related_entity TEXT,
                evidence TEXT,
                report_date TEXT
            );
            
            CREATE TABLE IF NOT EXISTS contractor_risk (
                id INTEGER PRIMARY KEY,
                contractor_name TEXT,
                risk_score REAL,
                total_projects INTEGER,
                total_amount REAL,
                delay_rate REAL,
                high_budget_projects INTEGER
            );
        ''')
        
        conn.commit()
        conn.close()
    
    def consolidate_audit_findings(self) -> Dict:
        """Consolidate findings from all audit components"""
        logger.info("📊 Consolidating audit findings")
        
        # Run financial irregularity audit
        logger.info("🔍 Running financial irregularity audit")
        irregularity_results = self.irregularity_tracker.run_full_audit()
        
        # Run infrastructure project tracking
        logger.info("🏗️ Running infrastructure project tracking")
        project_results = self.project_tracker.run_full_tracking()
        
        # Consolidate findings
        consolidated = {
            'timestamp': datetime.now().isoformat(),
            'financial_irregularities': {
                'salary_irregularities': irregularity_results['salary_irregularities'],
                'budget_discrepancies': irregularity_results['budget_discrepancies'],
                'summary': {
                    'total_irregularities': len(irregularity_results['salary_irregularities']) + 
                                         len(irregularity_results['budget_discrepancies']),
                    'high_salary_cases': len(irregularity_results['salary_irregularities']),
                    'budget_discrepancies': len(irregularity_results['budget_discrepancies'])
                }
            },
            'infrastructure_projects': {
                'projects': project_results['projects'],
                'flags': project_results['flags'],
                'contractor_analysis': project_results['contractor_analysis'],
                'summary': {
                    'total_projects': len(project_results['projects']),
                    'flagged_projects': len(project_results['flags']),
                    'total_budget': sum(p.get('budgeted_amount', 0) for p in project_results['projects'])
                }
            },
            'key_findings': self._extract_key_findings(irregularity_results, project_results),
            'contractor_risk_analysis': self._analyze_contractor_risk(project_results['contractor_analysis'])
        }
        
        return consolidated
    
    def _extract_key_findings(self, irregularity_results: Dict, project_results: Dict) -> List[Dict]:
        """Extract key findings for dashboard display"""
        findings = []
        
        # High salary findings
        for irregularity in irregularity_results['salary_irregularities']:
            findings.append({
                'finding_type': 'High Salary',
                'severity': 'high',
                'description': f"{irregularity['official_name']} salary {irregularity['discrepancy_ratio']:.1f}x average",
                'amount': irregularity['declared_salary'],
                'related_entity': irregularity['official_name'],
                'evidence': irregularity['evidence']
            })
        
        # Budget discrepancy findings
        for discrepancy in irregularity_results['budget_discrepancies']:
            findings.append({
                'finding_type': 'Budget Discrepancy',
                'severity': 'medium',
                'description': f"{discrepancy['category']} {discrepancy['difference_percentage']:.1%} off budget",
                'amount': discrepancy['difference'],
                'related_entity': discrepancy['category'],
                'evidence': discrepancy['evidence']
            })
        
        # Project delay findings
        for flag in project_results['flags']:
            findings.append({
                'finding_type': 'Project Delay',
                'severity': flag['severity'],
                'description': flag['description'],
                'amount': flag['budgeted_amount'],
                'related_entity': flag['project_name'],
                'evidence': flag['description']
            })
        
        return findings
    
    def _analyze_contractor_risk(self, contractor_analysis: List[Dict]) -> List[Dict]:
        """Analyze contractor risk scores"""
        risk_analysis = []
        
        for contractor in contractor_analysis:
            # Calculate risk score (0-100)
            # Higher score = higher risk
            risk_score = 0
            
            # Risk factors:
            # 1. High delay rate (up to 50 points)
            delay_risk = min(50, contractor.get('delay_rate', 0) * 100)
            
            # 2. Low completion rate (up to 30 points)
            completion_risk = min(30, (1 - contractor.get('completion_rate', 1)) * 100)
            
            # 3. Very high total amount (up to 20 points)
            amount_risk = min(20, contractor['total_amount'] / 100000000)  # Normalize by 100M
            
            risk_score = delay_risk + completion_risk + amount_risk
            
            risk_entry = {
                'contractor_name': contractor['contractor_name'],
                'risk_score': risk_score,
                'total_projects': contractor['total_projects'],
                'total_amount': contractor['total_amount'],
                'delay_rate': contractor['delay_rate'],
                'completion_rate': contractor.get('completion_rate', 0)
            }
            
            risk_analysis.append(risk_entry)
        
        # Sort by risk score
        risk_analysis.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return risk_analysis
    
    def save_to_dashboard_db(self, consolidated_data: Dict):
        """Save consolidated data to dashboard database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Save summary
        summary = consolidated_data['financial_irregularities']['summary']
        infra_summary = consolidated_data['infrastructure_projects']['summary']
        
        cursor.execute('''
            INSERT INTO dashboard_summary 
            (report_date, total_irregularities, high_salary_cases, delayed_projects,
             budget_discrepancies, flagged_contractors, total_tracked_projects, total_budget_tracked)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            summary['total_irregularities'],
            summary['high_salary_cases'],
            infra_summary['flagged_projects'],
            summary['budget_discrepancies'],
            len([c for c in consolidated_data['contractor_risk_analysis'] if c['risk_score'] > 50]),
            infra_summary['total_projects'],
            infra_summary['total_budget']
        ))
        
        # Save key findings
        for finding in consolidated_data['key_findings']:
            cursor.execute('''
                INSERT INTO key_findings 
                (finding_type, severity, description, amount, related_entity, evidence, report_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                finding['finding_type'],
                finding['severity'],
                finding['description'],
                finding['amount'],
                finding['related_entity'],
                finding['evidence'],
                datetime.now().isoformat()
            ))
        
        # Save contractor risk analysis
        for contractor in consolidated_data['contractor_risk_analysis']:
            cursor.execute('''
                INSERT INTO contractor_risk 
                (contractor_name, risk_score, total_projects, total_amount, delay_rate, high_budget_projects)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                contractor['contractor_name'],
                contractor['risk_score'],
                contractor['total_projects'],
                contractor['total_amount'],
                contractor['delay_rate'],
                len([p for p in consolidated_data['infrastructure_projects']['projects'] 
                     if p.get('contractor') == contractor['contractor_name'] and 
                        p.get('budgeted_amount', 0) > 50000000])
            ))
        
        conn.commit()
        conn.close()
    
    def export_dashboard_data(self, consolidated_data: Dict) -> str:
        """Export dashboard data to JSON for frontend visualization"""
        # Add metadata
        dashboard_data = {
            'metadata': {
                'title': 'Carmen de Areco Financial Audit Dashboard',
                'generated_date': datetime.now().isoformat(),
                'period_covered': '2009-2025'
            },
            **consolidated_data
        }
        
        # Save to file
        output_file = self.output_dir / f"dashboard_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"💾 Dashboard data exported to {output_file}")
        return str(output_file)
    
    def generate_executive_summary(self, consolidated_data: Dict) -> Dict:
        """Generate executive summary for stakeholders"""
        fin_summary = consolidated_data['financial_irregularities']['summary']
        infra_summary = consolidated_data['infrastructure_projects']['summary']
        key_findings = consolidated_data['key_findings']
        contractor_risk = consolidated_data['contractor_risk_analysis']
        
        # High risk contractors
        high_risk_contractors = [c for c in contractor_risk if c['risk_score'] > 70]
        
        # Most significant findings
        significant_findings = sorted(key_findings, key=lambda x: x['amount'], reverse=True)[:5]
        
        executive_summary = {
            'report_date': datetime.now().isoformat(),
            'executive_summary': {
                'overview': f"""
CARMEN DE ARECO FINANCIAL AUDIT EXECUTIVE SUMMARY

This comprehensive audit identified {fin_summary['total_irregularities'] + infra_summary['flagged_projects']} 
key areas of concern in municipal financial operations, including high salary discrepancies, 
budget execution issues, and infrastructure project delays.
                """,
                'key_metrics': {
                    'high_salary_cases': fin_summary['high_salary_cases'],
                    'budget_discrepancies': fin_summary['budget_discrepancies'],
                    'delayed_projects': infra_summary['flagged_projects'],
                    'total_tracked_budget': f"ARS {infra_summary['total_budget']:,.0f}",
                    'high_risk_contractors': len(high_risk_contractors)
                },
                'major_findings': [
                    f"Identified {fin_summary['high_salary_cases']} officials with salaries significantly above peers",
                    f"Found {fin_summary['budget_discrepancies']} significant budget execution discrepancies",
                    f"Flagged {infra_summary['flagged_projects']} infrastructure projects with concerning delays",
                    f"{len(high_risk_contractors)} contractors identified with high risk profiles"
                ],
                'recommendations': [
                    "Implement salary benchmarking against peer municipalities",
                    "Establish project milestone-based payment schedules",
                    "Create contractor performance dashboard with public access",
                    "Require detailed justification for budget variances exceeding 10%",
                    "Conduct annual infrastructure project completion audits"
                ],
                'high_risk_entities': [
                    {
                        'type': 'contractor',
                        'name': contractor['contractor_name'],
                        'risk_score': contractor['risk_score'],
                        'description': f"High delay rate ({contractor['delay_rate']:.1%}) and {contractor['total_projects']} projects"
                    } for contractor in high_risk_contractors[:3]
                ],
                'significant_findings': [
                    {
                        'description': finding['description'],
                        'amount': f"ARS {finding['amount']:,.0f}",
                        'type': finding['finding_type']
                    } for finding in significant_findings
                ]
            }
        }
        
        # Save executive summary
        summary_file = self.output_dir / f"executive_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(executive_summary, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"📋 Executive summary generated: {summary_file}")
        return executive_summary
    
    def run_complete_dashboard(self, include_external_collection=True):
        \"\"\"Run complete unified audit dashboard\"\"\"
        logger.info(\"🏛️ Starting Carmen de Areco Unified Financial Audit Dashboard\")
        
        try:
            # 1. Consolidate all audit findings
            consolidated_data = self.consolidate_audit_findings()
            
            # 2. Enhanced external data collection if requested
            if include_external_collection:
                logger.info(\"🔄 Running enhanced external data collection...\")
                from enhanced_external_data_collector import EnhancedExternalDataCollector
                external_collector = EnhancedExternalDataCollector()
                external_results = external_collector.run_complete_collection()
                consolidated_data['external_data_collection'] = external_results
            
            # 3. Save to dashboard database
            self.save_to_dashboard_db(consolidated_data)
            
            # 4. Export dashboard data
            dashboard_file = self.export_dashboard_data(consolidated_data)
            
            # 5. Generate executive summary
            executive_summary = self.generate_executive_summary(consolidated_data)
            
            # 6. Print dashboard summary
            print(\"\\n\" + \"=\"*80)
            print(\"CARMEN DE ARECO UNIFIED FINANCIAL AUDIT DASHBOARD\")
            print(\"=\"*80)
            print(\"EXECUTIVE SUMMARY:\")
            print(\"-\"*80)
            
            summary = executive_summary['executive_summary']
            metrics = summary['key_metrics']
            
            print(f\"High Salary Cases:     {metrics['high_salary_cases']}\")
            print(f\"Budget Discrepancies:  {metrics['budget_discrepancies']}\")
            print(f\"Delayed Projects:      {metrics['delayed_projects']}\")
            print(f\"Total Tracked Budget:  {metrics['total_tracked_budget']}\")
            print(f\"High-Risk Contractors: {metrics['high_risk_contractors']}\")
            
            # Include external collection metrics if available
            if include_external_collection and 'external_data_collection' in consolidated_data:
                ext_results = consolidated_data['external_data_collection']
                print(f\"External Records:      {ext_results.get('total_records', 0)}\")
                print(f\"External Errors:       {ext_results.get('total_errors', 0)}\")
            
            print(\"\\nKEY RECOMMENDATIONS:\")
            print(\"-\"*80)
            for i, rec in enumerate(summary['recommendations'][:5], 1):
                print(f\"{i}. {rec}\")
            
            print(f\"\\nDetailed dashboard data exported to: {dashboard_file}\")
            print(\"=\"*80)
            
            return {
                'consolidated_data': consolidated_data,
                'dashboard_file': dashboard_file,
                'executive_summary': executive_summary
            }
            
        except Exception as e:
            logger.error(f\"Error running unified dashboard: {e}\")
            raise

if __name__ == "__main__":
    # Initialize dashboard
    dashboard = UnifiedAuditDashboard()
    
    # Run complete dashboard
    try:
        results = dashboard.run_complete_dashboard()
        print("\n✅ Unified audit dashboard completed successfully")
        exit(0)
    except Exception as e:
        logger.error(f"❌ Dashboard execution failed: {e}")
        exit(1)
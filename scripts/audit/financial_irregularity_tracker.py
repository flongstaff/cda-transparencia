#!/usr/bin/env python3
"""
Financial Irregularity Tracker for Carmen de Areco
Specifically tracks high salaries, delayed infrastructure projects, and spending discrepancies
"""

import requests
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import sqlite3
import re
import logging
from typing import Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FinancialIrregularityTracker:
    """Tracks specific financial irregularities in Carmen de Areco municipal operations"""
    
    def __init__(self, output_dir="data/audit_irregularities"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # API endpoints
        self.api_base = "http://localhost:3001/api"
        
        # Thresholds for irregularity detection
        self.thresholds = {
            'high_salary_multiplier': 5,  # Salary 5x higher than average
            'delayed_project_payment_days': 90,  # Payment 90+ days before completion
            'budget_execution_threshold': 0.20,  # 20% difference between budgeted/actual
            'missing_completion_days': 365  # Project incomplete 1+ year after budgeting
        }
        
        # Database for tracking findings
        self.db_path = self.output_dir / "irregularities.db"
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize SQLite database for irregularity tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables for tracking irregularities
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS salary_irregularities (
                id INTEGER PRIMARY KEY,
                official_name TEXT,
                role TEXT,
                declared_salary REAL,
                estimated_fair_salary REAL,
                discrepancy_ratio REAL,
                year INTEGER,
                detection_date TEXT,
                evidence TEXT
            );
            
            CREATE TABLE IF NOT EXISTS project_irregularities (
                id INTEGER PRIMARY KEY,
                project_name TEXT,
                budgeted_amount REAL,
                actual_spent REAL,
                payment_date TEXT,
                scheduled_completion TEXT,
                actual_completion TEXT,
                delay_days INTEGER,
                irregularity_type TEXT,
                detection_date TEXT,
                evidence TEXT
            );
            
            CREATE TABLE IF NOT EXISTS budget_discrepancies (
                id INTEGER PRIMARY KEY,
                category TEXT,
                budgeted_amount REAL,
                actual_spent REAL,
                difference REAL,
                difference_percentage REAL,
                year INTEGER,
                detection_date TEXT,
                evidence TEXT
            );
            
            CREATE TABLE IF NOT EXISTS audit_reports (
                id INTEGER PRIMARY KEY,
                report_date TEXT,
                total_irregularities INTEGER,
                salary_irregularities INTEGER,
                project_irregularities INTEGER,
                budget_discrepancies INTEGER,
                summary TEXT
            );
        ''')
        
        conn.commit()
        conn.close()
    
    def fetch_salary_data(self) -> List[Dict]:
        """Fetch salary data from API"""
        try:
            response = requests.get(f"{self.api_base}/salaries")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch salary data: {e}")
            return []
    
    def fetch_contract_data(self) -> List[Dict]:
        """Fetch contract/public tender data from API"""
        try:
            response = requests.get(f"{self.api_base}/tenders")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch contract data: {e}")
            return []
    
    def fetch_budget_data(self) -> List[Dict]:
        """Fetch budget/financial report data from API"""
        try:
            response = requests.get(f"{self.api_base}/reports")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch budget data: {e}")
            return []
    
    def detect_high_salary_irregularities(self) -> List[Dict]:
        """Detect officials with disproportionately high salaries"""
        logger.info("🔍 Detecting high salary irregularities")
        
        salaries = self.fetch_salary_data()
        if not salaries:
            return []
        
        # Convert to DataFrame for easier analysis
        df = pd.DataFrame(salaries)
        
        # Calculate average salary by role category
        df['role_category'] = df['role'].apply(lambda x: self._categorize_role(x))
        avg_salaries = df.groupby('role_category')['basic_salary'].mean().to_dict()
        
        irregularities = []
        
        for _, salary in df.iterrows():
            role_category = salary['role_category']
            declared_salary = salary['basic_salary']
            
            if role_category in avg_salaries:
                avg_salary = avg_salaries[role_category]
                if avg_salary > 0:
                    discrepancy_ratio = declared_salary / avg_salary
                    
                    if discrepancy_ratio > self.thresholds['high_salary_multiplier']:
                        irregularity = {
                            'official_name': salary['official_name'],
                            'role': salary['role'],
                            'declared_salary': declared_salary,
                            'estimated_fair_salary': avg_salary,
                            'discrepancy_ratio': discrepancy_ratio,
                            'year': salary['year'],
                            'detection_date': datetime.now().isoformat(),
                            'evidence': f"Salary {discrepancy_ratio:.1f}x higher than average for {role_category} roles"
                        }
                        
                        irregularities.append(irregularity)
                        logger.warning(f"High salary detected: {salary['official_name']} - {discrepancy_ratio:.1f}x average")
        
        return irregularities
    
    def _categorize_role(self, role: str) -> str:
        """Categorize roles for salary comparison"""
        role = role.lower()
        if 'intendente' in role:
            return 'executive'
        elif 'secretario' in role or 'director' in role:
            return 'senior_admin'
        elif 'coordinador' in role or 'jefe' in role:
            return 'mid_admin'
        else:
            return 'general_staff'
    
    def detect_project_irregularities(self) -> List[Dict]:
        """Detect irregularities in infrastructure projects"""
        logger.info("🏗️ Detecting project irregularities")
        
        contracts = self.fetch_contract_data()
        if not contracts:
            return []
        
        irregularities = []
        
        for contract in contracts:
            # Check for delayed projects with early payments
            award_date = contract.get('award_date')
            completion_date = contract.get('completion_date') or contract.get('expected_completion')
            
            if award_date and completion_date:
                try:
                    award_dt = datetime.fromisoformat(award_date.replace('Z', '+00:00'))
                    completion_dt = datetime.fromisoformat(completion_date.replace('Z', '+00:00'))
                    
                    # Calculate delay
                    delay_days = (completion_dt - award_dt).days
                    
                    # Check if payment was made significantly before completion
                    if delay_days > self.thresholds['delayed_project_payment_days']:
                        irregularity = {
                            'project_name': contract.get('title', 'Unknown Project'),
                            'budgeted_amount': contract.get('budget', 0),
                            'actual_spent': contract.get('actual_cost', contract.get('budget', 0)),
                            'payment_date': award_date,
                            'scheduled_completion': completion_date,
                            'actual_completion': completion_date,  # Assuming same for now
                            'delay_days': delay_days,
                            'irregularity_type': 'delayed_completion',
                            'detection_date': datetime.now().isoformat(),
                            'evidence': f"Project delayed by {delay_days} days with early payment"
                        }
                        
                        irregularities.append(irregularity)
                        logger.warning(f"Delayed project detected: {contract.get('title')} - {delay_days} days delay")
                except Exception as e:
                    logger.debug(f"Could not parse dates for contract {contract.get('id')}: {e}")
        
        return irregularities
    
    def detect_budget_discrepancies(self) -> List[Dict]:
        """Detect discrepancies between budgeted and actual spending"""
        logger.info("💰 Detecting budget discrepancies")
        
        reports = self.fetch_budget_data()
        if not reports:
            return []
        
        # Group by category and year for comparison
        df = pd.DataFrame(reports)
        
        discrepancies = []
        
        for _, report in df.iterrows():
            planned_income = report.get('planned_income', 0)
            actual_income = report.get('income', 0)
            
            planned_expenses = report.get('planned_expenses', 0)
            actual_expenses = report.get('expenses', 0)
            
            # Check income discrepancies
            if planned_income > 0:
                income_diff = abs(actual_income - planned_income)
                income_diff_pct = income_diff / planned_income
                
                if income_diff_pct > self.thresholds['budget_execution_threshold']:
                    discrepancy = {
                        'category': 'Income',
                        'budgeted_amount': planned_income,
                        'actual_spent': actual_income,
                        'difference': income_diff,
                        'difference_percentage': income_diff_pct,
                        'year': report.get('year', 0),
                        'detection_date': datetime.now().isoformat(),
                        'evidence': f"Income {income_diff_pct:.1%} different from planned"
                    }
                    
                    discrepancies.append(discrepancy)
                    logger.warning(f"Income discrepancy detected: {income_diff_pct:.1%} difference")
            
            # Check expense discrepancies
            if planned_expenses > 0:
                expense_diff = abs(actual_expenses - planned_expenses)
                expense_diff_pct = expense_diff / planned_expenses
                
                if expense_diff_pct > self.thresholds['budget_execution_threshold']:
                    discrepancy = {
                        'category': 'Expenses',
                        'budgeted_amount': planned_expenses,
                        'actual_spent': actual_expenses,
                        'difference': expense_diff,
                        'difference_percentage': expense_diff_pct,
                        'year': report.get('year', 0),
                        'detection_date': datetime.now().isoformat(),
                        'evidence': f"Expenses {expense_diff_pct:.1%} different from planned"
                    }
                    
                    discrepancies.append(discrepancy)
                    logger.warning(f"Expense discrepancy detected: {expense_diff_pct:.1%} difference")
        
        return discrepancies
    
    def save_irregularities_to_db(self, salary_irregularities: List[Dict], 
                                 project_irregularities: List[Dict], 
                                 budget_discrepancies: List[Dict]):
        """Save detected irregularities to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Save salary irregularities
        for irregularity in salary_irregularities:
            cursor.execute('''
                INSERT INTO salary_irregularities 
                (official_name, role, declared_salary, estimated_fair_salary, 
                 discrepancy_ratio, year, detection_date, evidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                irregularity['official_name'],
                irregularity['role'],
                irregularity['declared_salary'],
                irregularity['estimated_fair_salary'],
                irregularity['discrepancy_ratio'],
                irregularity['year'],
                irregularity['detection_date'],
                irregularity['evidence']
            ))
        
        # Save project irregularities
        for irregularity in project_irregularities:
            cursor.execute('''
                INSERT INTO project_irregularities 
                (project_name, budgeted_amount, actual_spent, payment_date,
                 scheduled_completion, actual_completion, delay_days, 
                 irregularity_type, detection_date, evidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                irregularity['project_name'],
                irregularity['budgeted_amount'],
                irregularity['actual_spent'],
                irregularity['payment_date'],
                irregularity['scheduled_completion'],
                irregularity['actual_completion'],
                irregularity['delay_days'],
                irregularity['irregularity_type'],
                irregularity['detection_date'],
                irregularity['evidence']
            ))
        
        # Save budget discrepancies
        for discrepancy in budget_discrepancies:
            cursor.execute('''
                INSERT INTO budget_discrepancies 
                (category, budgeted_amount, actual_spent, difference,
                 difference_percentage, year, detection_date, evidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                discrepancy['category'],
                discrepancy['budgeted_amount'],
                discrepancy['actual_spent'],
                discrepancy['difference'],
                discrepancy['difference_percentage'],
                discrepancy['year'],
                discrepancy['detection_date'],
                discrepancy['evidence']
            ))
        
        conn.commit()
        conn.close()
    
    def generate_audit_report(self, salary_irregularities: List[Dict], 
                             project_irregularities: List[Dict], 
                             budget_discrepancies: List[Dict]) -> Dict:
        """Generate comprehensive audit report"""
        total_irregularities = len(salary_irregularities) + len(project_irregularities) + len(budget_discrepancies)
        
        summary = f"""
CARMEN DE ARECO FINANCIAL IRREGULARITY REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

SUMMARY:
- Total Irregularities Detected: {total_irregularities}
- High Salary Cases: {len(salary_irregularities)}
- Project Delays: {len(project_irregularities)}
- Budget Discrepancies: {len(budget_discrepancies)}

KEY FINDINGS:
"""
        
        # Add key findings
        if salary_irregularities:
            summary += "\nHigh Salary Irregularities:\n"
            for irregularity in salary_irregularities[:3]:  # Top 3
                summary += f"- {irregularity['official_name']} ({irregularity['role']}): "
                summary += f"Salary {irregularity['discrepancy_ratio']:.1f}x higher than average\n"
        
        if project_irregularities:
            summary += "\nDelayed Infrastructure Projects:\n"
            for irregularity in project_irregularities[:3]:  # Top 3
                summary += f"- {irregularity['project_name']}: Delayed by {irregularity['delay_days']} days\n"
        
        if budget_discrepancies:
            summary += "\nSignificant Budget Discrepancies:\n"
            for discrepancy in budget_discrepancies[:3]:  # Top 3
                summary += f"- {discrepancy['category']} ({discrepancy['year']}): "
                summary += f"{discrepancy['difference_percentage']:.1%} difference\n"
        
        report = {
            'report_date': datetime.now().isoformat(),
            'total_irregularities': total_irregularities,
            'salary_irregularities': len(salary_irregularities),
            'project_irregularities': len(project_irregularities),
            'budget_discrepancies': len(budget_discrepancies),
            'summary': summary.strip()
        }
        
        # Save to database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO audit_reports 
            (report_date, total_irregularities, salary_irregularities, 
             project_irregularities, budget_discrepancies, summary)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            report['report_date'],
            report['total_irregularities'],
            report['salary_irregularities'],
            report['project_irregularities'],
            report['budget_discrepancies'],
            report['summary']
        ))
        conn.commit()
        conn.close()
        
        return report
    
    def export_findings_to_json(self, salary_irregularities: List[Dict], 
                               project_irregularities: List[Dict], 
                               budget_discrepancies: List[Dict],
                               audit_report: Dict):
        """Export findings to JSON for frontend visualization"""
        findings = {
            'timestamp': datetime.now().isoformat(),
            'salary_irregularities': salary_irregularities,
            'project_irregularities': project_irregularities,
            'budget_discrepancies': budget_discrepancies,
            'audit_report': audit_report
        }
        
        output_file = self.output_dir / f"irregularities_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(findings, f, ensure_ascii=False, indent=2)
        
        logger.info(f"🔍 Audit findings exported to {output_file}")
        return output_file
    
    def run_full_audit(self):
        """Run complete financial irregularity audit"""
        logger.info("🏛️ Starting Carmen de Areco Financial Irregularity Audit")
        
        # 1. Detect high salary irregularities
        salary_irregularities = self.detect_high_salary_irregularities()
        
        # 2. Detect project irregularities
        project_irregularities = self.detect_project_irregularities()
        
        # 3. Detect budget discrepancies
        budget_discrepancies = self.detect_budget_discrepancies()
        
        # 4. Save to database
        self.save_irregularities_to_db(salary_irregularities, project_irregularities, budget_discrepancies)
        
        # 5. Generate audit report
        audit_report = self.generate_audit_report(salary_irregularities, project_irregularities, budget_discrepancies)
        
        # 6. Export findings
        output_file = self.export_findings_to_json(salary_irregularities, project_irregularities, 
                                                  budget_discrepancies, audit_report)
        
        # 7. Print summary
        print("\n" + "="*70)
        print("CARMEN DE ARECO FINANCIAL IRREGULARITY AUDIT RESULTS")
        print("="*70)
        print(audit_report['summary'])
        print("\nDetailed findings saved to:", output_file)
        print("="*70)
        
        return {
            'salary_irregularities': salary_irregularities,
            'project_irregularities': project_irregularities,
            'budget_discrepancies': budget_discrepancies,
            'audit_report': audit_report,
            'output_file': str(output_file)
        }

if __name__ == "__main__":
    # Initialize tracker
    tracker = FinancialIrregularityTracker()
    
    # Run full audit
    results = tracker.run_full_audit()
    
    # Exit with appropriate code
    if results['audit_report']['total_irregularities'] > 0:
        print(f"\n⚠️  {results['audit_report']['total_irregularities']} irregularities detected")
        exit(1)  # Exit with error code to indicate findings
    else:
        print("\n✅ No significant irregularities detected")
        exit(0)  # Exit successfully
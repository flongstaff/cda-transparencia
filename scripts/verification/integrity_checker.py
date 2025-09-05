#!/usr/bin/env python3
"""
Integrity Checker - Detects irregularities and potential unlawful actions
Ensures transparency portal displays truthful information and flags suspicious patterns
"""

import re
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd

class IntegrityChecker:
    def __init__(self):
        self.alerts = []
        self.irregularities = []
        self.transparency_score = 0
        
        # Legal compliance patterns for Argentina
        self.legal_patterns = {
            "salary_limits": {
                "intendente_max_multiplier": 10,  # Maximum salary ratio vs minimum wage
                "description": "Ley 25.725 - Límites salariales funcionarios"
            },
            "contract_thresholds": {
                "licitacion_publica_min": 1000000,  # Minimum for public bidding (ARS)
                "description": "Régimen de Contrataciones Públicas - Decreto 1023/01"
            },
            "budget_disclosure": {
                "required_categories": ["Personal", "Bienes", "Servicios", "Transferencias"],
                "description": "Ley 24156 - Administración Financiera"
            },
            "declaration_requirements": {
                "officials_must_declare": ["Intendente", "Secretarios", "Directores"],
                "description": "Ley 25.188 - Ética en el Ejercicio de la Función Pública"
            }
        }
        
        # Red flags that could indicate irregularities
        self.red_flags = {
            "salary_anomalies": [
                r"ajuste.*(\d+)%.*mes",  # Unusual salary adjustments
                r"plus.*no.*remunerativo",  # Non-remunerative bonuses (tax avoidance)
                r"viático.*(\d+)",  # Excessive travel allowances
            ],
            "contract_irregularities": [
                r"adjudicat.*direct.*sin.*licitación",  # Direct awards without bidding
                r"ampliación.*contrato.*(\d+)%",  # Suspicious contract amendments
                r"proveedor.*único",  # Sole provider justifications
            ],
            "budget_concerns": [
                r"modificación.*presupuestaria.*(\d+)%",  # Large budget modifications
                r"transferencia.*partida",  # Budget line transfers
                r"gasto.*reservado",  # Reserved/secret expenses
            ],
            "transparency_violations": [
                r"información.*no.*disponible",  # Information not available
                r"documento.*faltante",  # Missing documents
                r"acceso.*restringido",  # Restricted access
            ]
        }

    def check_salary_compliance(self, salary_data: List[Dict]) -> Dict[str, Any]:
        """Check salary data for legal compliance and irregularities"""
        issues = []
        warnings = []
        
        if not salary_data:
            return {"status": "error", "message": "No salary data available"}
        
        try:
            # Convert to DataFrame for analysis
            df = pd.DataFrame(salary_data)
            
            # Check for salary caps compliance
            if 'net_salary' in df.columns and 'role' in df.columns:
                # Find intendente salary
                intendente_salaries = df[df['role'].str.contains('Intendente', case=False, na=False)]
                
                if not intendente_salaries.empty:
                    max_intendente_salary = intendente_salaries['net_salary'].astype(float).max()
                    min_salary = df['net_salary'].astype(float).min()
                    
                    # Check ratio vs minimum wage (approximate)
                    salario_minimo_2024 = 234315  # Argentina minimum wage 2024
                    ratio = max_intendente_salary / salario_minimo_2024
                    
                    if ratio > self.legal_patterns["salary_limits"]["intendente_max_multiplier"]:
                        issues.append({
                            "type": "SALARY_VIOLATION",
                            "severity": "HIGH",
                            "description": f"Intendente salary {ratio:.1f}x minimum wage (legal limit: {self.legal_patterns['salary_limits']['intendente_max_multiplier']}x)",
                            "amount": max_intendente_salary,
                            "legal_reference": self.legal_patterns["salary_limits"]["description"]
                        })
                
                # Check for unusual salary patterns
                salary_std = df['net_salary'].astype(float).std()
                salary_mean = df['net_salary'].astype(float).mean()
                
                for _, row in df.iterrows():
                    salary = float(row['net_salary'])
                    if salary > salary_mean + (3 * salary_std):
                        warnings.append({
                            "type": "SALARY_ANOMALY",
                            "severity": "MEDIUM",
                            "description": f"Unusually high salary: {row['official_name']} - ${salary:,.2f}",
                            "person": row['official_name'],
                            "role": row['role']
                        })
            
            # Check for red flag patterns in salary descriptions
            for _, row in df.iterrows():
                adjustments = str(row.get('adjustments', ''))
                for pattern in self.red_flags["salary_anomalies"]:
                    if re.search(pattern, adjustments, re.IGNORECASE):
                        warnings.append({
                            "type": "SALARY_RED_FLAG",
                            "severity": "MEDIUM",
                            "description": f"Suspicious adjustment pattern: {adjustments}",
                            "person": row.get('official_name', 'Unknown'),
                            "pattern": pattern
                        })
            
            return {
                "status": "analyzed",
                "total_records": len(df),
                "issues": issues,
                "warnings": warnings,
                "compliance_score": max(0, 100 - len(issues) * 20 - len(warnings) * 5)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def check_contract_compliance(self, contract_data: List[Dict]) -> Dict[str, Any]:
        """Check contracts for bidding compliance and irregularities"""
        issues = []
        warnings = []
        
        if not contract_data:
            return {"status": "error", "message": "No contract data available"}
        
        try:
            df = pd.DataFrame(contract_data)
            
            # Check for public bidding requirements
            if 'budget' in df.columns:
                threshold = self.legal_patterns["contract_thresholds"]["licitacion_publica_min"]
                
                for _, row in df.iterrows():
                    budget = float(row.get('budget', 0))
                    title = str(row.get('title', ''))
                    status = str(row.get('execution_status', ''))
                    
                    if budget > threshold:
                        # High-value contracts should have public bidding
                        if 'licitación' not in title.lower() and 'concurso' not in title.lower():
                            issues.append({
                                "type": "BIDDING_VIOLATION",
                                "severity": "HIGH",
                                "description": f"High-value contract without public bidding: ${budget:,.2f}",
                                "contract": title,
                                "amount": budget,
                                "legal_reference": self.legal_patterns["contract_thresholds"]["description"]
                            })
                    
                    # Check for red flag patterns
                    full_text = f"{title} {row.get('description', '')} {status}"
                    for pattern in self.red_flags["contract_irregularities"]:
                        if re.search(pattern, full_text, re.IGNORECASE):
                            warnings.append({
                                "type": "CONTRACT_RED_FLAG",
                                "severity": "MEDIUM",
                                "description": f"Suspicious pattern in contract: {title}",
                                "contract": title,
                                "pattern": pattern,
                                "amount": budget
                            })
            
            # Check for concentration of contracts with single providers
            if 'awarded_to' in df.columns:
                provider_counts = df['awarded_to'].value_counts()
                total_contracts = len(df)
                
                for provider, count in provider_counts.items():
                    if count > total_contracts * 0.3:  # More than 30% to single provider
                        warnings.append({
                            "type": "PROVIDER_CONCENTRATION",
                            "severity": "MEDIUM",
                            "description": f"High concentration: {provider} has {count}/{total_contracts} contracts ({count/total_contracts*100:.1f}%)",
                            "provider": provider,
                            "contract_count": count
                        })
            
            return {
                "status": "analyzed",
                "total_records": len(df),
                "issues": issues,
                "warnings": warnings,
                "compliance_score": max(0, 100 - len(issues) * 25 - len(warnings) * 10)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def check_budget_transparency(self, budget_data: List[Dict]) -> Dict[str, Any]:
        """Check budget data for transparency and compliance"""
        issues = []
        warnings = []
        
        if not budget_data:
            return {"status": "error", "message": "No budget data available"}
        
        try:
            df = pd.DataFrame(budget_data)
            
            # Check for required budget categories
            required_cats = self.legal_patterns["budget_disclosure"]["required_categories"]
            
            if 'category' in df.columns:
                available_cats = df['category'].unique()
                missing_cats = [cat for cat in required_cats if not any(cat.lower() in str(avail).lower() for avail in available_cats)]
                
                if missing_cats:
                    issues.append({
                        "type": "BUDGET_DISCLOSURE_VIOLATION",
                        "severity": "HIGH",
                        "description": f"Missing required budget categories: {missing_cats}",
                        "missing_categories": missing_cats,
                        "legal_reference": self.legal_patterns["budget_disclosure"]["description"]
                    })
            
            # Check for large budget modifications
            if 'execution_percentage' in df.columns:
                for _, row in df.iterrows():
                    exec_pct = float(row.get('execution_percentage', 100))
                    if exec_pct > 150:  # More than 50% over budget
                        warnings.append({
                            "type": "BUDGET_OVERRUN",
                            "severity": "HIGH",
                            "description": f"Significant budget overrun: {exec_pct:.1f}% executed",
                            "item": row.get('report_type', 'Unknown'),
                            "percentage": exec_pct
                        })
                    elif exec_pct < 50:  # Less than 50% executed
                        warnings.append({
                            "type": "BUDGET_UNDEREXECUTION",
                            "severity": "MEDIUM",
                            "description": f"Low budget execution: {exec_pct:.1f}% executed",
                            "item": row.get('report_type', 'Unknown'),
                            "percentage": exec_pct
                        })
            
            return {
                "status": "analyzed",
                "total_records": len(df),
                "issues": issues,
                "warnings": warnings,
                "compliance_score": max(0, 100 - len(issues) * 30 - len(warnings) * 5)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def generate_integrity_report(self, all_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Generate comprehensive integrity and compliance report"""
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "municipality": "Carmen de Areco",
            "analysis": {},
            "overall_assessment": {},
            "legal_compliance": {},
            "recommendations": []
        }
        
        # Analyze each data type
        if "salaries" in all_data:
            report["analysis"]["salaries"] = self.check_salary_compliance(all_data["salaries"])
            
        if "contracts" in all_data:
            report["analysis"]["contracts"] = self.check_contract_compliance(all_data["contracts"])
            
        if "budget" in all_data:
            report["analysis"]["budget"] = self.check_budget_transparency(all_data["budget"])
        
        # Calculate overall scores
        all_issues = []
        all_warnings = []
        compliance_scores = []
        
        for analysis in report["analysis"].values():
            if analysis.get("status") == "analyzed":
                all_issues.extend(analysis.get("issues", []))
                all_warnings.extend(analysis.get("warnings", []))
                compliance_scores.append(analysis.get("compliance_score", 0))
        
        # Overall assessment
        avg_compliance = sum(compliance_scores) / len(compliance_scores) if compliance_scores else 0
        
        report["overall_assessment"] = {
            "transparency_score": avg_compliance,
            "total_issues": len(all_issues),
            "total_warnings": len(all_warnings),
            "risk_level": "HIGH" if all_issues else "MEDIUM" if all_warnings else "LOW",
            "requires_investigation": len([i for i in all_issues if i.get("severity") == "HIGH"]) > 0
        }
        
        # Legal compliance summary
        report["legal_compliance"] = {
            "salary_compliance": "VIOLATED" if any(i.get("type") == "SALARY_VIOLATION" for i in all_issues) else "COMPLIANT",
            "contract_compliance": "VIOLATED" if any(i.get("type") == "BIDDING_VIOLATION" for i in all_issues) else "COMPLIANT", 
            "budget_transparency": "VIOLATED" if any(i.get("type") == "BUDGET_DISCLOSURE_VIOLATION" for i in all_issues) else "COMPLIANT"
        }
        
        # Generate recommendations
        if all_issues:
            report["recommendations"].append("🚨 URGENT: Legal violations detected - requires immediate investigation")
        if all_warnings:
            report["recommendations"].append("⚠️ Irregularities detected - recommend detailed review")
        if avg_compliance < 70:
            report["recommendations"].append("📊 Transparency score below acceptable threshold - improve disclosure")
        
        report["recommendations"].append("✅ Continue regular monitoring and public disclosure")
        report["recommendations"].append("📋 Implement automated alerts for future irregularities")
        
        return report

if __name__ == "__main__":
    checker = IntegrityChecker()
    
    # This would be called with real data from the API
    sample_data = {
        "salaries": [{"official_name": "Test", "role": "Intendente", "net_salary": "5000000"}],
        "contracts": [{"title": "Test Contract", "budget": "2000000", "awarded_to": "Test Provider"}],
        "budget": [{"category": "Personal", "execution_percentage": "95"}]
    }
    
    report = checker.generate_integrity_report(sample_data)
    print(json.dumps(report, indent=2, ensure_ascii=False))
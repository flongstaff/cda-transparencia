#!/usr/bin/env python3
"""
Anomaly Detection and Network Analysis System
Implements corruption pattern detection using network analysis approach
Based on Neo4j methodology from the comprehensive resource document
"""

import pandas as pd
import networkx as nx
import numpy as np
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging
from collections import defaultdict, Counter
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import warnings

warnings.filterwarnings('ignore')

class AnomalyDetectionSystem:
    def __init__(self):
        self.data_dir = Path("data/anomaly_detection")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Network graph for relationship analysis
        self.network_graph = nx.DiGraph()
        
        # Anomaly detection thresholds
        self.thresholds = self._setup_anomaly_thresholds()
        
        # Suspicious patterns definitions
        self.suspicious_patterns = self._setup_suspicious_patterns()
        
    def _setup_anomaly_thresholds(self):
        """Setup statistical thresholds for anomaly detection"""
        return {
            "vendor_concentration": {
                "high_risk": 0.6,  # Single vendor >60% of category spending
                "medium_risk": 0.4,
                "low_risk": 0.25
            },
            "amount_clustering": {
                "round_number_threshold": 0.3,  # >30% round numbers suspicious
                "duplicate_amount_threshold": 0.15,  # >15% duplicate amounts
                "just_under_threshold": 0.05  # Amounts just under legal thresholds
            },
            "timing_patterns": {
                "year_end_rush": 0.4,  # >40% of spending in December
                "weekend_payments": 0.05,  # >5% payments on weekends
                "holiday_payments": 0.02   # >2% payments on holidays
            },
            "relationship_patterns": {
                "circular_payments": 2,  # Max 2 degrees of circular payments
                "vendor_employee_overlap": 0.1,  # >10% name/address overlap
                "new_vendor_large_contract": 100000  # New vendor with >$100k first contract
            },
            "statistical": {
                "z_score_threshold": 3.0,  # Statistical outliers
                "iqr_multiplier": 1.5,     # Interquartile range outliers
                "benford_deviation": 0.1   # Benford's Law deviation threshold
            }
        }
    
    def _setup_suspicious_patterns(self):
        """Define patterns that indicate potential corruption"""
        return {
            "vendor_patterns": [
                "same_vendor_multiple_contracts_same_day",
                "vendor_address_matches_employee_address", 
                "vendor_incorporated_just_before_contract",
                "vendor_wins_all_bids_in_category",
                "vendor_name_similar_to_existing_approved_vendor"
            ],
            "amount_patterns": [
                "amounts_just_under_bidding_thresholds",
                "excessive_round_numbers",
                "duplicate_amounts_different_vendors",
                "amounts_violate_benfords_law",
                "unexplained_budget_increases"
            ],
            "timing_patterns": [
                "year_end_spending_rush",
                "pre_election_spending_spikes",
                "weekend_holiday_approvals",
                "contract_modifications_after_election",
                "payments_faster_than_normal_processing"
            ],
            "network_patterns": [
                "circular_payment_loops",
                "shell_company_networks", 
                "vendor_employee_relationships",
                "subcontracting_back_to_municipality_employees",
                "family_member_vendor_relationships"
            ]
        }
    
    def load_financial_data(self, data_sources: List[str]) -> pd.DataFrame:
        """Load and combine financial data from various sources"""
        self.logger.info("📊 Loading financial data for analysis...")
        
        combined_data = []
        
        for source in data_sources:
            try:
                if source.endswith('.json'):
                    with open(source, 'r') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            df = pd.DataFrame(data)
                        else:
                            df = pd.json_normalize(data)
                elif source.endswith('.csv'):
                    df = pd.read_csv(source)
                elif source.endswith('.xlsx'):
                    df = pd.read_excel(source)
                else:
                    continue
                
                df['data_source'] = source
                combined_data.append(df)
                
            except Exception as e:
                self.logger.error(f"Error loading {source}: {e}")
        
        if combined_data:
            return pd.concat(combined_data, ignore_index=True, sort=False)
        else:
            # Return sample data for testing
            return self._generate_sample_financial_data()
    
    def _generate_sample_financial_data(self) -> pd.DataFrame:
        """Generate sample financial data for testing"""
        np.random.seed(42)
        
        vendors = [
            "CONSTRUCCIONES SRL", "SERVICIOS MUNICIPALES SA", "OBRAS VIALES LTDA",
            "MANTENIMIENTO INTEGRAL", "SUMINISTROS GENERALES", "TRANSPORTES UNIDOS",
            "LIMPIEZA TOTAL SRL", "SEGURIDAD PRIVADA SA", "CONSULTORES ASOCIADOS"
        ]
        
        categories = [
            "OBRAS PUBLICAS", "SERVICIOS", "SUMINISTROS", "MANTENIMIENTO",
            "CONSULTORIA", "TRANSPORTE", "SEGURIDAD", "LIMPIEZA"
        ]
        
        data = []
        for i in range(500):
            # Introduce some suspicious patterns
            vendor = np.random.choice(vendors)
            category = np.random.choice(categories)
            
            # Normal amounts with some suspicious ones
            if np.random.random() < 0.1:  # 10% suspicious amounts
                amount = np.random.choice([50000, 100000, 250000, 500000])  # Round numbers
            else:
                amount = np.random.normal(75000, 25000)
                amount = max(1000, amount)
            
            # Date patterns
            if np.random.random() < 0.3:  # 30% December payments (suspicious)
                month = 12
            else:
                month = np.random.randint(1, 12)
            
            day = np.random.randint(1, 29)
            year = np.random.choice([2022, 2023, 2024])
            
            data.append({
                'vendor': vendor,
                'category': category,
                'amount': round(amount, 2),
                'date': f"{year}-{month:02d}-{day:02d}",
                'contract_id': f"CONT-{i:04d}",
                'description': f"Servicios de {category.lower()}",
                'payment_method': np.random.choice(['TRANSFERENCIA', 'CHEQUE', 'EFECTIVO']),
                'department': np.random.choice(['OBRAS', 'SERVICIOS', 'ADMINISTRACION']),
                'approved_by': np.random.choice(['INTENDENTE', 'SECRETARIO', 'JEFE_AREA'])
            })
        
        return pd.DataFrame(data)
    
    def detect_vendor_concentration_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect suspicious vendor concentration patterns"""
        self.logger.info("🔍 Analyzing vendor concentration patterns...")
        
        anomalies = {
            "high_concentration_categories": [],
            "dominant_vendors": [],
            "herfindahl_index": {}
        }
        
        # Analyze by category
        for category in df['category'].unique():
            category_data = df[df['category'] == category]
            vendor_spending = category_data.groupby('vendor')['amount'].sum().sort_values(ascending=False)
            
            if len(vendor_spending) > 1:
                total_spending = vendor_spending.sum()
                top_vendor_share = vendor_spending.iloc[0] / total_spending
                
                # Calculate Herfindahl-Hirschman Index
                hhi = sum((spending / total_spending) ** 2 for spending in vendor_spending)
                anomalies["herfindahl_index"][category] = round(hhi, 3)
                
                # Check concentration thresholds
                if top_vendor_share > self.thresholds["vendor_concentration"]["high_risk"]:
                    anomalies["high_concentration_categories"].append({
                        "category": category,
                        "top_vendor": vendor_spending.index[0],
                        "concentration": round(top_vendor_share, 3),
                        "total_spending": total_spending,
                        "hhi": round(hhi, 3),
                        "risk_level": "HIGH"
                    })
                elif top_vendor_share > self.thresholds["vendor_concentration"]["medium_risk"]:
                    anomalies["high_concentration_categories"].append({
                        "category": category,
                        "top_vendor": vendor_spending.index[0],
                        "concentration": round(top_vendor_share, 3),
                        "total_spending": total_spending,
                        "hhi": round(hhi, 3),
                        "risk_level": "MEDIUM"
                    })
        
        # Find vendors dominating multiple categories
        vendor_categories = df.groupby('vendor')['category'].nunique()
        vendor_total = df.groupby('vendor')['amount'].sum()
        
        for vendor in vendor_categories[vendor_categories > 2].index:
            if vendor_total[vendor] > df['amount'].quantile(0.9):
                anomalies["dominant_vendors"].append({
                    "vendor": vendor,
                    "categories_count": vendor_categories[vendor],
                    "total_amount": vendor_total[vendor],
                    "categories": list(df[df['vendor'] == vendor]['category'].unique())
                })
        
        return anomalies
    
    def detect_amount_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect suspicious amount patterns"""
        self.logger.info("💰 Analyzing payment amount patterns...")
        
        anomalies = {
            "round_numbers": [],
            "duplicate_amounts": [],
            "statistical_outliers": [],
            "benford_violation": {},
            "threshold_gaming": []
        }
        
        # Round number analysis
        amounts = df['amount']
        round_amounts = amounts[amounts % 1000 == 0]
        round_percentage = len(round_amounts) / len(amounts)
        
        if round_percentage > self.thresholds["amount_clustering"]["round_number_threshold"]:
            anomalies["round_numbers"] = {
                "percentage": round(round_percentage, 3),
                "count": len(round_amounts),
                "threshold": self.thresholds["amount_clustering"]["round_number_threshold"],
                "suspicious_amounts": round_amounts.value_counts().head(10).to_dict()
            }
        
        # Duplicate amount analysis
        amount_counts = amounts.value_counts()
        duplicates = amount_counts[amount_counts > 1]
        duplicate_percentage = duplicates.sum() / len(amounts)
        
        if duplicate_percentage > self.thresholds["amount_clustering"]["duplicate_amount_threshold"]:
            anomalies["duplicate_amounts"] = {
                "percentage": round(duplicate_percentage, 3),
                "unique_duplicate_amounts": len(duplicates),
                "most_common": duplicates.head(5).to_dict()
            }
        
        # Statistical outliers
        z_scores = np.abs(stats.zscore(amounts))
        outliers = df[z_scores > self.thresholds["statistical"]["z_score_threshold"]]
        
        if len(outliers) > 0:
            anomalies["statistical_outliers"] = {
                "count": len(outliers),
                "outlier_amounts": outliers[['vendor', 'amount', 'category']].to_dict('records')
            }
        
        # Benford's Law analysis (first digit distribution)
        first_digits = [int(str(amount)[0]) for amount in amounts if str(amount)[0].isdigit()]
        if first_digits:
            observed = Counter(first_digits)
            total = len(first_digits)
            
            # Expected Benford distribution
            benford_expected = {d: np.log10(1 + 1/d) for d in range(1, 10)}
            
            chi_square = 0
            for digit in range(1, 10):
                observed_freq = observed.get(digit, 0) / total
                expected_freq = benford_expected[digit]
                chi_square += (observed_freq - expected_freq) ** 2 / expected_freq
            
            if chi_square > self.thresholds["statistical"]["benford_deviation"]:
                anomalies["benford_violation"] = {
                    "chi_square": round(chi_square, 4),
                    "observed_distribution": {d: round(observed.get(d, 0) / total, 3) for d in range(1, 10)},
                    "expected_distribution": {d: round(benford_expected[d], 3) for d in range(1, 10)}
                }
        
        # Threshold gaming (amounts just under bidding thresholds)
        bidding_thresholds = [50000, 100000, 250000, 500000, 1000000]
        for threshold in bidding_thresholds:
            near_threshold = amounts[(amounts > threshold * 0.95) & (amounts < threshold)]
            if len(near_threshold) > 0:
                anomalies["threshold_gaming"].append({
                    "threshold": threshold,
                    "near_threshold_count": len(near_threshold),
                    "amounts": near_threshold.tolist()
                })
        
        return anomalies
    
    def detect_timing_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect suspicious timing patterns"""
        self.logger.info("⏰ Analyzing timing patterns...")
        
        anomalies = {
            "year_end_rush": {},
            "weekend_payments": {},
            "holiday_patterns": {},
            "pre_election_spikes": {}
        }
        
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['year'] = df['date'].dt.year
        
        # Year-end rush analysis
        december_spending = df[df['month'] == 12]['amount'].sum()
        total_spending = df['amount'].sum()
        december_percentage = december_spending / total_spending
        
        if december_percentage > self.thresholds["timing_patterns"]["year_end_rush"]:
            anomalies["year_end_rush"] = {
                "percentage": round(december_percentage, 3),
                "december_amount": december_spending,
                "total_amount": total_spending,
                "contracts_count": len(df[df['month'] == 12])
            }
        
        # Weekend payments analysis
        weekend_payments = df[df['day_of_week'].isin([5, 6])]  # Saturday, Sunday
        weekend_percentage = len(weekend_payments) / len(df)
        
        if weekend_percentage > self.thresholds["timing_patterns"]["weekend_payments"]:
            anomalies["weekend_payments"] = {
                "percentage": round(weekend_percentage, 3),
                "count": len(weekend_payments),
                "total_amount": weekend_payments['amount'].sum()
            }
        
        # Monthly distribution analysis
        monthly_distribution = df.groupby('month')['amount'].sum()
        monthly_std = monthly_distribution.std()
        monthly_mean = monthly_distribution.mean()
        
        unusual_months = []
        for month, amount in monthly_distribution.items():
            if abs(amount - monthly_mean) > 2 * monthly_std:
                unusual_months.append({
                    "month": month,
                    "amount": amount,
                    "deviation_from_mean": round((amount - monthly_mean) / monthly_std, 2)
                })
        
        if unusual_months:
            anomalies["unusual_spending_months"] = unusual_months
        
        return anomalies
    
    def build_relationship_network(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Build network graph for relationship analysis"""
        self.logger.info("🕸️ Building relationship network...")
        
        # Clear existing graph
        self.network_graph.clear()
        
        # Add nodes and relationships
        for _, row in df.iterrows():
            vendor = row['vendor']
            category = row['category']
            department = row['department']
            approver = row['approved_by']
            
            # Add nodes
            self.network_graph.add_node(vendor, type='vendor')
            self.network_graph.add_node(category, type='category') 
            self.network_graph.add_node(department, type='department')
            self.network_graph.add_node(approver, type='approver')
            
            # Add relationships (edges)
            self.network_graph.add_edge(vendor, category, weight=row['amount'], type='provides')
            self.network_graph.add_edge(department, vendor, weight=row['amount'], type='contracts')
            self.network_graph.add_edge(approver, vendor, weight=row['amount'], type='approves')
        
        # Analyze network structure
        analysis = {
            "nodes": self.network_graph.number_of_nodes(),
            "edges": self.network_graph.number_of_edges(),
            "density": nx.density(self.network_graph),
            "suspicious_patterns": self._detect_network_anomalies()
        }
        
        return analysis
    
    def _detect_network_anomalies(self) -> Dict[str, Any]:
        """Detect anomalies in the relationship network"""
        anomalies = {
            "circular_patterns": [],
            "unusual_centrality": [],
            "isolated_clusters": []
        }
        
        # Circular payment detection
        try:
            cycles = list(nx.simple_cycles(self.network_graph))
            if cycles:
                anomalies["circular_patterns"] = [
                    {"cycle": cycle, "length": len(cycle)} 
                    for cycle in cycles[:10]  # Top 10 cycles
                ]
        except:
            pass
        
        # Centrality analysis
        betweenness = nx.betweenness_centrality(self.network_graph)
        high_centrality = {node: centrality for node, centrality in betweenness.items() 
                          if centrality > 0.1}  # High centrality nodes
        
        if high_centrality:
            anomalies["unusual_centrality"] = high_centrality
        
        # Detect isolated clusters
        if not nx.is_connected(self.network_graph.to_undirected()):
            components = list(nx.connected_components(self.network_graph.to_undirected()))
            large_components = [list(comp) for comp in components if len(comp) > 3]
            if len(large_components) > 1:
                anomalies["isolated_clusters"] = large_components
        
        return anomalies
    
    def run_comprehensive_analysis(self, data_sources: List[str] = None) -> Dict[str, Any]:
        """Run complete anomaly detection analysis"""
        self.logger.info("\n🕵️ COMPREHENSIVE ANOMALY DETECTION ANALYSIS")
        self.logger.info("=" * 60)
        
        # Load data
        if not data_sources:
            df = self._generate_sample_financial_data()
        else:
            df = self.load_financial_data(data_sources)
        
        if df.empty:
            return {"error": "No data to analyze"}
        
        analysis_results = {
            "timestamp": datetime.now().isoformat(),
            "data_summary": {
                "total_records": len(df),
                "total_amount": df['amount'].sum(),
                "unique_vendors": df['vendor'].nunique(),
                "date_range": f"{df['date'].min()} to {df['date'].max()}"
            },
            "anomaly_detection": {},
            "risk_assessment": {}
        }
        
        # Run all detection methods
        detection_methods = [
            ("vendor_concentration", self.detect_vendor_concentration_anomalies),
            ("amount_anomalies", self.detect_amount_anomalies),
            ("timing_anomalies", self.detect_timing_anomalies),
            ("network_analysis", lambda df: self.build_relationship_network(df))
        ]
        
        for method_name, method_func in detection_methods:
            try:
                self.logger.info(f"🔍 Running {method_name}...")
                result = method_func(df)
                analysis_results["anomaly_detection"][method_name] = result
            except Exception as e:
                self.logger.error(f"❌ Error in {method_name}: {e}")
                analysis_results["anomaly_detection"][method_name] = {"error": str(e)}
        
        # Calculate overall risk assessment
        analysis_results["risk_assessment"] = self._calculate_risk_score(analysis_results["anomaly_detection"])
        
        # Save results
        output_file = self.data_dir / f"anomaly_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis_results, f, indent=2, ensure_ascii=False, default=str)
        
        self.logger.info(f"💾 Analysis saved to: {output_file}")
        
        return analysis_results
    
    def _calculate_risk_score(self, detection_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall corruption risk score"""
        risk_factors = []
        
        # Vendor concentration risks
        vendor_analysis = detection_results.get("vendor_concentration", {})
        high_concentration = len(vendor_analysis.get("high_concentration_categories", []))
        if high_concentration > 0:
            risk_factors.append(("High vendor concentration", high_concentration * 20))
        
        # Amount pattern risks
        amount_analysis = detection_results.get("amount_anomalies", {})
        if amount_analysis.get("round_numbers"):
            risk_factors.append(("Excessive round numbers", 15))
        if amount_analysis.get("benford_violation"):
            risk_factors.append(("Benford's Law violation", 25))
        if amount_analysis.get("threshold_gaming"):
            risk_factors.append(("Threshold gaming", 20))
        
        # Timing risks
        timing_analysis = detection_results.get("timing_anomalies", {})
        if timing_analysis.get("year_end_rush"):
            risk_factors.append(("Year-end spending rush", 15))
        if timing_analysis.get("weekend_payments"):
            risk_factors.append(("Weekend payments", 10))
        
        # Network risks
        network_analysis = detection_results.get("network_analysis", {})
        suspicious_patterns = network_analysis.get("suspicious_patterns", {})
        if suspicious_patterns.get("circular_patterns"):
            risk_factors.append(("Circular payment patterns", 30))
        
        # Calculate total risk score
        total_risk = min(100, sum(score for _, score in risk_factors))
        
        risk_level = "LOW"
        if total_risk > 70:
            risk_level = "CRITICAL"
        elif total_risk > 50:
            risk_level = "HIGH"
        elif total_risk > 30:
            risk_level = "MEDIUM"
        
        return {
            "total_risk_score": total_risk,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "recommendations": self._generate_risk_recommendations(risk_factors)
        }
    
    def _generate_risk_recommendations(self, risk_factors: List[Tuple[str, int]]) -> List[str]:
        """Generate recommendations based on detected risks"""
        recommendations = []
        
        for factor, score in risk_factors:
            if "vendor concentration" in factor.lower():
                recommendations.append("Implement competitive bidding requirements for high-value contracts")
                recommendations.append("Establish vendor rotation policies to prevent monopolization")
            elif "round numbers" in factor.lower():
                recommendations.append("Require detailed cost breakdowns for all contracts")
                recommendations.append("Implement additional review for contracts with round number amounts")
            elif "benford" in factor.lower():
                recommendations.append("Conduct detailed audit of financial records")
                recommendations.append("Implement automated anomaly detection systems")
            elif "threshold gaming" in factor.lower():
                recommendations.append("Review bidding thresholds and approval processes")
                recommendations.append("Implement stricter oversight for contracts near thresholds")
            elif "year-end" in factor.lower():
                recommendations.append("Establish spending guidelines for Q4")
                recommendations.append("Require additional approvals for December contracts")
            elif "circular" in factor.lower():
                recommendations.append("Map vendor relationships and ownership structures")
                recommendations.append("Implement conflict of interest screening")
        
        return list(set(recommendations))  # Remove duplicates
    
    def generate_analysis_report(self, analysis_results: Dict[str, Any]) -> str:
        """Generate human-readable analysis report"""
        report = f"""
# CORRUPTION RISK ANALYSIS REPORT
## Carmen de Areco Financial Transparency Audit

**Analysis Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Data Period:** {analysis_results['data_summary']['date_range']}

## EXECUTIVE SUMMARY

**Risk Level: {analysis_results['risk_assessment']['risk_level']}**
**Risk Score: {analysis_results['risk_assessment']['total_risk_score']}/100**

### Key Statistics
- Total Records Analyzed: {analysis_results['data_summary']['total_records']:,}
- Total Amount: ${analysis_results['data_summary']['total_amount']:,.2f}
- Unique Vendors: {analysis_results['data_summary']['unique_vendors']}

## RISK FACTORS IDENTIFIED

"""
        
        for factor, score in analysis_results['risk_assessment']['risk_factors']:
            report += f"🚨 **{factor}** (Risk Score: {score})\n"
        
        report += "\n## DETAILED FINDINGS\n\n"
        
        # Vendor concentration findings
        vendor_analysis = analysis_results['anomaly_detection'].get('vendor_concentration', {})
        high_conc = vendor_analysis.get('high_concentration_categories', [])
        if high_conc:
            report += "### Vendor Concentration Issues\n\n"
            for item in high_conc[:5]:  # Top 5
                report += f"- **{item['category']}**: {item['top_vendor']} controls {item['concentration']*100:.1f}% (${item['total_spending']:,.2f})\n"
        
        # Amount anomalies
        amount_analysis = analysis_results['anomaly_detection'].get('amount_anomalies', {})
        if amount_analysis.get('round_numbers'):
            round_pct = amount_analysis['round_numbers']['percentage'] * 100
            report += f"\n### Suspicious Amount Patterns\n\n"
            report += f"- {round_pct:.1f}% of payments are round numbers (threshold: 30%)\n"
        
        # Recommendations
        recommendations = analysis_results['risk_assessment'].get('recommendations', [])
        if recommendations:
            report += "\n## RECOMMENDATIONS\n\n"
            for i, rec in enumerate(recommendations, 1):
                report += f"{i}. {rec}\n"
        
        report += f"\n---\n*Report generated by Carmen de Areco Transparency Audit System*"
        
        return report

if __name__ == "__main__":
    detector = AnomalyDetectionSystem()
    
    # Run analysis with sample data
    results = detector.run_comprehensive_analysis()
    
    # Generate report
    report = detector.generate_analysis_report(results)
    report_file = detector.data_dir / f"corruption_risk_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("🕵️ Anomaly detection analysis completed!")
    print(f"📊 Risk Level: {results['risk_assessment']['risk_level']}")
    print(f"📄 Report: {report_file}")
    print(f"📋 Data: {detector.data_dir}")
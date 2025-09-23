#!/usr/bin/env python3
"""
Validation Health Monitor for Carmen de Areco Transparency System
Specifically addresses the "Verificados 34" vs "Verificados 40" issue
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

class ValidationHealthMonitor:
    """Monitor and analyze validation service health"""
    
    def __init__(self, data_path: str = "data"):
        self.data_path = Path(data_path)
        self.validation_logs = []
        self.load_validation_data()
    
    def load_validation_data(self):
        """Load all validation-related data"""
        print("Loading validation data...")
        
        # Look for files that might contain verification metrics
        json_files = list(self.data_path.rglob("*.json"))
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Check if this could be validation data
                if self.is_validation_data(data):
                    self.validation_logs.append({
                        "file": str(json_file),
                        "data": data,
                        "timestamp": datetime.now().isoformat()
                    })
                    
            except Exception as e:
                print(f"Error loading {json_file}: {e}")
        
        print(f"Loaded {len(self.validation_logs)} validation data sources")
    
    def is_validation_data(self, data: Any) -> bool:
        """Determine if data contains validation/verification information"""
        if isinstance(data, list) and len(data) > 0:
            first_item = data[0]
            if isinstance(first_item, dict):
                keys = first_item.keys()
                # Common validation fields
                validation_fields = ['verification_status', 'integrity_verified', 
                                   'validation_result', 'issues_found', 'errors_count', 
                                   'status', 'processed']
                return any(field in keys for field in validation_fields)
        elif isinstance(data, dict):
            # Single object with validation info
            keys = data.keys()
            validation_fields = ['verification_status', 'integrity_verified', 
                               'validation_result', 'issues_found', 'errors_count', 
                               'status', 'processed']
            return any(field in keys for field in validation_fields)
        
        return False
    
    def analyze_verification_ratio(self) -> Dict[str, Any]:
        """Analyze the ratio of issues to solutions"""
        print("\nAnalyzing verification metrics...")
        
        total_issues = 0
        total_solutions = 0
        processed_items = 0
        
        # Look for the specific pattern: "Verificados 34" and "Verificados 40"
        # This likely represents verification counts
        
        for log_entry in self.validation_logs:
            data = log_entry["data"]
            
            # Handle list of items
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        # Look for verification patterns
                        if 'verification_status' in item:
                            processed_items += 1
                            if item['verification_status'] == 'preserved':
                                total_solutions += 1
                            elif item['verification_status'] == 'issues_found':
                                total_issues += 1
                        elif 'integrity_verified' in item:
                            processed_items += 1
                            if item['integrity_verified']:
                                total_solutions += 1
                            else:
                                total_issues += 1
                        elif 'errors_count' in item and isinstance(item['errors_count'], int):
                            processed_items += 1
                            total_issues += item['errors_count']
                        elif 'status' in item and item['status'] == 'completed':
                            processed_items += 1
                        # Try to detect issue/solution patterns in other fields
                        elif 'issues_found' in item:
                            total_issues += item['issues_found']
                            processed_items += 1
                        elif 'validated' in item and item['validated']:
                            total_solutions += 1
                            processed_items += 1
                        elif 'validated' in item and not item['validated']:
                            total_issues += 1
                            processed_items += 1
            
            # Handle single item
            elif isinstance(data, dict):
                if 'verification_status' in data:
                    processed_items += 1
                    if data['verification_status'] == 'preserved':
                        total_solutions += 1
                    elif data['verification_status'] == 'issues_found':
                        total_issues += 1
                elif 'integrity_verified' in data:
                    processed_items += 1
                    if data['integrity_verified']:
                        total_solutions += 1
                    else:
                        total_issues += 1
                elif 'errors_count' in data and isinstance(data['errors_count'], int):
                    processed_items += 1
                    total_issues += data['errors_count']
                elif 'issues_found' in data:
                    total_issues += data['issues_found']
                    processed_items += 1
                elif 'validated' in data:
                    processed_items += 1
                    if data['validated']:
                        total_solutions += 1
                    else:
                        total_issues += 1
        
        # Calculate ratios and provide insights
        issue_solution_ratio = total_issues / max(total_solutions, 1)
        
        # Check if the service is creating more issues than solutions
        health_status = "healthy" if issue_solution_ratio <= 1.0 else "unbalanced"
        
        return {
            "total_processed_items": processed_items,
            "total_issues_found": total_issues,
            "total_solutions_provided": total_solutions,
            "issue_to_solution_ratio": issue_solution_ratio,
            "health_status": health_status,
            "recommendations": self.get_recommendations(issue_solution_ratio, processed_items)
        }
    
    def get_recommendations(self, ratio: float, total_processed: int) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if total_processed == 0:
            recommendations.append("⚠️  No validation data found - service may not be active")
        elif total_processed < 10:
            recommendations.append("⚠️  Low validation volume - may not be representative")
        elif ratio > 1.0:
            recommendations.append("⚠️  ISSUE: More issues found than solutions provided")
            recommendations.append("   - Your validation service may be creating more problems than it's solving")
            recommendations.append("   - Review validation thresholds and rules")
        elif ratio > 0.5:
            recommendations.append("⚠️  CAUTION: Significant number of issues relative to solutions")
            recommendations.append("   - Monitor validation rules for potential over-reporting")
        else:
            recommendations.append("✅ BALANCED: Issues are well-managed relative to solutions")
        
        return recommendations
    
    def generate_report(self):
        """Generate a comprehensive validation health report"""
        print("=" * 60)
        print("VALIDATION SERVICE HEALTH REPORT")
        print("=" * 60)
        
        analysis = self.analyze_verification_ratio()
        
        print(f"Total Items Processed: {analysis['total_processed_items']}")
        print(f"Issues Found: {analysis['total_issues_found']}")
        print(f"Solutions Provided: {analysis['total_solutions_provided']}")
        print(f"Issue-to-Solution Ratio: {analysis['issue_to_solution_ratio']:.2f}")
        print(f"Health Status: {analysis['health_status'].upper()}")
        
        print("\n" + "=" * 40)
        print("RECOMMENDATIONS")
        print("=" * 40)
        
        for rec in analysis['recommendations']:
            print(rec)
        
        # Special focus on your specific concern
        if analysis['total_issues_found'] == 34 and analysis['total_solutions_provided'] == 40:
            print("\n" + "=" * 40)
            print("SPECIFIC CONCERN ANALYSIS")
            print("=" * 40)
            print("Based on your dashboard metrics:")
            print("   - 'Verificados 34' (issues found)")
            print("   - 'Verificados 40' (solutions provided)")
            print("   Ratio: 34/40 = 0.85")
            print("   This is within acceptable range (healthy)")

def main():
    """Main function to run validation health monitoring"""
    print("Starting Validation Health Monitor for Carmen de Areco Transparency System")
    
    monitor = ValidationHealthMonitor()
    monitor.generate_report()

if __name__ == "__main__":
    main()
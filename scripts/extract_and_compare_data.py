#!/usr/bin/env python3
"""
Data Extraction and Comparison Script
Extracts Power BI and PDF data and creates comparison reports
"""

import json
import requests
import csv
import os
from datetime import datetime
from pathlib import Path

def extract_powerbi_data():
    """Extract Power BI data from the backend API"""
    try:
        # Get financial data from Power BI
        response = requests.get('http://localhost:3001/api/powerbi/financial-data')
        if response.status_code == 200:
            data = response.json()
            return data.get('financialData', [])
        else:
            print(f"Error fetching Power BI data: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error extracting Power BI data: {e}")
        return []

def extract_pdf_data():
    """Extract PDF data from the backend API"""
    try:
        # Get budget execution documents
        response = requests.get('http://localhost:3001/api/real-documents/budget-execution')
        if response.status_code == 200:
            data = response.json()
            return data.get('documents', [])
        else:
            print(f"Error fetching PDF data: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error extracting PDF data: {e}")
        return []

def create_comparison_report(powerbi_data, pdf_data):
    """Create a comparison report between Power BI and PDF data"""
    
    # For now, we'll create a simple comparison based on categories
    # In a real implementation, you would do field-by-field comparison
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'powerbi_record_count': len(powerbi_data),
        'pdf_document_count': len(pdf_data),
        'comparison_points': []
    }
    
    # Extract unique categories from Power BI data
    powerbi_categories = {}
    for item in powerbi_data:
        data = item.get('data', {})
        category = data.get('category')
        subcategory = data.get('subcategory')
        if category not in powerbi_categories:
            powerbi_categories[category] = []
        powerbi_categories[category].append({
            'subcategory': subcategory,
            'budgeted': data.get('budgeted', 0),
            'executed': data.get('executed', 0),
            'difference': data.get('difference', 0),
            'percentage': data.get('percentage', 0)
        })
    
    # Add comparison points
    for category, items in powerbi_categories.items():
        total_budgeted = sum(item['budgeted'] for item in items)
        total_executed = sum(item['executed'] for item in items)
        
        report['comparison_points'].append({
            'category': category,
            'powerbi_budgeted': total_budgeted,
            'powerbi_executed': total_executed,
            'pdf_document_count': len([doc for doc in pdf_data if category.lower() in doc.get('title', '').lower()]),
            'status': 'analyzed'
        })
    
    return report

def save_comparison_report(report):
    """Save the comparison report to files"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    reports_dir = Path("/Users/flong/Developer/cda-transparencia/data/comparison_reports")
    
    # Save as JSON
    json_file = reports_dir / f"comparison_report_{timestamp}.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"✅ Comparison report saved to: {json_file}")
    
    # Save as CSV
    csv_file = reports_dir / f"comparison_report_{timestamp}.csv"
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Category', 'Power BI Budgeted', 'Power BI Executed', 'PDF Documents'])
        
        for point in report.get('comparison_points', []):
            writer.writerow([
                point['category'],
                point['powerbi_budgeted'],
                point['powerbi_executed'],
                point['pdf_document_count']
            ])
    
    print(f"📊 CSV report saved to: {csv_file}")
    
    return json_file, csv_file

def main():
    """Main function to extract and compare data"""
    print("🔍 Starting data extraction and comparison...")
    
    # Extract Power BI data
    print("📊 Extracting Power BI data...")
    powerbi_data = extract_powerbi_data()
    print(f"   Found {len(powerbi_data)} Power BI records")
    
    # Extract PDF data
    print("📄 Extracting PDF data...")
    pdf_data = extract_pdf_data()
    print(f"   Found {len(pdf_data)} PDF documents")
    
    # Create comparison report
    print("🔄 Creating comparison report...")
    report = create_comparison_report(powerbi_data, pdf_data)
    
    # Save report
    json_file, csv_file = save_comparison_report(report)
    
    print("\n✅ Data extraction and comparison completed!")
    print(f"   JSON Report: {json_file}")
    print(f"   CSV Report: {csv_file}")
    
    # Print summary
    print(f"\n📈 Summary:")
    print(f"   Power BI Records: {report['powerbi_record_count']}")
    print(f"   PDF Documents: {report['pdf_document_count']}")
    print(f"   Comparison Points: {len(report.get('comparison_points', []))}")

if __name__ == "__main__":
    main()
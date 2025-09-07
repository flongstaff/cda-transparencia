#!/usr/bin/env python3
"""
Script to organize audit cycle, analysis, and oversight files
"""

import os
import json
import shutil
from pathlib import Path
import re

def organize_analysis_files():
    """Organize audit cycle and analysis files into appropriate categories"""
    
    base_dir = "/Users/flong/Developer/cda-transparencia"
    data_dir = os.path.join(base_dir, "data")
    organized_dir = os.path.join(base_dir, "organized_analysis")
    
    print("Organizing analysis files...")
    
    # 1. Move cycle result files
    cycle_results_dir = os.path.join(data_dir, "cycle_results")
    if os.path.exists(cycle_results_dir):
        for file in os.listdir(cycle_results_dir):
            if file.endswith(".json"):
                src_path = os.path.join(cycle_results_dir, file)
                dst_path = os.path.join(organized_dir, "audit_cycles", "cycle_reports", file)
                shutil.copy2(src_path, dst_path)
                print(f"Moved cycle report: {file}")
    
    # 2. Move enhanced audit files
    enhanced_audit_dir = os.path.join(data_dir, "enhanced_audit_data")
    if os.path.exists(enhanced_audit_dir):
        for file in os.listdir(enhanced_audit_dir):
            if file.endswith(".json"):
                src_path = os.path.join(enhanced_audit_dir, file)
                dst_path = os.path.join(organized_dir, "audit_cycles", "enhanced_audits", file)
                shutil.copy2(src_path, dst_path)
                print(f"Moved enhanced audit: {file}")
    
    # 3. Move anomaly detection files
    anomaly_files = [
        "anomaly_data_2024.json"
    ]
    for anomaly_file in anomaly_files:
        src_path = os.path.join(data_dir, anomaly_file)
        if os.path.exists(src_path):
            dst_path = os.path.join(organized_dir, "audit_cycles", "anomaly_detection", anomaly_file)
            shutil.copy2(src_path, dst_path)
            print(f"Moved anomaly data: {anomaly_file}")
    
    # 4. Move comparison reports
    comparison_reports_dir = os.path.join(data_dir, "comparison_reports")
    if os.path.exists(comparison_reports_dir):
        for file in os.listdir(comparison_reports_dir):
            src_path = os.path.join(comparison_reports_dir, file)
            dst_path = os.path.join(organized_dir, "data_analysis", "comparisons", file)
            shutil.copy2(src_path, dst_path)
            print(f"Moved comparison report: {file}")
    
    # 5. Move CSV exports
    csv_exports_dir = os.path.join(data_dir, "csv_exports")
    if os.path.exists(csv_exports_dir):
        for file in os.listdir(csv_exports_dir):
            if file.endswith(".csv"):
                src_path = os.path.join(csv_exports_dir, file)
                dst_path = os.path.join(organized_dir, "data_analysis", "csv_exports", file)
                shutil.copy2(src_path, dst_path)
                print(f"Moved CSV export: {file}")
    
    # 6. Move visualization files
    visualizations_dir = os.path.join(data_dir, "visualizations")
    if os.path.exists(visualizations_dir):
        for file in os.listdir(visualizations_dir):
            if file.endswith(".png"):
                src_path = os.path.join(visualizations_dir, file)
                dst_path = os.path.join(organized_dir, "data_analysis", "visualizations", file)
                shutil.copy2(src_path, dst_path)
                print(f"Moved visualization: {file}")
    
    # 7. Move financial oversight data
    financial_files = [
        "budget_data_2024.json",
        "salary_data_2024.json", 
        "debt_data_2024.json"
    ]
    for fin_file in financial_files:
        src_path = os.path.join(data_dir, fin_file)
        if os.path.exists(src_path):
            category = ""
            if "budget" in fin_file:
                category = "budget_analysis"
            elif "salary" in fin_file:
                category = "salary_oversight"
            elif "debt" in fin_file:
                category = "debt_monitoring"
            
            dst_path = os.path.join(organized_dir, "financial_oversight", category, fin_file)
            shutil.copy2(src_path, dst_path)
            print(f"Moved financial data: {fin_file}")
    
    # 8. Move governance review data
    governance_files = [
        "web_sources.json"
    ]
    for gov_file in governance_files:
        src_path = os.path.join(data_dir, gov_file)
        if os.path.exists(src_path):
            dst_path = os.path.join(organized_dir, "governance_review", "transparency_reports", gov_file)
            shutil.copy2(src_path, dst_path)
            print(f"Moved governance data: {gov_file}")
    
    # 9. Move database file
    db_src = os.path.join(data_dir, "db")
    if os.path.exists(db_src):
        db_dst = os.path.join(organized_dir, "audit_cycles", "cycle_reports", "transparency_data.db")
        shutil.copy2(db_src, db_dst)
        print(f"Moved database file")
    
    print("Organization complete!")

def create_readme():
    """Create README files for the organized analysis structure"""
    
    organized_dir = "/Users/flong/Developer/cda-transparencia/organized_analysis"
    
    # Main README
    readme_content = """# Organized Analysis Files

This directory contains all audit cycle, analysis, and oversight files organized by category.

## Directory Structure

```
organized_analysis/
├── audit_cycles/                 # Audit cycles and enhanced audits
│   ├── cycle_reports/           # Automated cycle execution reports
│   ├── enhanced_audits/         # Enhanced audit results and findings
│   └── anomaly_detection/      # Anomaly detection reports
├── data_analysis/                # Data analysis outputs
│   ├── csv_exports/             # CSV exports of document data
│   ├── comparisons/             # Comparison reports
│   └── visualizations/          # Data visualizations
├── financial_oversight/          # Financial oversight data
│   ├── budget_analysis/        # Budget execution analysis
│   ├── salary_oversight/        # Salary and payroll oversight
│   └── debt_monitoring/          # Debt monitoring data
└── governance_review/           # Governance and transparency review
    ├── transparency_reports/     # Web source and transparency reports
    ├── official_declarations/   # Official declarations and filings
    └── procurement_analysis/   # Procurement and contracting analysis
```

## Categories

### Audit Cycles
- **Cycle Reports**: Automated reports from data collection cycles
- **Enhanced Audits**: Detailed audit findings and enhanced analysis
- **Anomaly Detection**: Identification of irregularities and anomalies

### Data Analysis
- **CSV Exports**: Structured data exports for analysis
- **Comparisons**: Comparative analysis reports
- **Visualizations**: Charts and graphs generated from data

### Financial Oversight
- **Budget Analysis**: Budget execution and planning analysis
- **Salary Oversight**: Payroll and compensation oversight
- **Debt Monitoring**: Debt tracking and monitoring

### Governance Review
- **Transparency Reports**: Website and data source tracking
- **Official Declarations**: Asset declarations and official filings
- **Procurement Analysis**: Contracting and procurement analysis

## File Naming Convention

Files generally follow the pattern:
- `{category}_{date}_{timestamp}.{extension}`
- `{report_type}_{year}.{extension}`

## Data Sources

The documents were collected from:
- `http://carmendeareco.gob.ar/transparencia`
- National and provincial open data portals
- Automated web scraping cycles
"""
    
    with open(os.path.join(organized_dir, "README.md"), "w") as f:
        f.write(readme_content)
    
    print("README files created!")

def main():
    """Main function"""
    print("Organizing analysis files...")
    organize_analysis_files()
    create_readme()
    print("Done!")

if __name__ == "__main__":
    main()
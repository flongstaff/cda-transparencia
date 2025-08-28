# Enhanced Financial Audit System for Carmen de Areco

## Overview

This enhanced system provides comprehensive tracking and auditing of municipal financial operations in Carmen de Areco, with specific focus on:

1. **High Salary Detection** - Identifies officials with disproportionately high salaries
2. **Infrastructure Project Tracking** - Monitors project timelines, spending, and completion status
3. **Budget Discrepancy Analysis** - Compares budgeted vs. actual spending
4. **Comprehensive Document Discovery** - Finds all 150+ municipal documents
5. **PowerBI Data Extraction** - Bypasses PowerBI limitations to access data
6. **Data Categorization** - Organizes documents for citizen access

## Key Features

### Financial Irregularity Tracking
- Detects officials with salaries significantly above peers
- Flags budget execution discrepancies exceeding 20%
- Identifies suspicious spending patterns

### Infrastructure Project Monitoring
- Tracks project timelines vs. payment schedules
- Flags delayed projects with early payments
- Analyzes contractor performance and risk profiles

### Document Discovery and Access
- Discovers all 150+ municipal documents from uploads directory
- Bypasses PowerBI limitations to access financial data
- Categorizes documents for easy citizen access
- Provides comprehensive data organization

### Citizen-Focused Dashboard
- Clear visualization of financial irregularities
- Easy-to-understand project status tracking
- Transparent display of municipal spending
- Organized document access by category and year

## Python Audit Scripts

### 1. Financial Irregularity Tracker
Located at: `scripts/audit/financial_irregularity_tracker.py`

This script specifically tracks:
- High salary discrepancies (5x+ above average)
- Delayed infrastructure projects (90+ days)
- Budget execution differences (20%+ variance)

**Usage:**
```bash
python scripts/audit/financial_irregularity_tracker.py
```

### 2. Infrastructure Project Tracker
Located at: `scripts/audit/infrastructure_project_tracker.py`

This script monitors:
- Infrastructure project execution
- Contractor performance analysis
- Project delay patterns
- Budget vs. actual spending

**Usage:**
```bash
python scripts/audit/infrastructure_project_tracker.py
```

### 3. Unified Audit Dashboard
Located at: `scripts/audit/unified_audit_dashboard.py`

This script consolidates all audit findings and generates:
- Comprehensive dashboard data
- Executive summary reports
- Risk assessments for contractors

**Usage:**
```bash
python scripts/audit/unified_audit_dashboard.py
```

### 4. Enhanced Document Discovery
Located at: `scripts/audit/enhanced_document_discovery.py`

This script discovers all municipal documents:
- Direct uploads directory exploration (150+ documents)
- Website crawling for hidden documents
- PowerBI limitation bypass attempts
- Database storage of discovered documents

**Usage:**
```bash
python scripts/audit/enhanced_document_discovery.py
```

### 5. PowerBI Data Extractor
Located at: `scripts/audit/powerbi_data_extractor.py`

This script bypasses PowerBI limitations:
- Browser simulation to access PowerBI data
- Alternative source exploration
- API endpoint discovery
- Multiple bypass techniques

**Usage:**
```bash
python scripts/audit/powerbi_data_extractor.py
```

### 6. Data Categorization System
Located at: `scripts/audit/data_categorization_system.py`

This script organizes all discovered documents:
- Comprehensive categorization rules
- Yearly analysis of document availability
- Hierarchical category structure
- Data completeness metrics

**Usage:**
```bash
python scripts/audit/data_categorization_system.py
```

### 7. Master Data System
Located at: `scripts/audit/master_data_system.py`

This script orchestrates all components:
- Runs enhanced discovery
- Executes PowerBI extraction
- Performs data categorization
- Generates master execution report

**Usage:**
```bash
python scripts/audit/master_data_system.py
```

## Frontend Components

### Financial Audit Dashboard
Located at: `frontend/src/components/audit/FinancialAuditDashboard.tsx`

Displays:
- Salary irregularity findings
- Budget discrepancy analysis
- Key financial risk indicators

### Infrastructure Tracker
Located at: `frontend/src/components/audit/InfrastructureTracker.tsx`

Displays:
- Project status tracking
- Contractor performance analysis
- Project delay alerts

### Data Categorization Dashboard
Located at: `frontend/src/components/audit/DataCategorizationDashboard.tsx`

Displays:
- Document categorization by type
- Yearly document analysis
- Data completeness metrics
- Easy document access interface

## Data Flow

1. **Enhanced Discovery**: Python scripts discover all 150+ municipal documents
2. **PowerBI Bypass**: Extract data from PowerBI using multiple techniques
3. **Data Processing**: Scripts detect financial irregularities and project issues
4. **Categorization**: Organize all documents into meaningful categories
5. **Storage**: Findings stored in JSON files and SQLite databases
6. **Visualization**: Frontend components display data in citizen-friendly format
7. **Reporting**: Executive summaries generated for stakeholders

## Key Irregularities Tracked

### High Salaries
- Officials with salaries 5x+ above average for their role
- Unexplained salary increases or bonuses
- Comparison against peer municipalities

### Delayed Infrastructure Projects
- Projects with payments made significantly before completion
- Projects incomplete 1+ year after budgeting
- Contractors with high delay rates

### Budget Discrepancies
- Income/expense differences exceeding 20% of budget
- Missing documentation for 30+ days
- Round number spending patterns (suspicious)

### Document Access Issues
- Missing document categories by year
- Incomplete data sets in PowerBI
- Hard-to-find documents in municipal portal

## Running the Audit System

### Prerequisites
```bash
pip install -r requirements.txt
```

### Run Complete Audit System
```bash
# Run master system (runs all components)
python scripts/audit/master_data_system.py
```

### Individual Component Execution
```bash
# Run financial irregularity tracker
python scripts/audit/financial_irregularity_tracker.py

# Run infrastructure project tracker
python scripts/audit/infrastructure_project_tracker.py

# Run enhanced document discovery
python scripts/audit/enhanced_document_discovery.py

# Run PowerBI data extractor
python scripts/audit/powerbi_data_extractor.py

# Run data categorization system
python scripts/audit/data_categorization_system.py
```

## Output Files

- `data/audit_irregularities/irregularities.db` - Database of financial irregularities
- `data/infrastructure_tracking/projects.db` - Database of infrastructure projects
- `data/enhanced_discovery/discovered_documents.db` - Database of discovered documents
- `data/powerbi_extraction/powerbi_data.db` - Database of PowerBI extracted data
- `data/categorized_data/categorized_data_*.json` - Categorized data for frontend
- `data/dashboard/dashboard.db` - Consolidated dashboard database
- `data/dashboard/dashboard_data_*.json` - Dashboard data for frontend
- `data/dashboard/executive_summary_*.json` - Executive summary reports

## Integration with Frontend

The audit system generates JSON files that are consumed by the React frontend components:
- FinancialAuditDashboard.tsx
- InfrastructureTracker.tsx
- DataCategorizationDashboard.tsx

These components provide citizens with clear, visual representations of municipal financial operations, project status, and organized document access.

## Legal Compliance

All data is sourced from official municipal transparency portals and public records. The system adheres to Argentine transparency laws (Ley 27.275) and municipal organic laws.

## Continuous Monitoring

The system is designed for daily execution via cron jobs or GitHub Actions to ensure ongoing monitoring of municipal financial operations and document availability.
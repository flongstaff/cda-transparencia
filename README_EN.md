# Carmen de Areco Transparency Portal

Complete transparency portal for Carmen de Areco municipality with real-time data integration and comprehensive audit capabilities.

## 🎯 Key Features

### 🏛️ Financial Transparency
- Real-time budget execution tracking
- Salary disclosure for all municipal officials
- Infrastructure project monitoring
- Contract and tender publication

### 🔍 Enhanced Audit System
- **High Salary Detection**: Identifies officials with disproportionately high salaries
- **Infrastructure Project Tracking**: Monitors project timelines, spending, and completion status
- **Budget Discrepancy Analysis**: Compares budgeted vs. actual spending
- See [Enhanced Audit System Documentation](ENHANCED_AUDIT_README.md) for details

### 📊 Data Visualization
- Interactive dashboards for citizens
- Financial trend analysis
- Project status tracking
- Contractor performance metrics

### 🌐 Multi-Source Integration
- Official municipal portal (primary source)
- Provincial transparency systems
- National databases (AFIP, BORA)
- Historical archives (Wayback Machine)

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt
cd frontend && npm install

# Run audit system
python scripts/complete_audit_system.py --quick

# Start development server
cd frontend && npm run dev
```

## 📋 System Components

### 1. Audit System (`scripts/`)
- `complete_audit_system.py`: Main audit orchestrator
- `audit/`: Enhanced financial irregularity tracking
- `scrapers/`: Data collection from official sources
- `osint/`: Intelligence gathering and verification
- `data-processing/`: PDF and document analysis

### 2. Backend (`backend/`)
- Node.js + Express API server
- PostgreSQL database
- Real-time data synchronization
- Document management system

### 3. Frontend (`frontend/`)
- React + TypeScript dashboard
- Responsive design for all devices
- Multi-language support (Spanish/English)
- Interactive data visualizations

### 4. Infrastructure
- GitHub Actions for CI/CD
- Docker configuration for deployment
- PostgreSQL database schema
- Automated testing suite

## 🛡️ Data Verification

All data is sourced from official municipal transparency portals and verified through multiple sources:
1. Primary: Carmen de Areco official portal
2. Secondary: Provincial oversight systems
3. Tertiary: Cross-reference validation
4. Archive: Historical documentation

## 📈 Audit Results

The enhanced audit system specifically tracks:
- Officials with salaries 5x+ above peers
- Infrastructure projects with significant delays
- Budget execution discrepancies exceeding 20%
- Contractor performance and risk profiles

See [Enhanced Audit Summary](ENHANCED_AUDIT_SUMMARY.md) for implementation details.

## 📚 Documentation

- [Enhanced Audit System](ENHANCED_AUDIT_README.md)
- [Audit System Overview](AUDIT_SYSTEM_README.md)
- [Live Scraping System](LIVE_SCRAPING_README.md)
- [Deployment Guide](DEPLOYMENT.md)

## 📞 Support

For questions about the transparency portal or audit system:
- Open an issue on GitHub
- Contact the development team

---
*Built for transparency and accountability in municipal governance*
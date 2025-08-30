# Power BI Data Integration

## Overview

This directory contains all components related to Power BI data integration for the Carmen de Areco Transparency Portal. The system extracts financial data from the municipal Power BI dashboard and presents it through various visualization tools.

## Components

### Backend Services

1. **Power BI Data Extractor** (`scripts/run_powerbi_extraction.py`)
   - Automates browser interaction with the Power BI dashboard
   - Extracts datasets, tables, and records
   - Saves data in structured JSON format

2. **Power BI Controller** (`backend/src/controllers/PowerBIController.js`)
   - API endpoints for serving Power BI data
   - Data validation and transformation
   - Extraction process management

### Frontend Components

1. **Power BI Data Dashboard** (`frontend/src/components/powerbi/PowerBIDataDashboard.tsx`)
   - Main dashboard for viewing Power BI datasets and tables
   - Data extraction controls and status monitoring

2. **Financial Analysis Dashboard** (`frontend/src/components/powerbi/PowerBIFinancialDashboard.tsx`)
   - Detailed financial data visualization
   - Budget vs. execution analysis
   - Category and department breakdowns

3. **Financial Mind Map** (`frontend/src/components/powerbi/FinancialMindMap.tsx`)
   - Interactive visualization of budget distribution
   - Hierarchical view of financial allocations
   - Zoom and pan capabilities

4. **Data Comparison Dashboard** (`frontend/src/components/powerbi/DataComparisonDashboard.tsx`)
   - Comparison between Power BI data and official PDF documents
   - Discrepancy identification and analysis
   - Missing data detection

5. **Comprehensive Financial Analysis** (`frontend/src/pages/ComprehensiveFinancialAnalysis.tsx`)
   - Unified interface for all financial analysis tools
   - Tabbed navigation between different views

### Data Flow

```
Power BI Dashboard
       ↓
Browser Automation (Selenium)
       ↓
Data Extraction Script
       ↓
Structured JSON Storage
       ↓
Backend API Endpoints
       ↓
Frontend Components
       ↓
User Interface
```

## Features

### Data Extraction
- Automated browser interaction with Power BI dashboard
- Extraction of datasets, tables, and records
- Data validation and cleaning
- Structured JSON storage

### Data Visualization
- Interactive financial dashboards
- Budget execution tracking
- Department and category breakdowns
- Time series analysis
- Hierarchical mind maps

### Data Comparison
- Cross-referencing with official PDF documents
- Discrepancy detection algorithms
- Missing data identification
- Validation reports

### User Interface
- Responsive web interface
- Dark/light mode support
- Multi-language support (Spanish)
- Export capabilities (CSV, JSON, PDF)
- Interactive charts and graphs

## API Endpoints

### Power BI Data
- `GET /api/powerbi/status` - Check data availability
- `GET /api/powerbi/datasets` - List available datasets
- `GET /api/powerbi/tables` - List available tables
- `GET /api/powerbi/records` - Get sample records
- `GET /api/powerbi/report` - Get extraction report
- `GET /api/powerbi/financial-data` - Get financial data for analysis
- `POST /api/powerbi/extract` - Trigger data extraction

## Data Structure

### Power BI Dataset
```json
{
  "name": "string",
  "id": "string",
  "table_count": "number"
}
```

### Power BI Table
```json
{
  "name": "string",
  "column_count": "number",
  "row_count": "number"
}
```

### Financial Data
```json
{
  "category": "string",
  "subcategory": "string",
  "budgeted": "number",
  "executed": "number",
  "difference": "number",
  "percentage": "number",
  "year": "number",
  "quarter": "string",
  "department": "string",
  "project": "string (optional)"
}
```

## Installation

### Prerequisites
- Node.js 16+
- Python 3.8+
- PostgreSQL (for data storage)
- Chrome/Chromium browser (for Selenium)

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Power BI Extraction Dependencies
```bash
pip install selenium webdriver-manager pandas requests
```

## Usage

### Manual Extraction
```bash
cd scripts
python run_powerbi_extraction.py
```

### Starting the Backend Server
```bash
cd backend
npm start
```

### Starting the Frontend Development Server
```bash
cd frontend
npm run dev
```

### Production Build
```bash
cd frontend
npm run build
```

## Data Storage

Extracted Power BI data is stored in:
- `data/powerbi_extraction/` - Raw JSON data files
- PostgreSQL database - Structured data for querying

## Security Considerations

- The system only accesses publicly available Power BI reports
- No authentication or special permissions are required
- All data is stored locally and not shared externally
- The extraction process simulates normal browser usage

## Troubleshooting

### Common Issues

1. **Extraction Fails**
   - Check internet connectivity
   - Verify the Power BI report URL is accessible
   - Ensure required dependencies are installed (`selenium`, `webdriver-manager`)

2. **Data Not Displaying**
   - Verify the extraction completed successfully
   - Check that the backend service can read the data files
   - Ensure the frontend is making correct API calls

3. **Performance Issues**
   - Large datasets may take time to load
   - Consider limiting the number of records displayed
   - Use pagination for large result sets

### Logs

Check the following locations for logs:
- Backend logs: Console output from the Node.js server
- Frontend logs: Browser developer console
- Extraction logs: Console output from the Python script

## Future Enhancements

1. **Advanced Analytics**
   - Predictive budgeting models
   - Anomaly detection algorithms
   - Trend analysis and forecasting

2. **Enhanced Visualization**
   - 3D financial visualizations
   - Interactive drill-down capabilities
   - Custom dashboard creation

3. **Data Integration**
   - Integration with additional municipal data sources
   - Real-time data streaming
   - Cross-platform data synchronization

4. **User Features**
   - Custom report generation
   - Data subscription notifications
   - Collaborative analysis tools

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Contact

For questions about the Power BI integration, please contact the project maintainers.
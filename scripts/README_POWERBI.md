# Power BI Data Extraction

This directory contains scripts and services for extracting data from the Carmen de Areco municipal Power BI dashboard.

## Prerequisites

Make sure you have the required Python dependencies installed:

```bash
pip install selenium webdriver-manager pandas requests
```

## Running the Extraction

To run the Power BI data extraction:

```bash
cd /path/to/project
python scripts/run_powerbi_extraction.py
```

This will:
1. Launch a browser session to access the Power BI dashboard
2. Extract available datasets, tables, and records
3. Save the data to `data/powerbi_extraction/powerbi_data_latest.json`

## Integration with Backend

The backend service (`backend/src/services/PowerBIService.js`) automatically serves the latest extracted data through API endpoints.

## Integration with Frontend

The frontend dashboard (`frontend/src/components/powerbi/PowerBIDataDashboard.tsx`) provides a user interface to:
- View extracted Power BI data
- Trigger manual extraction
- Compare data with other sources

For more detailed information, see [Power BI Extraction Documentation](../docs/powerbi-extraction.md).
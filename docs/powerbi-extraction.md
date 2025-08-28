# Power BI Data Extraction System

## Overview

This system provides automated extraction of financial data from the Carmen de Areco municipal Power BI dashboard. The extracted data is then made available through our API for auditing and analysis purposes.

## Components

1. **Backend Service** (`backend/src/services/PowerBIService.js`):
   - Manages Power BI data storage and retrieval
   - Provides API endpoints for frontend integration
   - Handles data comparison between Power BI and PDF sources

2. **Frontend Dashboard** (`frontend/src/components/powerbi/PowerBIDataDashboard.tsx`):
   - Visualizes extracted Power BI data
   - Provides interfaces for data exploration
   - Allows manual triggering of data extraction

3. **Extraction Script** (`scripts/run_powerbi_extraction.py`):
   - Runs the actual Power BI data extraction process
   - Uses browser automation to access the Power BI dashboard
   - Saves extracted data in structured JSON format

## How It Works

1. **Data Extraction Process**:
   - The Python script uses Selenium to automate a browser session
   - It navigates to the public Power BI report URL
   - It attempts to extract data from the report's internal APIs
   - Extracted data is saved to JSON files in `data/powerbi_extraction/`

2. **Data Access**:
   - The backend service reads the latest extracted data
   - API endpoints serve the data to the frontend
   - The frontend dashboard displays datasets, tables, and records

3. **Data Comparison**:
   - Power BI data can be compared with PDF-extracted financial data
   - Discrepancies are identified for further investigation

## Usage

### Manual Extraction

To manually trigger Power BI data extraction:

1. From the frontend dashboard:
   - Navigate to the Power BI Data page
   - Click the "Ejecutar Extracción" button
   - Wait for the process to complete (may take several minutes)
   - The dashboard will automatically refresh with new data

2. From the command line:
   ```bash
   cd /path/to/project
   python scripts/run_powerbi_extraction.py
   ```

### API Endpoints

- `GET /api/powerbi/status` - Check if Power BI data is available
- `GET /api/powerbi/data` - Get all Power BI data
- `GET /api/powerbi/datasets` - Get Power BI datasets
- `GET /api/powerbi/tables` - Get Power BI tables
- `GET /api/powerbi/records` - Get Power BI records (limited)
- `GET /api/powerbi/report` - Get extraction report
- `GET /api/powerbi/financial-data` - Get financial data for auditing
- `POST /api/powerbi/extract` - Trigger data extraction (admin only)

## Data Structure

The extracted Power BI data includes:

1. **Datasets**: Top-level containers of related data
2. **Tables**: Structured data tables within datasets
3. **Records**: Individual data rows from tables
4. **Extraction Report**: Metadata about the extraction process

## Security Considerations

- The system only accesses publicly available Power BI reports
- No authentication or special permissions are required
- All data is stored locally and not shared externally
- The extraction process simulates normal browser usage

## Troubleshooting

### Common Issues

1. **Extraction Fails**:
   - Check internet connectivity
   - Verify the Power BI report URL is accessible
   - Ensure required dependencies are installed (`selenium`, `webdriver-manager`)

2. **Data Not Displaying**:
   - Verify the extraction completed successfully
   - Check that the backend service can read the data files
   - Ensure the frontend is making correct API calls

3. **Performance Issues**:
   - Large datasets may take time to load
   - Consider limiting the number of records displayed
   - Use pagination for large result sets

### Logs

Check the following locations for logs:

- Backend logs: Console output from the Node.js server
- Frontend logs: Browser developer console
- Extraction logs: Console output from the Python script
# 📊 Power BI Financial Analysis Guide

## Overview

This guide explains how to use the Power BI financial analysis tools in the Carmen de Areco Transparency Portal. These tools provide detailed insights into municipal budget execution and financial distribution.

## Accessing the Tools

To access the financial analysis tools:

1. Visit the portal at [http://localhost:5173](http://localhost:5173) (or your deployed URL)
2. Navigate to **"Análisis Financiero"** in the main navigation menu
3. Or directly visit [http://localhost:5173/financial-analysis](http://localhost:5173/financial-analysis)

## Available Views

### 1. Mapa Financiero (Financial Mind Map)
- **Purpose**: Interactive visualization of budget distribution
- **Features**:
  - Hierarchical view of financial allocations
  - Color-coded categories
  - Zoom and pan capabilities
  - Proportional sizing based on budget amounts

### 2. Dashboard Power BI
- **Purpose**: Detailed financial data analysis
- **Features**:
  - Budget vs. execution comparison
  - Category and department breakdowns
  - Time series analysis
  - Filtering by year, department, and category

### 3. Comparación de Datos (Data Comparison)
- **Purpose**: Cross-reference Power BI data with official PDF documents
- **Features**:
  - Discrepancy detection
  - Missing data identification
  - Validation reports
  - Source document linking

## Using the Tools

### Navigation
- Use the tabs at the top to switch between different views
- Each view has its own set of filters and controls
- Click on elements to drill down into details

### Filtering Data
Most views include filtering options:
- **Search**: Type to filter by category, subcategory, or department
- **Year Filter**: Select specific years to analyze
- **Department Filter**: Focus on specific municipal departments
- **Status Filter** (Comparison view): Filter by match, discrepancy, or missing status

### Interacting with Visualizations
- **Zoom**: Use the + and - buttons or mouse wheel
- **Pan**: Click and drag to move around the visualization
- **Details**: Hover over elements to see additional information
- **Selection**: Click on elements to highlight related data

## Understanding the Data

### Financial Categories
The budget is divided into several main categories:
- **Salud** (Health): Hospitals, clinics, health programs
- **Educación** (Education): Schools, educational programs
- **Infraestructura** (Infrastructure): Roads, buildings, public works
- **Servicios Públicos** (Public Services): Utilities, maintenance
- **Administración General** (General Administration): Offices, administrative costs
- **Desarrollo Social** (Social Development): Social programs, community initiatives
- **Seguridad** (Security): Police, fire department
- **Cultura** (Culture): Libraries, cultural events

### Key Metrics
- **Presupuestado** (Budgeted): Amount allocated in the annual budget
- **Ejecutado** (Executed): Actual amount spent
- **Diferencia** (Difference): Difference between budgeted and executed
- **% Ejecución** (Execution %): Percentage of budget executed

## Troubleshooting

### No Data Displayed
If you see empty views or "No data available":
1. Ensure the Power BI extraction has been run
2. Check that the backend service is running
3. Verify that data files exist in `data/powerbi_extraction/`

### Performance Issues
For better performance with large datasets:
- Use filters to limit the amount of data displayed
- Focus on specific years or categories
- Close unused browser tabs

### Data Discrepancies
If you notice discrepancies between views:
1. Check the data extraction date
2. Verify that all data sources are up to date
3. Run a new extraction to refresh the data

## Technical Information

### Data Sources
- **Primary**: Power BI dashboard at [carmendeareco.gob.ar](https://carmendeareco.gob.ar)
- **Secondary**: Official PDF documents from the municipal website
- **Storage**: JSON files in `data/powerbi_extraction/`

### Update Frequency
- **Automatic**: Daily data extraction runs at 2 AM
- **Manual**: Can be triggered anytime through the admin interface

### Data Format
All extracted data is stored in structured JSON format with the following schema:
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
  "department": "string"
}
```

## Support

For technical issues or questions about the financial analysis tools, please contact the development team.

For questions about the financial data itself, please contact the municipal finance department at [carmendeareco.gob.ar](https://carmendeareco.gob.ar).
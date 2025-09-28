# Carmen de Areco Transparency Portal - Data Structure and API Documentation

## Overview

This document describes the data structure and API endpoints for the Carmen de Areco Transparency Portal. The portal provides access to financial, statistical, and administrative data from the municipality of Carmen de Areco, Buenos Aires, Argentina.

## Data Organization

The data is organized in a hierarchical structure by year, with each year containing multiple data files in CSV and JSON formats.

### Directory Structure

```
/data/
├── processed/                 # Processed data files organized by year
│   ├── 2017/
│   ├── 2018/
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── web_accessible/           # Web-accessible versions of data files
│   ├── 2017/
│   ├── 2018/
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
└── api/                      # API-compatible JSON files
    ├── financial/
    │   ├── 2017/
    │   ├── 2018/
    │   ├── 2019/
    │   ├── 2020/
    │   ├── 2021/
    │   ├── 2022/
    │   ├── 2023/
    │   ├── 2024/
    │   └── 2025/
    ├── transparency/
    ├── statistics/
    ├── tenders/
    └── index.json            # API index file
```

## API Endpoints

All API endpoints return JSON data and are accessible via HTTP GET requests.

### Base URL
```
/api/
```

### Financial Data Endpoints

Financial data is organized by year, with each year containing specific data endpoints.

#### Available Years
- 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025

#### Endpoints by Year
```
GET /api/financial/{year}/consolidated_data.json
GET /api/financial/{year}/financial_summary.json
GET /api/financial/{year}/revenue_by_source.json
GET /api/financial/{year}/expenditure_by_program.json
```

### Example Requests

#### Get Financial Summary for 2019
```
GET /api/financial/2019/financial_summary.json
```

Response format:
```json
{
  "year": 2019,
  "generated_at": "2025-09-27T19:07:53.032234",
  "data": [
    {
      "category": "revenue",
      "subcategory": "current",
      "description": "Ingresos corrientes",
      "budgeted": "241879702.14",
      "executed": "232492993.99",
      "percentage": "96.12",
      "year": "2019"
    },
    {
      "category": "expenditure",
      "subcategory": "personnel",
      "description": "Gastos en personal",
      "budgeted": "115221488.53",
      "executed": "115221488.53",
      "percentage": "100.00",
      "year": "2019"
    }
    // ... more data entries
  ]
}
```

#### Get Revenue by Source for 2019
```
GET /api/financial/2019/revenue_by_source.json
```

Response format:
```json
{
  "year": 2019,
  "generated_at": "2025-09-27T19:07:53.035421",
  "data": [
    {
      "year": "2017",
      "impuestos": "900000000",
      "tasas": "200000000"
    },
    {
      "year": "2018",
      "impuestos": "1050000000",
      "tasas": "220000000"
    },
    {
      "year": "2019",
      "impuestos": "1200000000",
      "tasas": "240000000"
    }
  ]
}
```

#### Get Expenditure by Program for 2019
```
GET /api/financial/2019/expenditure_by_program.json
```

Response format:
```json
{
  "year": 2019,
  "generated_at": "2025-09-27T19:07:53.038745",
  "data": [
    {
      "program_code": "1110101000-17",
      "program_name": "Planificacion y desarrollo de politicas sociales, salu",
      "budgeted": "17185446.15",
      "executed": "17143446.15",
      "paid": "16736420.07",
      "year": "2019"
    }
    // ... more program entries
  ]
}
```

### API Index

The API index provides information about available endpoints and data:

```
GET /api/index.json
```

Response format:
```json
{
  "api_version": "1.0",
  "generated_at": "2025-09-27T19:07:53.040420",
  "endpoints": {
    "financial": {
      "base": "/api/financial",
      "description": "Financial data organized by year",
      "available_years": [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    },
    "transparency": {
      "base": "/api/transparency",
      "description": "Transparency portal data",
      "routes": {}
    },
    "statistics": {
      "base": "/api/statistics",
      "description": "Statistical reports and data",
      "routes": {}
    },
    "tenders": {
      "base": "/api/tenders",
      "description": "Public tender data",
      "routes": {}
    }
  }
}
```

## Data Categories

### Financial Data
- **Financial Summary**: Overall financial position including revenues, expenditures, and results
- **Revenue by Source**: Breakdown of income by different sources (taxes, fees, etc.)
- **Expenditure by Program**: Breakdown of spending by government programs
- **Budget Execution**: Comparison of budgeted vs. executed amounts
- **Debt Status**: Municipal debt information
- **Financial Reserves**: Information about financial reserves
- **Fiscal Balance**: Monthly or quarterly fiscal balance reports

### Transparency Data
- **Document Index**: Index of all transparency documents
- **Categories**: Document categories and classifications
- **Document Metadata**: Metadata for each transparency document

### Statistical Data
- **Demographics**: Population and demographic statistics
- **Economics**: Economic indicators and statistics
- **Social**: Social program statistics
- **Environment**: Environmental data and statistics

### Tender Data
- **Public Tenders**: Information about public tenders and contracts
- **Awarded Contracts**: Details of awarded contracts
- **Tender Process**: Information about the tender process

## Data Processing Pipeline

The data follows a standardized processing pipeline:

1. **Raw Data Collection**: PDF documents are collected from official sources
2. **OCR Extraction**: Text and tables are extracted from PDFs using OCR
3. **Data Structuring**: Extracted data is converted to structured CSV/JSON format
4. **Validation**: Data is validated for accuracy and completeness
5. **Organization**: Data is organized by year and category
6. **API Generation**: API-compatible JSON files are generated
7. **Web Publication**: Data is made available through web-accessible endpoints

## Data Standards

All data follows these standards:

- **Encoding**: UTF-8
- **Decimal Separator**: Period (.)
- **Thousands Separator**: Comma (,)
- **Currency**: Argentine Pesos (ARS)
- **Date Format**: ISO 8601 (YYYY-MM-DD)
- **File Format**: JSON and CSV

## Access Methods

### Direct File Access
Files can be accessed directly via their paths:
```
/data/processed/{year}/{filename}.csv
/data/web_accessible/{year}/{filename}.csv
```

### API Access
Data can be accessed via the REST API:
```
/api/financial/{year}/{endpoint}.json
```

### Web Interface
Data is displayed through the web interface at:
```
https://cda-transparencia.vercel.app/
```

## Data Licensing

All data is sourced from official municipal documents and is made available under the MIT License for transparency and public access purposes.

## Updates

Data is updated periodically as new documents are published by the municipality. The `generated_at` field in each JSON response indicates when the data was last processed.
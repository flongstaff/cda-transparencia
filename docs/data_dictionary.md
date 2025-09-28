# Data Dictionary for Carmen de Areco Transparency Portal

## Overview
This document provides a comprehensive description of each column, data source, and unit of measurement used in the Carmen de Areco transparency data project.

## Core Data Files

### 1. Budget Execution Files
**File Pattern:** `*budget*execution*.csv`

| Column Name | Data Type | Description | Units | Source |
|-------------|-----------|-------------|-------|--------|
| year | Integer | Fiscal year of the budget | Year | Municipal Records |
| sector | String | Government sector/department | N/A | Municipal Records |
| budget | Numeric | Allocated budget amount | Argentine Pesos (ARS) | Municipal Budget Office |
| executed | Numeric | Amount actually spent | Argentine Pesos (ARS) | Municipal Accounting |
| execution_percentage | Numeric | Percentage of budget executed | Percentage | Calculated |
| extraction_date | DateTime | Date when data was extracted | YYYY-MM-DD HH:MM:SS | Data Extraction Process |
| source_file | String | Name of source PDF file | N/A | Data Extraction Process |
| source_page | Integer | Page number in source document | Page number | Data Extraction Process |

### 2. Revenue Files
**File Pattern:** `*revenue*.csv`

| Column Name | Data Type | Description | Units | Source |
|-------------|-----------|-------------|-------|--------|
| year | Integer | Fiscal year | Year | Municipal Records |
| source | String | Revenue source category | N/A | Municipal Records |
| revenue | Numeric | Revenue amount | Argentine Pesos (ARS) | Municipal Accounting |
| extraction_date | DateTime | Date when data was extracted | YYYY-MM-DD HH:MM:SS | Data Extraction Process |
| source_file | String | Name of source PDF file | N/A | Data Extraction Process |

### 3. Expenditure Files
**File Pattern:** `*expenditure*.csv`

| Column Name | Data Type | Description | Units | Source |
|-------------|-----------|-------------|-------|--------|
| year | Integer | Fiscal year | Year | Municipal Records |
| sector | String | Government sector/department | N/A | Municipal Records |
| expenditure | Numeric | Expenditure amount | Argentine Pesos (ARS) | Municipal Accounting |
| category | String | Expenditure category | N/A | Municipal Records |
| extraction_date | DateTime | Date when data was extracted | YYYY-MM-DD HH:MM:SS | Data Extraction Process |
| source_file | String | Name of source PDF file | N/A | Data Extraction Process |

### 4. Gender Perspective Files
**File Pattern:** `*gender*.csv` or `*perspectiva_genero*.csv`

| Column Name | Data Type | Description | Units | Source |
|-------------|-----------|-------------|-------|--------|
| year | Integer | Fiscal year | Year | Municipal Records |
| sector | String | Government sector/department | N/A | Municipal Records |
| gender_inclusive_budget | Numeric | Budget allocated with gender perspective | Argentine Pesos (ARS) | Municipal Planning |
| total_budget | Numeric | Total sector budget | Argentine Pesos (ARS) | Municipal Budget Office |
| female_beneficiaries | Integer | Number of female beneficiaries | Count | Municipal Records |
| male_beneficiaries | Integer | Number of male beneficiaries | Count | Municipal Records |
| extraction_date | DateTime | Date when data was extracted | YYYY-MM-DD HH:MM:SS | Data Extraction Process |

### 5. Procurement Files
**File Pattern:** `*procurement*.csv`, `*tender*.csv`, `*licitacion*.csv`

| Column Name | Data Type | Description | Units | Source |
|-------------|-----------|-------------|-------|--------|
| tender_id | String | Unique tender identifier | N/A | Municipal Procurement Office |
| date | Date | Tender publication/approval date | YYYY-MM-DD | Municipal Procurement Office |
| year | Integer | Fiscal year | Year | Calculated |
| sector | String | Government sector/department | N/A | Municipal Records |
| procurement_type | String | Type of procurement (Bienes/Servicios/Obras) | N/A | Municipal Procurement Office |
| amount | Numeric | Tender amount | Argentine Pesos (ARS) | Municipal Procurement Office |
| contractor | String | Name of successful contractor | N/A | Municipal Procurement Office |
| duration_days | Integer | Contract duration in days | Days | Municipal Procurement Office |
| extraction_date | DateTime | Date when data was extracted | YYYY-MM-DD HH:MM:SS | Data Extraction Process |
| source_file | String | Name of source PDF file | N/A | Data Extraction Process |

## Data Sources

### Primary Sources
1. **Situacion-Economico-Financiera-*.pdf** - Official municipal financial reports
2. **Transparency Portal** - Carmen de Areco municipal transparency portal
3. **Annual Reports** - Municipal annual performance reports
4. **Procurement Documents** - Public tender documents and contracts

### Secondary Sources
1. **SIEMBRA Data** - Agricultural statistics (when available)
2. **Provincial Reports** - Buenos Aires province reports
3. **National Statistics** - INDEC and other national sources

## Data Quality Notes

### Missing Values
- Empty cells in budget/expenditure fields may indicate unaudited figures
- Missing sector information defaults to "General Government"

### Data Consistency
- All monetary values are in Argentine Pesos (ARS)
- Historical values are adjusted for inflation where possible
- Sector names are standardized using mapping rules

### Update Frequency
- Budget execution data: Quarterly
- Revenue and expenditure: Monthly
- Procurement data: As events occur
- Gender perspective data: Annually

## Methodology

### Data Collection
- PDF extraction using pdfplumber
- Web scraping of transparency portal
- OCR processing for scanned documents

### Data Cleaning
- Monetary value standardization (remove currency symbols, handle decimal separators)
- Sector name harmonization
- Duplicate removal
- Null value handling

### Data Validation
- Budget ≥ Execution validation
- Cross-source consistency checks
- Range validation for monetary values
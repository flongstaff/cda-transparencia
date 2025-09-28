# Carmen de Areco Transparency Data

This directory contains all the processed and organized data for the Carmen de Areco Transparency Portal.

## Directory Structure

```
data/
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
├── api/                      # API-compatible JSON files
│   ├── financial/
│   │   ├── 2017/
│   │   ├── 2018/
│   │   ├── 2019/
│   │   ├── 2020/
│   │   ├── 2021/
│   │   ├── 2022/
│   │   ├── 2023/
│   │   ├── 2024/
│   │   └── 2025/
│   ├── transparency/
│   ├── statistics/
│   ├── tenders/
│   └── index.json            # API index file
└── master_index.json         # Master index of all data files
```

## Data Organization

Each year directory contains:

- **CSV files**: Structured data in CSV format
- **JSON files**: Structured data in JSON format
- **consolidated_data.json**: Comprehensive consolidation of all data for that year

## API Access

API endpoints are available at:
- `/api/index.json` - API index
- `/api/financial/{year}/financial_summary.json` - Financial summary for a specific year
- `/api/financial/{year}/revenue_by_source.json` - Revenue breakdown by source
- `/api/financial/{year}/expenditure_by_program.json` - Expenditure breakdown by program

## Data Standards

- All monetary values are in Argentine Pesos (ARS)
- All data is UTF-8 encoded
- Decimal separator is period (.)
- Thousands separator is comma (,)

## Last Updated

Data was last organized on September 27, 2025.
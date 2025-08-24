# API Documentation

## Overview

The Transparency Portal API provides RESTful endpoints for accessing government transparency data. All endpoints return JSON data and follow standard HTTP status codes.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication for read operations. Administrative endpoints will require JWT authentication (to be implemented).

## Rate Limiting

Rate limiting will be implemented in future versions to prevent abuse (planned).

## Error Handling

All API errors follow the RFC 7807 Problem Details standard:

```json
{
  "type": "https://tools.ietf.org/html/rfc9457",
  "title": "An error occurred",
  "status": 404,
  "detail": "The requested resource was not found"
}
```

## API Endpoints

### Property Declarations
- `GET /api/declarations` - Get all property declarations
- `GET /api/declarations/:year` - Get declarations for a specific year
- `GET /api/declarations/official/:name` - Get declarations for a specific official

### Salaries
- `GET /api/salaries` - Get all salary data
- `GET /api/salaries/:year` - Get salary data for a specific year
- `GET /api/salaries/official/:name` - Get salary data for a specific official

### Public Tenders
- `GET /api/tenders` - Get all public tenders
- `GET /api/tenders/:year` - Get tenders for a specific year
- `GET /api/tenders/status/:status` - Get tenders by execution status

### Financial Reports
- `GET /api/reports` - Get all financial reports
- `GET /api/reports/:year` - Get reports for a specific year
- `GET /api/reports/:year/:quarter` - Get reports for a specific year and quarter

### Treasury Movements
- `GET /api/treasury` - Get all treasury movements
- `GET /api/treasury/:year` - Get movements for a specific year
- `GET /api/treasury/category/:category` - Get movements by category

### Fees and Rights
- `GET /api/fees` - Get all fees and rights data
- `GET /api/fees/:year` - Get data for a specific year
- `GET /api/fees/category/:category` - Get data by category

### Operational Expenses
- `GET /api/expenses` - Get all operational expenses
- `GET /api/expenses/:year` - Get expenses for a specific year
- `GET /api/expenses/category/:category` - Get expenses by category

### Municipal Debt
- `GET /api/debt` - Get all municipal debt data
- `GET /api/debt/:year` - Get debt data for a specific year
- `GET /api/debt/status/:status` - Get debt by status

### Investments and Assets
- `GET /api/investments` - Get all investments and assets
- `GET /api/investments/:year` - Get data for a specific year
- `GET /api/investments/type/:type` - Get data by asset type

### Financial Indicators
- `GET /api/indicators` - Get all financial indicators
- `GET /api/indicators/:year` - Get indicators for a specific year
- `GET /api/indicators/name/:name` - Get specific indicator data

## Data Models

### Property Declaration
```json
{
  "id": 1,
  "year": 2024,
  "official_name": "Juan Pérez",
  "role": "Intendente",
  "cuil": "20-12345678-9",
  "declaration_date": "2024-03-15",
  "status": "published",
  "uuid": "DDJJ-2024-001",
  "observations": "Declaración presentada dentro del plazo establecido",
  "public_verification": "Verificada por Contraloría",
  "critical_review": "Sin observaciones relevantes"
}
```

### Salary
```json
{
  "id": 1,
  "year": 2024,
  "official_name": "Juan Pérez",
  "role": "Intendente",
  "basic_salary": 450000.00,
  "adjustments": "Ajuste por paritarias 2024: +15%",
  "deductions": "SOMA: 3%, IPS: 11%",
  "net_salary": 387000.00,
  "inflation_rate": 12.5
}
```

### Public Tender
```json
{
  "id": 1,
  "year": 2024,
  "title": "Construcción de nuevo centro comunitario",
  "description": "Licitación para la construcción de un centro comunitario en el barrio San Martín",
  "budget": 15000000.00,
  "awarded_to": "Constructora ABC S.A.",
  "award_date": "2024-02-10",
  "execution_status": "in_progress",
  "delay_analysis": "Sin demoras significativas reportadas"
}
```

## Database Schema

### Property Declarations (Declaraciones Juradas Patrimoniales)
```sql
CREATE TABLE property_declarations (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  official_name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  cuil VARCHAR(20),
  declaration_date DATE,
  status VARCHAR(50),
  uuid VARCHAR(255),
  observations TEXT,
  public_verification TEXT,
  critical_review TEXT
);
```

### Salaries (Sueldos)
```sql
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  official_name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  basic_salary DECIMAL(12, 2),
  adjustments TEXT,
  deductions TEXT,
  net_salary DECIMAL(12, 2),
  inflation_rate DECIMAL(5, 2)
);
```

### Public Tenders (Licitaciones Públicas)
```sql
CREATE TABLE public_tenders (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(12, 2),
  awarded_to VARCHAR(255),
  award_date DATE,
  execution_status VARCHAR(100),
  delay_analysis TEXT
);
```

### Financial Reports (RAFAM)
```sql
CREATE TABLE financial_reports (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  quarter INTEGER,
  report_type VARCHAR(100),
  income DECIMAL(15, 2),
  expenses DECIMAL(15, 2),
  balance DECIMAL(15, 2),
  execution_percentage DECIMAL(5, 2)
);
```

### Treasury Movements (Movimientos de Tesorería)
```sql
CREATE TABLE treasury_movements (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  amount DECIMAL(15, 2),
  balance DECIMAL(15, 2),
  debt_tracking TEXT
);
```

### Fees and Rights (Tasas y Derechos)
```sql
CREATE TABLE fees_rights (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  category VARCHAR(100),
  description TEXT,
  revenue DECIMAL(15, 2),
  collection_efficiency DECIMAL(5, 2)
);
```

### Operational Expenses (Gastos Operativos)
```sql
CREATE TABLE operational_expenses (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  category VARCHAR(100),
  description TEXT,
  amount DECIMAL(15, 2),
  administrative_analysis TEXT
);
```

### Municipal Debt (Deuda Municipal)
```sql
CREATE TABLE municipal_debt (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  debt_type VARCHAR(100),
  description TEXT,
  amount DECIMAL(15, 2),
  interest_rate DECIMAL(5, 2),
  due_date DATE,
  status VARCHAR(50)
);
```

### Investments and Assets (Inversiones y Activos)
```sql
CREATE TABLE investments_assets (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  asset_type VARCHAR(100),
  description TEXT,
  value DECIMAL(15, 2),
  depreciation DECIMAL(15, 2),
  location VARCHAR(255)
);
```

### Financial Indicators (Indicadores Financieros)
```sql
CREATE TABLE financial_indicators (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  indicator_name VARCHAR(100),
  value DECIMAL(15, 2),
  description TEXT,
  comparison_previous_year DECIMAL(5, 2)
);
```
-- Create tables for the Transparency Portal

-- Property Declarations (Declaraciones Juradas Patrimoniales)
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

-- Salaries (Sueldos)
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

-- Public Tenders (Licitaciones Públicas)
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

-- Financial Reports (RAFAM)
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

-- Treasury Movements (Movimientos de Tesorería)
CREATE TABLE treasury_movements (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  amount DECIMAL(15, 2),
  balance DECIMAL(15, 2),
  debt_tracking TEXT
);

-- Fees and Rights (Tasas y Derechos)
CREATE TABLE fees_rights (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  category VARCHAR(100),
  description TEXT,
  revenue DECIMAL(15, 2),
  collection_efficiency DECIMAL(5, 2)
);

-- Operational Expenses (Gastos Operativos)
CREATE TABLE operational_expenses (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  category VARCHAR(100),
  description TEXT,
  amount DECIMAL(15, 2),
  administrative_analysis TEXT
);

-- Municipal Debt (Deuda Municipal)
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

-- Investments and Assets (Inversiones y Activos)
CREATE TABLE investments_assets (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  asset_type VARCHAR(100),
  description TEXT,
  value DECIMAL(15, 2),
  depreciation DECIMAL(15, 2),
  location VARCHAR(255)
);

-- Financial Indicators (Indicadores Financieros)
CREATE TABLE financial_indicators (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  indicator_name VARCHAR(100),
  value DECIMAL(15, 2),
  description TEXT,
  comparison_previous_year DECIMAL(5, 2)
);
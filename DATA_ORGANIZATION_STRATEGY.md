# Data Organization & Pipeline Strategy
Carmen de Areco Transparency Portal

## 1. Primary Data Storage: CSV Format

### Why CSV?
- Easy to parse, transform, and analyze
- Lightweight and efficient
- Universal compatibility with all tools
- Excellent for feeding into charts and visualizations
- Version control friendly (diffable)

### Target Data for CSV Storage

#### Financial Execution Data
```
data/execution/
├── quarterly/
│   ├── 2023_Q4.csv
│   └── 2024_Q1.csv
├── by_function/
│   ├── administration.csv
│   ├── health.csv
│   └── education.csv
└── by_source/
    ├── taxes.csv
    └── transfers.csv
```

#### SEF (Sistema Electrónico de Finanzas) Data
```
data/sef/
├── summary/
│   ├── 2023_summary.csv
│   └── 2024_summary.csv
├── revenues/
│   ├── 2023_revenues.csv
│   └── 2024_revenues.csv
└── expenses/
    ├── 2023_expenses.csv
    └── 2024_expenses.csv
```

#### Procurement Data
```
data/procurement/
├── licitaciones/
│   ├── licitaciones_2023.csv
│   └── licitaciones_2024.csv
├── adjudications/
│   ├── adjudications_2023.csv
│   └── adjudications_2024.csv
└── suppliers/
    ├── suppliers_2023.csv
    └── suppliers_2024.csv
```

#### Statistics Data
```
data/statistics/
├── health/
│   ├── health_indicators_2022.csv
│   └── health_indicators_2023.csv
├── production/
│   ├── production_2022.csv
│   └── production_2023.csv
└── social/
    ├── social_indicators_2022.csv
    └── social_indicators_icators_2023.csv
```

## 2. Metadata & Documentation

### JSON Metadata Structure

Each dataset will have corresponding metadata in JSON format:

```json
{
  "dataset_id": "execution_2024_Q2",
  "name": "Ejecución de Gastos Q2 2024",
  "description": "Quarterly execution of expenses by economic character",
  "year": 2024,
  "quarter": "Q2",
  "type": "Ejecucion de Gastos",
  "category": "finance",
  "source_url": "https://carmendeareco.gob.ar/wp-content/uploads/2024/08/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf",
  "local_file": "data/execution/2024_Q2.csv",
  "original_pdf": "data/raw_pdfs/2024/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf",
  "processing_date": "2024-09-30T10:30:00Z",
  "status": "parsed",
  "data_quality_score": 95,
  "record_count": 45,
  "columns": [
    {
      "name": "category",
      "type": "string",
      "description": "Expense category by economic character"
    },
    {
      "name": "budgeted",
      "type": "number",
      "description": "Budgeted amount in ARS"
    },
    {
      "name": "executed",
      "type": "number",
      "description": "Executed amount in ARS"
    },
    {
      "name": "execution_rate",
      "type": "number",
      "description": "Execution rate as percentage"
    }
  ],
  "anomalies": [
    {
      "type": "high_execution",
      "column": "execution_rate",
      "value": 125.3,
      "threshold": 120,
      "description": "Execution rate exceeds 120%"
    }
  ]
}
```

### Markdown Documentation

Each major dataset category will have detailed documentation in Markdown format:

```markdown
# Ejecución de Gastos Documentation

## Overview
This dataset contains quarterly execution of municipal expenses by economic character.

## Data Structure
- **category**: Expense category (e.g., Personal, Goods, Services)
- **budgeted**: Amount budgeted for the period (ARS)
- **executed**: Amount actually spent (ARS)
- **execution_rate**: Percentage of budget executed

## Interpretation Guidelines
- Execution rates between 90-110% are considered normal
- Rates below 80% may indicate under-execution
- Rates above 120% may indicate overspending or budget adjustments

## Anomaly Indicators
- **High execution**: >120% may indicate budget adjustments or overspending
- **Low execution**: <80% may indicate delayed projects or budget cuts
```

## 3. Original Reports: PDF Storage Strategy

### Storage Approach
Original PDFs will be stored separately to avoid repository bloat:

```
data/raw_pdfs/
├── 2023/
│   ├── Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf
│   └── Estado-de-Ejecucion-de-Gastos-por-Funcion-Junio.pdf
├── 2024/
│   ├── Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf
│   └── Estado-de-Ejecucion-de-Gastos-por-Funcion-Junio.pdf
└── metadata.json  # Index of all PDFs with metadata
```

### Repository Strategy
- Use Git LFS for PDF storage to prevent repository bloat
- Maintain metadata linking processed CSVs to original PDFs
- Provide direct download links in metadata for verification

## 4. External Sources Integration

### Carmen de Areco Transparency Portal Scraping
Automated ETL pipeline to:

1. **Monitor Portal**: Track official website for new reports
2. **Download PDFs**: Collect new documents automatically
3. **Parse Content**: Extract tabular data using OCR
4. **Generate CSVs**: Convert to structured data format
5. **Update Metadata**: Maintain comprehensive dataset index
6. **Flag Anomalies**: Detect unusual patterns during processing

### ETL Pipeline Components

```python
# scrape_portal.py
def scrape_transparency_portal():
    """Scrape Carmen de Areco official portal for new reports"""
    reports = []
    
    # Find new reports
    for report in find_new_reports():
        # Download PDF
        pdf_path = download_pdf(report.url)
        
        # Parse to CSV
        csv_path = parse_pdf_to_csv(pdf_path)
        
        # Generate metadata
        metadata = generate_metadata(report, csv_path, pdf_path)
        
        # Update index
        update_dataset_index(metadata)
        
        reports.append(metadata)
    
    return reports

def parse_pdf_to_csv(pdf_path):
    """Parse PDF and extract tabular data to CSV"""
    # Use pdfplumber, tabula, or OCR depending on PDF type
    tables = extract_tables_from_pdf(pdf_path)
    
    # Convert to CSV
    csv_path = convert_tables_to_csv(tables, pdf_path)
    
    return csv_path
```

## 5. Data Pipeline Workflow

### Complete Workflow

```
1. Raw Ingestion
   ↓
[data/raw_pdfs/] ← External Sources (Portal Scraping)
   ↓
2. ETL Processing
   ↓
[data/extracted/*.csv] ← PDF Parsing (pdfplumber/tabula/OCR)
   ↓
3. Data Transformation
   ↓
[data/processed/*.csv] ← Cleaning, Validation, Anomaly Detection
   ↓
4. Metadata Generation
   ↓
[data/metadata/*.json] ← Automated Documentation
   ↓
5. Index Creation
   ↓
[data/index.json] ← Comprehensive Dataset Catalog
   ↓
6. Frontend Integration
   ↓
[/public/data/] ← Ready for React Components
```

### Pipeline Automation

```bash
#!/bin/bash
# automation_pipeline.sh

echo "🚀 Starting Data Pipeline Automation..."

# Step 1: Scrape for new reports
echo "🔍 Scraping transparency portal for new reports..."
python scripts/scrape_portal.py

# Step 2: Process new PDFs
echo "📄 Processing new PDF reports..."
python scripts/process_pdfs.py

# Step 3: Validate and enrich data
echo "✅ Validating and enriching data..."
python scripts/validate_data.py

# Step 4: Generate metadata
echo "📝 Generating metadata and documentation..."
python scripts/generate_metadata.py

# Step 5: Update indexes
echo "📊 Updating dataset indexes..."
python scripts/update_indexes.py

# Step 6: Deploy to frontend
echo "🔄 Deploying to frontend..."
cp -r data/processed/* frontend/public/data/
cp data/index.json frontend/public/data/
cp data/metadata/*.json frontend/public/data/metadata/

echo "🎉 Data pipeline automation completed!"
```

## 6. Frontend Integration Strategy

### React Component Architecture

#### Data Hooks
```javascript
// src/hooks/useCsvData.js
import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function useCsvData(csvUrl) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, [csvUrl]);

  return { data, error, loading };
}
```

#### Chart Components
```javascript
// src/components/charts/FinancialExecutionChart.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import useCsvData from "../../hooks/useCsvData";

function FinancialExecutionChart({ csvUrl, title }) {
  const { data, error, loading } = useCsvData(csvUrl);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  // Color coding based on execution rate
  const getColor = (rate) => {
    if (rate > 120) return "#ff4444"; // Overspent - Red
    if (rate < 80) return "#ffbb33";  // Under-executed - Orange
    return "#00C851"; // Normal - Green
  };

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === "execution_rate") {
                return [`${value}%`, "Execution Rate"];
              }
              return [value.toLocaleString(), name];
            }}
          />
          <Legend />
          <Bar 
            dataKey="budgeted" 
            fill="#33b5e5" 
            name="Budgeted"
          />
          <Bar 
            dataKey="executed" 
            name="Executed"
            fill={(data) => getColor(data.execution_rate)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Dashboard Integration
```javascript
// src/pages/FinancialDashboard.js
import React, { useState } from "react";
import FinancialExecutionChart from "../components/charts/FinancialExecutionChart";
import AnomalyAlerts from "../components/analytics/AnomalyAlerts";
import YearSelector from "../components/controls/YearSelector";

function FinancialDashboard() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  return (
    <div className="dashboard">
      <div className="controls">
        <YearSelector 
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
        <button 
          onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
          className={showAnomaliesOnly ? "active" : ""}
        >
          Show Anomalies Only
        </button>
      </div>

      <AnomalyAlerts year={selectedYear} />

      <div className="charts-grid">
        <FinancialExecutionChart 
          csvUrl={`/data/execution/quarterly/${selectedYear}_Q2.csv`}
          title={`Financial Execution - Q2 ${selectedYear}`}
        />
        
        <FinancialExecutionChart 
          csvUrl={`/data/execution/by_function/administration_${selectedYear}.csv`}
          title={`Administration Expenses - ${selectedYear}`}
        />
        
        <FinancialExecutionChart 
          csvUrl={`/data/execution/by_function/health_${selectedYear}.csv`}
          title={`Health Expenses - ${selectedYear}`}
        />
      </div>
    </div>
  );
}
```

## 7. Corruption & Anomaly Analysis

### Anomaly Detection Framework

#### Flagging Patterns
1. **Execution Rate Anomalies**
   - Excessive execution (>120%)
   - Severe under-execution (<80%)

2. **Procurement Concentration**
   - Single supplier dominance (>70% of contracts)
   - Unusual spending spikes

3. **Temporal Irregularities**
   - Sudden budget increases/decreases
   - End-of-period spending surges

#### Implementation
```json
// data/anomalies/2024_q2_alerts.json
[
  {
    "id": "exe_high_001",
    "type": "high_execution",
    "severity": "warning",
    "dataset": "execution_2024_q2",
    "category": "Personal",
    "value": 125.3,
    "threshold": 120,
    "description": "Personal expenses exceeded budget by 25.3%",
    "recommendation": "Review budget adjustments and payroll records",
    "timestamp": "2024-09-30T10:30:00Z"
  },
  {
    "id": "proc_conc_002",
    "type": "supplier_concentration",
    "severity": "critical",
    "dataset": "procurement_2024_q2",
    "supplier": "CONSTRUCCIONES S.A.",
    "percentage": 73.2,
    "threshold": 70,
    "description": "Single supplier received 73.2% of total procurement",
    "recommendation": "Evaluate supplier diversification strategy",
    "timestamp": "2024-09-30T10:30:00Z"
  }
]
```

### Visual Corruption Highlighting

#### Color Coding Strategy
```javascript
// Anomaly-based color coding
const getExecutionColor = (rate) => {
  if (rate > 120) return "#ff4444"; // Critical overspending - Red
  if (rate > 110) return "#ff6b35"; // Moderate overspending - Orange-red
  if (rate > 100) return "#ffaa00"; // Slight overspending - Orange
  if (rate < 80) return "#cc0000";  // Severe under-execution - Dark red
  if (rate < 90) return "#ff6600";  // Moderate under-execution - Dark orange
  return "#00C851"; // Normal execution - Green
};
```

#### Chart Annotations
```javascript
// Add annotations for anomalies
const renderCustomizedLabel = (props) => {
  const { x, y, width, value, index } = props;
  const anomaly = checkForAnomaly(value);
  
  if (anomaly) {
    return (
      <g>
        <text x={x + width / 2} y={y - 10} fill="#ff4444" textAnchor="middle" fontWeight="bold">
          ⚠️ {anomaly.percentage}%
        </text>
      </g>
    );
  }
  return null;
};
```

#### Flags Dashboard
```javascript
// src/components/analytics/AnomalyDashboard.js
import React, { useState } from "react";
import useJsonData from "../../hooks/useJsonData";

function AnomalyDashboard() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const { data: alerts, loading, error } = useJsonData("/data/anomalies/latest.json");

  const filteredAlerts = alerts?.filter(alert => 
    severityFilter === "all" || alert.severity === severityFilter
  );

  return (
    <div className="anomaly-dashboard">
      <div className="filters">
        <select onChange={(e) => setSeverityFilter(e.target.value)} value={severityFilter}>
          <option value="all">All Severities</option>
          <option value="info">Informational</option>
          <option value="warning">Warnings</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="alerts-list">
        {filteredAlerts?.map(alert => (
          <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
            <div className="alert-header">
              <span className="alert-type">{alert.type.replace('_', ' ')}</span>
              <span className="alert-severity">{alert.severity}</span>
            </div>
            <div className="alert-content">
              <h4>{alert.description}</h4>
              <p><strong>Recommendation:</strong> {alert.recommendation}</p>
              <p><strong>Dataset:</strong> {alert.dataset}</p>
            </div>
            <div className="alert-footer">
              <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 8. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Establish data directory structure
- [ ] Create metadata schema and templates
- [ ] Implement basic CSV parsing hooks
- [ ] Set up Git LFS for PDF storage

### Phase 2: Data Processing Pipeline (Week 3-4)
- [ ] Develop PDF parsing and OCR pipeline
- [ ] Create ETL scripts for data transformation
- [ ] Implement anomaly detection algorithms
- [ ] Build automated metadata generation

### Phase 3: Frontend Integration (Week 5-6)
- [ ] Develop React components for data visualization
- [ ] Implement chart components with anomaly highlighting
- [ ] Create dashboard layouts
- [ ] Build anomaly alerts dashboard

### Phase 4: Automation & Monitoring (Week 7-8)
- [ ] Set up automated pipeline with scheduling
- [ ] Implement monitoring and alerting
- [ ] Create documentation and user guides
- [ ] Conduct testing and validation

## 9. Benefits of This Approach

### Data Integrity
- Multiple data sources reduce single points of failure
- Cross-validation improves accuracy
- Version-controlled history ensures transparency

### User Experience
- Rich, interactive visualizations
- Contextual information and explanations
- Anomaly detection and alerts
- Easy verification through original documents

### Technical Advantages
- Works with GitHub Pages deployment
- No backend dependencies
- Efficient caching and performance
- Scalable architecture

This strategy ensures that all data is complementary, with each source contributing unique value while maintaining a cohesive, reliable, and transparent system.
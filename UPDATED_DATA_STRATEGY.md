# Updated Data Organization Strategy
Aligned with Current Implementation

## Current Implementation Overview

Based on the verification, the current data organization follows this structure:

```
/public/data/
├── api/                     # API-related data
├── charts/                  # Consolidated chart-ready CSV files
├── consolidated/            # Year-specific consolidated JSON data
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── csv/                     # Raw CSV files
├── pdfs/                    # Processed PDF documents
├── processed/               # Processed data files
├── raw/                     # Raw data files
└── website_data/            # Website metadata and content
```

## Aligned Strategy for Enhanced Organization

### 1. Maintain Current Structure with Enhanced Categorization

```
/public/data/
├── api/                     # API-related data and routes
├── charts/                  # Chart-ready consolidated CSV files
│   ├── budget/              # Budget execution charts
│   ├── contracts/           # Contracts analysis charts
│   ├── salaries/            # Salary analysis charts
│   ├── treasury/            # Treasury analysis charts
│   ├── debt/                # Debt analysis charts
│   ├── documents/           # Document analysis charts
│   └── comprehensive/       # Multi-domain charts
├── consolidated/            # Year-specific consolidated JSON data
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── csv/                     # Raw CSV files
│   ├── budget/              # Budget CSV files
│   ├── contracts/           # Contracts CSV files
│   ├── salaries/            # Salary CSV files
│   ├── treasury/            # Treasury CSV files
│   ├── debt/                # Debt CSV files
│   └── documents/           # Document CSV files
├── pdfs/                    # Processed PDF documents
│   ├── budget/              # Budget PDFs
│   ├── contracts/           # Contracts PDFs
│   ├── salaries/            # Salary PDFs
│   ├── treasury/            # Treasury PDFs
│   ├── debt/                # Debt PDFs
│   └── documents/           # General documents
├── processed/               # Processed data files
├── raw/                     # Raw data files
├── metadata/                # Metadata and data indices
└── website_data/            # Website metadata and content
```

### 2. Enhanced Data Integration Approach

#### Primary Data Sources (Maintained)
1. **External APIs** - Government transparency portals and national databases
2. **Local CSV Files** - Processed government data in `/public/data/csv/`
3. **JSON Files** - Structured data in `/public/data/consolidated/`
4. **PDF Documents** - Processed documents in `/public/data/pdfs/`

#### Integration Strategy (Enhanced)
1. **Priority-Based Loading**
   - External APIs (real-time, highest priority)
   - Local JSON files (structured, medium priority)
   - Local CSV files (historical, lower priority)
   - PDF processed data (fallback, lowest priority)

2. **Cross-Domain Complementarity**
   - Each page receives data from multiple domains
   - Related data is automatically linked
   - Contextual information is provided alongside core data

### 3. CSV Data Organization (Enhanced)

#### Target Organization for CSV Files

```
/public/data/csv/
├── budget/
│   ├── execution/
│   │   ├── 2023_Q4.csv
│   │   ├── 2024_Q1.csv
│   │   └── 2024_Q2.csv
│   ├── sef/
│   │   ├── 2023_summary.csv
│   │   ├── 2024_summary.csv
│   │   └── 2024_Q2.csv
│   └── historical/
│       ├── budget_2019-2025.csv
│       └── execution_rates_2019-2025.csv
├── contracts/
│   ├── licitaciones/
│   │   ├── licitaciones_2023.csv
│   │   └── licitaciones_2024.csv
│   ├── adjudications/
│   │   ├── adjudications_2023.csv
│   │   └── adjudications_2024.csv
│   └── suppliers/
│       ├── suppliers_2023.csv
│       └── suppliers_2024.csv
├── salaries/
│   ├── personnel/
│   │   ├── personnel_2023.csv
│   │   └── personnel_2024.csv
│   └── positions/
│       ├── positions_2023.csv
│       └── positions_2024.csv
├── treasury/
│   ├── cashflow/
│   │   ├── cashflow_2023.csv
│   │   └── cashflow_2024.csv
│   └── balances/
│       ├── balances_2023.csv
│       └── balances_2024.csv
├── debt/
│   ├── obligations/
│   │   ├── obligations_2023.csv
│   │   └── obligations_2024.csv
│   └── servicing/
│       ├── servicing_2023.csv
│       └── servicing_2024.csv
└── documents/
    ├── reports/
    │   ├── reports_2023.csv
    │   └── reports_2024.csv
    └── inventory/
        ├── inventory_2023.csv
        └── inventory_2024.csv
```

### 4. JSON Data Structure (Enhanced)

#### Consolidated Data Structure

```json
{
  "year": 2024,
  "financialData": {
    "budget": {
      "total_budget": 324135000,
      "total_executed": 303702919,
      "execution_rate": 93.7,
      "categories": [
        {
          "name": "Personal",
          "budgeted": 150491250,
          "executed": 142345678,
          "execution_rate": 94.6
        }
      ],
      "monthly_data": [
        {
          "month": "January",
          "budgeted": 27011250,
          "executed": 25234567,
          "execution_rate": 93.4
        }
      ]
    },
    "contracts": [
      {
        "id": "CONT-2024-001",
        "title": "Road Maintenance Contract",
        "amount": 15000000,
        "date": "2024-01-15",
        "status": "completed",
        "vendor": "Construction Co.",
        "category": "Infrastructure"
      }
    ],
    "salaries": {
      "total_payroll": 150491250,
      "employee_count": 125,
      "average_salary": 1203930,
      "positions": [
        {
          "title": "Municipal Secretary",
          "count": 1,
          "total_cost": 2400000,
          "average_salary": 2400000
        }
      ]
    },
    "treasury": {
      "balance": 45678900,
      "income": 278900000,
      "expenses": 233221100
    },
    "debt": {
      "total_debt": 89000000,
      "annual_service": 12000000
    },
    "documents": [
      {
        "id": "DOC-2024-001",
        "title": "Q1 Budget Execution Report",
        "category": "Budget",
        "date": "2024-04-15",
        "url": "/data/pdfs/budget/q1_2024_execution.pdf",
        "verified": true
      }
    ]
  },
  "metadata": {
    "last_updated": "2024-09-30T18:50:04.348Z",
    "data_sources": [
      "external_api",
      "local_csv",
      "processed_pdfs"
    ],
    "quality_score": 92
  }
}
```

### 5. Enhanced Metadata System

#### Data Source Metadata

```json
{
  "dataset_id": "budget_execution_2024_q2",
  "name": "Budget Execution Q2 2024",
  "description": "Quarterly execution of municipal budget by category",
  "year": 2024,
  "quarter": "Q2",
  "type": "budget_execution",
  "category": "finance",
  "source_urls": [
    "https://carmendeareco.gob.ar/wp-content/uploads/2024/08/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf"
  ],
  "local_files": {
    "csv": "/data/csv/budget/execution/2024_Q2.csv",
    "json": "/data/consolidated/2024/budget.json",
    "pdf": "/data/pdfs/budget/2024/Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf"
  },
  "processing_info": {
    "method": "pdf_extraction",
    "extraction_tool": "tabula",
    "processed_date": "2024-09-30T10:30:00Z",
    "quality_score": 95
  },
  "anomalies": [],
  "related_datasets": [
    "contracts_2024_q2",
    "salaries_2024_q2"
  ]
}
```

### 6. Frontend Integration Strategy (Enhanced)

#### CSV Data Hook with Enhanced Error Handling

```typescript
// src/hooks/useCsvData.ts
import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";

interface CsvDataState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface PapaParseOptions {
  header?: boolean;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
}

// Cache for CSV data
const csvCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function useCsvData<T>(
  csvUrl: string | null,
  options: PapaParseOptions = {}
): CsvDataState<T> {
  const [state, setState] = useState<CsvDataState<T>>({
    data: null,
    loading: false,
    error: null,
    refetch: () => {}
  });

  const loadData = useCallback(async () => {
    if (!csvUrl) {
      setState(prev => ({ ...prev, data: null, loading: false, error: null }));
      return;
    }

    // Check cache first
    const cached = csvCache.get(csvUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setState(prev => ({
        ...prev,
        data: cached.data as T[],
        loading: false,
        error: null
      }));
      return;
    }

    // Set loading state
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Parse CSV data
      const result = await new Promise<{ data: T[]; errors: any[] }>((resolve, reject) => {
        Papa.parse(csvUrl, {
          download: true,
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          ...options,
          complete: (results) => {
            resolve({
              data: results.data as T[],
              errors: results.errors
            });
          },
          error: (error) => {
            reject(error);
          }
        });
      });

      // Process and clean data
      const cleanData = result.data.filter((row: any) =>
        Object.values(row).some(value => value !== null && value !== '')
      );

      // Cache the data
      csvCache.set(csvUrl, {
        data: cleanData,
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        data: cleanData,
        loading: false,
        error: null
      }));
    } catch (error: any) {
      console.error(`❌ Error loading CSV data from ${csvUrl}:`, error);
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: error
      }));
    }
  }, [csvUrl, options]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    refetch: loadData
  };
}
```

#### Enhanced Chart Component with Anomaly Detection

```typescript
// src/components/charts/EnhancedBudgetChart.tsx
import React, { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface BudgetDataPoint {
  category: string;
  budgeted: number;
  executed: number;
  execution_rate: number;
  anomaly?: boolean;
  anomaly_type?: 'high' | 'low';
  anomaly_severity?: 'warning' | 'critical';
}

interface EnhancedBudgetChartProps {
  data: BudgetDataPoint[];
  title: string;
  showAnomalies?: boolean;
}

const EnhancedBudgetChart: React.FC<EnhancedBudgetChartProps> = ({ 
  data, 
  title, 
  showAnomalies = true 
}) => {
  // Process data to detect anomalies
  const processedData = useMemo(() => {
    return data.map(item => {
      let anomaly = false;
      let anomaly_type: 'high' | 'low' | undefined;
      let anomaly_severity: 'warning' | 'critical' | undefined;
      
      // Detect execution anomalies
      if (item.execution_rate > 120) {
        anomaly = true;
        anomaly_type = 'high';
        anomaly_severity = item.execution_rate > 150 ? 'critical' : 'warning';
      } else if (item.execution_rate < 80) {
        anomaly = true;
        anomaly_type = 'low';
        anomaly_severity = item.execution_rate < 50 ? 'critical' : 'warning';
      }
      
      return {
        ...item,
        anomaly,
        anomaly_type,
        anomaly_severity
      };
    });
  }, [data]);

  // Get bar color based on execution rate and anomalies
  const getBarColor = (rate: number, anomaly?: boolean, severity?: string) => {
    if (anomaly) {
      if (severity === 'critical') return '#ff4444'; // Critical red
      return '#ffaa00'; // Warning orange
    }
    if (rate > 120) return '#ff6b35'; // Overspent orange-red
    if (rate > 100) return '#ffaa00'; // Slight overspent orange
    if (rate < 80) return '#ff6600'; // Under-executed dark orange
    return '#00C851'; // Normal green
  };

  // Custom tooltip with anomaly information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-dark-surface p-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 dark:text-dark-text-primary">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Budgeted: ${data.budgeted?.toLocaleString()}
          </p>
          <p className="text-green-600 dark:text-green-400">
            Executed: ${data.executed?.toLocaleString()}
          </p>
          <p className={`font-semibold ${
            data.anomaly ? 
              (data.anomaly_severity === 'critical' ? 'text-red-600' : 'text-orange-600') :
              'text-gray-700'
          }`}>
            Execution Rate: {data.execution_rate?.toFixed(1)}%
          </p>
          
          {data.anomaly && (
            <div className={`mt-2 flex items-center ${
              data.anomaly_severity === 'critical' ? 'text-red-600' : 'text-orange-600'
            }`}>
              {data.anomaly_severity === 'critical' ? 
                <AlertTriangle className="w-4 h-4 mr-1" /> : 
                <AlertTriangle className="w-4 h-4 mr-1" />
              }
              <span className="font-medium">
                {data.anomaly_type === 'high' ? 'High execution' : 'Low execution'}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center">
        {title}
        {showAnomalies && processedData.some(d => d.anomaly) && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {processedData.filter(d => d.anomaly).length} anomalies
          </span>
        )}
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis 
              dataKey="category" 
              angle={-45} 
              textAnchor="end" 
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            
            <Bar 
              dataKey="budgeted" 
              fill="#33b5e5" 
              name="Budgeted"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="executed" 
              name="Executed"
              radius={[4, 4, 0, 0]}
              fill={(data) => getBarColor(
                data.execution_rate, 
                data.anomaly, 
                data.anomaly_severity
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {showAnomalies && processedData.some(d => d.anomaly) && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Anomalies Detected
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Some categories show unusual execution rates. Review these entries for potential issues.
              </p>
              <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                {processedData
                  .filter(d => d.anomaly)
                  .map((item, index) => (
                    <li key={index} className="flex items-center mt-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>
                        {item.category}: {item.execution_rate.toFixed(1)}% 
                        {item.anomaly_type === 'high' ? ' (overspent)' : ' (under-executed)'}
                      </span>
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBudgetChart;
```

### 7. Data Pipeline Enhancement Strategy

#### Automated CSV Organization Script

```bash
#!/bin/bash
# scripts/organize-csv-data.sh

echo "📦 Organizing CSV data files..."

# Create directory structure
mkdir -p public/data/csv/{budget,contracts,salaries,treasury,debt,documents}/{execution,sef,historical,licitaciones,adjudications,suppliers,personnel,positions,cashflow,balances,obligations,servicing,reports,inventory}

# Move existing CSV files to appropriate directories
# Budget files
mv public/data/csv/*budget* public/data/csv/budget/ 2>/dev/null || true
mv public/data/csv/*Budget* public/data/csv/budget/ 2>/dev/null || true

# Contracts files
mv public/data/csv/*contract* public/data/csv/contracts/ 2>/dev/null || true
mv public/data/csv/*Contract* public/data/csv/contracts/ 2>/dev/null || true

# Salary files
mv public/data/csv/*salary* public/data/csv/salaries/ 2>/dev/null || true
mv public/data/csv/*Salary* public/data/csv/salaries/ 2>/dev/null || true

# Treasury files
mv public/data/csv/*treasury* public/data/csv/treasury/ 2>/dev/null || true
mv public/data/csv/*Treasury* public/data/csv/treasury/ 2>/dev/null || true

# Debt files
mv public/data/csv/*debt* public/data/csv/debt/ 2>/dev/null || true
mv public/data/csv/*Debt* public/data/csv/debt/ 2>/dev/null || true

# Document files
mv public/data/csv/*document* public/data/csv/documents/ 2>/dev/null || true
mv public/data/csv/*Document* public/data/csv/documents/ 2>/dev/null || true

echo "✅ CSV data files organized successfully!"
```

### 8. GitHub Pages & Cloudflare Deployment Compatibility

#### Enhanced Data Service with Dual Mode Support

```typescript
// src/services/GitHubDataService.ts (enhanced)
class GitHubDataService {
  private static instance: GitHubDataService;
  private cache = new Map<string, { data: any; timestamp: number; etag?: string }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private config = {
    owner: 'flongstaff',
    repo: 'cda-transparencia',
    branch: 'main',
    baseUrl: 'https://raw.githubusercontent.com'
  };

  // Check if running in GitHub Pages environment
  private isGitHubPages(): boolean {
    return window.location.hostname.includes('github.io') || 
           window.location.hostname.includes('pages.dev'); // Cloudflare Pages
  }

  // Get appropriate base URL based on environment
  private getBaseUrl(): string {
    if (this.isGitHubPages()) {
      // Production: Use GitHub raw URLs
      return `${this.config.baseUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}`;
    } else {
      // Development: Use local paths
      return '';
    }
  }

  // Enhanced fetch method with fallback logic
  async fetchFile(filePath: string): Promise<any> {
    const cacheKey = `file:${filePath}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;

    try {
      console.log(`📥 Fetching file: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/csv, application/pdf',
          'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      // Determine content type and parse accordingly
      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/csv')) {
        const text = await response.text();
        // Parse CSV data
        const csvData = await new Promise((resolve, reject) => {
          Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error)
          });
        });
        data = csvData;
      } else {
        // Return as text for other file types
        data = await response.text();
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        etag: response.headers.get('etag') || undefined
      });

      return data;
    } catch (error) {
      console.error(`❌ Error fetching file ${url}:`, error);
      
      // Fallback to local file in development
      if (!this.isGitHubPages()) {
        try {
          const localUrl = `${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
          console.log(`🔄 Trying fallback to local file: ${localUrl}`);
          const localResponse = await fetch(localUrl);
          if (localResponse.ok) {
            return await localResponse.json();
          }
        } catch (localError) {
          console.error(`❌ Local fallback also failed:`, localError);
        }
      }
      
      throw error;
    }
  }
}
```

### 9. Implementation Roadmap

#### Phase 1: Directory Structure Enhancement (Week 1)
- [ ] Create enhanced directory structure for CSV files
- [ ] Move existing files to appropriate categories
- [ ] Update data loading paths in services

#### Phase 2: Data Integration Enhancement (Week 2)
- [ ] Enhance data integration service with priority-based loading
- [ ] Implement cross-domain data linking
- [ ] Add comprehensive metadata generation

#### Phase 3: Frontend Component Enhancement (Week 3)
- [ ] Update chart components with anomaly detection
- [ ] Implement enhanced CSV data hooks
- [ ] Add visual indicators for data quality

#### Phase 4: Deployment Optimization (Week 4)
- [ ] Enhance GitHub data service with dual-mode support
- [ ] Optimize caching strategies
- [ ] Verify Cloudflare Pages compatibility

## Conclusion

This updated strategy maintains compatibility with the existing implementation while enhancing the organization and integration of data from multiple sources. The approach ensures:

✅ **Complementary Data**: Each page receives data from multiple sources
✅ **GitHub Pages Compatibility**: Works without backend processes or tunnels
✅ **Cloudflare Deployment**: Ready for Cloudflare Pages deployment
✅ **Data Integrity**: Maintains data quality through cross-validation
✅ **Scalability**: Supports growth with organized data structure

The system will provide rich, contextual information by combining external APIs, local CSV/JSON files, and processed PDF data while maintaining full compatibility with static hosting platforms.
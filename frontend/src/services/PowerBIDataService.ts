/**
 * PowerBI Data Service - Handles PowerBI integration and data visualization
 * This service provides PowerBI-compatible data formatting and dashboard integration
 */

import { consolidatedApiService } from './ConsolidatedApiService';

interface PowerBIDataset {
  name: string;
  tables: PowerBITable[];
}

interface PowerBITable {
  name: string;
  columns: PowerBIColumn[];
  rows: any[][];
}

interface PowerBIColumn {
  name: string;
  dataType: string;
}

class PowerBIDataService {
  async getFinancialDataset(year: number): Promise<PowerBIDataset> {
    try {
      const budgetData = await consolidatedApiService.getBudgetData(year);
      
      return {
        name: `Financial Data ${year}`,
        tables: [
          {
            name: 'BudgetExecution',
            columns: [
              { name: 'Category', dataType: 'string' },
              { name: 'Budgeted', dataType: 'number' },
              { name: 'Executed', dataType: 'number' },
              { name: 'ExecutionRate', dataType: 'number' }
            ],
            rows: Object.entries(budgetData.categories || {}).map(([category, data]) => [
              category,
              data.budgeted || 0,
              data.executed || 0,
              parseFloat(data.execution_rate || '0')
            ])
          }
        ]
      };
    } catch (error) {
      console.error('Error getting PowerBI financial dataset:', error);
      return {
        name: `Financial Data ${year}`,
        tables: []
      };
    }
  }

  async getTransparencyDataset(): Promise<PowerBIDataset> {
    try {
      const documents = await consolidatedApiService.getDocuments();
      
      return {
        name: 'Transparency Documents',
        tables: [
          {
            name: 'Documents',
            columns: [
              { name: 'Title', dataType: 'string' },
              { name: 'Category', dataType: 'string' },
              { name: 'Year', dataType: 'number' },
              { name: 'Size_MB', dataType: 'number' },
              { name: 'Verified', dataType: 'boolean' }
            ],
            rows: documents.map(doc => [
              doc.title,
              doc.category || 'General',
              doc.year || new Date().getFullYear(),
              parseFloat(doc.size_mb || '0'),
              doc.verification_status === 'verified'
            ])
          }
        ]
      };
    } catch (error) {
      console.error('Error getting PowerBI transparency dataset:', error);
      return {
        name: 'Transparency Documents',
        tables: []
      };
    }
  }

  async getMunicipalDataset(year: number): Promise<PowerBIDataset> {
    try {
      const yearlyData = await consolidatedApiService.getYearlyData(year);
      
      return {
        name: `Municipal Data ${year}`,
        tables: [
          {
            name: 'Summary',
            columns: [
              { name: 'Metric', dataType: 'string' },
              { name: 'Value', dataType: 'number' },
              { name: 'Year', dataType: 'number' }
            ],
            rows: [
              ['Total Documents', yearlyData.total_documents || 0, year],
              ['Verified Documents', yearlyData.verified_documents || 0, year],
              ['Transparency Score', yearlyData.summary?.transparency_score || 0, year],
              ['Total Budget', yearlyData.budget?.total_budgeted || 0, year],
              ['Budget Executed', yearlyData.budget?.total_executed || 0, year]
            ]
          }
        ]
      };
    } catch (error) {
      console.error('Error getting PowerBI municipal dataset:', error);
      return {
        name: `Municipal Data ${year}`,
        tables: []
      };
    }
  }

  formatForPowerBI(data: any[], columns: string[]): PowerBITable {
    return {
      name: 'FormattedData',
      columns: columns.map(col => ({ name: col, dataType: 'string' })),
      rows: data.map(item => columns.map(col => item[col] || ''))
    };
  }

  async exportToPowerBI(dataset: PowerBIDataset): Promise<string> {
    // Return JSON that can be imported into PowerBI
    return JSON.stringify(dataset, null, 2);
  }
}

export default new PowerBIDataService();
export { PowerBIDataService };
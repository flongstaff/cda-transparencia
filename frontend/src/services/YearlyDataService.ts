import ApiService from './ApiService';

export interface YearlyDataPoint {
  year: number;
  name?: string;
  value: number;
  count?: number;
  total?: number;
  average?: number;
  percentage?: number;
  category?: string;
  description?: string;
}

export interface YearlyComparisonData {
  data: YearlyDataPoint[];
  comparison?: YearlyDataPoint[];
  statistics: {
    total: number;
    average: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
}

class YearlyDataService {
  private formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  private calculateGrowthRate = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  private getTrend = (data: YearlyDataPoint[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3);
    const avgRecent = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const older = data.slice(0, Math.max(1, data.length - 3));
    const avgOlder = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    
    const difference = ((avgRecent - avgOlder) / avgOlder) * 100;
    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'stable';
  };

  async getSalaryDataByYear(startYear: number = 2018, endYear: number = 2025): Promise<YearlyComparisonData> {
    try {
      const yearlyData: YearlyDataPoint[] = [];
      
      for (let year = startYear; year <= endYear; year++) {
        try {
          const salaries = await ApiService.getSalaries(year);
          const totalSalaries = salaries.reduce((sum, salary) => sum + salary.net_salary, 0);
          const averageSalary = salaries.length > 0 ? totalSalaries / salaries.length : 0;
          
          yearlyData.push({
            year,
            name: year.toString(),
            value: totalSalaries,
            count: salaries.length,
            average: averageSalary,
            category: 'salarios',
            description: `${salaries.length} empleados municipales`
          });
        } catch (error) {
          // If no data for specific year, add zero entry
          yearlyData.push({
            year,
            name: year.toString(),
            value: 0,
            count: 0,
            average: 0,
            category: 'salarios',
            description: 'Sin datos disponibles'
          });
        }
      }

      const validData = yearlyData.filter(d => d.value > 0);
      const total = validData.reduce((sum, d) => sum + d.value, 0);
      const average = validData.length > 0 ? total / validData.length : 0;
      
      // Calculate year-over-year growth
      const currentYear = validData[validData.length - 1];
      const previousYear = validData[validData.length - 2];
      const growth = currentYear && previousYear ? 
        this.calculateGrowthRate(currentYear.value, previousYear.value) : 0;

      return {
        data: yearlyData,
        statistics: {
          total,
          average,
          growth,
          trend: this.getTrend(validData)
        }
      };
    } catch (error) {
      console.error('Error fetching salary data by year:', error);
      throw new Error('Failed to fetch salary data');
    }
  }

  async getFinancialDataByYear(startYear: number = 2018, endYear: number = 2025): Promise<YearlyComparisonData> {
    try {
      const yearlyData: YearlyDataPoint[] = [];
      
      for (let year = startYear; year <= endYear; year++) {
        try {
          const reports = await ApiService.getFinancialReports(year);
          const totalIncome = reports.reduce((sum, report) => sum + report.income, 0);
          const totalExpenses = reports.reduce((sum, report) => sum + report.expenses, 0);
          const avgExecution = reports.length > 0 ? 
            reports.reduce((sum, report) => sum + report.execution_percentage, 0) / reports.length : 0;
          
          yearlyData.push({
            year,
            name: year.toString(),
            value: totalIncome,
            total: totalExpenses,
            count: reports.length,
            percentage: avgExecution,
            category: 'financiero',
            description: `${reports.length} reportes financieros`
          });
        } catch (error) {
          yearlyData.push({
            year,
            name: year.toString(),
            value: 0,
            total: 0,
            count: 0,
            percentage: 0,
            category: 'financiero',
            description: 'Sin datos disponibles'
          });
        }
      }

      const validData = yearlyData.filter(d => d.value > 0);
      const total = validData.reduce((sum, d) => sum + d.value, 0);
      const average = validData.length > 0 ? total / validData.length : 0;
      
      const currentYear = validData[validData.length - 1];
      const previousYear = validData[validData.length - 2];
      const growth = currentYear && previousYear ? 
        this.calculateGrowthRate(currentYear.value, previousYear.value) : 0;

      return {
        data: yearlyData,
        statistics: {
          total,
          average,
          growth,
          trend: this.getTrend(validData)
        }
      };
    } catch (error) {
      console.error('Error fetching financial data by year:', error);
      throw new Error('Failed to fetch financial data');
    }
  }

  async getPublicTenderDataByYear(startYear: number = 2018, endYear: number = 2025): Promise<YearlyComparisonData> {
    try {
      const yearlyData: YearlyDataPoint[] = [];
      
      for (let year = startYear; year <= endYear; year++) {
        try {
          const tenders = await ApiService.getPublicTenders(year);
          const totalBudget = tenders.reduce((sum, tender) => sum + (tender.budget || 0), 0);
          const avgBudget = tenders.length > 0 ? totalBudget / tenders.length : 0;
          
          yearlyData.push({
            year,
            name: year.toString(),
            value: totalBudget,
            count: tenders.length,
            average: avgBudget,
            category: 'licitaciones',
            description: `${tenders.length} licitaciones públicas`
          });
        } catch (error) {
          yearlyData.push({
            year,
            name: year.toString(),
            value: 0,
            count: 0,
            average: 0,
            category: 'licitaciones',
            description: 'Sin datos disponibles'
          });
        }
      }

      const validData = yearlyData.filter(d => d.value > 0);
      const total = validData.reduce((sum, d) => sum + d.value, 0);
      const average = validData.length > 0 ? total / validData.length : 0;
      
      const currentYear = validData[validData.length - 1];
      const previousYear = validData[validData.length - 2];
      const growth = currentYear && previousYear ? 
        this.calculateGrowthRate(currentYear.value, previousYear.value) : 0;

      return {
        data: yearlyData,
        statistics: {
          total,
          average,
          growth,
          trend: this.getTrend(validData)
        }
      };
    } catch (error) {
      console.error('Error fetching public tender data by year:', error);
      throw new Error('Failed to fetch public tender data');
    }
  }

  async getDocumentDataByYear(startYear: number = 2018, endYear: number = 2025): Promise<YearlyComparisonData> {
    try {
      const yearlyData: YearlyDataPoint[] = [];
      
      for (let year = startYear; year <= endYear; year++) {
        try {
          const documents = await ApiService.getTransparencyDocuments(year);
          
          yearlyData.push({
            year,
            name: year.toString(),
            value: documents.length,
            count: documents.length,
            category: 'documentos',
            description: `${documents.length} documentos de transparencia`
          });
        } catch (error) {
          yearlyData.push({
            year,
            name: year.toString(),
            value: 0,
            count: 0,
            category: 'documentos',
            description: 'Sin datos disponibles'
          });
        }
      }

      const validData = yearlyData.filter(d => d.value > 0);
      const total = validData.reduce((sum, d) => sum + d.value, 0);
      const average = validData.length > 0 ? total / validData.length : 0;
      
      const currentYear = validData[validData.length - 1];
      const previousYear = validData[validData.length - 2];
      const growth = currentYear && previousYear ? 
        this.calculateGrowthRate(currentYear.value, previousYear.value) : 0;

      return {
        data: yearlyData,
        statistics: {
          total,
          average,
          growth,
          trend: this.getTrend(validData)
        }
      };
    } catch (error) {
      console.error('Error fetching document data by year:', error);
      throw new Error('Failed to fetch document data');
    }
  }

  async getComprehensiveYearlyData(year: number): Promise<{
    salaries: YearlyDataPoint;
    financial: YearlyDataPoint;
    tenders: YearlyDataPoint;
    documents: YearlyDataPoint;
  }> {
    try {
      const [salaryData, financialData, tenderData, documentData] = await Promise.all([
        this.getSalaryDataByYear(year, year),
        this.getFinancialDataByYear(year, year),
        this.getPublicTenderDataByYear(year, year),
        this.getDocumentDataByYear(year, year)
      ]);

      return {
        salaries: salaryData.data[0] || { year, name: year.toString(), value: 0, category: 'salarios' },
        financial: financialData.data[0] || { year, name: year.toString(), value: 0, category: 'financiero' },
        tenders: tenderData.data[0] || { year, name: year.toString(), value: 0, category: 'licitaciones' },
        documents: documentData.data[0] || { year, name: year.toString(), value: 0, category: 'documentos' }
      };
    } catch (error) {
      console.error('Error fetching comprehensive yearly data:', error);
      throw new Error('Failed to fetch comprehensive data');
    }
  }

  formatValueForDisplay(value: number, category: string): string {
    switch (category) {
      case 'salarios':
      case 'financiero':
      case 'licitaciones':
        return this.formatCurrency(value);
      case 'documentos':
        return value.toString();
      default:
        return value.toLocaleString();
    }
  }
}

export default new YearlyDataService();
// API Service for Carmen de Areco Transparency Portal
// Live data integration for financial transparency investigation
import { API_BASE_URL, API_CONFIG, buildApiUrl, validateTransparencyData } from '../config/api';

// Use the local backend API

// Helper function to convert string values to numbers in API responses
const transformApiResponse = <T>(data: any): T => {
  if (Array.isArray(data)) {
    return data.map(item => transformApiResponse(item)) as unknown as T;
  }
  
  if (data && typeof data === 'object') {
    const transformed: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        // Convert string numbers to actual numbers
        if (typeof value === 'string' && !isNaN(parseFloat(value)) && !isNaN(Number(value))) {
          transformed[key] = parseFloat(value);
        } else {
          transformed[key] = value;
        }
      }
    }
    return transformed;
  }
  
  return data;
};

export interface OfficialDocument {
  filename: string;
  year: number;
  type: string;
  download_url: string;
  official_url: string;
  archive_url: string;
  verification_status: 'verified' | 'partial' | 'unverified';
  download_date: string;
}

export interface PropertyDeclaration {
  id: number;
  year: number;
  official_name: string;
  role: string;
  cuil: string;
  declaration_date: string;
  status: string;
  uuid: string;
  observations: string;
  public_verification: string;
  critical_review: string;
  total_assets?: number;
  real_estate?: number;
  vehicles?: number;
  investments?: number;
  bank_accounts?: number;
  previous_year_assets?: number;
  change_percentage?: number;
  compliance_score?: number;
}

export interface Salary {
  id: number;
  year: number;
  official_name: string;
  role: string;
  basic_salary: number;
  adjustments: string;
  deductions: string;
  net_salary: number;
  inflation_rate: number;
  collection_efficiency?: number;
  previous_year_salary?: number;
  salary_change?: number;
}

export interface PublicTender {
  id: number;
  year: number;
  title: string;
  description: string;
  budget: number;
  awarded_to: string;
  award_date: string;
  execution_status: string;
  delay_analysis: string;
  estimated_amount?: number;
  actual_cost?: number;
  completion_percentage?: number;
}

export interface FinancialReport {
  id: number;
  year: number;
  quarter: number;
  report_type: string;
  income: number;
  expenses: number;
  balance: number;
  execution_percentage: number;
  planned_income?: number;
  planned_expenses?: number;
  variance_income?: number;
  variance_expenses?: number;
}

export interface TreasuryMovement {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  balance: number;
  debt_tracking: string;
  monthly_total?: number;
  cumulative_balance?: number;
}

export interface FeeRight {
  id: number;
  year: number;
  category: string;
  description: string;
  revenue: number;
  collection_efficiency: number;
  monthly_revenue?: number;
  quarterly_total?: number;
  annual_projection?: number;
}

export interface OperationalExpense {
  id: number;
  year: number;
  category: string;
  description: string;
  amount: number;
  administrative_analysis: string;
  monthly_amount?: number;
  quarterly_total?: number;
  budget_allocation?: number;
  execution_percentage?: number;
}

export interface MunicipalDebt {
  id: number;
  year: number;
  debt_type: string;
  description: string;
  amount: number;
  interest_rate: number;
  due_date: string;
  status: string;
  principal_amount?: number;
  accrued_interest?: number;
  remaining_term?: number;
}

export interface InvestmentAsset {
  id: number;
  year: number;
  asset_type: string;
  description: string;
  value: number;
  depreciation: number;
  location: string;
  net_value?: number;
  age_years?: number;
  condition_rating?: number;
}

export interface FinancialIndicator {
  id: number;
  year: number;
  indicator_name: string;
  value: number;
  description: string;
  comparison_previous_year: number;
  target_value?: number;
  deviation_from_target?: number;
  trend_direction?: 'up' | 'down' | 'stable';
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}, dataSources: string[] = ['database_local', 'official_site']): Promise<T> {
    // Add data sources as query parameters
    const dataSourceParams = dataSources.map(source => `source=${source}`).join('&');
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}/api${endpoint}${separator}${dataSourceParams}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const rawData = await response.json();
        return transformApiResponse<T>(rawData);
      } else {
        // Handle non-JSON responses
        throw new Error('API response is not JSON');
      }
    } catch (error) {
      console.error(`API request error for ${url}:`, error);
      throw error;
    }
  }

  // Property Declarations
  async getPropertyDeclarations(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<PropertyDeclaration[]> {
    try {
      const endpoint = year 
        ? `/declarations/year/${year}`
        : '/declarations';
      return await this.request<PropertyDeclaration[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch property declarations:', error);
      return []; // Return empty array as fallback
    }
  }

  async getPropertyDeclarationById(id: number): Promise<PropertyDeclaration> {
    try {
      return await this.request<PropertyDeclaration>(`/declarations/${id}`);
    } catch (error) {
      console.error(`Failed to fetch property declaration with id ${id}:`, error);
      return {} as PropertyDeclaration; // Return empty object as fallback
    }
  }

  // Salaries
  async getSalaries(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<Salary[]> {
    try {
      const endpoint = year 
        ? `/salaries/year/${year}`
        : '/salaries';
      return await this.request<Salary[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch salaries:', error);
      return []; // Return empty array as fallback
    }
  }

  // Official Documents
  async getOfficialDocuments(): Promise<{ documents: OfficialDocument[], total: number }> {
    try {
      return await this.request<{ documents: OfficialDocument[], total: number }>('/documents');
    } catch (error) {
      console.error('Failed to fetch official documents:', error);
      return { documents: [], total: 0 }; // Return empty result as fallback
    }
  }

  async downloadDocument(year: number, filename: string): Promise<Blob> {
    try {
      const url = `${API_BASE_URL}/api/documents/${year}/${filename}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error(`Failed to download document ${filename} for year ${year}:`, error);
      return new Blob(); // Return empty blob as fallback
    }
  }

  // Public Tenders
  async getPublicTenders(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<PublicTender[]> {
    try {
      const endpoint = year 
        ? `/tenders/year/${year}`
        : '/tenders';
      return await this.request<PublicTender[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch public tenders:', error);
      return []; // Return empty array as fallback
    }
  }

  // Financial Reports
  async getFinancialReports(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<FinancialReport[]> {
    try {
      const endpoint = year 
        ? `/reports/year/${year}`
        : '/reports';
      const data = await this.request<any[]>(endpoint, {}, dataSources);
      
      // Transform string values to numbers
      return data.map(report => ({
        ...report,
        income: typeof report.income === 'string' ? parseFloat(report.income) : report.income,
        expenses: typeof report.expenses === 'string' ? parseFloat(report.expenses) : report.expenses,
        balance: typeof report.balance === 'string' ? parseFloat(report.balance) : report.balance,
        execution_percentage: typeof report.execution_percentage === 'string' ? parseFloat(report.execution_percentage) : report.execution_percentage,
        planned_income: report.planned_income ? (typeof report.planned_income === 'string' ? parseFloat(report.planned_income) : report.planned_income) : undefined,
        planned_expenses: report.planned_expenses ? (typeof report.planned_expenses === 'string' ? parseFloat(report.planned_expenses) : report.planned_expenses) : undefined,
        variance_income: report.variance_income ? (typeof report.variance_income === 'string' ? parseFloat(report.variance_income) : report.variance_income) : undefined,
        variance_expenses: report.variance_expenses ? (typeof report.variance_expenses === 'string' ? parseFloat(report.variance_expenses) : report.variance_expenses) : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch financial reports:', error);
      return []; // Return empty array as fallback
    }
  }

  // Treasury Movements
  async getTreasuryMovements(dataSources: string[] = ['database_local', 'official_site']): Promise<TreasuryMovement[]> {
    try {
      return await this.request<TreasuryMovement[]>('/treasury', {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch treasury movements:', error);
      return []; // Return empty array as fallback
    }
  }

  // Fees and Rights
  async getFeesRights(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<FeeRight[]> {
    try {
      const endpoint = year 
        ? `/fees/year/${year}`
        : '/fees';
      return await this.request<FeeRight[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch fees and rights:', error);
      return []; // Return empty array as fallback
    }
  }

  // Operational Expenses
  async getOperationalExpenses(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<OperationalExpense[]> {
    try {
      const endpoint = year 
        ? `/expenses/year/${year}`
        : '/expenses';
      return await this.request<OperationalExpense[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch operational expenses:', error);
      return []; // Return empty array as fallback
    }
  }

  // Municipal Debt
  async getMunicipalDebt(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<MunicipalDebt[]> {
    try {
      const endpoint = year 
        ? `/debt/year/${year}`
        : '/debt';
      return await this.request<MunicipalDebt[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch municipal debt:', error);
      return []; // Return empty array as fallback
    }
  }

  // Investments and Assets
  async getInvestmentsAssets(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<InvestmentAsset[]> {
    try {
      const endpoint = year 
        ? `/investments/year/${year}`
        : '/investments';
      return await this.request<InvestmentAsset[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch investments and assets:', error);
      return []; // Return empty array as fallback
    }
  }

  // Financial Indicators
  async getFinancialIndicators(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<FinancialIndicator[]> {
    try {
      const endpoint = year 
        ? `/indicators/year/${year}`
        : '/indicators';
      return await this.request<FinancialIndicator[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch financial indicators:', error);
      return []; // Return empty array as fallback
    }
  }

  // Transparency Documents
  async getTransparencyDocuments(year?: number, dataSources: string[] = ['database_local', 'official_site']): Promise<{ id: number; year: number; title: string; category: string; created_at: string; }[]> {
    try {
      const endpoint = year 
        ? `/documents/year/${year}`
        : '/documents';
      return await this.request<{ id: number; year: number; title: string; category: string; created_at: string; }[]>(endpoint, {}, dataSources);
    } catch (error) {
      console.error('Failed to fetch transparency documents:', error);
      return []; // Return empty array as fallback
    }
  }

  // Helper methods to get data for a specific year
  async getDataForYear(year: number, dataSources: string[] = ['database_local', 'official_site']): Promise<{
    declarations: PropertyDeclaration[];
    salaries: Salary[];
    tenders: PublicTender[];
    reports: FinancialReport[];
    treasury: TreasuryMovement[];
    fees: FeeRight[];
    expenses: OperationalExpense[];
    debt: MunicipalDebt[];
    investments: InvestmentAsset[];
    indicators: FinancialIndicator[];
  }> {
    try {
      // Fetch all data in parallel for better performance
      const [
        declarations,
        salaries,
        tenders,
        reports,
        treasury,
        fees,
        expenses,
        debt,
        investments,
        indicators
      ] = await Promise.all([
        this.getPropertyDeclarations(year, dataSources),
        this.getSalaries(year, dataSources),
        this.getPublicTenders(year, dataSources),
        this.getFinancialReports(year, dataSources),
        this.getTreasuryMovements(dataSources),
        this.getFeesRights(year, dataSources),
        this.getOperationalExpenses(year, dataSources),
        this.getMunicipalDebt(year, dataSources),
        this.getInvestmentsAssets(year, dataSources),
        this.getFinancialIndicators(year, dataSources)
      ]);

      return {
        declarations,
        salaries,
        tenders,
        reports,
        treasury,
        fees,
        expenses,
        debt,
        investments,
        indicators
      };
    } catch (error) {
      console.error(`Failed to fetch data for year ${year}:`, error);
      throw error;
    }
  }

  // Get available years for data
  getAvailableYears(): string[] {
    // For now, return all available years (2017-2025)
    // In a real implementation, this would fetch from the API
    const allYears = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
    return allYears.sort().reverse();
  }
}

export default new ApiService();
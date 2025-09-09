/**
 * ProfessionalApiService - Complete Integration with ALL Backend Controllers
 * 
 * Integrates with:
 * - AntiCorruptionDashboardController (corruption detection, transparency metrics)
 * - EnhancedAuditController (comprehensive audits)
 * - ComprehensiveTransparencyController (transparency analysis)
 * - All financial controllers (salaries, debt, treasury, investments, etc.)
 * 
 * This is the professional-grade service for municipal transparency
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

// Professional interfaces
export interface AntiCorruptionDashboard {
  current_year: number;
  system_status: {
    operational: boolean;
    last_updated: string;
    services_active: number;
    data_sources_connected: number;
  };
  corruption_status: {
    risk_level: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
    active_alerts: number;
    transparency_score: number;
  };
  transparency_metrics: {
    overall_score: number;
    grade: string;
    compliance_status: string;
    category_scores: Record<string, number>;
    improvement_areas: Array<{
      area: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      recommendation: string;
    }>;
  };
  red_flags: {
    total_alerts: number;
    critical_alerts: number;
    high_priority_alerts: number;
    recent_alerts: Array<{
      id: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
      date: string;
      category: string;
    }>;
  };
  audit_trail: {
    total_reports: number;
    latest_report: string;
    current_session: string;
  };
  kpi_summary: {
    total_issues_detected: number;
    transparency_grade: string;
    requires_immediate_attention: boolean;
    legal_compliance_status: string;
    data_coverage_years: string;
    last_analysis: string;
  };
  available_actions: Array<{
    action: string;
    endpoint: string;
    description: string;
    category: string;
    estimated_time: string;
  }>;
  quick_stats: {
    total_documents_analyzed: number;
    budget_years_covered: number;
    transparency_improvement_needed: number;
    critical_issues_detected: number;
    system_uptime: string;
    last_data_update: string;
  };
}

export interface EnhancedAuditReport {
  audit_id: string;
  year: number;
  audit_date: string;
  total_findings: number;
  critical_findings: Array<{
    finding_id: string;
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  }>;
  compliance_assessment: {
    overall_score: number;
    legal_compliance: number;
    transparency_compliance: number;
    financial_compliance: number;
    procedural_compliance: number;
  };
  risk_assessment: {
    overall_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    financial_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    operational_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reputational_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  recommendations: Array<{
    recommendation_id: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    area: string;
    description: string;
    expected_impact: string;
    implementation_timeline: string;
  }>;
}

export interface ComprehensiveFinancialData {
  year: number;
  budget_execution: {
    total_budgeted: number;
    total_executed: number;
    execution_rate: number;
    categories: Record<string, any>;
  };
  treasury_status: {
    current_balance: number;
    monthly_movements: Array<{
      month: string;
      income: number;
      expenses: number;
      net_balance: number;
    }>;
    cash_flow_analysis: any;
  };
  debt_analysis: {
    total_debt: number;
    debt_by_type: Record<string, number>;
    debt_service_ratio: number;
    risk_indicators: any;
  };
  investment_portfolio: {
    total_investments: number;
    active_projects: number;
    completed_projects: number;
    roi_analysis: any;
  };
  financial_indicators: {
    liquidity_ratio: number;
    debt_to_asset_ratio: number;
    operational_efficiency: number;
    transparency_index: number;
  };
}

class ProfessionalApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log(`🔗 Professional API Request: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Professional API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ Professional API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // === ANTI-CORRUPTION SERVICES ===
  async getAntiCorruptionDashboard(): Promise<AntiCorruptionDashboard> {
    try {
      return await this.fetchApi<AntiCorruptionDashboard>('/anti-corruption/dashboard');
    } catch (error) {
      console.error('Error loading anti-corruption dashboard:', error);
      // Return fallback structure
      return {
        current_year: new Date().getFullYear(),
        system_status: {
          operational: false,
          last_updated: new Date().toISOString(),
          services_active: 0,
          data_sources_connected: 0
        },
        corruption_status: {
          risk_level: 'MEDIO',
          active_alerts: 0,
          transparency_score: 0
        },
        transparency_metrics: {
          overall_score: 0,
          grade: 'N/A',
          compliance_status: 'UNKNOWN',
          category_scores: {},
          improvement_areas: []
        },
        red_flags: {
          total_alerts: 0,
          critical_alerts: 0,
          high_priority_alerts: 0,
          recent_alerts: []
        },
        audit_trail: {
          total_reports: 0,
          latest_report: '',
          current_session: ''
        },
        kpi_summary: {
          total_issues_detected: 0,
          transparency_grade: 'N/A',
          requires_immediate_attention: false,
          legal_compliance_status: 'UNKNOWN',
          data_coverage_years: '',
          last_analysis: ''
        },
        available_actions: [],
        quick_stats: {
          total_documents_analyzed: 0,
          budget_years_covered: 0,
          transparency_improvement_needed: 0,
          critical_issues_detected: 0,
          system_uptime: '0%',
          last_data_update: ''
        }
      };
    }
  }

  async getAntiCorruptionSystemStatus() {
    try {
      return await this.fetchApi('/anti-corruption/status');
    } catch (error) {
      console.error('Error getting anti-corruption system status:', error);
      return { status: 'ERROR', message: 'Service unavailable' };
    }
  }

  async runCorruptionAnalysis(year: number) {
    try {
      return await this.fetchApi(`/anti-corruption/analysis/${year}`, { method: 'POST' });
    } catch (error) {
      console.error('Error running corruption analysis:', error);
      return { error: 'Analysis failed', details: error };
    }
  }

  async compareOfficialData(year: number) {
    try {
      return await this.fetchApi(`/anti-corruption/compare-official/${year}`);
    } catch (error) {
      console.error('Error comparing official data:', error);
      return { error: 'Comparison failed' };
    }
  }

  // === ENHANCED AUDIT SERVICES ===
  async getEnhancedAuditReport(year: number): Promise<EnhancedAuditReport> {
    try {
      return await this.fetchApi<EnhancedAuditReport>(`/audit/enhanced/${year}`);
    } catch (error) {
      console.error('Error loading enhanced audit report:', error);
      return {
        audit_id: '',
        year: year,
        audit_date: new Date().toISOString(),
        total_findings: 0,
        critical_findings: [],
        compliance_assessment: {
          overall_score: 0,
          legal_compliance: 0,
          transparency_compliance: 0,
          financial_compliance: 0,
          procedural_compliance: 0
        },
        risk_assessment: {
          overall_risk: 'MEDIUM',
          financial_risk: 'MEDIUM',
          operational_risk: 'MEDIUM',
          reputational_risk: 'MEDIUM'
        },
        recommendations: []
      };
    }
  }

  async generateAuditReport(year: number) {
    try {
      return await this.fetchApi('/audit/generate-report', { 
        method: 'POST',
        body: JSON.stringify({ year })
      });
    } catch (error) {
      console.error('Error generating audit report:', error);
      return { error: 'Report generation failed' };
    }
  }

  async getAuditTrail(year?: number) {
    try {
      const endpoint = year ? `/audit/trail/${year}` : '/audit/trail';
      return await this.fetchApi(endpoint);
    } catch (error) {
      console.error('Error getting audit trail:', error);
      return { trail: [], total: 0 };
    }
  }

  // === COMPREHENSIVE TRANSPARENCY SERVICES ===
  async getComprehensiveTransparencyReport(year: number) {
    try {
      return await this.fetchApi(`/transparency/comprehensive/${year}`);
    } catch (error) {
      console.error('Error loading comprehensive transparency report:', error);
      return { error: 'Transparency report failed' };
    }
  }

  async getTransparencyTrends() {
    try {
      return await this.fetchApi('/transparency/trends');
    } catch (error) {
      console.error('Error getting transparency trends:', error);
      return { trends: [], analysis: {} };
    }
  }

  async getTransparencyScore(year: number): Promise<{ score: number; grade: string; details: any }> {
    try {
      return await this.fetchApi(`/transparency/score/${year}`);
    } catch (error) {
      console.error('Error getting transparency score:', error);
      return { score: 0, grade: 'N/A', details: {} };
    }
  }

  // === FINANCIAL DATA SERVICES ===
  async getComprehensiveFinancialData(year: number): Promise<ComprehensiveFinancialData> {
    try {
      return await this.fetchApi<ComprehensiveFinancialData>(`/transparency/financial/${year}`);
    } catch (error) {
      console.error('Error loading comprehensive financial data:', error);
      return {
        year: year,
        budget_execution: {
          total_budgeted: 0,
          total_executed: 0,
          execution_rate: 0,
          categories: {}
        },
        treasury_status: {
          current_balance: 0,
          monthly_movements: [],
          cash_flow_analysis: {}
        },
        debt_analysis: {
          total_debt: 0,
          debt_by_type: {},
          debt_service_ratio: 0,
          risk_indicators: {}
        },
        investment_portfolio: {
          total_investments: 0,
          active_projects: 0,
          completed_projects: 0,
          roi_analysis: {}
        },
        financial_indicators: {
          liquidity_ratio: 0,
          debt_to_asset_ratio: 0,
          operational_efficiency: 0,
          transparency_index: 0
        }
      };
    }
  }

  // Individual Financial Controllers - UPDATED TO USE CONSOLIDATED ENDPOINTS
  async getSalaries(year: number) {
    try {
      return await this.fetchApi(`/transparency/salaries/${year}`);
    } catch (error) {
      console.error('Error loading salaries:', error);
      return { salaries: [], total: 0 };
    }
  }

  async getTreasuryMovements(year?: number) {
    try {
      const endpoint = year ? `/transparency/treasury/${year}` : '/transparency/treasury';
      return await this.fetchApi(endpoint);
    } catch (error) {
      console.error('Error loading treasury movements:', error);
      return { movements: [], summary: {} };
    }
  }

  async getMunicipalDebt(year: number) {
    try {
      return await this.fetchApi(`/transparency/debt/${year}`);
    } catch (error) {
      console.error('Error loading municipal debt:', error);
      return { debt: [], total_debt: 0 };
    }
  }

  async getInvestmentsAssets(year: number) {
    try {
      return await this.fetchApi(`/transparency/investments/${year}`);
    } catch (error) {
      console.error('Error loading investments and assets:', error);
      return { investments: [], assets: [], total_value: 0 };
    }
  }

  async getOperationalExpenses(year: number) {
    try {
      return await this.fetchApi(`/transparency/expenses/${year}`);
    } catch (error) {
      console.error('Error loading operational expenses:', error);
      return { expenses: [], total: 0 };
    }
  }

  async getFeesRights(year: number) {
    try {
      return await this.fetchApi(`/transparency/fees/${year}`);
    } catch (error) {
      console.error('Error loading fees and rights:', error);
      return { fees: [], rights: [], total_collected: 0 };
    }
  }

  async getFinancialIndicators(year: number) {
    try {
      return await this.fetchApi(`/transparency/indicators/${year}`);
    } catch (error) {
      console.error('Error loading financial indicators:', error);
      return { indicators: {}, analysis: {} };
    }
  }

  async getFinancialReports(year: number) {
    try {
      return await this.fetchApi(`/transparency/reports/${year}`);
    } catch (error) {
      console.error('Error loading financial reports:', error);
      return { reports: [], summary: {} };
    }
  }

  async getPublicTenders(year: number) {
    try {
      return await this.fetchApi(`/transparency/tenders/${year}`);
    } catch (error) {
      console.error('Error loading public tenders:', error);
      return { tenders: [], total_value: 0 };
    }
  }

  async getPropertyDeclarations(year?: number) {
    try {
      const endpoint = year ? `/transparency/declarations/${year}` : '/transparency/declarations';
      return await this.fetchApi(endpoint);
    } catch (error) {
      console.error('Error loading property declarations:', error);
      return { declarations: [], total: 0 };
    }
  }

  // === SYSTEM & DOCUMENT SERVICES ===
  async getSystemHealth() {
    try {
      return await this.fetchApi('/transparency/health');
    } catch (error) {
      console.error('Error getting system health:', error);
      return { status: 'ERROR', services: {}, uptime: '0%' };
    }
  }

  async getDocuments(year?: number, category?: string) {
    try {
      let endpoint = '/transparency/documents';
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (category) params.append('category', category);
      if (params.toString()) endpoint += `?${params.toString()}`;
      
      const response = await this.fetchApi<{ documents: any[] }>(endpoint);
      return response.documents || [];
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  async getPdfIndex() {
    try {
      return await this.fetchApi('/transparency/pdfs-index');
    } catch (error) {
      console.error('Error getting PDF index:', error);
      return { pdfs: [], total: 0 };
    }
  }

  async getAvailableYears(): Promise<number[]> {
    try {
      const response = await this.fetchApi<{ years: number[] }>('/transparency/years');
      return response.years || [];
    } catch (error) {
      console.error('Error loading available years:', error);
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];
    }
  }

  // === PYTHON INTEGRATION & EXTERNAL SERVICES ===
  async runPythonTracker() {
    try {
      return await this.fetchApi('/anti-corruption/run-tracker', { method: 'POST' });
    } catch (error) {
      console.error('Error running Python tracker:', error);
      return { error: 'Python tracker failed' };
    }
  }

  async getPowerBIIntegration() {
    try {
      return await this.fetchApi('/transparency/powerbi');
    } catch (error) {
      console.error('Error getting PowerBI integration:', error);
      return { integration_status: 'ERROR' };
    }
  }
}

export const professionalApiService = new ProfessionalApiService();
export default professionalApiService;
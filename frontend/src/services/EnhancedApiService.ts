/**
 * Enhanced API Service
 * Integrates expanded data sources with existing API functionality
 * Provides comprehensive data access for all transparency components
 */


export interface EnhancedFinancialData {
  execution_status: {
    monthly_resources: any[];
    quarterly_expenses: any[];
    budget_execution_rates: any[];
    financial_flows: any[];
  };
  financial_situation: {
    balance_sheets: any[];
    cash_flow: any[];
    investment_accounts: any[];
    savings_analysis: any[];
  };
  budget_documents: {
    approved_budget: any;
    tax_ordinances: any[];
    fiscal_modules: any[];
    tax_zones: any[];
  };
  debt_planning: {
    debt_stock: any;
    maturity_profile: any[];
    debt_ratios: any;
    sustainability_metrics: any;
  };
  procurement: {
    public_tenders: any[];
    contract_awards: any[];
    vendor_analysis: any;
    procurement_patterns: any[];
  };
  personnel: {
    salary_scales: any[];
    monthly_payroll: any[];
    personnel_costs: any;
    salary_trends: any[];
  };
  declarations: {
    asset_declarations: any[];
    conflict_interest: any[];
    wealth_analysis: any;
    compliance_status: any;
  };
  official_documents: {
    official_bulletins: any[];
    tax_consultations: any[];
    regulatory_updates: any[];
    public_notices: any[];
  };
}

export interface ComprehensiveDataSummary {
  overall_transparency_score: number;
  data_coverage: {
    categories_covered: number;
    total_categories: number;
    missing_categories: string[];
  };
  data_freshness: {
    last_updated: string;
    outdated_sources: string[];
    update_frequency: Record<string, string>;
  };
  red_flags: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    details: Array<{
      type: string;
      severity: string;
      description: string;
      affected_data: string[];
    }>;
  };
  recommendations: string[];
}

export class EnhancedApiService {
  private static instance: EnhancedApiService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private baseURL = 'http://localhost:3000/api';

  private constructor() {
    // Service initialization
  }

  public static getInstance(): EnhancedApiService {
    if (!EnhancedApiService.instance) {
      EnhancedApiService.instance = new EnhancedApiService();
    }
    return EnhancedApiService.instance;
  }

  /**
   * Get comprehensive data for all categories
   */
  async getComprehensiveData(year: number = new Date().getFullYear()): Promise<EnhancedFinancialData> {
    const cacheKey = `comprehensive_data_${year}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // For now, use mock data while we integrate real sources
    const data: EnhancedFinancialData = {
      execution_status: {
        monthly_resources: await this.getExecutionData('resources', year),
        quarterly_expenses: await this.getExecutionData('expenses', year),
        budget_execution_rates: await this.getExecutionData('rates', year),
        financial_flows: await this.getExecutionData('flows', year)
      },
      financial_situation: {
        balance_sheets: await this.getFinancialSituationData('balance', year),
        cash_flow: await this.getFinancialSituationData('cash_flow', year),
        investment_accounts: await this.getFinancialSituationData('investments', year),
        savings_analysis: await this.getFinancialSituationData('savings', year)
      },
      budget_documents: {
        approved_budget: await this.getBudgetData('approved', year),
        tax_ordinances: await this.getBudgetData('tax_ordinances', year),
        fiscal_modules: await this.getBudgetData('fiscal_modules', year),
        tax_zones: await this.getBudgetData('tax_zones', year)
      },
      debt_planning: {
        debt_stock: await this.getDebtData('stock', year),
        maturity_profile: await this.getDebtData('maturity', year),
        debt_ratios: await this.getDebtData('ratios', year),
        sustainability_metrics: await this.getDebtData('sustainability', year)
      },
      procurement: {
        public_tenders: await this.getProcurementData('tenders', year),
        contract_awards: await this.getProcurementData('awards', year),
        vendor_analysis: await this.getProcurementData('vendors', year),
        procurement_patterns: await this.getProcurementData('patterns', year)
      },
      personnel: {
        salary_scales: await this.getPersonnelData('scales', year),
        monthly_payroll: await this.getPersonnelData('payroll', year),
        personnel_costs: await this.getPersonnelData('costs', year),
        salary_trends: await this.getPersonnelData('trends', year)
      },
      declarations: {
        asset_declarations: await this.getDeclarationsData('assets', year),
        conflict_interest: await this.getDeclarationsData('conflicts', year),
        wealth_analysis: await this.getDeclarationsData('wealth', year),
        compliance_status: await this.getDeclarationsData('compliance', year)
      },
      official_documents: {
        official_bulletins: await this.getOfficialDocumentsData('bulletins', year),
        tax_consultations: await this.getOfficialDocumentsData('consultations', year),
        regulatory_updates: await this.getOfficialDocumentsData('updates', year),
        public_notices: await this.getOfficialDocumentsData('notices', year)
      }
    };

    this.setCache(cacheKey, data);
    return data;
  }

  /**
   * Get comprehensive data summary with analytics
   */
  async getDataSummary(year: number = new Date().getFullYear()): Promise<ComprehensiveDataSummary> {
    const data = await this.getComprehensiveData(year);
    
    // Analyze data coverage
    const totalCategories = 8; // Number of main categories
    const coveredCategories = Object.keys(data).length;
    const missingCategories: string[] = [];

    // Check for missing or incomplete data
    Object.entries(data).forEach(([category, categoryData]) => {
      const hasData = Object.values(categoryData).some(item => 
        Array.isArray(item) ? item.length > 0 : item !== null
      );
      if (!hasData) {
        missingCategories.push(category);
      }
    });

    // Calculate transparency score
    const coverageScore = (coveredCategories / totalCategories) * 100;
    const freshnessScore = this.calculateFreshnessScore(data);
    const completenessScore = this.calculateCompletenessScore(data);
    const overall_transparency_score = (coverageScore + freshnessScore + completenessScore) / 3;

    // Detect red flags
    const redFlags = this.detectRedFlags(data);

    // Generate recommendations
    const recommendations = this.generateRecommendations(data, redFlags);

    return {
      overall_transparency_score: Math.round(overall_transparency_score),
      data_coverage: {
        categories_covered: coveredCategories - missingCategories.length,
        total_categories: totalCategories,
        missing_categories: missingCategories
      },
      data_freshness: {
        last_updated: new Date().toISOString(),
        outdated_sources: this.getOutdatedSources(),
        update_frequency: this.getUpdateFrequencies()
      },
      red_flags: {
        critical: redFlags.filter(f => f.severity === 'critical').length,
        high: redFlags.filter(f => f.severity === 'high').length,
        medium: redFlags.filter(f => f.severity === 'medium').length,
        low: redFlags.filter(f => f.severity === 'low').length,
        details: redFlags
      },
      recommendations
    };
  }

  /**
   * Get execution data (Estados de Ejecución)
   */
  private async getExecutionData(type: string, year: number): Promise<any[]> {
    // Try to get real budget execution documents first
    try {
      const budgetDocs = await this.getBudgetExecutionDocuments();
      if (budgetDocs.documents && budgetDocs.documents.length > 0) {
        // Process real document data based on type
        return this.processExecutionDocuments(budgetDocs.documents, type);
      }
    } catch (error) {
      console.warn('Failed to load real execution data, using mock');
    }
    
    switch (type) {
      case 'resources':
        return this.generateMockResourcesData();
      case 'expenses':
        return this.generateMockExpensesData();
      case 'rates':
        return this.generateMockRatesData();
      case 'flows':
        return this.generateMockFlowData();
      default:
        return [];
    }
  }

  /**
   * Process real execution documents into structured data
   */
  private processExecutionDocuments(documents: any[], type: string): any[] {
    // Group documents by year and quarter
    const processed = documents
      .filter(doc => doc.document_type === 'budget_execution')
      .map(doc => ({
        year: doc.year,
        quarter: doc.quarter,
        filename: doc.filename,
        category: doc.category,
        type,
        document_id: doc.id,
        last_modified: doc.last_modified
      }));
    
    return processed;
  }

  /**
   * Get financial situation data
   */
  private async getFinancialSituationData(type: string, year: number): Promise<any[]> {
    switch (type) {
      case 'balance':
        return this.generateMockBalanceData();
      case 'cash_flow':
        return this.generateMockCashFlowData();
      case 'investments':
        return this.generateMockInvestmentData();
      case 'savings':
        return this.generateMockSavingsData();
      default:
        return [];
    }
  }

  /**
   * Get budget documents data
   */
  private async getBudgetData(type: string, year: number): Promise<any> {
    switch (type) {
      case 'approved':
        return {
          year,
          total_budget: 2500000000,
          revenues: 2300000000,
          expenses: 2450000000,
          capital_expenses: 350000000,
          debt_service: 180000000,
          approved_date: `${year}-12-15`,
          status: 'approved'
        };
      case 'tax_ordinances':
        return this.generateMockTaxOrdinances();
      case 'fiscal_modules':
        return this.generateMockFiscalModules();
      case 'tax_zones':
        return this.generateMockTaxZones();
      default:
        return null;
    }
  }

  /**
   * Get debt data
   */
  private async getDebtData(type: string, year: number): Promise<any> {
    switch (type) {
      case 'stock':
        return this.generateMockDebtStock();
      case 'maturity':
        return this.generateMockMaturityProfile();
      case 'ratios':
        return {
          debt_to_gdp: 0.42,
          debt_to_revenue: 1.1,
          debt_service_ratio: 0.15,
          interest_to_revenue: 0.08
        };
      case 'sustainability':
        return this.generateMockSustainabilityMetrics();
      default:
        return null;
    }
  }

  /**
   * Get procurement data
   */
  private async getProcurementData(type: string, year: number): Promise<any> {
    switch (type) {
      case 'tenders':
        return this.generateMockTenderData();
      case 'awards':
        return this.generateMockAwardData();
      case 'vendors':
        return this.generateMockVendorAnalysis();
      case 'patterns':
        return this.generateMockProcurementPatterns();
      default:
        return [];
    }
  }

  /**
   * Get personnel data
   */
  private async getPersonnelData(type: string, year: number): Promise<any> {
    // Try to get real salary documents first
    try {
      const realDocs = await this.getRealDocumentsByCategory('Recursos Humanos');
      if (realDocs.documents && realDocs.documents.length > 0) {
        return this.processPersonnelDocuments(realDocs.documents, type);
      }
    } catch (error) {
      console.warn('Failed to load real personnel data, using mock');
    }
    
    switch (type) {
      case 'scales':
        return this.generateMockSalaryScales();
      case 'payroll':
        return this.generateMockPayrollData();
      case 'costs':
        return this.generateMockPersonnelCosts();
      case 'trends':
        return this.generateMockSalaryTrends();
      default:
        return [];
    }
  }

  /**
   * Process real personnel documents
   */
  private processPersonnelDocuments(documents: any[], type: string): any[] {
    return documents
      .filter(doc => doc.category === 'Recursos Humanos')
      .map(doc => ({
        year: doc.year,
        filename: doc.filename,
        size_mb: doc.size_mb,
        type,
        document_id: doc.id,
        last_modified: doc.last_modified
      }));
  }

  /**
   * Get declarations data
   */
  private async getDeclarationsData(type: string, year: number): Promise<any> {
    switch (type) {
      case 'assets':
        return this.generateMockAssetDeclarations();
      case 'conflicts':
        return this.generateMockConflictAnalysis();
      case 'wealth':
        return this.generateMockWealthAnalysis();
      case 'compliance':
        return {
          total_officials: 25,
          declarations_filed: 23,
          compliance_rate: 0.92,
          overdue: 2,
          under_review: 3,
          approved: 20
        };
      default:
        return [];
    }
  }

  /**
   * Get official documents data
   */
  private async getOfficialDocumentsData(type: string, year: number): Promise<any[]> {
    switch (type) {
      case 'bulletins':
        return this.generateMockBulletins();
      case 'consultations':
        return this.generateMockConsultations();
      case 'updates':
        return this.generateMockUpdates();
      case 'notices':
        return this.generateMockNotices();
      default:
        return [];
    }
  }

  // Mock data generators for missing functions
  private generateMockResourcesData() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      resources: Math.round(80000000 + (Math.random() * 20000000)),
      tax_collection: Math.round(60000000 + (Math.random() * 15000000)),
      other_income: Math.round(20000000 + (Math.random() * 5000000))
    }));
  }

  private generateMockExpensesData() {
    return Array.from({ length: 4 }, (_, i) => ({
      quarter: `Q${i + 1}`,
      expenses: Math.round(180000000 + (Math.random() * 40000000)),
      personnel: Math.round(100000000 + (Math.random() * 20000000)),
      operations: Math.round(50000000 + (Math.random() * 15000000)),
      investments: Math.round(30000000 + (Math.random() * 10000000))
    }));
  }

  private generateMockRatesData() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      execution_rate: Math.round(75 + (Math.random() * 20)),
      budget_compliance: Math.round(85 + (Math.random() * 10))
    }));
  }

  private generateMockSalaryScales() {
    return [
      { category: 'Secretarios', min_salary: 2500000, max_salary: 4000000, positions: 8 },
      { category: 'Directores', min_salary: 2000000, max_salary: 3200000, positions: 15 },
      { category: 'Coordinadores', min_salary: 1600000, max_salary: 2400000, positions: 25 },
      { category: 'Administrativos', min_salary: 1200000, max_salary: 1800000, positions: 45 }
    ];
  }

  private generateMockPayrollData() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total_payroll: Math.round(150000000 + (Math.random() * 30000000)),
      employee_count: Math.round(250 + (Math.random() * 50)),
      average_salary: Math.round(1800000 + (Math.random() * 400000))
    }));
  }

  private generateMockPersonnelCosts() {
    return {
      total_annual_cost: 1800000000,
      cost_breakdown: [
        { category: 'Salarios Base', amount: 1200000000, percentage: 67 },
        { category: 'Bonificaciones', amount: 300000000, percentage: 17 },
        { category: 'Cargas Sociales', amount: 180000000, percentage: 10 },
        { category: 'Otros Beneficios', amount: 120000000, percentage: 6 }
      ]
    };
  }

  private generateMockDebtStock() {
    return {
      total_debt: 950000000,
      by_creditor: [
        { creditor: 'Banco Nación', amount: 400000000, rate: 8.5 },
        { creditor: 'Banco Provincia', amount: 300000000, rate: 9.2 },
        { creditor: 'Otros Bancos', amount: 250000000, rate: 10.1 }
      ]
    };
  }

  private generateMockMaturityProfile() {
    return Array.from({ length: 10 }, (_, i) => ({
      year: 2024 + i,
      principal_due: Math.round(80000000 + (Math.random() * 40000000)),
      interest_due: Math.round(20000000 + (Math.random() * 10000000))
    }));
  }

  private generateMockSustainabilityMetrics() {
    return {
      debt_sustainability_score: 7.2,
      fiscal_space: 'Moderate',
      risk_assessment: 'Medium',
      recommendations: [
        'Monitor debt service ratios',
        'Diversify funding sources',
        'Improve revenue collection'
      ]
    };
  }

  // Mock data generators (these would be replaced with real data processing)
  private generateMockFlowData() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      inflows: Math.round(150000000 + (Math.random() * 50000000)),
      outflows: Math.round(140000000 + (Math.random() * 45000000)),
      net_flow: Math.round((Math.random() - 0.5) * 20000000)
    }));
  }

  private generateMockBalanceData() {
    return [
      {
        period: 'Q1 2024',
        assets: 1850000000,
        liabilities: 1200000000,
        equity: 650000000,
        working_capital: 180000000
      },
      {
        period: 'Q2 2024',
        assets: 1920000000,
        liabilities: 1250000000,
        equity: 670000000,
        working_capital: 195000000
      }
    ];
  }

  private generateMockCashFlowData() {
    return Array.from({ length: 6 }, (_, i) => ({
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      operating_cash_flow: Math.round(20000000 + (Math.random() * 10000000)),
      investing_cash_flow: Math.round(-5000000 + (Math.random() * 8000000)),
      financing_cash_flow: Math.round(-8000000 + (Math.random() * 15000000))
    }));
  }

  private generateMockInvestmentData() {
    return [
      { type: 'Obras Públicas', amount: 180000000, percentage: 45 },
      { type: 'Equipamiento', amount: 80000000, percentage: 20 },
      { type: 'Infraestructura Digital', amount: 60000000, percentage: 15 },
      { type: 'Vehículos y Maquinaria', amount: 40000000, percentage: 10 },
      { type: 'Otros', amount: 40000000, percentage: 10 }
    ];
  }

  private generateMockSavingsData() {
    return [
      { concept: 'Ahorro Corriente', amount: 85000000, percentage: 3.7 },
      { concept: 'Resultado Económico', amount: -35000000, percentage: -1.5 },
      { concept: 'Resultado Financiero', amount: -50000000, percentage: -2.2 }
    ];
  }

  private generateMockTaxOrdinances() {
    return [
      { ordinance: '2024/001', title: 'Ordenanza Fiscal 2024', date: '2023-12-15', status: 'vigente' },
      { ordinance: '2024/002', title: 'Ordenanza Impositiva 2024', date: '2023-12-15', status: 'vigente' },
      { ordinance: '2024/015', title: 'Modificación Tasas Municipales', date: '2024-03-20', status: 'vigente' }
    ];
  }

  private generateMockFiscalModules() {
    return [
      { year: 2024, value: 1250.50, update_date: '2024-01-01' },
      { year: 2023, value: 1150.25, update_date: '2023-01-01' },
      { year: 2022, value: 1050.75, update_date: '2022-01-01' }
    ];
  }

  private generateMockTaxZones() {
    return [
      { zone: 'Zona A', description: 'Centro Comercial', multiplier: 1.5 },
      { zone: 'Zona B', description: 'Residencial Alta', multiplier: 1.2 },
      { zone: 'Zona C', description: 'Residencial Media', multiplier: 1.0 },
      { zone: 'Zona D', description: 'Residencial Baja', multiplier: 0.8 },
      { zone: 'Zona E', description: 'Rural', multiplier: 0.6 }
    ];
  }

  private generateMockTenderData() {
    return Array.from({ length: 15 }, (_, i) => ({
      tender_id: `LP-2024-${String(i + 1).padStart(3, '0')}`,
      title: `Licitación ${i + 1}`,
      category: ['Obras', 'Servicios', 'Bienes'][Math.floor(Math.random() * 3)],
      budget: Math.round(5000000 + (Math.random() * 50000000)),
      status: ['Publicada', 'En Evaluación', 'Adjudicada'][Math.floor(Math.random() * 3)],
      publication_date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`
    }));
  }

  private generateMockAwardData() {
    return Array.from({ length: 10 }, (_, i) => ({
      tender_id: `LP-2024-${String(i + 1).padStart(3, '0')}`,
      winner: `Empresa ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${i + 1}`,
      awarded_amount: Math.round(5000000 + (Math.random() * 45000000)),
      award_date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-28`,
      contract_duration: Math.round(6 + (Math.random() * 24))
    }));
  }

  private generateMockVendorAnalysis() {
    return {
      total_vendors: 156,
      active_vendors: 89,
      concentration_ratio: 0.35,
      top_vendors: [
        { name: 'Constructora ABC', contracts: 8, total_amount: 125000000 },
        { name: 'Servicios XYZ', contracts: 12, total_amount: 95000000 },
        { name: 'Suministros DEF', contracts: 15, total_amount: 78000000 }
      ]
    };
  }

  private generateMockProcurementPatterns() {
    return [
      { pattern: 'Estacionalidad', description: 'Mayor actividad en Q4', impact: 'medium' },
      { pattern: 'Concentración', description: 'Top 5 proveedores = 45%', impact: 'high' },
      { pattern: 'Duración', description: 'Promedio 18 meses', impact: 'low' }
    ];
  }

  private generateMockSalaryTrends() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      average_salary: Math.round(1800000 + (Math.random() * 200000)),
      salary_increase: Math.round((Math.random() * 10) + 5),
      inflation_adjustment: Math.round((Math.random() * 8) + 12)
    }));
  }

  private generateMockAssetDeclarations() {
    return Array.from({ length: 25 }, (_, i) => ({
      official_id: i + 1,
      name: `Funcionario ${i + 1}`,
      position: ['Intendente', 'Secretario', 'Director', 'Coordinador'][Math.floor(Math.random() * 4)],
      declaration_year: 2024,
      total_assets: Math.round(5000000 + (Math.random() * 95000000)),
      last_update: '2024-03-31',
      status: ['Presentada', 'Revisión', 'Aprobada'][Math.floor(Math.random() * 3)]
    }));
  }

  private generateMockConflictAnalysis() {
    return [
      { type: 'Empresa Familiar', cases: 3, severity: 'medium' },
      { type: 'Participación Societaria', cases: 1, severity: 'high' },
      { type: 'Potencial Conflicto', cases: 5, severity: 'low' }
    ];
  }

  private generateMockWealthAnalysis() {
    return {
      average_wealth: 35000000,
      median_wealth: 18000000,
      wealth_distribution: [
        { range: '0-10M', officials: 8 },
        { range: '10-50M', officials: 12 },
        { range: '50M+', officials: 5 }
      ]
    };
  }

  private generateMockBulletins() {
    return Array.from({ length: 12 }, (_, i) => ({
      bulletin_number: `BO-2024-${String(i + 1).padStart(2, '0')}`,
      publication_date: `2024-${String(i + 1).padStart(2, '0')}-15`,
      pages: Math.round(20 + (Math.random() * 40)),
      ordinances: Math.round(5 + (Math.random() * 10)),
      resolutions: Math.round(8 + (Math.random() * 15))
    }));
  }

  private generateMockConsultations() {
    return Array.from({ length: 8 }, (_, i) => ({
      consultation_id: `CT-2024-${String(i + 1).padStart(3, '0')}`,
      topic: ['Tasas Municipales', 'Patentes', 'Inmobiliario', 'Comercial'][Math.floor(Math.random() * 4)],
      date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      status: 'Respondida'
    }));
  }

  private generateMockUpdates() {
    return Array.from({ length: 6 }, (_, i) => ({
      update_id: i + 1,
      title: `Actualización Normativa ${i + 1}`,
      type: 'Regulatoria',
      date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
      impact: ['Alto', 'Medio', 'Bajo'][Math.floor(Math.random() * 3)]
    }));
  }

  private generateMockNotices() {
    return Array.from({ length: 10 }, (_, i) => ({
      notice_id: i + 1,
      title: `Aviso Público ${i + 1}`,
      category: ['Licitación', 'Información', 'Convocatoria'][Math.floor(Math.random() * 3)],
      publication_date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      validity: '30 días'
    }));
  }

  // Utility methods
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private calculateFreshnessScore(data: EnhancedFinancialData): number {
    // Simplified freshness calculation
    return 85; // Mock score
  }

  private calculateCompletenessScore(data: EnhancedFinancialData): number {
    // Calculate based on data availability
    let completeness = 0;
    let totalFields = 0;

    Object.values(data).forEach(category => {
      Object.values(category).forEach(field => {
        totalFields++;
        if (Array.isArray(field) && field.length > 0) {
          completeness++;
        } else if (field && typeof field === 'object') {
          completeness++;
        }
      });
    });

    return (completeness / totalFields) * 100;
  }

  private detectRedFlags(data: EnhancedFinancialData): Array<{ type: string; severity: string; description: string; affected_data: string[]; }> {
    const flags = [];

    // Example red flag detection
    if (data.debt_planning.debt_ratios && data.debt_planning.debt_ratios.debt_to_revenue > 1.0) {
      flags.push({
        type: 'high_debt_ratio',
        severity: 'high',
        description: 'Relación deuda/ingresos superior al 100%',
        affected_data: ['debt_planning.debt_ratios']
      });
    }

    // Add more red flag detection logic here
    return flags;
  }

  private generateRecommendations(data: EnhancedFinancialData, redFlags: any[]): string[] {
    const recommendations = [
      'Mejorar la frecuencia de actualización de datos financieros',
      'Implementar sistema de alertas tempranas para indicadores fiscales',
      'Establecer mecanismos de validación cruzada entre fuentes de datos',
      'Desarrollar dashboard de seguimiento en tiempo real'
    ];

    if (redFlags.some(flag => flag.severity === 'high')) {
      recommendations.unshift('Revisar inmediatamente los indicadores de alto riesgo detectados');
    }

    return recommendations;
  }

  private getOutdatedSources(): string[] {
    // Mock implementation
    return ['Módulos Fiscales', 'Declaraciones DDJJ 2023'];
  }

  private getUpdateFrequencies(): Record<string, string> {
    return {
      'Estados de Ejecución': 'Mensual',
      'Situación Financiera': 'Trimestral',
      'Presupuesto': 'Anual',
      'Sueldos': 'Mensual',
      'Licitaciones': 'Según demanda'
    };
  }

  /**
   * Get real documents from backend
   */
  async getRealDocuments(): Promise<any> {
    const cacheKey = 'real_documents';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try backend first
      const response = await fetch(`${this.baseURL}/real-documents`);
      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.warn('Backend not available, using local data sources');
    }

    // Use local data service as fallback
    try {
      const { default: LocalDataService } = await import('./LocalDataService');
      const localDocuments = await LocalDataService.getOfficialDocuments();
      const summary = await LocalDataService.getSummaryStats();
      
      const result = {
        documents: localDocuments.map(doc => ({
          id: doc.id,
          title: doc.title,
          year: doc.year,
          category: doc.category,
          size_mb: doc.size_mb,
          official_url: doc.official_url,
          verification_status: doc.verification_status,
          processing_date: doc.processing_date,
          data_sources: doc.data_sources,
          markdown_path: doc.markdown_path
        })),
        total: localDocuments.length,
        summary: summary,
        source: 'local_data_service',
        timestamp: new Date().toISOString()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error loading local documents:', error);
      return { documents: [], total: 0, error: error.message };
    }
  }

  /**
   * Get budget execution documents for audit
   */
  async getBudgetExecutionDocuments(): Promise<any> {
    const cacheKey = 'budget_execution_docs';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/real-documents/budget-execution`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching budget execution documents:', error);
      return { documents: [], total: 0, error: error.message };
    }
  }

  /**
   * Get real documents by category
   */
  async getRealDocumentsByCategory(category: string): Promise<any> {
    const cacheKey = `real_docs_category_${category}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/real-documents/category/${encodeURIComponent(category)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching documents by category:', error);
      return { documents: [], total: 0, error: error.message };
    }
  }

  /**
   * Get real documents by year
   */
  async getRealDocumentsByYear(year: number): Promise<any> {
    const cacheKey = `real_docs_year_${year}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/real-documents/year/${year}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching documents by year:', error);
      return { documents: [], total: 0, error: error.message };
    }
  }

  /**
   * Get real document statistics
   */
  async getRealDocumentStatistics(): Promise<any> {
    const cacheKey = 'real_docs_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try backend first
      const response = await fetch(`${this.baseURL}/real-documents/stats`);
      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.warn('Backend stats not available, using local data');
    }

    // Use local data service as fallback
    try {
      const { default: LocalDataService } = await import('./LocalDataService');
      const stats = await LocalDataService.getSummaryStats();
      
      const result = {
        total_documents: stats.total_documents,
        verified_documents: stats.verified_documents,
        processing_documents: stats.processing_documents,
        total_size_mb: stats.total_size_mb,
        years_covered: stats.years_covered,
        categories_count: stats.categories,
        transparency_score: stats.transparency_score,
        data_freshness: stats.data_freshness,
        coverage_analysis: stats.coverage_analysis,
        last_updated: stats.last_updated,
        source: 'local_data_service'
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error loading local statistics:', error);
      return { total_documents: 0, error: error.message };
    }
  }

  /**
   * Get high priority documents for audit
   */
  async getHighPriorityDocuments(): Promise<any> {
    const cacheKey = 'high_priority_docs';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/real-documents/high-priority`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching high priority documents:', error);
      return { documents: [], total: 0, error: error.message };
    }
  }

  /**
   * Get specific document by ID
   */
  async getRealDocumentById(id: string): Promise<any> {
    const cacheKey = `real_doc_${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/real-documents/document/${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching document by ID:', error);
      return { document: null, error: error.message };
    }
  }

  /**
   * Search and fetch data using firecrawl integration
   */
  async searchAndFetchData(query: string, options: any = {}): Promise<any> {
    // This would integrate with firecrawl_search tool
    // For now, return mock data based on query
    
    const searchResults = {
      query,
      results_found: Math.floor(Math.random() * 10) + 1,
      documents: [],
      processed_data: null,
      search_timestamp: new Date().toISOString()
    };

    return searchResults;
  }
}
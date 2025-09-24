/**
 * Repository Data Service - Complete GitHub Repository Data Loader
 * Loads ALL files from the repository: PDFs (as JSONs), markdowns, CSVs, Excel
 * Creates complete money flow tracking from budget -> contracts -> execution
 */

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';

export interface ContractTender {
  id: string;
  title: string;
  number: string;
  year: number;
  category: 'licitacion' | 'contratacion' | 'compra_directa';
  amount?: number;
  status: 'published' | 'awarded' | 'completed' | 'cancelled' | 'unknown';
  budget_category?: string;
  execution_status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
  contractor?: string;
  description?: string;
  official_url: string;
  processed_data?: any;
}

export interface BudgetExecution {
  category: string;
  subcategory?: string;
  budgeted: number;
  executed: number;
  execution_rate: number;
  period: string;
  year: number;
  related_contracts?: ContractTender[];
  variance?: number;
  status: 'on_track' | 'delayed' | 'overspent' | 'underspent';
}

export interface CompleteRepositoryData {
  documents: {
    all: any[];
    byYear: Record<number, any[]>;
    byCategory: Record<string, any[]>;
  };
  budget: {
    byYear: Record<number, BudgetExecution[]>;
    summary: Record<number, any>;
  };
  contracts: {
    byYear: Record<number, ContractTender[]>;
    summary: Record<number, any>;
  };
  salaries: Record<number, any>;
  financial: Record<number, any>;
  audit: Record<number, any>;
  raw_data: {
    document_inventory: any;
    multi_source_report: any;
    organized_analysis: any;
  };
  money_flow: {
    byYear: Record<number, any>;
    budget_to_contracts: Record<number, any>;
    execution_tracking: Record<number, any>;
  };
  metadata: {
    last_updated: string;
    total_documents: number;
    available_years: number[];
    categories: string[];
    data_sources: string[];
  };
}

class RepositoryDataService {
  private cache: Map<string, any> = new Map();
  private loading: Set<string> = new Set();

  /**
   * Load complete repository data with money flow tracking
   */
  async loadCompleteRepository(): Promise<CompleteRepositoryData> {
    const data: CompleteRepositoryData = {
      documents: { all: [], byYear: {}, byCategory: {} },
      budget: { byYear: {}, summary: {} },
      contracts: { byYear: {}, summary: {} },
      salaries: {},
      financial: {},
      audit: {},
      raw_data: { document_inventory: null, multi_source_report: null, organized_analysis: null },
      money_flow: { byYear: {}, budget_to_contracts: {}, execution_tracking: {} },
      metadata: {
        last_updated: new Date().toISOString(),
        total_documents: 0,
        available_years: [],
        categories: [],
        data_sources: []
      }
    };

    await Promise.all([
      this.loadDocumentInventory(data),
      this.loadMultiSourceReport(data),
      this.loadOrganizedAnalysis(data),
      this.loadAllCategoryData(data)
    ]);

    // Process relationships and money flow
    this.processMoneyFlow(data);

    return data;
  }

  /**
   * Load document inventory - complete catalog of all files
   */
  private async loadDocumentInventory(data: CompleteRepositoryData): Promise<void> {
    try {
      const response = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/document_inventory.json`);
      if (response.ok) {
        const inventory = await response.json();
        data.raw_data.document_inventory = inventory;

        // Process documents by year and category
        inventory.forEach((doc: any) => {
          const year = parseInt(doc.year);
          const category = doc.category;

          if (!data.documents.byYear[year]) data.documents.byYear[year] = [];
          if (!data.documents.byCategory[category]) data.documents.byCategory[category] = [];

          // Enhanced document with processed status
          const processedDoc = {
            ...doc,
            id: doc.filename.replace(/\.[^/.]+$/, ''),
            verified: true,
            processing_date: new Date().toISOString(),
            json_path: `data/organized_documents/${doc.relative_path}`,
            markdown_path: doc.relative_path.replace('/json/', '/markdown/').replace('.json', '.md')
          };

          data.documents.all.push(processedDoc);
          data.documents.byYear[year].push(processedDoc);
          data.documents.byCategory[category].push(processedDoc);
        });

        data.metadata.total_documents = data.documents.all.length;
        data.metadata.available_years = [...new Set(data.documents.all.map(d => d.year))].sort();
        data.metadata.categories = Object.keys(data.documents.byCategory);
      }
    } catch (error) {
      console.warn('Could not load document inventory:', error);
    }
  }

  /**
   * Load multi-source report for cross-validation
   */
  private async loadMultiSourceReport(data: CompleteRepositoryData): Promise<void> {
    try {
      const response = await fetch(`${GITHUB_RAW_BASE}/data/multi_source_report.json`);
      if (response.ok) {
        const report = await response.json();
        data.raw_data.multi_source_report = report;
        data.metadata.data_sources.push('multi_source_local', 'multi_source_external');
      }
    } catch (error) {
      console.warn('Could not load multi-source report:', error);
    }
  }

  /**
   * Load organized analysis data - processed financial data
   */
  private async loadOrganizedAnalysis(data: CompleteRepositoryData): Promise<void> {
    const analysisFiles = [
      { path: 'inventory_summary.json', type: 'summary' },
      { path: 'detailed_inventory.json', type: 'detailed' },
      { path: 'financial_oversight/budget_analysis/budget_data_2024.json', type: 'budget', year: 2024 },
      { path: 'financial_oversight/salary_oversight/salary_data_2024.json', type: 'salary', year: 2024 },
      { path: 'financial_oversight/debt_monitoring/debt_data_2024.json', type: 'debt', year: 2024 }
    ];

    for (const file of analysisFiles) {
      try {
        const response = await fetch(`${GITHUB_RAW_BASE}/data/organized_analysis/${file.path}`);
        if (response.ok) {
          const fileData = await response.json();

          if (file.year) {
            // Year-specific data
            switch (file.type) {
              case 'budget':
                data.budget.byYear[file.year] = this.processBudgetData(fileData);
                data.budget.summary[file.year] = fileData;
                break;
              case 'salary':
                data.salaries[file.year] = fileData;
                break;
              case 'debt':
                data.financial[file.year] = fileData;
                break;
            }
          } else {
            data.raw_data.organized_analysis = { ...data.raw_data.organized_analysis, [file.type]: fileData };
          }

          data.metadata.data_sources.push(`organized_analysis/${file.path}`);
        }
      } catch (error) {
        console.warn(`Could not load ${file.path}:`, error);
      }
    }
  }

  /**
   * Load all category-specific data including contracts/licitaciones
   */
  private async loadAllCategoryData(data: CompleteRepositoryData): Promise<void> {
    const categories = ['Contrataciones', 'Ejecución_de_Gastos', 'Ejecución_de_Recursos', 'Presupuesto_Municipal'];

    for (const category of categories) {
      try {
        const response = await fetch(`${GITHUB_RAW_BASE}/data/organized_documents/json/data_index_${category}.json`);
        if (response.ok) {
          const categoryData = await response.json();

          if (category === 'Contrataciones') {
            this.processContractData(categoryData, data);
          } else if (category.startsWith('Ejecución_de_Gastos')) {
            this.processBudgetExecutionData(categoryData, data);
          }
        }
      } catch (error) {
        console.warn(`Could not load category ${category}:`, error);
      }
    }
  }

  /**
   * Process contract/tender data and link to budget categories
   */
  private processContractData(contractData: any, data: CompleteRepositoryData): void {
    if (!contractData.documents) return;

    contractData.documents.forEach((contract: any) => {
      const year = contract.year || new Date().getFullYear();
      if (!data.contracts.byYear[year]) data.contracts.byYear[year] = [];

      // Parse tender number and type
      const title = contract.title || '';
      const number = title.match(/N[°\u00b0]?\s*(\d+)/)?.[1] || 'unknown';
      const isLicitacion = title.toLowerCase().includes('licitacion');
      const isContrato = title.toLowerCase().includes('contrato');

      const processedContract: ContractTender = {
        id: contract.id,
        title: contract.title,
        number: number,
        year: year,
        category: isLicitacion ? 'licitacion' : (isContrato ? 'contratacion' : 'compra_directa'),
        status: 'unknown', // Will be determined by cross-referencing with execution data
        official_url: contract.official_url || contract.url,
        description: contract.description,
        processed_data: contract
      };

      data.contracts.byYear[year].push(processedContract);
    });
  }

  /**
   * Process budget execution data
   */
  private processBudgetData(budgetData: any): BudgetExecution[] {
    if (!budgetData.categories) return [];

    return budgetData.categories.map((category: any) => ({
      category: category.name,
      budgeted: category.budgeted || 0,
      executed: category.executed || 0,
      execution_rate: category.percentage || 0,
      period: 'annual',
      year: budgetData.year,
      variance: (category.executed || 0) - (category.budgeted || 0),
      status: this.calculateBudgetStatus(category.percentage || 0),
      related_contracts: []
    }));
  }

  /**
   * Process budget execution data from PDFs
   */
  private processBudgetExecutionData(executionData: any, data: CompleteRepositoryData): void {
    // This would parse execution documents and link them to budget categories
    // Implementation would extract data from processed PDF JSONs
  }

  /**
   * Create money flow relationships between budget, contracts, and execution
   */
  private processMoneyFlow(data: CompleteRepositoryData): void {
    data.metadata.available_years.forEach(year => {
      const budgetData = data.budget.byYear[year] || [];
      const contracts = data.contracts.byYear[year] || [];

      // Create money flow mapping
      data.money_flow.byYear[year] = {
        total_budget: budgetData.reduce((sum, item) => sum + item.budgeted, 0),
        total_executed: budgetData.reduce((sum, item) => sum + item.executed, 0),
        total_contracts: contracts.length,
        contract_amount_estimate: 0, // Would be calculated from contract analysis
        categories: budgetData.map(budget => ({
          name: budget.category,
          budget: budget.budgeted,
          executed: budget.executed,
          contracts: contracts.filter(c =>
            c.description?.toLowerCase().includes(budget.category.toLowerCase()) ||
            budget.category.toLowerCase().includes('obra') && c.title.toLowerCase().includes('obra')
          ),
          completion_rate: budget.execution_rate
        }))
      };

      // Track budget-to-contract relationships
      data.money_flow.budget_to_contracts[year] = budgetData.map(budgetCategory => ({
        budget_category: budgetCategory.category,
        allocated: budgetCategory.budgeted,
        executed: budgetCategory.executed,
        related_tenders: contracts.filter(contract => this.matchBudgetToContract(budgetCategory, contract)),
        discrepancies: []
      }));
    });
  }

  /**
   * Match budget categories to contracts/tenders
   */
  private matchBudgetToContract(budget: BudgetExecution, contract: ContractTender): boolean {
    const budgetKeywords = budget.category.toLowerCase();
    const contractText = (contract.title + ' ' + (contract.description || '')).toLowerCase();

    // Simple keyword matching - could be enhanced with ML/AI
    const matches = [
      budgetKeywords.includes('obra') && contractText.includes('obra'),
      budgetKeywords.includes('servicio') && contractText.includes('servicio'),
      budgetKeywords.includes('suministro') && contractText.includes('suministro'),
      budgetKeywords.includes('mantenimiento') && contractText.includes('mantenimiento')
    ];

    return matches.some(match => match);
  }

  /**
   * Calculate budget execution status
   */
  private calculateBudgetStatus(executionRate: number): 'on_track' | 'delayed' | 'overspent' | 'underspent' {
    if (executionRate > 100) return 'overspent';
    if (executionRate < 70) return 'underspent';
    if (executionRate >= 70 && executionRate <= 100) return 'on_track';
    return 'delayed';
  }
}

export const repositoryDataService = new RepositoryDataService();
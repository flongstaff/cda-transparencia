import { useState, useEffect, useCallback, useMemo } from 'react';
import UnifiedTransparencyService from '../services/UnifiedTransparencyService';
import RealDataService from '../services/RealDataService';
import yearSpecificDataService from '../services/YearSpecificDataService';
import dataIntegrationService, { type IntegratedData } from '../services/DataIntegrationService';
import type { UnifiedTransparencyData } from '../services/UnifiedTransparencyService';

export interface UseMasterDataReturn {
  // All data from all sources
  masterData: UnifiedTransparencyData | null;

  // Quick access to current year data
  currentBudget: any;
  currentContracts: any[];
  currentSalaries: any[];
  currentDocuments: any[];
  currentTreasury: any;
  currentDebt: any;

  // Multi-year data access
  multiYearData: {
    [year: number]: {
      budget: any;
      contracts: any[];
      salaries: any[];
      documents: any[];
      treasury: any;
      debt: any;
      external_validation: any[];
    };
  };

  // Charts data for ALL chart components (current and historical)
  budgetChartData: any;
  contractsChartData: any;
  salariesChartData: any;
  treasuryChartData: any;
  debtChartData: any;
  documentsChartData: any;
  comprehensiveChartData: any;
  // Historical charts data
  budgetHistoricalData: any[];
  contractsHistoricalData: any[];
  salariesHistoricalData: any[];
  treasuryHistoricalData: any[];
  debtHistoricalData: any[];
  documentsHistoricalData: any[];

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Loading state for year switching only
  loadingYear: boolean;

  // Metadata
  totalDocuments: number;
  availableYears: number[];
  categories: string[];
  dataSourcesActive: number;

  // Audit data
  auditDiscrepancies: any[];
  auditSummary: any;
  dataFlags: any[];

  // Actions
  refetch: () => Promise<void>;
  switchYear: (year: number) => Promise<void>;
  retry: () => Promise<void>;  // New retry function
}

export const useMasterData = (selectedYear?: number) => {
  const [masterData, setMasterData] = useState<UnifiedTransparencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingYear, setLoadingYear] = useState(false); // Separate loading state for year switching
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(selectedYear || new Date().getFullYear());

  // Initialize with integrated data from all sources
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Initializing integrated data for year ${currentYear}...`);

      // Use the new DataIntegrationService to combine external APIs + local CSV/JSON + generated data
      const integratedData = await dataIntegrationService.loadIntegratedData(currentYear);

      console.log(`✅ Integrated data loaded:`, {
        sources: integratedData.metadata.sources_used,
        external_available: integratedData.metadata.external_data_available,
        budget: integratedData.budget.total_budget
      });

      // Build master data structure with integrated data
      const initialMasterData = {
        financialData: {
          [currentYear]: {
            budget: {
              total_budget: integratedData.budget.total_budget,
              total_executed: integratedData.budget.total_executed,
              execution_rate: integratedData.budget.execution_rate,
              quarterly_data: integratedData.budget.quarterly_data
            },
            contracts: integratedData.contracts,
            salaries: integratedData.salaries,
            treasury: integratedData.treasury,
            debt: integratedData.debt,
            documents: integratedData.documents
          }
        },
        audit: {
          discrepancies: [],
          summary: {
            sources_used: integratedData.metadata.sources_used,
            integration_success: integratedData.metadata.integration_success,
            external_data_available: integratedData.metadata.external_data_available
          },
          flags: [],
          external_datasets: integratedData.external_validation
        },
        documents: {
          all: integratedData.documents,
          byYear: {
            [currentYear]: integratedData.documents
          },
          byCategory: {},
          byType: {}
        },
        metadata: {
          last_updated: integratedData.metadata.last_sync,
          total_documents: integratedData.documents.length,
          available_years: yearSpecificDataService.getAvailableYears(),
          categories: ['Presupuesto', 'Finanzas', 'Recursos Humanos', 'Contratos', 'Informes'],
          data_sources_active: integratedData.metadata.sources_used.length,
          coverage_percentage: integratedData.metadata.integration_success ? 95 : 75
        },
        loading: false,
        error: null
      };

      setMasterData(initialMasterData as UnifiedTransparencyData);

    } catch (err: any) {
      console.error('❌ Master data initialization failed:', err);
      setError(err.message || 'Failed to initialize master data');
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  // New retry function that attempts to refetch data
  const retry = useCallback(async () => {
    try {
      setError(null);
      await initializeData();
    } catch (err: any) {
      console.error('❌ Retry failed:', err);
      setError(err.message || 'Failed to load data after retry');
    }
  }, [initializeData]);

  // Efficiently switch between years by only updating current year data if available
  const switchYear = useCallback(async (year: number) => {
    // Set the new year immediately to update UI quickly
    setCurrentYear(year);

    // Show loading state for year switching only
    setLoadingYear(true);

    try {
      // Check if data for this year already exists in masterData
      if (masterData?.financialData[year]) {
        // If data exists, no need to fetch, just update the current year state
        setLoadingYear(false);
        return;
      }

      // Use the integrated data service to get data from all sources for this year
      const integratedData = await dataIntegrationService.loadIntegratedData(year);

      console.log(`✅ Year ${year} integrated data loaded:`, {
        sources: integratedData.metadata.sources_used,
        budget: integratedData.budget.total_budget
      });

      if (integratedData) {
        // Update the master data with the new year's integrated information
        const updatedFinancialData = {
          ...masterData?.financialData,
          [year]: {
            budget: {
              total_budget: integratedData.budget.total_budget,
              total_executed: integratedData.budget.total_executed,
              execution_rate: integratedData.budget.execution_rate,
              quarterly_data: integratedData.budget.quarterly_data
            },
            contracts: integratedData.contracts,
            salaries: integratedData.salaries,
            treasury: integratedData.treasury,
            debt: integratedData.debt,
            documents: integratedData.documents
          }
        };

        const updatedMasterData = {
          ...masterData,
          financialData: updatedFinancialData,
          metadata: {
            ...masterData?.metadata,
            available_years: yearSpecificDataService.getAvailableYears(),
            last_updated: integratedData.metadata.last_sync,
            data_sources_active: integratedData.metadata.sources_used.length
          },
          audit: {
            ...masterData?.audit,
            summary: {
              ...masterData?.audit?.summary,
              sources_used: integratedData.metadata.sources_used,
              integration_success: integratedData.metadata.integration_success,
              external_data_available: integratedData.metadata.external_data_available
            },
            external_datasets: [...(masterData?.audit?.external_datasets || []), ...integratedData.external_validation]
          }
        } as UnifiedTransparencyData;

        setMasterData(updatedMasterData);
      }
    } catch (err: any) {
      console.error(`❌ Failed to switch to year ${year}:`, err);
      setError(err.message || `Failed to load data for year ${year}`);
    } finally {
      setLoadingYear(false);
    }
  }, [masterData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Memoized computation of current year data
  const currentYearData = useMemo(() => {
    return masterData?.financialData[currentYear] || {};
  }, [masterData, currentYear]);
  
  const currentBudget = useMemo(() => currentYearData.budget || {}, [currentYearData]);
  const currentContracts = useMemo(() => currentYearData.contracts || [], [currentYearData]);
  const currentSalaries = useMemo(() => currentYearData.salaries || [], [currentYearData]);
  const currentDocuments = useMemo(() => currentYearData.documents || [], [currentYearData]);
  const currentTreasury = useMemo(() => currentYearData.treasury || {}, [currentYearData]);
  const currentDebt = useMemo(() => currentYearData.debt || {}, [currentYearData]);

  // Multi-year data access
  const multiYearData = useMemo(() => masterData?.financialData || {}, [masterData]);

  // Charts data for ALL components (current and historical)
  const budgetChartData = useMemo(() => {
    // Prepare data from financial data
    return currentBudget;
  }, [currentBudget]);
  
  const contractsChartData = useMemo(() => {
    // Prepare data from financial data
    return { data: currentContracts };
  }, [currentContracts]);
  
  const salariesChartData = useMemo(() => {
    // Prepare data from financial data
    return { data: currentSalaries };
  }, [currentSalaries]);
  
  const treasuryChartData = useMemo(() => {
    // Prepare data from financial data
    return currentTreasury;
  }, [currentTreasury]);
  
  const debtChartData = useMemo(() => {
    // Prepare data from financial data
    return currentDebt;
  }, [currentDebt]);
  
  const documentsChartData = useMemo(() => {
    // Prepare data from financial data
    return { data: currentDocuments };
  }, [currentDocuments]);
  
  const comprehensiveChartData = useMemo(() => {
    // Prepare comprehensive data
    return {
      ...currentBudget,
      contracts: currentContracts.length,
      salaries: currentSalaries.length,
      documents: currentDocuments.length
    };
  }, [currentBudget, currentContracts, currentSalaries, currentDocuments]);
  
  // Historical charts data
  const budgetHistoricalData = useMemo(() => {
    if (!masterData?.financialData) return [];
    return Object.entries(masterData.financialData)
      .map(([year, data]) => ({
        year: parseInt(year),
        budget: data.budget?.total_budget || 0,
        executed: data.budget?.total_executed || 0,
        execution_rate: data.budget?.execution_rate || 0
      }))
      .filter(item => item.budget > 0 || item.executed > 0) // Only include years with actual data
      .sort((a, b) => a.year - b.year); // Sort chronologically
  }, [masterData]);
  
  const contractsHistoricalData = useMemo(() => {
    if (!masterData?.financialData) return [];
    return Object.entries(masterData.financialData)
      .map(([year, data]) => ({
        year: parseInt(year),
        count: Array.isArray(data.contracts) ? data.contracts.length : 0,
        total_value: Array.isArray(data.contracts) && data.contracts.length > 0 ? 
          data.contracts.reduce((sum, contract) => sum + (contract.value || 0), 0) : 0
      }))
      .filter(item => item.count > 0 || item.total_value > 0)
      .sort((a, b) => a.year - b.year);
  }, [masterData]);
  
  const salariesHistoricalData = useMemo(() => {
    if (!masterData?.financialData) return [];
    return Object.entries(masterData.financialData)
      .map(([year, data]) => ({
        year: parseInt(year),
        count: data.salaries?.employeeCount || 0,
        total_salary: data.salaries?.totalPayroll || 0
      }))
      .filter(item => item.count > 0 || item.total_salary > 0)
      .sort((a, b) => a.year - b.year);
  }, [masterData]);
  
  const treasuryHistoricalData = useMemo(() => {
    if (!masterData?.financialData) return [];
    return Object.entries(masterData.financialData)
      .map(([year, data]) => ({
        year: parseInt(year),
        balance: data.treasury?.balance || 0,
        income: data.treasury?.income || 0,
        expenses: data.treasury?.expenses || 0
      }))
      .filter(item => item.balance !== 0 || item.income !== 0 || item.expenses !== 0)
      .sort((a, b) => a.year - b.year);
  }, [masterData]);
  
  const debtHistoricalData = useMemo(() => {
    if (!masterData?.financialData) return [];
    return Object.entries(masterData.financialData)
      .map(([year, data]) => ({
        year: parseInt(year),
        total_debt: data.debt?.total_debt || 0,
        debt_service: data.debt?.debt_service || 0
      }))
      .filter(item => item.total_debt !== 0 || item.debt_service !== 0)
      .sort((a, b) => a.year - b.year);
  }, [masterData]);
  
  const documentsHistoricalData = useMemo(() => {
    if (!masterData?.financialData) return [];
    return Object.entries(masterData.financialData)
      .map(([year, data]) => ({
        year: parseInt(year),
        count: Array.isArray(data.documents) ? data.documents.length : 0
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => a.year - b.year);
  }, [masterData]);

  // Metadata
  const totalDocuments = useMemo(() => masterData?.metadata.total_documents || 0, [masterData]);
  const availableYears = useMemo(() => masterData?.metadata.available_years || [], [masterData]);
  const categories = useMemo(() => masterData?.metadata.categories || [], [masterData]);
  const dataSourcesActive = useMemo(() => masterData?.metadata.data_sources_active || 0, [masterData]);

  // Audit data
  const auditDiscrepancies = useMemo(() => masterData?.audit.discrepancies || [], [masterData]);
  const auditSummary = useMemo(() => masterData?.audit.summary || {}, [masterData]);
  const dataFlags = useMemo(() => masterData?.audit.flags || [], [masterData]);

  return {
    masterData,
    currentBudget,
    currentContracts,
    currentSalaries,
    currentDocuments,
    currentTreasury,
    currentDebt,
    multiYearData,
    budgetChartData,
    contractsChartData,
    salariesChartData,
    treasuryChartData,
    debtChartData,
    documentsChartData,
    comprehensiveChartData,
    budgetHistoricalData,
    contractsHistoricalData,
    salariesHistoricalData,
    treasuryHistoricalData,
    debtHistoricalData,
    documentsHistoricalData,
    loading,
    error,
    loadingYear,
    totalDocuments,
    availableYears,
    categories,
    dataSourcesActive,
    auditDiscrepancies,
    auditSummary,
    dataFlags,
    refetch: initializeData,
    switchYear,
    retry
  };
};

export default useMasterData;
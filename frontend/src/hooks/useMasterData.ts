import { useState, useEffect, useCallback, useMemo } from 'react';
import UnifiedTransparencyService from '../services/UnifiedTransparencyService';
import RealDataService from '../services/RealDataService';
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
}

export const useMasterData = (selectedYear?: number) => {
  const [masterData, setMasterData] = useState<UnifiedTransparencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingYear, setLoadingYear] = useState(false); // Separate loading state for year switching
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(selectedYear || new Date().getFullYear());

  // Initialize with all years data to have multi-year data available for charts
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get real data first, fallback to UnifiedTransparencyService
      const realData = await RealDataService.getVerifiedData();
      if (realData) {
        // Transform real data to format expected by the UI
        const unifiedFormat = {
          financialData: realData.enhancedData?.allYears?.reduce((acc: any, yearData: any) => {
            const year = yearData.year || currentYear;
            acc[year] = {
              budget: yearData,
              contracts: realData.enhancedData?.contracts || [],
              salaries: realData.enhancedData?.salaries || [],
              treasury: realData.enhancedData?.treasury || {},
              debt: realData.enhancedData?.debt || {},
              documents: realData.enhancedData?.documents || []
            };
            return acc;
          }, {}),
          audit: realData.auditData || {
            discrepancies: [],
            summary: {},
            flags: [],
            external_datasets: []
          },
          documents: {
            all: realData.enhancedData?.documents || [],
            byYear: {},
            byCategory: {},
            byType: {}
          },
          metadata: realData.metadata || {
            last_updated: new Date().toISOString(),
            total_documents: 0,
            available_years: [],
            categories: [],
            data_sources_active: 0,
            coverage_percentage: 0
          },
          loading: false,
          error: null
        };
        setMasterData(unifiedFormat);
      } else {
        // Fallback to UnifiedTransparencyService
        const allData = await UnifiedTransparencyService.getTransparencyData();
        setMasterData(allData);
      }

    } catch (err: any) {
      console.error('❌ Master data initialization failed:', err);
      setError(err.message || 'Failed to initialize master data');
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

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
      
      // If data doesn't exist, fetch it using the real data service
      const yearSpecificData = await RealDataService.getVerifiedData();
      if (yearSpecificData) {
        // Update the master data with the new year's information
        const updatedFinancialData = {
          ...masterData?.financialData,
          [year]: {
            budget: yearSpecificData.enhancedData?.budget || {},
            contracts: yearSpecificData.enhancedData?.contracts || [],
            salaries: yearSpecificData.enhancedData?.salaries || [],
            treasury: yearSpecificData.enhancedData?.treasury || {},
            debt: yearSpecificData.enhancedData?.debt || {},
            documents: yearSpecificData.enhancedData?.documents || []
          }
        };
        
        const updatedMasterData = {
          ...masterData,
          financialData: updatedFinancialData
        } as UnifiedTransparencyData;
        
        setMasterData(updatedMasterData);
      } else {
        // Fallback to UnifiedTransparencyService if real data service fails
        const yearSpecificData = await UnifiedTransparencyService.getTransparencyData(year);
        
        // Merge the new year data with existing data to build an updated master data
        if (masterData) {
          const updatedFinancialData = {
            ...masterData.financialData,
            [year]: yearSpecificData.financialData[year] || {}
          };
          
          const updatedMasterData = {
            ...masterData,
            financialData: updatedFinancialData
          };
          
          setMasterData(updatedMasterData);
        } else {
          // If no existing data, set the year-specific data
          setMasterData(yearSpecificData);
        }
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
        count: data.contracts?.length || 0,
        total_value: data.contracts?.reduce((sum, contract) => sum + (contract.value || 0), 0) || 0
      }))
      .filter(item => item.count > 0 || item.total_value > 0)
      .sort((a, b) => a.year - b.year);
  }, [masterData]);
  
  const salariesHistoricalData = useMemo(() => {
    if (!masterData?.financialData) return [];
    return Object.entries(masterData.financialData)
      .map(([year, data]) => ({
        year: parseInt(year),
        count: data.salaries?.length || 0,
        total_salary: data.salaries?.reduce((sum, salary) => sum + (salary.amount || 0), 0) || 0
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
        count: data.documents?.length || 0
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
    switchYear
  };
};

export default useMasterData;
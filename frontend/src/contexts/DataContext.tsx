/**
 * Global Data Context - Seamless data sharing across all pages
 * No page reloads, efficient caching, centralized data management
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { dataService } from '../services/dataService';
import { csvCache } from '../hooks/useCsvData';
import { jsonCache } from '../hooks/useJsonData';
import { pdfCache } from '../hooks/usePdfData';

// Data state interface
interface DataState {
  selectedYear: number;
  availableYears: number[];
  searchQuery: string;
  selectedCategory: string;
  loading: boolean;
  error: string | null;

  // Data caches
  csvData: Map<string, any>;
  jsonData: Map<string, any>;
  pdfData: Map<string, any>;

  // Master data
  masterData: any;

  // Filter states
  filters: {
    year: number;
    category: string;
    search: string;
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
  };

  // UI states
  ui: {
    sidebarCollapsed: boolean;
    chartHeight: number;
    theme: 'light' | 'dark';
    language: 'es' | 'en';
  };

  // Performance metrics
  performance: {
    cacheHits: number;
    cacheMisses: number;
    lastUpdateTime: number;
    avgLoadTime: number;
  };
}

// Action types
type DataAction =
  | { type: 'SET_YEAR'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MASTER_DATA'; payload: any }
  | { type: 'SET_AVAILABLE_YEARS'; payload: number[] }
  | { type: 'UPDATE_CSV_CACHE'; payload: { key: string; data: any } }
  | { type: 'UPDATE_JSON_CACHE'; payload: { key: string; data: any } }
  | { type: 'UPDATE_PDF_CACHE'; payload: { key: string; data: any } }
  | { type: 'SET_FILTERS'; payload: Partial<DataState['filters']> }
  | { type: 'SET_UI_STATE'; payload: Partial<DataState['ui']> }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<DataState['performance']> }
  | { type: 'CLEAR_CACHE' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: DataState = {
  selectedYear: new Date().getFullYear(),
  availableYears: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
  searchQuery: '',
  selectedCategory: '',
  loading: false,
  error: null,

  csvData: new Map(),
  jsonData: new Map(),
  pdfData: new Map(),

  masterData: null,

  filters: {
    year: new Date().getFullYear(),
    category: '',
    search: '',
    dateRange: {
      start: null,
      end: null
    }
  },

  ui: {
    sidebarCollapsed: false,
    chartHeight: 400,
    theme: 'light',
    language: 'es'
  },

  performance: {
    cacheHits: 0,
    cacheMisses: 0,
    lastUpdateTime: Date.now(),
    avgLoadTime: 0
  }
};

// Reducer
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_YEAR':
      return {
        ...state,
        selectedYear: action.payload,
        filters: { ...state.filters, year: action.payload }
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        filters: { ...state.filters, search: action.payload }
      };

    case 'SET_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        filters: { ...state.filters, category: action.payload }
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_MASTER_DATA':
      return { ...state, masterData: action.payload };

    case 'SET_AVAILABLE_YEARS':
      return { ...state, availableYears: action.payload };

    case 'UPDATE_CSV_CACHE':
      const newCsvData = new Map(state.csvData);
      newCsvData.set(action.payload.key, action.payload.data);
      return { ...state, csvData: newCsvData };

    case 'UPDATE_JSON_CACHE':
      const newJsonData = new Map(state.jsonData);
      newJsonData.set(action.payload.key, action.payload.data);
      return { ...state, jsonData: newJsonData };

    case 'UPDATE_PDF_CACHE':
      const newPdfData = new Map(state.pdfData);
      newPdfData.set(action.payload.key, action.payload.data);
      return { ...state, pdfData: newPdfData };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case 'SET_UI_STATE':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload }
      };

    case 'CLEAR_CACHE':
      // Clear all caches
      csvCache.clear();
      jsonCache.clear();
      pdfCache.clear();
      return {
        ...state,
        csvData: new Map(),
        jsonData: new Map(),
        pdfData: new Map(),
        performance: {
          ...state.performance,
          cacheHits: 0,
          cacheMisses: 0
        }
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
const DataContext = createContext<{
  state: DataState;
  dispatch: React.Dispatch<DataAction>;

  // Convenient action creators
  setYear: (year: number) => void;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string) => void;
  loadMasterData: (year?: number) => Promise<void>;
  refreshData: () => Promise<void>;
  clearCache: () => void;

  // Data access helpers
  getCsvData: (url: string) => any;
  getJsonData: (url: string) => any;
  getPdfData: (category?: string) => any[];

  // Filter helpers
  getFilteredData: (data: any[], type: 'csv' | 'json' | 'pdf') => any[];

} | undefined>(undefined);

// Provider component
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Action creators
  const setYear = (year: number) => {
    dispatch({ type: 'SET_YEAR', payload: year });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setCategory = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const loadMasterData = async (year?: number) => {
    const targetYear = year || state.selectedYear;
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const startTime = Date.now();
      const masterData = await dataService.getMasterData(targetYear);
      const loadTime = Date.now() - startTime;

      dispatch({ type: 'SET_MASTER_DATA', payload: masterData });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Update performance metrics
      dispatch({
        type: 'UPDATE_PERFORMANCE',
        payload: {
          lastUpdateTime: Date.now(),
          avgLoadTime: (state.performance.avgLoadTime + loadTime) / 2
        }
      });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshData = async () => {
    dispatch({ type: 'CLEAR_CACHE' });
    await loadMasterData();
  };

  const clearCache = () => {
    dispatch({ type: 'CLEAR_CACHE' });
  };

  // Data access helpers
  const getCsvData = (url: string) => {
    return state.csvData.get(url) || null;
  };

  const getJsonData = (url: string) => {
    return state.jsonData.get(url) || null;
  };

  const getPdfData = (category?: string) => {
    const allPdfs = Array.from(state.pdfData.values()).flat();
    if (category) {
      return allPdfs.filter((pdf: any) => pdf.category === category);
    }
    return allPdfs;
  };

  // Filter helpers
  const getFilteredData = (data: any[], type: 'csv' | 'json' | 'pdf') => {
    let filtered = [...data];

    // Apply year filter
    if (state.filters.year) {
      filtered = filtered.filter((item: any) => {
        const year = item.year || item.Year || item.YEAR || item.año || item.Año;
        return !year || parseInt(year) === state.filters.year;
      });
    }

    // Apply category filter
    if (state.filters.category) {
      filtered = filtered.filter((item: any) =>
        item.category === state.filters.category ||
        item.tipo === state.filters.category ||
        item.type === state.filters.category
      );
    }

    // Apply search filter
    if (state.filters.search) {
      const query = state.filters.search.toLowerCase();
      filtered = filtered.filter((item: any) =>
        Object.values(item).some(value =>
          String(value || '').toLowerCase().includes(query)
        )
      );
    }

    // Apply date range filter
    if (state.filters.dateRange.start || state.filters.dateRange.end) {
      filtered = filtered.filter((item: any) => {
        const itemDate = new Date(item.date || item.fecha || item.timestamp);
        const start = state.filters.dateRange.start;
        const end = state.filters.dateRange.end;

        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        return true;
      });
    }

    return filtered;
  };

  // Load initial data
  useEffect(() => {
    loadMasterData();
  }, []);

  // Sync external caches with context state
  useEffect(() => {
    const syncInterval = setInterval(() => {
      // Sync CSV cache
      csvCache.forEach((value, key) => {
        if (!state.csvData.has(key)) {
          dispatch({ type: 'UPDATE_CSV_CACHE', payload: { key, data: value } });
        }
      });

      // Sync JSON cache
      jsonCache.forEach((value, key) => {
        if (!state.jsonData.has(key)) {
          dispatch({ type: 'UPDATE_JSON_CACHE', payload: { key, data: value.data } });
        }
      });

      // Sync PDF cache
      pdfCache.forEach((value, key) => {
        if (!state.pdfData.has(key)) {
          dispatch({ type: 'UPDATE_PDF_CACHE', payload: { key, data: value.data } });
        }
      });
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [state.csvData, state.jsonData, state.pdfData]);

  const value = {
    state,
    dispatch,
    setYear,
    setSearchQuery,
    setCategory,
    loadMasterData,
    refreshData,
    clearCache,
    getCsvData,
    getJsonData,
    getPdfData,
    getFilteredData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
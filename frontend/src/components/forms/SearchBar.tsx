import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataService from '../../services/dataService';

// Define the types for Fuse.js results
import type { FuseResult } from 'fuse.js';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

interface SearchableItem {
  id: string;
  title: string;
  content: string;
  type: string;
  url: string; // URL where the item can be found
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  // Dynamically import Fuse to avoid type issues
  const [Fuse, setFuse] = useState<unknown>(null);

  // Load Fuse dynamically
  useEffect(() => {
    const loadFuse = async () => {
      const FuseModule = await import('fuse.js');
      setFuse(FuseModule.default);
    };
    
    loadFuse();
  }, []);
  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Fuse.FuseResult<SearchableItem>[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [allSearchableData, setAllSearchableData] = useState<SearchableItem[]>([]);
  const navigate = useNavigate();

  // Load all searchable data once when component mounts
  useEffect(() => {
    const loadSearchableData = async () => {
      try {
        // Load financial data
        const financialData = await DataService.getFinancialData();
        const financialItems: SearchableItem[] = financialData.map(item => ({
          id: `fin-${item.year}`,
          title: `Finanzas ${item.year}`,
          content: `Presupuesto: ${item.planned}, Ejecutado: ${item.executed}`,
          type: 'Finanzas',
          url: '/finances'
        }));

        // Load contract data
        const contractData = await DataService.getChartData();
        const contractItems: SearchableItem[] = contractData.map(item => ({
          id: `contract-${item.id}`,
          title: `Contrato: ${item.description}`,
          content: `Contratista: ${item.contractor}, Monto: ${item.amount}, Estado: ${item.status}`,
          type: 'Contrato',
          url: '/contracts'
        }));

        // Load audit data
        const auditData = await DataService.getMasterIndex();
        const auditItems: SearchableItem[] = auditData.map((item, index) => ({
          id: `audit-${item.year || index}`,
          title: `Auditoría ${item.year}`,
          content: `Discrepancia: ${item.discrepancy}, Local: ${item.local}, Externo: ${item.external}`,
          type: 'Auditoría',
          url: '/audits'
        }));

        // Combine all searchable data
        const combinedData = [
          ...financialItems,
          ...contractItems,
          ...auditItems
        ];

        setAllSearchableData(combinedData);
      } catch (error) {
        console.error('Error loading searchable data:', error);
        
        // Fallback with static data
        setAllSearchableData([
          { id: 'fin-2023', title: 'Finanzas 2023', content: 'Datos financieros del año 2023', type: 'Finanzas', url: '/finances' },
          { id: 'fin-2022', title: 'Finanzas 2022', content: 'Datos financieros del año 2022', type: 'Finanzas', url: '/finances' },
          { id: 'contract-1', title: 'Contrato Reparación Calles', content: 'Reparación de calles en sector norte', type: 'Contrato', url: '/contracts' },
          { id: 'audit-2022', title: 'Auditoría 2022', content: 'Auditoría del año 2022', type: 'Auditoría', url: '/audits' }
        ]);
      }
    };

    loadSearchableData();
  }, []);

  // Initialize Fuse with the searchable data when Fuse is loaded
  const fuse = Fuse ? new Fuse(allSearchableData, {
    keys: ['title', 'content', 'type'],
    threshold: 0.3, // Adjust for fuzzy matching sensitivity
    includeScore: true,
  }) : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
    
    // Perform search when form is submitted
    if (query.trim() && fuse) {
      const results = fuse.search(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Perform search as user types (optional - can be removed for performance)
    if (value.trim() && fuse) {
      const results = fuse.search(value);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Buscar en el portal de transparencia..."
          className="w-full px-4 py-2 rounded-l-lg text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-50 dark:bg-blue-900/200 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition duration-200"
        >
          Buscar
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full bg-white dark:bg-dark-surface shadow-lg rounded-md mt-1 max-h-80 overflow-y-auto">
          <ul>
            {searchResults.map((result, index) => (
              <li 
                key={result.item.id} 
                className={`border-b border-gray-200 last:border-b-0 p-3 cursor-pointer hover:bg-gray-100 dark:bg-dark-background ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50 dark:bg-dark-background'
                }`}
                onClick={() => handleResultClick(result.item.url)}
              >
                <div className="font-semibold text-blue-600 dark:text-blue-400">{result.item.title}</div>
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary truncate">{result.item.content}</div>
                <div className="text-xs text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-1">{result.item.type}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show "no results" message */}
      {showResults && searchResults.length === 0 && query && (
        <div className="absolute z-10 w-full bg-white dark:bg-dark-surface shadow-lg rounded-md mt-1 p-3">
          No se encontraron resultados para "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchBar;
import React, { useState, useEffect } from 'react';
import YearlyFinancialDashboard from '../components/yearly/YearlyFinancialDashboard';
import { unifiedDataService } from '../services';
import { Loader } from 'lucide-react';

const FinancialHistory: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableYears();
  }, []);

  const loadAvailableYears = async () => {
    try {
      setLoading(true);
      const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019]; // Static years for now
      setAvailableYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (error) {
      console.error('Error loading available years:', error);
      // Fallback to default years
      setAvailableYears([2025, 2024, 2023, 2022, 2020, 2019]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando historial financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
                📊 Historial Financiero
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Evolución financiera del municipio de Carmen de Areco (2019-2025)
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Años disponibles: {availableYears.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Yearly Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <YearlyFinancialDashboard year={selectedYear} />
      </div>
    </div>
  );
};

export default FinancialHistory;
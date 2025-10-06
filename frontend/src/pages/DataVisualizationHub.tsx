import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Grid3X3,
  Table,
  LineChart,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import ComprehensiveDataDisplay from '../components/data-display/ComprehensiveDataDisplay';
import StandardizedChart from '../components/charts/StandardizedChart';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { formatCurrencyARS } from '../utils/formatters';
import { externalAPIsService } from "../services/ExternalDataAdapter";
import { carmenScraperService } from '../services/CarmenScraperService';
import { dataAuditService } from '../services/DataAuditService';
import ConsistentDataVisualization from '../components/charts/ConsistentDataVisualization';
import ConsistentDataTable from '../components/tables/ConsistentDataTable';

interface ChartData {
  name: string;
  category: string;
  data: any[];
  type: 'bar' | 'line' | 'pie' | 'area';
  description: string;
}

const DataVisualizationHub: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'charts'>('charts');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvData, setCsvData] = useState<Record<string, any[]>>({});
  const [externalData, setExternalData] = useState<{
    rafam: any;
    gba: any;
    contrataciones: any;
    carmenOfficial: any;
    carmenScraper: any;
  }>({
    rafam: null,
    gba: null,
    contrataciones: null,
    carmenOfficial: null,
    carmenScraper: null
  });
  const [externalLoading, setExternalLoading] = useState(true);
  const [dataSources, setDataSources] = useState<string[]>(['local']);

  const availableYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

  const categories = [
    'Presupuesto',
    'Finanzas',
    'Ingresos',
    'Gastos',
    'Deuda',
    'Inversiones',
    'Balance Fiscal',
    'Recursos Humanos',
    'Salud',
    'Educación',
    'Infraestructura',
    'Economía'
  ];

  const csvFiles = [
    'Budget_Execution_consolidated_2019-2025.csv',
    'Financial_Reserves_consolidated_2019-2025.csv',
    'Health_Statistics_consolidated_2019-2025.csv',
    'Personnel_Expenses_consolidated_2019-2025.csv',
    'Education_Data_consolidated_2019-2025.csv',
    'Expenditure_Report_consolidated_2019-2025.csv',
    'Investment_Report_consolidated_2019-2025.csv',
    'Fiscal_Balance_Report_consolidated_2019-2025.csv',
    'Debt_Report_consolidated_2019-2025.csv',
    'Revenue_Report_consolidated_2019-2025.csv',
    'Economic_Report_consolidated_2019-2025.csv',
    'Infrastructure_Projects_consolidated_2019-2025.csv',
    'Revenue_Sources_consolidated_2019-2025.csv'
  ];

  // Function to parse CSV data with improved column naming
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    // Improve column naming
    const improvedHeaders = headers.map((header, index) => {
      if (header.toLowerCase().includes('column') || header === `Column_${index}` || header === `Column ${index}`) {
        // Try to derive meaningful names based on common patterns
        switch (index) {
          case 0: return 'Indicador';
          case 1: return 'Año Actual';
          case 2: return 'Año Anterior';
          case 3: return 'Variación';
          case 4: return 'Año';
          default: return `Dato ${index + 1}`;
        }
      }
      return header || `Columna ${index + 1}`;
    });

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        improvedHeaders.forEach((header, index) => {
          let value = values[index];

          // Clean currency values: remove $, commas, and percentage signs
          const cleanValue = value.replace(/[$,\s%]/g, '');

          // Try to parse as number if it looks like one (but not dates or 4-digit years)
          if (cleanValue && !isNaN(parseFloat(cleanValue)) && isNaN(Date.parse(value)) && !/^\d{4}$/.test(value)) {
            row[header] = parseFloat(cleanValue);
          } else {
            // Keep original value for text fields (like Quarter, Concept, year)
            row[header] = value;
          }
        });
        data.push(row);
      }
    }

    return data;
  };

  // Load CSV data
  const loadCSVData = async () => {
    const loadedData: Record<string, any[]> = {};

    for (const fileName of csvFiles) {
      try {
        const response = await fetch(`/data/charts/${fileName}`);
        if (response.ok) {
          const csvText = await response.text();
          const parsedData = parseCSV(csvText);
          loadedData[fileName] = parsedData.filter(row =>
            !selectedYear ||
            !row.year ||
            parseInt(row.year) === selectedYear ||
            parseInt(row.Year) === selectedYear ||
            parseInt(row.Año) === selectedYear
          );
        }
      } catch (error) {
        console.error(`Error loading ${fileName}:`, error);
        loadedData[fileName] = [];
      }
    }

    setCsvData(loadedData);
  };

  // Load external data sources
  const loadExternalData = async () => {
    try {
      setExternalLoading(true);
      console.log('Fetching external data sources...');

      const [rafamResult, gbaResult, contratacionesResult, carmenResult, carmenScraperResult] = await Promise.allSettled([
        externalAPIsService.getRAFAMData('270'),
        externalAPIsService.getBuenosAiresProvincialData(),
        externalAPIsService.getContratacionesData('Carmen de Areco'),
        externalAPIsService.getCarmenDeArecoData(),
        carmenScraperService.fetchAllCarmenData()
      ]);

      const newExternalData: any = {
        rafam: rafamResult.status === 'fulfilled' && rafamResult.value.success ? rafamResult.value.data : null,
        gba: gbaResult.status === 'fulfilled' && gbaResult.value.success ? gbaResult.value.data : null,
        contrataciones: contratacionesResult.status === 'fulfilled' && contratacionesResult.value.success ? contratacionesResult.value.data : null,
        carmenOfficial: carmenResult.status === 'fulfilled' ? carmenResult.value : null,
        carmenScraper: carmenScraperResult.status === 'fulfilled' && carmenScraperResult.value.success ? carmenScraperResult.value.results : null
      };

      setExternalData(newExternalData);

      const activeSources = ['local'];
      if (newExternalData.rafam) activeSources.push('rafam');
      if (newExternalData.gba) activeSources.push('gba');
      if (newExternalData.contrataciones) activeSources.push('contrataciones');
      if (newExternalData.carmenOfficial) activeSources.push('carmen');
      if (newExternalData.carmenScraper) activeSources.push('carmen-scraper');

      setDataSources(activeSources);

      console.log('External data loaded:', {
        rafam: !!newExternalData.rafam,
        gba: !!newExternalData.gba,
        contrataciones: !!newExternalData.contrataciones,
        carmen: !!newExternalData.carmenOfficial,
        'carmen-scraper': !!newExternalData.carmenScraper
      });

    } catch (error) {
      console.error('Error loading external data:', error);
    } finally {
      setExternalLoading(false);
    }
  };

  useEffect(() => {
    loadCSVData();
    loadExternalData();
    setLoading(false);
  }, [selectedYear]);

  // Generate chart configurations
  const getChartConfigs = (): ChartData[] => {
    const configs: ChartData[] = [];

    // Add local CSV data configurations
    Object.entries(csvData).forEach(([fileName, data]) => {
      if (data.length === 0) return;

      const baseConfig = {
        name: fileName.replace('_consolidated_2019-2025.csv', ''),
        data: data,
        description: `Datos de ${fileName.replace('.csv', '').replace(/_/g, ' ')}`
      };

      // Determine category and chart type based on file name
      if (fileName.includes('Budget_Execution')) {
        configs.push({
          ...baseConfig,
          category: 'Presupuesto',
          type: 'bar',
          description: 'Ejecución presupuestaria por sector y período'
        });
      } else if (fileName.includes('Revenue')) {
        configs.push({
          ...baseConfig,
          category: 'Ingresos',
          type: 'line',
          description: 'Análisis de ingresos municipales'
        });
      } else if (fileName.includes('Debt')) {
        configs.push({
          ...baseConfig,
          category: 'Deuda',
          type: 'area',
          description: 'Evolución de la deuda municipal'
        });
      } else if (fileName.includes('Health')) {
        configs.push({
          ...baseConfig,
          category: 'Salud',
          type: 'bar',
          description: 'Estadísticas del sector salud'
        });
      } else if (fileName.includes('Education')) {
        configs.push({
          ...baseConfig,
          category: 'Educación',
          type: 'bar',
          description: 'Datos del sector educación'
        });
      } else if (fileName.includes('Infrastructure')) {
        configs.push({
          ...baseConfig,
          category: 'Infraestructura',
          type: 'bar',
          description: 'Proyectos de infraestructura municipal'
        });
      } else {
        // Default configuration
        configs.push({
          ...baseConfig,
          category: 'Finanzas',
          type: 'bar',
          description: baseConfig.description
        });
      }
    });

    // Add external data configurations if available
    if (externalData.rafam) {
      configs.push({
        name: 'RAFAM - Datos Económicos',
        category: 'Finanzas',
        data: externalData.rafam?.economicData?.budget || [],
        type: 'bar',
        description: 'Datos económicos del municipio de Carmen de Areco desde RAFAM'
      });
    }

    if (externalData.gba && externalData.gba.datasets) {
      configs.push({
        name: 'Datos Abiertos GBA',
        category: 'Transparencia',
        data: externalData.gba.datasets,
        type: 'line',
        description: 'Datos abiertos de la Provincia de Buenos Aires'
      });
    }

    if (externalData.contrataciones) {
      configs.push({
        name: 'Contrataciones Abiertas',
        category: 'Contrataciones',
        data: externalData.contrataciones.contracts || [],
        type: 'bar',
        description: 'Contrataciones del municipio desde el portal de contrataciones abiertas'
      });
    }

    if (externalData.carmenOfficial) {
      configs.push({
        name: 'Datos Carmen de Areco',
        category: 'Municipal',
        data: externalData.carmenOfficial.data?.documents || [],
        type: 'area',
        description: 'Datos oficiales del municipio de Carmen de Areco'
      });
    }

    // Add Carmen scraper data configurations
    if (externalData.carmenScraper) {
      // Add official data from scraper
      if (externalData.carmenScraper.official) {
        configs.push({
          name: 'Scraper - Datos Oficiales Carmen',
          category: 'Municipal',
          data: Array.isArray(externalData.carmenScraper.official) ? externalData.carmenScraper.official : [externalData.carmenScraper.official],
          type: 'line',
          description: 'Datos oficiales del municipio de Carmen de Areco vía scraper'
        });
      }
      
      // Add transparency data from scraper
      if (externalData.carmenScraper.transparency) {
        configs.push({
          name: 'Scraper - Datos Transparencia',
          category: 'Transparencia',
          data: Array.isArray(externalData.carmenScraper.transparency) ? externalData.carmenScraper.transparency : [externalData.carmenScraper.transparency],
          type: 'bar',
          description: 'Datos de transparencia del municipio de Carmen de Areco vía scraper'
        });
      }
      
      // Add boletin data from scraper
      if (externalData.carmenScraper.boletin) {
        configs.push({
          name: 'Scraper - Boletín Oficial',
          category: 'Legal',
          data: Array.isArray(externalData.carmenScraper.boletin) ? externalData.carmenScraper.boletin : [externalData.carmenScraper.boletin],
          type: 'area',
          description: 'Publicaciones del boletín oficial de Carmen de Areco vía scraper'
        });
      }
    }

    return configs;
  };

  const chartConfigs = getChartConfigs();
  const filteredCharts = chartConfigs.filter(chart =>
    selectedCategory === 'all' || chart.category === selectedCategory
  );

  const renderChart = (config: ChartData) => {
    if (!config.data || config.data.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-dark-text-tertiary">
            No hay datos disponibles para {config.name}
          </div>
        </div>
      );
    }

    // Determine appropriate keys for chart
    const keys = Object.keys(config.data[0] || {});
    const numericKeys = keys.filter(key =>
      config.data.some(row => typeof row[key] === 'number' && row[key] !== 0)
    );
    const categoryKey = keys.find(key =>
      typeof config.data[0][key] === 'string' &&
      !key.toLowerCase().includes('year') &&
      !key.toLowerCase().includes('año')
    ) || keys[0];

    if (numericKeys.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-dark-text-tertiary">
            No se encontraron datos numéricos para graficar
          </div>
        </div>
      );
    }

    return (
      <ErrorBoundary>
        <StandardizedChart
          data={config.data}
          chartType={config.type}
          xAxisKey={categoryKey}
          yAxisKeys={numericKeys.slice(0, 3)} // Limit to 3 series
          title={config.name.replace(/_/g, ' ')}
          description={config.description}
          height={300}
          valueFormatter={formatCurrencyARS}
          className="w-full"
        />
      </ErrorBoundary>
    );
  };

  const renderDataTable = (config: ChartData) => {
    if (!config.data || config.data.length === 0) return null;

    const headers = Object.keys(config.data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 dark:bg-dark-surface-alt">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {config.data.slice(0, 10).map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-surface-alt">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                    {typeof row[header] === 'number' && (
                      header.toLowerCase().includes('amount') ||
                      header.toLowerCase().includes('total') ||
                      header.toLowerCase().includes('monto') ||
                      header.toLowerCase().includes('budget') ||
                      header.toLowerCase().includes('presupuesto')
                    )
                      ? formatCurrencyARS(row[header])
                      : typeof row[header] === 'number' && header.toLowerCase().includes('%')
                      ? `${row[header]}%`
                      : row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-dark-text-secondary">Cargando visualizaciones de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                <Database className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                Centro de Visualización de Datos
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-3 max-w-2xl">
                Acceso completo a todos los archivos CSV, JSON y PDF con visualizaciones interactivas.
                Todos los datos municipales organizados y disponibles para análisis.
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Data Sources Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 bg-white dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Fuentes de Datos Activas
            </h3>
            {externalLoading && (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-gray-700 dark:text-dark-text-secondary">Archivos Locales (CSV/JSON)</span>
            </div>
            <div className="flex items-center text-sm">
              {externalData.rafam ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-gray-700 dark:text-dark-text-secondary">RAFAM</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">RAFAM</span>
                </>
              )}
            </div>
            <div className="flex items-center text-sm">
              {externalData.gba ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-gray-700 dark:text-dark-text-secondary">Buenos Aires</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">Buenos Aires</span>
                </>
              )}
            </div>
            <div className="flex items-center text-sm">
              {externalData.contrataciones ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-gray-700 dark:text-dark-text-secondary">Contrataciones</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">Contrataciones</span>
                </>
              )}
            </div>
            <div className="flex items-center text-sm">
              {externalData.carmenOfficial ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-gray-700 dark:text-dark-text-secondary">Carmen de Areco</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">Carmen de Areco</span>
                </>
              )}
            </div>
            <div className="flex items-center text-sm">
              {externalData.carmenScraper ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-gray-700 dark:text-dark-text-secondary">Scraper Carmen</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">Scraper Carmen</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-tertiary">
            Fuentes activas: {dataSources.length} | Clic en "Gráficos" para ver comparaciones entre fuentes
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-1 shadow-sm border border-gray-200 dark:border-dark-border">
            {[
              { mode: 'charts', icon: BarChart3, label: 'Gráficos' },
              { mode: 'table', icon: Table, label: 'Tablas' },
              { mode: 'grid', icon: Grid3X3, label: 'Archivos' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'grid' | 'table' | 'charts')}
                className={`flex items-center px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-surface-alt'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {viewMode === 'charts' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filteredCharts.map((config, index) => (
                <motion.div
                  key={`${config.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                        {config.name.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        {config.description}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {config.category}
                    </span>
                  </div>
                  {renderChart(config)}
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'table' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {filteredCharts.map((config, index) => (
                <motion.div
                  key={`${config.name}-table-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                        {config.name.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        {config.description} (mostrando primeros 10 registros)
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {config.category}
                    </span>
                  </div>
                  {renderDataTable(config)}
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'grid' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ErrorBoundary>
                <ComprehensiveDataDisplay
                  showAllFiles={true}
                  category={selectedCategory !== 'all' ? selectedCategory : undefined}
                  year={selectedYear}
                />
              </ErrorBoundary>
            </motion.div>
          )}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-border text-center">
            <FileSpreadsheet className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              {csvFiles.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Archivos CSV
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-border text-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              {chartConfigs.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Visualizaciones
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-border text-center">
            <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Categorías
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-border text-center">
            <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              {availableYears.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Años de Datos
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataVisualizationHub;
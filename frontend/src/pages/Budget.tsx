import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Filter, 
  Eye, 
  FileText, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Loader2,
  BarChart3,
  PieChart,
  ExternalLink,
  Target,
  Activity
} from 'lucide-react';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChart';
import ComprehensiveVisualization from '../components/charts/ComprehensiveVisualization';
import FinancialDataTable from '../components/tables/FinancialDataTable';
import ComprehensiveDataService, { DocumentLink, PowerBIDataPoint } from '../services/ComprehensiveDataService';
import ApiService, { FinancialReport } from '../services/ApiService';
import { formatCurrencyARS } from '../utils/formatters';

const Budget: React.FC = () => {
  const [activeYear, setActiveYear] = useState<number>(2025);
  const [activeTab, setActiveTab] = useState('overview');
  const [budgetDocuments, setBudgetDocuments] = useState<DocumentLink[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [powerBIData, setPowerBIData] = useState<PowerBIDataPoint[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const dataService = ComprehensiveDataService.getInstance();
  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

  useEffect(() => {
    loadBudgetData();
  }, [activeYear]);

  const loadBudgetData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Loading comprehensive budget data for ${activeYear}...`);
      
      // 1. Load budget execution documents
      const allDocs = await dataService.getAllDocuments();
      const budgetDocs = allDocs.filter(doc => 
        doc.year === activeYear && 
        (doc.document_type === 'budget_execution' || doc.category.includes('Presupuest') || doc.category.includes('Ejecución'))
      );
      setBudgetDocuments(budgetDocs);
      console.log(`📄 Found ${budgetDocs.length} budget documents for ${activeYear}`);

      // 2. Load financial reports from backend API
      try {
        const reports = await ApiService.getFinancialReports(activeYear);
        setFinancialReports(reports);
        console.log(`📊 Loaded ${reports.length} financial reports from API`);
      } catch (apiError) {
        console.warn('⚠️ Backend API not available, using local data only');
      }

      // 3. Load PowerBI data
      const powerbiData = await dataService.extractPowerBIData(activeYear);
      setPowerBIData(powerbiData);
      console.log(`📈 Extracted ${powerbiData.length} PowerBI data points`);

      // 4. Generate budget analysis
      const analysis = generateBudgetAnalysis(budgetDocs, financialReports, powerbiData);
      setBudgetAnalysis(analysis);
      
      console.log(`✅ Budget data loaded successfully for ${activeYear}`);
      
    } catch (error) {
      console.error('❌ Error loading budget data:', error);
      setError('Error loading budget data');
    } finally {
      setLoading(false);
    }
  };

  const generateBudgetAnalysis = (docs: DocumentLink[], reports: FinancialReport[], powerbi: PowerBIDataPoint[]) => {
    // Calculate total income and expenses from all sources
    const totalIncome = powerbi
      .filter(p => p.category.includes('Ingresos'))
      .reduce((sum, p) => sum + p.value, 0);
    
    const totalExpenses = powerbi
      .filter(p => p.category.includes('Gastos'))
      .reduce((sum, p) => sum + p.value, 0);

    const budgetBalance = totalIncome - totalExpenses;
    const executionRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    // Monthly breakdown
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthIncome = powerbi
        .filter(p => p.month === month && p.category.includes('Ingresos'))
        .reduce((sum, p) => sum + p.value, 0);
      
      const monthExpenses = powerbi
        .filter(p => p.month === month && p.category.includes('Gastos'))
        .reduce((sum, p) => sum + p.value, 0);

      monthlyData.push({
        month,
        income: monthIncome,
        expenses: monthExpenses,
        balance: monthIncome - monthExpenses
      });
    }

    // Category breakdown
    const expenseCategories = {
      'Gastos de Personal': powerbi.filter(p => p.category.includes('Personal')).reduce((sum, p) => sum + p.value, 0),
      'Gastos Operativos': powerbi.filter(p => p.category.includes('Operativo')).reduce((sum, p) => sum + p.value, 0),
      'Inversión en Obras': powerbi.filter(p => p.category.includes('Obras')).reduce((sum, p) => sum + p.value, 0),
      'Otros Gastos': powerbi.filter(p => p.category.includes('Otros')).reduce((sum, p) => sum + p.value, 0)
    };

    return {
      totalIncome,
      totalExpenses,
      budgetBalance,
      executionRate,
      monthlyData,
      expenseCategories,
      totalDocuments: docs.length,
      dataPoints: powerbi.length,
      lastUpdated: new Date().toISOString()
    };
  };

  const openDocument = (document: DocumentLink) => {
    window.open(document.direct_pdf_url, '_blank');
  };

  const openOfficialSite = (document: DocumentLink) => {
    window.open(document.official_url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Cargando datos presupuestarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="mx-auto w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadBudgetData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ejecución Presupuestaria</h1>
            <p className="text-green-100">
              Carmen de Areco - Datos Presupuestarios Oficiales {activeYear}
            </p>
          </div>
          {budgetAnalysis && (
            <div className="text-right">
              <div className="text-4xl font-bold">
                {budgetAnalysis.executionRate.toFixed(1)}%
              </div>
              <div className="text-green-100">Ejecución</div>
              <div className="text-sm text-green-200 mt-1">
                {budgetAnalysis.totalDocuments} documentos disponibles
              </div>
            </div>
          )}
        </div>

        {budgetAnalysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrencyARS(budgetAnalysis.totalIncome)}
              </div>
              <div className="text-green-100 text-sm">Ingresos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrencyARS(budgetAnalysis.totalExpenses)}
              </div>
              <div className="text-green-100 text-sm">Gastos</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${budgetAnalysis.budgetBalance >= 0 ? 'text-green-200' : 'text-red-300'}`}>
                {formatCurrencyARS(budgetAnalysis.budgetBalance)}
              </div>
              <div className="text-green-100 text-sm">Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{budgetAnalysis.dataPoints}</div>
              <div className="text-green-100 text-sm">Puntos de Datos</div>
            </div>
          </div>
        )}
      </div>

      {/* Year Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Año:</label>
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Última actualización: {budgetAnalysis ? new Date(budgetAnalysis.lastUpdated).toLocaleDateString('es-AR') : 'N/A'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'overview', label: 'Resumen General', icon: Target },
          { id: 'execution', label: 'Ejecución Mensual', icon: TrendingUp },
          { id: 'categories', label: 'Por Categorías', icon: PieChart },
          { id: 'documents', label: 'Documentos', icon: FileText },
          { id: 'charts', label: 'Visualizaciones', icon: BarChart3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && budgetAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Resumen Presupuestario {activeYear}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Ingresos Totales:</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrencyARS(budgetAnalysis.totalIncome)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-900">Gastos Totales:</span>
                <span className="text-xl font-bold text-red-700">
                  {formatCurrencyARS(budgetAnalysis.totalExpenses)}
                </span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                budgetAnalysis.budgetBalance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
              }`}>
                <span className={`font-medium ${
                  budgetAnalysis.budgetBalance >= 0 ? 'text-blue-900' : 'text-yellow-900'
                }`}>
                  {budgetAnalysis.budgetBalance >= 0 ? 'Superávit:' : 'Déficit:'}
                </span>
                <span className={`text-xl font-bold ${
                  budgetAnalysis.budgetBalance >= 0 ? 'text-blue-700' : 'text-yellow-700'
                }`}>
                  {formatCurrencyARS(Math.abs(budgetAnalysis.budgetBalance))}
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tasa de Ejecución:</span>
                  <span className="font-bold">{budgetAnalysis.executionRate.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${Math.min(budgetAnalysis.executionRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Fuentes de Datos
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-900">Documentos Oficiales</div>
                  <div className="text-sm text-blue-700">{budgetDocuments.length} documentos</div>
                </div>
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-900">Reportes API</div>
                  <div className="text-sm text-green-700">{financialReports.length} reportes</div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-purple-900">Datos PowerBI</div>
                  <div className="text-sm text-purple-700">{powerBIData.length} puntos</div>
                </div>
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              
              <div className="pt-3 border-t">
                <a 
                  href="https://carmendeareco.gob.ar/transparencia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver sitio oficial</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'execution' && budgetAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Ejecución Presupuestaria Mensual {activeYear}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Chart */}
            <div className="h-96">
              <BudgetAnalysisChart 
                data={budgetAnalysis.monthlyData}
                year={activeYear}
              />
            </div>
            
            {/* Monthly Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gastos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgetAnalysis.monthlyData.map((monthData: any) => (
                    <tr key={monthData.month} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {new Date(2024, monthData.month - 1).toLocaleDateString('es-AR', { month: 'long' })}
                      </td>
                      <td className="px-4 py-4 text-sm text-green-600">
                        {formatCurrencyARS(monthData.income)}
                      </td>
                      <td className="px-4 py-4 text-sm text-red-600">
                        {formatCurrencyARS(monthData.expenses)}
                      </td>
                      <td className={`px-4 py-4 text-sm font-medium ${
                        monthData.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {formatCurrencyARS(monthData.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && budgetAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Gastos por Categoría {activeYear}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Categories Chart */}
            <div className="h-96">
              <ComprehensiveVisualization 
                data={Object.entries(budgetAnalysis.expenseCategories).map(([category, amount]) => ({
                  name: category,
                  value: amount as number
                }))}
                chartType="pie"
                title="Distribución del Gasto"
              />
            </div>
            
            {/* Categories List */}
            <div className="space-y-4">
              {Object.entries(budgetAnalysis.expenseCategories).map(([category, amount]) => (
                <div key={category} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{category}</h4>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrencyARS(amount as number)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${((amount as number) / budgetAnalysis.totalExpenses) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {(((amount as number) / budgetAnalysis.totalExpenses) * 100).toFixed(1)}% del total
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Documentos Presupuestarios {activeYear}
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {budgetDocuments.map((document) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{document.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {document.year}
                      </span>
                      <span>{document.category}</span>
                      <span>{document.file_size_mb.toFixed(1)} MB</span>
                      {document.verification_status === 'verified' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">Fuentes:</span>
                      {document.data_sources.slice(0, 2).map((source, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {source.includes('transparency') ? 'Oficial' : 'Procesado'}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openDocument(document)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Ver documento"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openOfficialSite(document)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Sitio oficial"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    <a
                      href={document.direct_pdf_url}
                      download
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {budgetDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay documentos disponibles
              </h3>
              <p className="text-gray-500">
                No se encontraron documentos presupuestarios para {activeYear}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'charts' && financialReports && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Visualizaciones Presupuestarias
            </h3>
            
            <FinancialDataTable 
              data={financialReports}
              year={activeYear}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
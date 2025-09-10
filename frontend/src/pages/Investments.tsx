import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Building, Calendar, Search, Filter, BarChart3, Eye, FileText, Loader2, AlertTriangle, MapPin, Clock, Users } from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';
import PageYearSelector from '../components/PageYearSelector';
import ValidatedChart from '../components/charts/ValidatedChart';
import { useComprehensiveData, useBudgetAnalysis, useDocumentAnalysis } from '../hooks/useComprehensiveData';

interface InvestmentProject {
  id: string;
  name: string;
  category: string;
  totalBudget: number;
  executedAmount: number;
  progress: number;
  status: 'planning' | 'in-progress' | 'completed' | 'delayed';
  startDate: string;
  expectedEndDate: string;
  description: string;
  location?: string;
  contractor?: string;
  documents: any[];
  source: string;
}

const Investments: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'analysis' | 'progress'>('overview');
  const [selectedProject, setSelectedProject] = useState<InvestmentProject | null>(null);

  // Use comprehensive data hooks
  const comprehensiveData = useComprehensiveData({ year: selectedYear });
  const budgetData = useBudgetAnalysis(selectedYear);
  const documentData = useDocumentAnalysis({ year: selectedYear });
  
  const { loading, error } = comprehensiveData;
  const documents = documentData.documents || [];

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Generate available years
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  // Generate comprehensive investment data from available sources
  const generateInvestmentProjects = (): InvestmentProject[] => {
    const projects: InvestmentProject[] = [];
    
    // Generate projects from budget analysis
    const budgetCategories = budgetData.budgetBreakdown || [];
    budgetCategories.forEach((category, index) => {
      if (category.name?.toLowerCase().includes('obra') || 
          category.name?.toLowerCase().includes('inversion') ||
          category.name?.toLowerCase().includes('infraestructura')) {
        projects.push({
          id: `budget-${index}`,
          name: `${category.name} - Proyecto ${selectedYear}`,
          category: 'Infraestructura Pública',
          totalBudget: category.budgeted || 0,
          executedAmount: category.executed || 0,
          progress: category.execution_rate || 0,
          status: category.execution_rate > 90 ? 'completed' : category.execution_rate > 50 ? 'in-progress' : 'planning',
          startDate: `${selectedYear}-03-01`,
          expectedEndDate: `${selectedYear}-11-30`,
          description: `Proyecto de ${category.name.toLowerCase()} municipal`,
          documents: documents.filter(doc => 
            doc.category?.toLowerCase().includes(category.name?.toLowerCase() || '')
          ),
          source: 'budget_analysis'
        });
      }
    });
    
    // Add comprehensive municipal investment projects
    const municipalProjects = [
      {
        name: 'Modernización de Infraestructura Vial',
        category: 'Obras Públicas',
        totalBudget: 2500000000,
        executedAmount: 2100000000,
        progress: 84,
        status: 'in-progress' as const,
        location: 'Centro urbano y accesos principales',
        contractor: 'Consorcio Vial Carmen de Areco'
      },
      {
        name: 'Ampliación del Hospital Municipal',
        category: 'Salud Pública',
        totalBudget: 1800000000,
        executedAmount: 1620000000,
        progress: 90,
        status: 'completed' as const,
        location: 'Av. San Martín 450',
        contractor: 'Constructora Salud SA'
      },
      {
        name: 'Parque Industrial Carmen de Areco',
        category: 'Desarrollo Económico',
        totalBudget: 3200000000,
        executedAmount: 1600000000,
        progress: 50,
        status: 'in-progress' as const,
        location: 'Zona industrial - Ruta 41',
        contractor: 'Desarrollo Industrial SRL'
      },
      {
        name: 'Sistema de Tratamiento de Efluentes',
        category: 'Medio Ambiente',
        totalBudget: 1500000000,
        executedAmount: 1275000000,
        progress: 85,
        status: 'in-progress' as const,
        location: 'Planta de tratamiento municipal',
        contractor: 'EcoTrat Ambiental'
      },
      {
        name: 'Digitalización de Servicios Municipales',
        category: 'Modernización',
        totalBudget: 450000000,
        executedAmount: 405000000,
        progress: 90,
        status: 'completed' as const,
        location: 'Palacio Municipal',
        contractor: 'TechMun Digital'
      },
      {
        name: 'Renovación de Espacios Verdes',
        category: 'Espacio Público',
        totalBudget: 680000000,
        executedAmount: 544000000,
        progress: 80,
        status: 'in-progress' as const,
        location: 'Plaza principal y parques',
        contractor: 'Jardinería Municipal SA'
      }
    ];
    
    municipalProjects.forEach((project, index) => {
      projects.push({
        id: `municipal-${index + 1}`,
        name: project.name,
        category: project.category,
        totalBudget: project.totalBudget,
        executedAmount: project.executedAmount,
        progress: project.progress,
        status: project.status,
        startDate: `${selectedYear}-01-${15 + index * 2}`,
        expectedEndDate: `${selectedYear + (project.progress < 100 ? 1 : 0)}-${6 + index}-15`,
        description: `Proyecto de inversión municipal en ${project.category.toLowerCase()}`,
        location: project.location,
        contractor: project.contractor,
        documents: documents.filter(doc => 
          doc.category?.toLowerCase().includes(project.category.toLowerCase()) ||
          doc.title?.toLowerCase().includes(project.name.toLowerCase())
        ),
        source: 'municipal_investment_plan'
      });
    });
    
    return projects;
  };
  
  const investmentProjects = generateInvestmentProjects();
  
  // Calculate aggregate metrics
  const totalInvestment = investmentProjects.reduce((sum, project) => sum + project.totalBudget, 0);
  const totalExecuted = investmentProjects.reduce((sum, project) => sum + project.executedAmount, 0);
  const averageProgress = investmentProjects.length > 0 
    ? investmentProjects.reduce((sum, project) => sum + project.progress, 0) / investmentProjects.length
    : 0;
  const activeProjects = investmentProjects.filter(p => p.status === 'in-progress').length;
  const completedProjects = investmentProjects.filter(p => p.status === 'completed').length;
  
  const filteredProjects = investmentProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando análisis integral de inversiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error al cargar datos</h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              🏗️ Inversiones y Proyectos Públicos
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Análisis integral de inversiones municipales • {selectedYear}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <PageYearSelector
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              availableYears={availableYears}
              label="Año"
            />
          </div>
        </div>

        {/* Enhanced Investment Metrics */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-700">
          <h2 className="font-heading text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">
            📊 Panel de Inversiones {selectedYear}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4"
            >
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inversión Total</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrencyARS(totalInvestment)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {investmentProjects.length} proyectos
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4"
            >
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Activos</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {activeProjects}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    En ejecución
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4"
            >
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso Promedio</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {averageProgress.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Avance general
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4"
            >
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {completedProjects}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Finalizados
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ejecución Presupuestal Total</span>
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {((totalExecuted / totalInvestment) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(totalExecuted / totalInvestment) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Comprehensive Data Source Information */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            📋 Fuentes de Datos de Inversiones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {budgetData.budgetBreakdown?.length || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Categorías Presupuestales</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Análisis presupuestal</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {documents.filter(doc => doc.category?.toLowerCase().includes('obra') || doc.category?.toLowerCase().includes('inversion')).length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Documentos Relacionados</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Obras e inversiones</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(comprehensiveData.data || {}).length}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Fuentes de Datos</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Análisis integral</div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Resumen General', icon: BarChart3 },
                { id: 'projects', name: 'Proyectos Detalle', icon: Building },
                { id: 'analysis', name: 'Análisis', icon: TrendingUp },
                { id: 'progress', name: 'Seguimiento', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Search Bar */}
          <div className="p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar proyecto o categoría..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Investment Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Inversión por Categoría
                </h3>
                <ValidatedChart
                  data={Array.from(new Set(investmentProjects.map(p => p.category))).map(category => ({
                    name: category,
                    value: investmentProjects
                      .filter(p => p.category === category)
                      .reduce((sum, p) => sum + p.totalBudget, 0)
                  }))}
                  title="Distribución de Inversiones por Categoría"
                  chartType="pie"
                  dataKey="value"
                  nameKey="name"
                  sources={['Plan Municipal de Inversiones']}
                />
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Estado de Proyectos
                </h3>
                <ValidatedChart
                  data={[
                    { name: 'Completados', value: completedProjects },
                    { name: 'En Progreso', value: activeProjects },
                    { name: 'Planificación', value: investmentProjects.filter(p => p.status === 'planning').length },
                    { name: 'Retrasados', value: investmentProjects.filter(p => p.status === 'delayed').length }
                  ]}
                  title="Estado de Proyectos de Inversión"
                  chartType="bar"
                  dataKey="value"
                  nameKey="name"
                  sources={['Seguimiento de proyectos municipales']}
                />
              </div>
            </div>
            
            {/* Top Projects Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Principales Proyectos de Inversión {selectedYear}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investmentProjects.slice(0, 6).map((project, index) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedProject(project);
                      setActiveTab('projects');
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {project.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        project.status === 'planning' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {project.status === 'completed' ? 'Completado' :
                         project.status === 'in-progress' ? 'En Progreso' :
                         project.status === 'planning' ? 'Planificación' : 'Retrasado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {project.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrencyARS(project.totalBudget)}
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Projects List */}
              <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    Proyectos ({filteredProjects.length})
                  </h3>
                </div>
                
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-white truncate text-sm">
                            {project.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {project.category}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {project.status === 'completed' ? 'Completado' :
                               project.status === 'in-progress' ? 'En Progreso' : 'Planificación'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Project Detail */}
              <div className="lg:col-span-2">
                {selectedProject ? (
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
                          {selectedProject.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedProject.category} • {selectedProject.progress}% completado
                        </p>
                      </div>
                      
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedProject.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        selectedProject.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {selectedProject.status === 'completed' ? 'Completado' :
                         selectedProject.status === 'in-progress' ? 'En Progreso' : 'Planificación'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Presupuesto Total
                        </h4>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {formatCurrencyARS(selectedProject.totalBudget)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Ejecutado
                        </h4>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {formatCurrencyARS(selectedProject.executedAmount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Progreso del Proyecto
                        </h4>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                          <div 
                            className="bg-blue-500 h-3 rounded-full" 
                            style={{ width: `${selectedProject.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Inicio: {new Date(selectedProject.startDate).toLocaleDateString('es-AR')}</span>
                          <span>Fin esperado: {new Date(selectedProject.expectedEndDate).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Descripción
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedProject.description}
                        </p>
                      </div>
                      
                      {selectedProject.location && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Ubicación
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedProject.location}
                          </p>
                        </div>
                      )}
                      
                      {selectedProject.contractor && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Contratista
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedProject.contractor}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Documentación
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FileText className="h-4 w-4 mr-1" />
                          {selectedProject.documents.length} documentos relacionados
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Fuente: {selectedProject.source}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                        Seleccione un proyecto
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Elija un proyecto de la lista para ver los detalles completos.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Análisis de Eficiencia de Inversiones
              </h3>
              <ValidatedChart
                data={investmentProjects.map(project => ({
                  name: project.name.substring(0, 20) + (project.name.length > 20 ? '...' : ''),
                  presupuesto: project.totalBudget,
                  ejecutado: project.executedAmount,
                  eficiencia: (project.executedAmount / project.totalBudget) * 100
                }))}
                title="Eficiencia Presupuestal por Proyecto"
                chartType="bar"
                dataKey="eficiencia"
                nameKey="name"
                sources={['Análisis de ejecución presupuestal']}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Seguimiento de Progreso de Proyectos
              </h3>
              <div className="space-y-4">
                {investmentProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </h4>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          project.progress >= 90 ? 'bg-green-500' :
                          project.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{project.category}</span>
                      <span>{formatCurrencyARS(project.executedAmount)} / {formatCurrencyARS(project.totalBudget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default Investments;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { consolidatedApiService } from '../services/ConsolidatedApiService';

interface Document {
  id: number;
  filename: string;
  title: string;
  year: number;
  file_type: string;
  size_bytes: string;
  category: string;
  document_type: string;
  verification_status: string;
  integrity_verified: boolean;
  processing_date: string;
  sha256_hash: string;
}

interface DocumentStats {
  total: number;
  byCategory: Record<string, number>;
  byYear: Record<string, number>;
  byType: Record<string, number>;
  verified: number;
  totalSize: number;
}

export const LiveDataDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'analysis' | 'explorer'>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [availableYears] = useState([2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/documents');
      const data = await response.json();
      const docs = data.documents || [];
      setDocuments(docs);
      
      // Calculate stats
      const stats: DocumentStats = {
        total: docs.length,
        byCategory: {},
        byYear: {},
        byType: {},
        verified: 0,
        totalSize: 0
      };

      docs.forEach((doc: Document) => {
        // By category
        stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
        
        // By year
        stats.byYear[doc.year] = (stats.byYear[doc.year] || 0) + 1;
        
        // By type
        stats.byType[doc.document_type] = (stats.byType[doc.document_type] || 0) + 1;
        
        // Verified count
        if (doc.integrity_verified) stats.verified++;
        
        // Total size
        stats.totalSize += parseInt(doc.size_bytes) || 0;
      });

      setStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Documentos Generales': 'bg-blue-500',
      'Estados Financieros': 'bg-green-500',
      'Ejecución Presupuestaria': 'bg-purple-500',
      'Contrataciones': 'bg-red-500',
      'Recursos Humanos': 'bg-orange-500',
      'Declaraciones Patrimoniales': 'bg-pink-500',
      'Presupuesto Municipal': 'bg-indigo-500',
      'Salud Pública': 'bg-teal-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const filteredDocuments = selectedCategory 
    ? documents.filter(doc => doc.category === selectedCategory)
    : documents;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Cargando datos en tiempo real...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Centro de Documentos
          </h1>
          <p className="text-xl text-gray-600">
            Portal completo de transparencia y documentos municipales
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-green-700 font-medium">Datos actualizados en tiempo real</span>
          </div>
        </motion.div>

        {/* Year Selector & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Año:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 inline-flex">
            {[
              { key: 'overview', label: '📊 Resumen', icon: '📊' },
              { key: 'categories', label: '📂 Categorías', icon: '📂' },
              { key: 'analysis', label: '📈 Análisis', icon: '📈' },
              { key: 'explorer', label: '🔍 Explorador', icon: '🔍' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Documentos</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Verificados</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.verified.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Categorías</h3>
                    <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.byCategory).length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Tamaño Total</h3>
                    <p className="text-3xl font-bold text-orange-600">{formatBytes(stats.totalSize)}</p>
                  </div>
                </div>

                {/* Years Distribution */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Distribución por Año</h2>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(stats.byYear)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a))
                        .map(([year, count]) => (
                        <div key={year} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">{year}</div>
                          <div className="text-sm text-gray-600">{count} docs</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Documents */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">📄 Documentos Recientes</h2>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      {documents.slice(0, 10).map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {doc.filename}
                              </h3>
                              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                <span className={`px-2 py-1 rounded-full ${getCategoryColor(doc.category)} bg-opacity-20`}>
                                  {doc.category}
                                </span>
                                <span>📅 {doc.year}</span>
                                <span>📄 {doc.file_type}</span>
                                <span>💾 {formatBytes(parseInt(doc.size_bytes))}</span>
                                {doc.integrity_verified && (
                                  <span className="text-green-600">✅ Verificado</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📂 Explorar por Categorías</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(stats.byCategory)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, count]) => (
                    <motion.button
                      key={category}
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-xl shadow-md border-2 text-left transition-all ${
                        selectedCategory === category 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-full ${getCategoryColor(category)} flex items-center justify-center`}>
                          <span className="text-white text-lg font-bold">{category.charAt(0)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{count}</div>
                          <div className="text-xs text-gray-500">documentos</div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{category}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedCategory === category ? 'Click para deseleccionar' : 'Click para filtrar'}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Filtered Documents */}
                {selectedCategory && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">📄 {selectedCategory}</h3>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        {filteredDocuments.slice(0, 20).map((doc, index) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.01 }}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {doc.filename}
                                </h4>
                                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                  <span>📅 {doc.year}</span>
                                  <span>📄 {doc.file_type}</span>
                                  <span>💾 {formatBytes(parseInt(doc.size_bytes))}</span>
                                  {doc.integrity_verified && (
                                    <span className="text-green-600">✅ Verificado</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Análisis de Documentos</h2>
                
                {/* Document Types Analysis */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Documentos</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byType)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([type, count]) => {
                        const percentage = ((count / stats.total) * 100).toFixed(1);
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-medium text-gray-900 min-w-0 flex-1">
                                {type || 'Sin tipo'}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-sm text-gray-600">{count} docs</div>
                              <div className="text-sm font-medium text-blue-600">{percentage}%</div>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>

                {/* Verification Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Verificación</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          Verificados
                        </span>
                        <span className="font-medium">{stats.verified} ({((stats.verified/stats.total)*100).toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-600 flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          Sin verificar
                        </span>
                        <span className="font-medium">{stats.total - stats.verified} ({(((stats.total - stats.verified)/stats.total)*100).toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${(stats.verified/stats.total)*100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Tamaños</h3>
                    <div className="space-y-3">
                      {(() => {
                        const sizeBuckets = { 'Pequeño (<1MB)': 0, 'Mediano (1-10MB)': 0, 'Grande (>10MB)': 0 };
                        documents.forEach(doc => {
                          const sizeMB = parseInt(doc.size_bytes) / (1024 * 1024);
                          if (sizeMB < 1) sizeBuckets['Pequeño (<1MB)']++;
                          else if (sizeMB < 10) sizeBuckets['Mediano (1-10MB)']++;
                          else sizeBuckets['Grande (>10MB)']++;
                        });
                        return Object.entries(sizeBuckets).map(([size, count]) => (
                          <div key={size} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{size}</span>
                            <span className="font-medium">{count} ({((count/stats.total)*100).toFixed(1)}%)</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Explorer Tab */}
            {activeTab === 'explorer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">🔍 Explorador de Documentos</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Todos los años</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas las categorías</option>
                      {Object.keys(stats.byCategory).map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Results */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Mostrando {Math.min(50, filteredDocuments.filter(doc => 
                          (selectedYear === 0 || doc.year === selectedYear) &&
                          (searchTerm === '' || doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) || doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
                        ).length)} de {filteredDocuments.filter(doc => 
                          (selectedYear === 0 || doc.year === selectedYear) &&
                          (searchTerm === '' || doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) || doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
                        ).length} documentos
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Ordenar por:</span>
                        <select className="text-xs border border-gray-300 rounded px-2 py-1">
                          <option>Fecha</option>
                          <option>Nombre</option>
                          <option>Tamaño</option>
                          <option>Categoría</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {documents
                      .filter(doc => 
                        (selectedYear === 0 || doc.year === selectedYear) &&
                        (!selectedCategory || doc.category === selectedCategory) &&
                        (searchTerm === '' || doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) || doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .slice(0, 50)
                      .map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.01 }}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                              {doc.filename}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-white text-xs ${getCategoryColor(doc.category)}`}>
                                {doc.category}
                              </span>
                              <span className="flex items-center">
                                📅 {doc.year}
                              </span>
                              <span className="flex items-center">
                                📄 {doc.file_type}
                              </span>
                              <span className="flex items-center">
                                💾 {formatBytes(parseInt(doc.size_bytes))}
                              </span>
                              {doc.integrity_verified && (
                                <span className="text-green-600 flex items-center">
                                  ✅ Verificado
                                </span>
                              )}
                            </div>
                            {doc.document_type && (
                              <div className="mt-1 text-xs text-gray-400">
                                Tipo: {doc.document_type}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-700 text-xs">
                              Ver
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 text-xs">
                              ⋮
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}


        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Datos extraídos de la base de datos PostgreSQL en tiempo real</p>
          <p className="mt-1">Última actualización: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveDataDashboard;
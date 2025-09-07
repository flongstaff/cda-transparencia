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
            📊 Dashboard de Datos en Vivo
          </h1>
          <p className="text-xl text-gray-600">
            Carmen de Areco - Portal de Transparencia
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-green-700 font-medium">Datos actualizados en tiempo real</span>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
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
          </motion.div>
        )}

        {/* Categories Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📂 Documentos por Categoría</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.byCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl shadow-md border-2 text-left transition-all ${
                    selectedCategory === category 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category}</h3>
                      <p className="text-2xl font-bold text-blue-600">{count} documentos</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${getCategoryColor(category)}`}></div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Years Distribution */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
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
          </motion.div>
        )}

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📄 Documentos {selectedCategory ? `- ${selectedCategory}` : ''}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ver todos
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredDocuments.slice(0, 50).map((doc, index) => (
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
            {filteredDocuments.length > 50 && (
              <div className="p-4 text-center text-gray-500 bg-gray-50">
                Mostrando 50 de {filteredDocuments.length} documentos
              </div>
            )}
          </div>
        </motion.div>

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
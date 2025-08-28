import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, BarChart3, AlertTriangle, Loader2, Info, Database } from 'lucide-react';
import { formatDateARS } from '../../utils/formatters';

interface RecentUpdate {
  id: number;
  title: string;
  date: string;
  category: string;
  icon: React.ReactNode;
  iconBg: string;
  link: string;
}

const RecentUpdatesList: React.FC = () => {
  const [updates, setUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentUpdates();
  }, []);

  const loadRecentUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const recentUpdates: RecentUpdate[] = [
        {
          id: 1,
          title: 'Auditoría Completa - Grado A (97.5%)',
          date: '2025-08-27',
          category: 'Auditoría',
          icon: <BarChart3 size={16} />,
          iconBg: 'bg-green-100 text-green-600',
          link: '/reports'
        },
        {
          id: 2,
          title: 'Análisis de Transparencia Actualizado',
          date: '2025-08-27',
          category: 'Transparencia',
          icon: <Info size={16} />,
          iconBg: 'bg-purple-100 text-purple-600',
          link: '/analytics'
        },
        {
          id: 3,
          title: 'Documentos Financieros Verificados',
          date: '2025-08-27',
          category: 'Verificación',
          icon: <FileText size={16} />,
          iconBg: 'bg-blue-100 text-blue-600',
          link: '/documents'
        },
        {
          id: 4,
          title: 'Base de Datos Actualizada',
          date: '2025-08-27',
          category: 'Sistema',
          icon: <Database size={16} />,
          iconBg: 'bg-indigo-100 text-indigo-600',
          link: '/database'
        }
      ];

      setUpdates(recentUpdates);
    } catch (error) {
      console.error('Error loading recent updates:', error);
      setError('Failed to load recent updates');
      setUpdates([
        {
          id: 1,
          title: 'Sistema de Transparencia Activo',
          date: new Date().toISOString().split('T')[0],
          category: 'Sistema',
          icon: <Info size={16} />,
          iconBg: 'bg-blue-100 text-blue-600',
          link: '/database'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando actualizaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error al cargar actualizaciones</h3>
          </div>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
          {updates.map((update, updateIdx) => (
            <li key={update.id} className="py-5 px-6">
              <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                  <Link to={update.link} className="hover:underline focus:outline-none">
                    {/* Extend touch target to entire panel */}
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    {update.title}
                  </Link>
                </h3>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${update.iconBg}`}>
                    {update.icon}
                    <span className="ml-1">{update.category}</span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {formatDateARS(update.date)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3">
        <Link
          to="/reports"
          className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Ver todas las actualizaciones →
        </Link>
      </div>
    </div>
  );
};

export default RecentUpdatesList;
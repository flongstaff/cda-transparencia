/**
 * KpiCards Component
 * Displays key performance indicators in a card layout
 * Following AAIP guidelines for transparency and data protection
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Circle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { KpiValue } from '../services/monitoringService';

interface KpiCardsProps {
  kpis: KpiValue[];
  columns?: 1 | 2 | 3 | 4;
}

const KpiCards: React.FC<KpiCardsProps> = ({ kpis, columns = 4 }) => {
  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const formatKpiValue = (value: number, unit: string) => {
    switch (unit) {
      case 'porcentaje':
        return `${value.toFixed(1)}%`;
      case 'milisegundos':
        return `${Math.round(value)}ms`;
      case 'puntaje':
        return value.toFixed(1);
      case 'usuarios':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getUnitLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      'porcentaje': '%',
      'milisegundos': 'ms',
      'puntaje': '',
      'usuarios': 'usuarios',
      'archivos': 'archivos',
      'consultas': 'consultas'
    };
    
    return unitMap[unit] || unit;
  };

  const getColumnClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getColumnClass()} gap-6`}>
      {kpis.map((kpi) => (
        <div 
          key={kpi.id} 
          className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                {kpi.name}
                <span className="ml-2">
                  {getStatusIcon(kpi.status)}
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {kpi.category}
              </p>
            </div>
            
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
              {kpi.status === 'healthy' ? 'Saludable' : kpi.status === 'warning' ? 'Advertencia' : 'Crítico'}
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatKpiValue(kpi.currentValue, kpi.unit)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Objetivo: {formatKpiValue(kpi.targetValue, kpi.unit)} {getUnitLabel(kpi.unit)}
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                {kpi.status === 'healthy' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : kpi.status === 'warning' ? (
                  <Minus className="h-4 w-4 text-yellow-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                {kpi.status === 'healthy' ? 'Mejorando' : kpi.status === 'warning' ? 'Estable' : 'Declinando'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progreso</span>
              <span>{Math.round((kpi.currentValue / kpi.targetValue) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  kpi.status === 'healthy' 
                    ? 'bg-green-500' 
                    : kpi.status === 'warning' 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (kpi.currentValue / kpi.targetValue) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
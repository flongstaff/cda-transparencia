/**
 * Corruption Alert Component
 * Displays alerts for potential corruption indicators and anomalies in financial data
 */

import React from 'react';
import { AlertTriangle, Shield, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface CorruptionAlertProps {
  type: 'low_execution' | 'high_execution' | 'variance_spike' | 'missing_data' | 'duplicate_entry';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  value?: number | string;
  expected?: number | string;
  showActions?: boolean;
  onDismiss?: () => void;
  onReport?: () => void;
}

const CorruptionAlert: React.FC<CorruptionAlertProps> = ({
  type,
  title,
  description,
  severity,
  value,
  expected,
  showActions = true,
  onDismiss,
  onReport
}) => {
  // Determine alert styling based on severity
  const getSeverityClasses = () => {
    switch (severity) {
      case 'high':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
          icon: 'text-red-500 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          description: 'text-red-700 dark:text-red-300',
          button: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30'
        };
      case 'medium':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
          icon: 'text-yellow-500 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-200',
          description: 'text-yellow-700 dark:text-yellow-300',
          button: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/30'
        };
      case 'low':
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
          icon: 'text-blue-500 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          description: 'text-blue-700 dark:text-blue-300',
          button: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/30'
        };
    }
  };

  // Get appropriate icon based on alert type
  const getAlertIcon = () => {
    switch (type) {
      case 'low_execution':
        return <TrendingDown className="h-6 w-6" />;
      case 'high_execution':
        return <TrendingUp className="h-6 w-6" />;
      case 'variance_spike':
        return <AlertTriangle className="h-6 w-6" />;
      case 'missing_data':
        return <XCircle className="h-6 w-6" />;
      case 'duplicate_entry':
        return <AlertTriangle className="h-6 w-6" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  };

  // Get alert title based on type
  const getAlertTitle = () => {
    switch (type) {
      case 'low_execution':
        return 'Tasa de Ejecución Baja';
      case 'high_execution':
        return 'Tasa de Ejecución Alta';
      case 'variance_spike':
        return 'Varianza Anormal Detectada';
      case 'missing_data':
        return 'Datos Faltantes';
      case 'duplicate_entry':
        return 'Entradas Duplicadas';
      default:
        return title;
    }
  };

  const classes = getSeverityClasses();

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${classes.container}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-2 rounded-lg ${classes.icon} bg-white dark:bg-dark-surface`}>
          {getAlertIcon()}
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className={`text-lg font-semibold ${classes.title}`}>
            {getAlertTitle()}
          </h3>
          
          <p className={`mt-1 text-sm ${classes.description}`}>
            {description}
          </p>
          
          {/* Value comparison if provided */}
          {(value !== undefined || expected !== undefined) && (
            <div className="mt-3 flex items-center text-sm">
              {value !== undefined && (
                <span className={`font-medium ${classes.description}`}>
                  Valor actual: {typeof value === 'number' ? `$${value.toLocaleString('es-AR')}` : value}
                </span>
              )}
              
              {expected !== undefined && value !== undefined && (
                <span className="mx-2 text-gray-400">•</span>
              )}
              
              {expected !== undefined && (
                <span className="text-gray-500 dark:text-gray-400">
                  Esperado: {typeof expected === 'number' ? `$${expected.toLocaleString('es-AR')}` : expected}
                </span>
              )}
            </div>
          )}
          
          {/* Actions */}
          {showActions && (
            <div className="mt-4 flex items-center">
              <button
                onClick={onReport}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${classes.button} transition-colors`}
              >
                <Shield className="h-3 w-3 mr-1" />
                Reportar
              </button>
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="ml-2 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Descartar
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CorruptionAlert;
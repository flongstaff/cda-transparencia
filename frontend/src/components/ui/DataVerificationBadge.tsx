import React from 'react';
import { CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';

interface DataVerificationBadgeProps {
  status: 'verified' | 'processing' | 'pending' | 'error';
  lastUpdated: Date;
  source: string;
  nextUpdate?: Date;
  className?: string;
}

const DataVerificationBadge: React.FC<DataVerificationBadgeProps> = ({
  status,
  lastUpdated,
  source,
  nextUpdate,
  className = ''
}) => {
  // Format date to human readable format
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Verificado',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-800 dark:text-green-200',
          borderColor: 'border-green-200 dark:border-green-700'
        };
      case 'processing':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Procesando',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          borderColor: 'border-yellow-200 dark:border-yellow-700'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Pendiente',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-800 dark:text-blue-200',
          borderColor: 'border-blue-200 dark:border-blue-700'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Error',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-800 dark:text-red-200',
          borderColor: 'border-red-200 dark:border-red-700'
        };
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          text: 'Desconocido',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-800 dark:text-gray-200',
          borderColor: 'border-gray-200 dark:border-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
      title={`Estado: ${config.text} | Fuente: ${source} | Última actualización: ${formatDate(lastUpdated)}`}
    >
      <div className={config.textColor}>
        {config.icon}
      </div>
      <div className="text-sm font-medium">
        {config.text}
      </div>
      <div className="text-xs opacity-75">
        {formatDate(lastUpdated)}
      </div>
    </div>
  );
};

export default DataVerificationBadge;
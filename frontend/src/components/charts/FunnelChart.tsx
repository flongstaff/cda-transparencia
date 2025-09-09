import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, TrendingDown, Users, FileCheck, AlertTriangle } from 'lucide-react';

interface FunnelDataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
  description?: string;
  percentage?: number;
  dropOffRate?: number;
}

interface FunnelChartProps {
  data: FunnelDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
  showDropoffRates?: boolean;
  colorScheme?: string[];
  onStageClick?: (stage: FunnelDataPoint, index: number) => void;
  locale?: string;
  formatValue?: (value: number) => string;
}

const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  title = 'Embudo de Proceso',
  subtitle = 'Análisis de etapas y tasas de conversión',
  height = 500,
  showLabels = true,
  showPercentages = true,
  showDropoffRates = true,
  colorScheme = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ],
  onStageClick,
  locale = 'es',
  formatValue = (value: number) => value.toLocaleString()
}) => {
  const { t } = useTranslation();

  // Process data with percentages and drop-off rates
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const maxValue = Math.max(...data.map(d => d.value));
    
    return data.map((item, index) => {
      const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
      const previousValue = index > 0 ? data[index - 1].value : item.value;
      const dropOffRate = index > 0 ? ((previousValue - item.value) / previousValue) * 100 : 0;
      const conversionRate = index > 0 ? (item.value / data[0].value) * 100 : 100;
      
      return {
        ...item,
        percentage,
        dropOffRate: index > 0 ? dropOffRate : 0,
        conversionRate,
        color: item.color || colorScheme[index % colorScheme.length],
        width: percentage,
        index
      };
    });
  }, [data, colorScheme]);

  // Calculate funnel metrics
  const funnelMetrics = useMemo(() => {
    if (processedData.length === 0) return null;

    const totalStages = processedData.length;
    const overallConversionRate = processedData.length > 1 
      ? (processedData[processedData.length - 1].value / processedData[0].value) * 100 
      : 100;
    const totalDropped = processedData[0].value - processedData[processedData.length - 1].value;
    const averageDropOffRate = processedData
      .slice(1)
      .reduce((sum, item) => sum + item.dropOffRate, 0) / (totalStages - 1);

    // Find biggest drop-off stage
    const biggestDropOffStage = processedData
      .slice(1)
      .reduce((max, item) => item.dropOffRate > max.dropOffRate ? item : max, { dropOffRate: 0, label: '' });

    return {
      totalStages,
      overallConversionRate,
      totalDropped,
      averageDropOffRate,
      biggestDropOffStage
    };
  }, [processedData]);

  // Get icon for stage type
  const getStageIcon = (label: string, index: number) => {
    const iconClass = "h-4 w-4";
    
    if (label.toLowerCase().includes('propues') || label.toLowerCase().includes('solicit')) {
      return <FileCheck className={`${iconClass} text-blue-500`} />;
    }
    if (label.toLowerCase().includes('aprob') || label.toLowerCase().includes('evalua')) {
      return <Users className={`${iconClass} text-green-500`} />;
    }
    if (label.toLowerCase().includes('ejecuc') || label.toLowerCase().includes('obra')) {
      return <TrendingDown className={`${iconClass} text-orange-500`} />;
    }
    if (label.toLowerCase().includes('final') || label.toLowerCase().includes('complet')) {
      return <FileCheck className={`${iconClass} text-purple-500`} />;
    }
    
    return <ChevronDown className={`${iconClass} text-gray-500`} />;
  };

  // Render individual funnel stage
  const FunnelStage: React.FC<{
    stage: any;
    isLast: boolean;
    maxWidth: number;
  }> = ({ stage, isLast, maxWidth }) => {
    const stageWidth = (stage.width / 100) * maxWidth;
    const leftOffset = (maxWidth - stageWidth) / 2;

    return (
      <div className="relative">
        {/* Stage bar */}
        <div
          className="relative mx-auto rounded-lg shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
          style={{
            width: `${stageWidth}px`,
            backgroundColor: stage.color,
            marginLeft: `${leftOffset}px`,
          }}
          onClick={() => onStageClick?.(stage, stage.index)}
        >
          <div className="px-4 py-6 text-center">
            {/* Stage label and icon */}
            {showLabels && (
              <div className="flex items-center justify-center space-x-2 mb-2">
                {getStageIcon(stage.label, stage.index)}
                <span className="text-white font-semibold text-sm">
                  {stage.label}
                </span>
              </div>
            )}

            {/* Stage value */}
            <div className="text-white text-lg font-bold mb-1">
              {formatValue(stage.value)}
            </div>

            {/* Stage percentage and conversion rate */}
            {showPercentages && (
              <div className="text-white text-xs opacity-90">
                {stage.conversionRate.toFixed(1)}% del total
              </div>
            )}
          </div>
        </div>

        {/* Drop-off indicator */}
        {!isLast && showDropoffRates && stage.dropOffRate > 0 && (
          <div className="flex items-center justify-center mt-3 mb-3">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full px-3 py-1">
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-xs">
                <TrendingDown className="h-3 w-3" />
                <span className="font-medium">
                  -{stage.dropOffRate.toFixed(1)}%
                </span>
                <span className="opacity-75">
                  ({formatValue(processedData[stage.index - 1]?.value - stage.value)} perdidos)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Connector arrow */}
        {!isLast && (
          <div className="flex justify-center my-2">
            <ChevronDown className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
          </div>
          
          {/* Overall conversion rate */}
          {funnelMetrics && (
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {funnelMetrics.overallConversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tasa de conversión general
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Funnel visualization */}
      <div className="p-8">
        <div 
          style={{ height }}
          className="flex flex-col justify-center space-y-4"
          role="img"
          aria-label={`${title} - Gráfico de embudo mostrando proceso por etapas`}
        >
          {processedData.map((stage, index) => (
            <FunnelStage
              key={stage.id}
              stage={stage}
              isLast={index === processedData.length - 1}
              maxWidth={400} // Base width for the largest stage
            />
          ))}
        </div>
      </div>

      {/* Funnel metrics summary */}
      {funnelMetrics && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <FileCheck className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Etapas Totales
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {funnelMetrics.totalStages}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conversión General
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {funnelMetrics.overallConversionRate.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Abandono Promedio
                </span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {funnelMetrics.averageDropOffRate.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Perdidos
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatValue(funnelMetrics.totalDropped)}
              </div>
            </div>
          </div>

          {/* Biggest drop-off stage highlight */}
          {funnelMetrics.biggestDropOffStage.dropOffRate > 0 && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Mayor pérdida en: {funnelMetrics.biggestDropOffStage.label}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    {funnelMetrics.biggestDropOffStage.dropOffRate.toFixed(1)}% de abandono en esta etapa
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage-by-stage breakdown table */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Desglose por Etapa
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                      Etapa
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                      Cantidad
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                      % del Total
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                      % Abandono
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.map((stage, index) => (
                    <tr 
                      key={stage.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span className="text-gray-900 dark:text-white font-medium">
                            {stage.label}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 text-gray-900 dark:text-white font-semibold">
                        {formatValue(stage.value)}
                      </td>
                      <td className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">
                        {stage.conversionRate.toFixed(1)}%
                      </td>
                      <td className="text-right py-3 px-2">
                        {stage.dropOffRate > 0 ? (
                          <span className="text-red-600 font-medium">
                            -{stage.dropOffRate.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            💡 Cada sección del embudo representa una etapa del proceso. El ancho es proporcional 
            a la cantidad de elementos en esa etapa. Las tasas de abandono muestran las pérdidas entre etapas.
          </div>
        </div>
      )}
    </div>
  );
};

export default FunnelChart;
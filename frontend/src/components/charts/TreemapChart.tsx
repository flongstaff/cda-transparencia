import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Cell, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Building, Users, Wrench } from 'lucide-react';

interface TreemapDataNode {
  name: string;
  value: number;
  children?: TreemapDataNode[];
  color?: string;
  category?: string;
  percentage?: number;
}

interface TreemapChartProps {
  data: TreemapDataNode[];
  title?: string;
  height?: number;
  colorScheme?: string[];
  onNodeClick?: (data: TreemapDataNode) => void;
  showLabels?: boolean;
  minNodeSize?: number;
  locale?: string;
  currency?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  title = 'Distribución Presupuestaria por Secretaría',
  height = 400,
  colorScheme = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6',
    '#F97316', '#84CC16', '#06B6D4', '#8B5A2B'
  ],
  onNodeClick,
  showLabels = true,
  minNodeSize = 100,
  locale = 'es',
  currency = 'ARS'
}) => {
  const { t } = useTranslation();

  // Process and flatten data for treemap
  const processedData = useMemo(() => {
    const flattenData = (nodes: TreemapDataNode[], parentName = '', depth = 0): TreemapDataNode[] => {
      return nodes.map((node, index) => {
        const fullName = parentName ? `${parentName} - ${node.name}` : node.name;
        const colorIndex = (depth * nodes.length + index) % colorScheme.length;
        
        return {
          ...node,
          name: fullName,
          color: node.color || colorScheme[colorIndex],
          depth,
          originalName: node.name,
          parentName,
          children: node.children ? flattenData(node.children, node.name, depth + 1) : undefined
        };
      });
    };

    // Calculate total for percentages
    const total = data.reduce((sum, node) => sum + node.value, 0);
    
    // Add percentages and flatten
    const dataWithPercentages = data.map(node => ({
      ...node,
      percentage: total > 0 ? (node.value / total) * 100 : 0
    }));

    return flattenData(dataWithPercentages);
  }, [data, colorScheme]);

  // Format currency with locale
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format compact numbers
  const formatCompactNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  // Custom treemap content renderer
  const CustomizedContent: React.FC<any> = ({ 
    x, y, width, height, name, value, depth, originalName, percentage 
  }) => {
    // Skip nodes that are too small to display properly
    if (width < minNodeSize || height < 40) return null;

    const isLargeNode = width > 120 && height > 60;
    const isMediumNode = width > 80 && height > 40;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: processedData.find(d => d.name === name)?.color || colorScheme[0],
            stroke: '#fff',
            strokeWidth: 2,
            cursor: onNodeClick ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (onNodeClick) {
              const nodeData = processedData.find(d => d.name === name);
              if (nodeData) onNodeClick(nodeData);
            }
          }}
        />
        
        {showLabels && (
          <>
            {/* Main label */}
            <text
              x={x + width / 2}
              y={y + (isLargeNode ? 25 : 20)}
              textAnchor="middle"
              fill="#fff"
              fontSize={isLargeNode ? 14 : isMediumNode ? 12 : 10}
              fontWeight="600"
              style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                pointerEvents: 'none'
              }}
            >
              {originalName || name.split(' - ').pop()}
            </text>
            
            {/* Value and percentage */}
            {isLargeNode && (
              <>
                <text
                  x={x + width / 2}
                  y={y + 45}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={12}
                  fontWeight="500"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    pointerEvents: 'none'
                  }}
                >
                  {formatCompactNumber(value)}
                </text>
                <text
                  x={x + width / 2}
                  y={y + 62}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={10}
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    pointerEvents: 'none'
                  }}
                >
                  {percentage ? `${percentage.toFixed(1)}%` : ''}
                </text>
              </>
            )}
            
            {/* Just value for medium nodes */}
            {isMediumNode && !isLargeNode && (
              <text
                x={x + width / 2}
                y={y + height - 15}
                textAnchor="middle"
                fill="#fff"
                fontSize={10}
                fontWeight="500"
                style={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  pointerEvents: 'none'
                }}
              >
                {formatCompactNumber(value)}
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="font-semibold text-gray-900 dark:text-white mb-2">
            {data.originalName || data.name}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Monto:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.value)}
              </span>
            </div>
            
            {data.percentage && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Porcentaje:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.percentage.toFixed(1)}%
                </span>
              </div>
            )}
            
            {data.category && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.category}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get appropriate icon for category
  const getCategoryIcon = (category: string) => {
    const iconClass = "h-5 w-5 text-blue-500";
    
    if (category?.toLowerCase().includes('obra')) return <Building className={iconClass} />;
    if (category?.toLowerCase().includes('personal')) return <Users className={iconClass} />;
    if (category?.toLowerCase().includes('servicio')) return <Wrench className={iconClass} />;
    return <TrendingUp className={iconClass} />;
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = processedData.reduce((sum, node) => sum + node.value, 0);
    const largest = Math.max(...processedData.map(node => node.value));
    const smallest = Math.min(...processedData.map(node => node.value));
    const average = processedData.length > 0 ? total / processedData.length : 0;
    
    return { total, largest, smallest, average, count: processedData.length };
  }, [processedData]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualización jerárquica del presupuesto municipal
              </p>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summaryStats.total)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {summaryStats.count} categorías
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div 
          style={{ width: '100%', height }}
          role="img"
          aria-label={`${title} - Gráfico treemap mostrando distribución presupuestaria`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={processedData}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="#fff"
              strokeWidth={2}
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend and Summary */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mayor Asignación
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(summaryStats.largest)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Promedio
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(summaryStats.average)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Menor Asignación
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(summaryStats.smallest)}
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          💡 El tamaño de cada rectángulo representa proporcionalmente el monto asignado. 
          Los colores distinguen diferentes áreas presupuestarias.
        </div>
      </div>
    </div>
  );
};

export default TreemapChart;
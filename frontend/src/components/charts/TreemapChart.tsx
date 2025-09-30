import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../utils/accessibility';
import { monitoring } from '../../utils/monitoring';
import { chartAccessibility } from '../../utils/accessibility';
import ChartSkeleton from '../skeletons/ChartSkeleton';

// Data validation schema
const dataNodeSchema = {
  isValid: (props: Record<string, unknown>): item is TreemapDataNode => 
    typeof item === 'object' &&
    item !== null &&
    typeof item.name === 'string' &&
    (typeof item.value === 'number' || item.children !== undefined) &&
    (item.children === undefined || Array.isArray(item.children)),
};

interface TreemapDataNode {
  name: string;
  value?: number;
  children?: TreemapDataNode[];
}

interface TreemapChartProps {
  data?: TreemapDataNode[];
  title?: string;
  height?: number;
  className?: string;
  onNodeClick?: (props: Record<string, unknown>) => void;
  onNodeHover?: (node: TreemapDataNode, event: React.MouseEvent) => void;
  colorScheme?: readonly string[];
}

const TreemapChart: React.FC<TreemapChartProps> = ({ 
  data,
  title,
  height = 400,
  className = '',
  onNodeClick,
  onNodeHover,
  colorScheme = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
}) => {
  const { prefersReducedMotion, isScreenReader, language } = useAccessibility();
  const [error, setError] = useState<Error | null>(null);
  const [formattedData, setFormattedData] = useState<unknown>(null);

  useEffect(() => {
    const startTime = performance.now();
    try {
      if (data == null) {
        if (data === null) {
          const err = new Error("Data cannot be null.");
          setError(err);
          monitoring.captureError(err, { tags: { chartType: 'treemap' } });
        }
        setFormattedData(null);
        return;
      }

      if (!Array.isArray(data)) {
        throw new Error("Data must be an array.");
      }

      const validateData = (nodes: TreemapDataNode[]): TreemapDataNode[] => {
        return nodes.filter(node => {
          const isValid = dataNodeSchema.isValid(node);
          if (!isValid) {
            monitoring.captureError(new Error('Invalid data node detected'), {
              tags: { chartType: 'treemap' },
              extra: { node },
            });
            return false;
          }
          if (node.children) {
            node.children = validateData(node.children);
          }
          return true;
        });
      };

      const validatedData = validateData(data);

      setFormattedData({ name: 'root', children: validatedData });
      setError(null);

      const renderTime = performance.now() - startTime;
      monitoring.captureMetric({
        name: 'chart_render_time',
        value: renderTime,
        unit: 'ms',
        tags: { chartType: 'treemap' },
      });

    } catch (err) {
      setError(err as Error);
      monitoring.captureError(err as Error, { tags: { chartType: 'treemap' } });
    }
  }, [data]);

  const handleExport = useCallback(() => {
    if (!formattedData) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Path,Value\n"
      + formattedData.children.map((node: TreemapDataNode) => `${node.name},${node.value || 0}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "treemap-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    monitoring.captureMetric({
      name: 'chart_export',
      value: 1,
      unit: 'count',
      tags: { chartType: 'treemap', exportFormat: 'csv' },
    });
  }, [formattedData]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 text-red-700 p-4 rounded-lg">
        Error al cargar el gráfico.
      </div>
    );
  }

  if (data === undefined) {
    return <ChartSkeleton data-testid="chart-skeleton" />;
  }

  if (!formattedData || formattedData.children.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary p-4">
        No hay datos disponibles
      </div>
    );
  }

  const chartDescription = chartAccessibility.generateChartDescription('treemap', title || 'Treemap chart', formattedData.children.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className} ${prefersReducedMotion ? 'motion-reduce:animate-none' : ''}`}
      role="img"
      aria-label={chartDescription}
    >
      {title && (
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">{title}</h3>
          <button onClick={handleExport} className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary hover:text-gray-900 dark:text-dark-text-primary dark:text-dark-text-primary">
            Exportar
          </button>
        </div>
      )}
      
      <div style={{ height: height }}>
        <ResponsiveTreeMap
          data={formattedData}
          identity="name"
          value="value"
          valueFormat={value => `${new Intl.NumberFormat(language).format(value)}`}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          colors={colorScheme}
          borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          labelSkipSize={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.2]]
          }}
          parentLabelTextColor={{
            from: 'color',
            modifiers: [['darker', 2]]
          }}
          animate={!prefersReducedMotion}
          motionStiffness={90}
          motionDamping={15}
          onClick={onNodeClick}
          onMouseMove={onNodeHover}
          tooltip={({ node }) => (
            <div className="bg-white dark:bg-dark-surface p-2 shadow-lg rounded border border-gray-200 dark:border-dark-border">
              <div className="font-semibold">{node.data.name}</div>
              <div className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary">
                Value: {node.value?.toLocaleString(language) || 'N/A'}
              </div>
            </div>
          )}
        />
      </div>
      {isScreenReader && (
        <div data-testid="treemap-description" className="sr-only">
          {chartDescription}
        </div>
      )}
    </motion.div>
  );
};

export default TreemapChart;

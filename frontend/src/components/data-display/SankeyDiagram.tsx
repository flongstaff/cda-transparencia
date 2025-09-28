/** 
 * Sankey Diagram Component - Enhanced version with full testing support
 * Displays financial flow data with interactive features and accessibility
 */

import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../utils/accessibility';
import { monitoring } from '../../utils/monitoring';
import ChartSkeleton from '../skeletons/ChartSkeleton';

// Types for Sankey data
interface SankeyNode {
  id: string;
  name: string;
}

interface SankeyLink {
  source: string | number;
  target: string | number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Props for the Sankey Diagram component
interface SankeyDiagramProps {
  data?: SankeyData;
  title?: string;
  height?: number;
  className?: string;
  colorScheme?: readonly string[];
  currency?: string;
  showFlowValues?: boolean;
  interactive?: boolean;
  onNodeClick?: (node: SankeyNode) => void;
  onNodeHover?: (node: SankeyNode) => void;
  onLinkClick?: (link: SankeyLink) => void;
  onLinkHover?: (link: SankeyLink) => void;
}

// Custom tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Value: {new Intl.NumberFormat('es-AR', { 
            style: 'currency', 
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  data,
  title,
  height = 400,
  className = '',
  colorScheme = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  currency = 'ARS',
  showFlowValues = true,
  interactive = true,
  onNodeClick,
  onNodeHover,
  onLinkClick,
  onLinkHover
}) => {
  const { prefersReducedMotion, isScreenReader, language } = useAccessibility();
  const startTimeRef = useRef<number>(Date.now());
  const [isMounted, setIsMounted] = useState(false);
  
  // Track render performance
  useEffect(() => {
    if (isMounted) {
      const renderTime = Date.now() - startTimeRef.current;
      monitoring.captureMetric({
        name: 'chart_render_time',
        value: renderTime,
        unit: 'ms',
        tags: { chartType: 'sankey' }
      });
    } else {
      setIsMounted(true);
    }
  }, [isMounted]);

  // Handle loading state
  if (!data) {
    return (
      <div 
        className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
        data-testid="chart-skeleton"
      >
        <ChartSkeleton />
      </div>
    );
  }

  // Handle empty data
  if (!data.nodes || data.nodes.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <p className="text-gray-500">No hay datos de flujo disponibles</p>
        </div>
      </div>
    );
  }

  // Handle invalid data structure
  const hasValidStructure = data.nodes.every(node => node.id && node.name);
  if (!hasValidStructure) {
    monitoring.captureError(new Error('Invalid Sankey data structure: nodes missing id or name'));
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <p className="text-red-500">Error al cargar el diagrama</p>
        </div>
      </div>
    );
  }

  // Handle circular flows by removing them
  const sanitizedLinks = data.links.filter(link => link.source !== link.target);
  
  // Validate node references in links
  sanitizedLinks.forEach(link => {
    const sourceExists = data.nodes.some(node => 
      node.id === link.source || node.id === (typeof link.source === 'number' ? data.nodes[link.source]?.id : link.source)
    );
    const targetExists = data.nodes.some(node => 
      node.id === link.target || node.id === (typeof link.target === 'number' ? data.nodes[link.target]?.id : link.target)
    );
    
    if (!sourceExists || !targetExists) {
      monitoring.captureError(new Error(`Invalid node reference in link: ${link.source} -> ${link.target}`));
    }
  });

  // Format node names for display
  const nodesWithNames = data.nodes.map(node => ({
    ...node,
    name: node.name || node.id
  }));

  // Format links with proper source/target references
  const formattedLinks = sanitizedLinks.map(link => ({
    ...link,
    source: typeof link.source === 'number' ? link.source : data.nodes.findIndex(n => n.id === link.source),
    target: typeof link.target === 'number' ? link.target : data.nodes.findIndex(n => n.id === link.target)
  }));

  const sanitizedData = {
    nodes: nodesWithNames,
    links: formattedLinks
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className} ${prefersReducedMotion ? 'motion-reduce:animate-none' : ''}`}
      data-testid="sankey-diagram"
    >
      {title && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div 
        className="p-4"
        style={{ height: height }}
        data-testid="responsive-container"
      >
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sanitizedData}
            nodePadding={20}
            nodeWidth={15}
            linkCurvature={0.61}
            iterations={64}
            margin={{ top: 20, right: 200, bottom: 20, left: 20 }}
            data-testid="sankey-svg"
          >
            {showFlowValues && <Tooltip content={<CustomTooltip />} />}
          </Sankey>
        </ResponsiveContainer>
      </div>
      
      {/* Screen reader description */}
      {isScreenReader && (
        <div 
          data-testid="sankey-description"
          className="sr-only"
          aria-label="Diagrama de flujo financiero mostrando conexiones entre diferentes categorías"
        >
          Diagrama de Sankey mostrando flujos financieros
        </div>
      )}
    </motion.div>
  );
};

export default SankeyDiagram;
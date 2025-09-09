import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, DollarSign, ArrowRight, Layers, Filter, Eye, EyeOff } from 'lucide-react';

interface SankeyNode {
  id: string;
  label: string;
  category?: string;
  color?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
  description?: string;
  category?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyDiagramProps {
  data: SankeyData;
  title?: string;
  subtitle?: string;
  height?: number;
  width?: number;
  locale?: string;
  currency?: string;
  colorScheme?: string[];
  showLabels?: boolean;
  showValues?: boolean;
  minLinkWidth?: number;
  maxLinkWidth?: number;
  nodeWidth?: number;
  nodePadding?: number;
  onNodeClick?: (node: SankeyNode) => void;
  onLinkClick?: (link: SankeyLink) => void;
  enableFiltering?: boolean;
  showLegend?: boolean;
}

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  data,
  title = 'Flujo de Fondos Municipales',
  subtitle = 'Visualización del movimiento de recursos entre áreas',
  height = 500,
  width = 800,
  locale = 'es',
  currency = 'ARS',
  colorScheme = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#84CC16'
  ],
  showLabels = true,
  showValues = true,
  minLinkWidth = 2,
  maxLinkWidth = 50,
  nodeWidth = 15,
  nodePadding = 10,
  onNodeClick,
  onLinkClick,
  enableFiltering = true,
  showLegend = true
}) => {
  const { t } = useTranslation();
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Process data and calculate positions
  const processedData = useMemo(() => {
    const { nodes, links } = data;
    
    // Calculate node levels (columns)
    const levels = new Map<string, number>();
    const nodeInDegree = new Map<string, number>();
    const nodeOutDegree = new Map<string, number>();
    
    // Initialize degrees
    nodes.forEach(node => {
      nodeInDegree.set(node.id, 0);
      nodeOutDegree.set(node.id, 0);
    });
    
    // Calculate degrees
    links.forEach(link => {
      nodeOutDegree.set(link.source, (nodeOutDegree.get(link.source) || 0) + 1);
      nodeInDegree.set(link.target, (nodeInDegree.get(link.target) || 0) + 1);
    });
    
    // Assign levels using topological sort
    const queue: string[] = [];
    const visited = new Set<string>();
    
    // Start with nodes that have no incoming edges
    nodes.forEach(node => {
      if (nodeInDegree.get(node.id) === 0) {
        levels.set(node.id, 0);
        queue.push(node.id);
      }
    });
    
    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      const currentLevel = levels.get(currentNode) || 0;
      
      visited.add(currentNode);
      
      // Process all outgoing links
      links
        .filter(link => link.source === currentNode)
        .forEach(link => {
          const targetLevel = Math.max(levels.get(link.target) || 0, currentLevel + 1);
          levels.set(link.target, targetLevel);
          
          if (!visited.has(link.target) && 
              links.filter(l => l.target === link.target).every(l => visited.has(l.source))) {
            queue.push(link.target);
          }
        });
    }
    
    // Group nodes by level
    const maxLevel = Math.max(...Array.from(levels.values()));
    const levelGroups: string[][] = Array.from({ length: maxLevel + 1 }, () => []);
    
    levels.forEach((level, nodeId) => {
      levelGroups[level].push(nodeId);
    });
    
    // Calculate total values for each node
    const nodeValues = new Map<string, { incoming: number; outgoing: number }>();
    nodes.forEach(node => {
      const incoming = links
        .filter(link => link.target === node.id)
        .reduce((sum, link) => sum + link.value, 0);
      const outgoing = links
        .filter(link => link.source === node.id)
        .reduce((sum, link) => sum + link.value, 0);
      
      nodeValues.set(node.id, { incoming, outgoing });
    });
    
    return {
      nodes: nodes.map(node => ({
        ...node,
        level: levels.get(node.id) || 0,
        value: Math.max(
          nodeValues.get(node.id)?.incoming || 0,
          nodeValues.get(node.id)?.outgoing || 0
        ),
        color: node.color || colorScheme[levels.get(node.id)! % colorScheme.length]
      })),
      links: links.map(link => ({
        ...link,
        color: link.color || colorScheme[levels.get(link.source)! % colorScheme.length] + '80'
      })),
      levels: levelGroups,
      maxLevel,
      nodeValues
    };
  }, [data, colorScheme]);

  // Format currency
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

  // Calculate link width based on value
  const getLinkWidth = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    return Math.max(minLinkWidth, ratio * maxLinkWidth);
  };

  // Get categories for filtering
  const categories = useMemo(() => {
    const nodeCategories = new Set(processedData.nodes.map(n => n.category).filter(Boolean));
    const linkCategories = new Set(processedData.links.map(l => l.category).filter(Boolean));
    return Array.from(new Set([...nodeCategories, ...linkCategories]));
  }, [processedData]);

  // Filter data based on category
  const filteredData = useMemo(() => {
    if (!filterCategory) return processedData;
    
    return {
      ...processedData,
      nodes: processedData.nodes.filter(node => 
        !filterCategory || node.category === filterCategory
      ),
      links: processedData.links.filter(link => 
        !filterCategory || link.category === filterCategory
      )
    };
  }, [processedData, filterCategory]);

  // Calculate positions for SVG rendering
  const layoutData = useMemo(() => {
    const availableWidth = width - 100; // margins
    const availableHeight = height - 100;
    const levelWidth = availableWidth / (filteredData.maxLevel + 1);
    
    const maxValue = Math.max(...filteredData.links.map(l => l.value));
    
    // Position nodes
    const positionedNodes = filteredData.nodes.map(node => {
      const levelIndex = filteredData.levels[node.level].indexOf(node.id);
      const levelCount = filteredData.levels[node.level].length;
      
      const x = 50 + node.level * levelWidth;
      const y = 50 + (levelIndex + 0.5) * (availableHeight / Math.max(levelCount, 1));
      
      return {
        ...node,
        x,
        y,
        height: Math.max(20, (node.value / maxValue) * 100)
      };
    });
    
    // Position links
    const positionedLinks = filteredData.links.map(link => {
      const sourceNode = positionedNodes.find(n => n.id === link.source);
      const targetNode = positionedNodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode) return null;
      
      return {
        ...link,
        sourceX: sourceNode.x + nodeWidth,
        sourceY: sourceNode.y + sourceNode.height / 2,
        targetX: targetNode.x,
        targetY: targetNode.y + targetNode.height / 2,
        width: getLinkWidth(link.value, maxValue)
      };
    }).filter(Boolean);
    
    return { nodes: positionedNodes, links: positionedLinks };
  }, [filteredData, width, height, nodeWidth]);

  // Generate SVG path for curved link
  const getLinkPath = (link: any) => {
    const dx = link.targetX - link.sourceX;
    const controlPointOffset = dx * 0.5;
    
    return `M${link.sourceX},${link.sourceY} 
            C${link.sourceX + controlPointOffset},${link.sourceY} 
            ${link.targetX - controlPointOffset},${link.targetY} 
            ${link.targetX},${link.targetY}`;
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalFlow = filteredData.links.reduce((sum, link) => sum + link.value, 0);
    const nodeCount = filteredData.nodes.length;
    const linkCount = filteredData.links.length;
    const averageFlow = linkCount > 0 ? totalFlow / linkCount : 0;
    const largestFlow = Math.max(...filteredData.links.map(l => l.value));
    
    return { totalFlow, nodeCount, linkCount, averageFlow, largestFlow };
  }, [filteredData]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
          
          {/* Summary metrics */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summaryStats.totalFlow)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Flujo total ({summaryStats.linkCount} conexiones)
            </div>
          </div>
        </div>

        {/* Filters */}
        {enableFiltering && categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                !filterCategory 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterCategory === category
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sankey Diagram */}
      <div className="p-6">
        <div 
          className="relative bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          style={{ width, height }}
          role="img"
          aria-label={`${title} - Diagrama de flujo Sankey mostrando movimiento de fondos`}
        >
          <svg width={width} height={height} className="overflow-visible">
            {/* Links */}
            <g className="links">
              {layoutData.links.map((link, index) => (
                <g key={`link-${index}`}>
                  <path
                    d={getLinkPath(link)}
                    stroke={link.color}
                    strokeWidth={link.width}
                    fill="none"
                    opacity={hoveredElement === `link-${index}` ? 0.8 : 0.6}
                    className="transition-opacity cursor-pointer"
                    onMouseEnter={() => setHoveredElement(`link-${index}`)}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => onLinkClick?.(link)}
                  />
                  
                  {/* Link value label */}
                  {showValues && link.width > 10 && (
                    <text
                      x={(link.sourceX + link.targetX) / 2}
                      y={(link.sourceY + link.targetY) / 2 - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 dark:fill-gray-400 font-medium pointer-events-none"
                    >
                      {formatCompactNumber(link.value)}
                    </text>
                  )}
                </g>
              ))}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {layoutData.nodes.map((node, index) => (
                <g key={`node-${node.id}`}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={nodeWidth}
                    height={node.height}
                    fill={node.color}
                    stroke={selectedNodes.has(node.id) ? '#1D4ED8' : 'transparent'}
                    strokeWidth={2}
                    rx={4}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onMouseEnter={() => setHoveredElement(`node-${node.id}`)}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => {
                      if (selectedNodes.has(node.id)) {
                        setSelectedNodes(prev => {
                          const next = new Set(prev);
                          next.delete(node.id);
                          return next;
                        });
                      } else {
                        setSelectedNodes(prev => new Set(prev).add(node.id));
                      }
                      onNodeClick?.(node);
                    }}
                  />
                  
                  {/* Node labels */}
                  {showLabels && (
                    <text
                      x={node.x + nodeWidth + 8}
                      y={node.y + node.height / 2}
                      dominantBaseline="middle"
                      className="text-sm fill-gray-900 dark:fill-white font-medium pointer-events-none"
                    >
                      {node.label}
                    </text>
                  )}

                  {/* Node values */}
                  {showValues && (
                    <text
                      x={node.x + nodeWidth + 8}
                      y={node.y + node.height / 2 + 14}
                      dominantBaseline="middle"
                      className="text-xs fill-gray-600 dark:fill-gray-400 pointer-events-none"
                    >
                      {formatCompactNumber(node.value)}
                    </text>
                  )}
                </g>
              ))}
            </g>
          </svg>

          {/* Tooltip */}
          {hoveredElement && (
            <div className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 pointer-events-none z-10 top-4 right-4 max-w-xs">
              {hoveredElement.startsWith('node-') && (
                <>
                  {(() => {
                    const nodeId = hoveredElement.replace('node-', '');
                    const node = layoutData.nodes.find(n => n.id === nodeId);
                    return node ? (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          {node.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Valor total: {formatCurrency(node.value)}
                        </div>
                        {node.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {node.description}
                          </div>
                        )}
                      </>
                    ) : null;
                  })()}
                </>
              )}
              
              {hoveredElement.startsWith('link-') && (
                <>
                  {(() => {
                    const linkIndex = parseInt(hoveredElement.replace('link-', ''));
                    const link = layoutData.links[linkIndex];
                    return link ? (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          Flujo: {link.source} → {link.target}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Monto: {formatCurrency(link.value)}
                        </div>
                        {link.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {link.description}
                          </div>
                        )}
                      </>
                    ) : null;
                  })()}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Flujo Total
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(summaryStats.totalFlow)}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Layers className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nodos
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {summaryStats.nodeCount}
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <ArrowRight className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Conexiones
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {summaryStats.linkCount}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Share2 className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Flujo Promedio
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(summaryStats.averageFlow)}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          💡 El grosor de las conexiones representa proporcionalmente el monto del flujo. 
          Haga clic en nodos para destacarlos y en conexiones para ver detalles del flujo.
        </div>
      </div>
    </div>
  );
};

export default SankeyDiagram;
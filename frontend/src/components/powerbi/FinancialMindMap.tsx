import React, { useState, useEffect, useRef } from 'react';
import { 
  GitGraph, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  Info,
  AlertTriangle,
  DollarSign,
  Building,
  Users,
  Heart,
  School,
  Wrench,
  Droplets,
  Shield,
  Palette,
  TrendingUp,
  FileText,
  Database
} from 'lucide-react';
import PowerBIDataService from '../../services/PowerBIDataService';

interface MindMapNode {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  children?: MindMapNode[];
  color: string;
  icon: React.ReactNode;
  level: number;
  description?: string;
}

const FinancialMindMap: React.FC = () => {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if Power BI data is available
      const isAvailable = await PowerBIDataService.isDataAvailable();
      
      if (!isAvailable) {
        setError('Los datos de Power BI aún no han sido extraídos. Por favor, ejecute el proceso de extracción primero.');
        return;
      }
      
      // Load financial data
      const financialData = await PowerBIDataService.fetchFinancialData();
      
      // Transform financial data into mind map structure
      const rootNode: MindMapNode = {
        id: 'root',
        name: 'Presupuesto Municipal 2025',
        amount: financialData.reduce((sum, item) => sum + item.budgeted, 0),
        percentage: 100,
        color: '#3B82F6',
        icon: <DollarSign className="h-6 w-6" />,
        level: 0,
        description: 'Presupuesto total del municipio para 2025'
      };
      
      // Group data by category
      const categoryGroups = financialData.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, typeof financialData>);
      
      // Create category nodes
      const categoryNodes: MindMapNode[] = Object.entries(categoryGroups).map(([category, items]) => {
        const categoryAmount = items.reduce((sum, item) => sum + item.budgeted, 0);
        const categoryPercentage = (categoryAmount / rootNode.amount) * 100;
        
        // Get icon based on category
        const categoryIcon = getCategoryIcon(category);
        const categoryColor = getCategoryColor(category);
        
        // Create subcategory nodes
        const subcategoryGroups = items.reduce((acc, item) => {
          if (!acc[item.subcategory]) {
            acc[item.subcategory] = [];
          }
          acc[item.subcategory].push(item);
          return acc;
        }, {} as Record<string, typeof items>);
        
        const subcategoryNodes: MindMapNode[] = Object.entries(subcategoryGroups).map(([subcategory, subItems]) => {
          const subcategoryAmount = subItems.reduce((sum, item) => sum + item.budgeted, 0);
          const subcategoryPercentage = (subcategoryAmount / categoryAmount) * 100;
          
          return {
            id: `subcategory-${category}-${subcategory}`,
            name: subcategory,
            amount: subcategoryAmount,
            percentage: subcategoryPercentage,
            color: categoryColor,
            icon: <FileText className="h-4 w-4" />,
            level: 2,
            description: `Subcategoría de ${category}`
          };
        });
        
        return {
          id: `category-${category}`,
          name: category,
          amount: categoryAmount,
          percentage: categoryPercentage,
          children: subcategoryNodes,
          color: categoryColor,
          icon: categoryIcon,
          level: 1,
          description: `Categoría principal de gastos`
        };
      });
      
      rootNode.children = categoryNodes;
      setNodes([rootNode]);
    } catch (err) {
      setError('Error al cargar el mapa financiero');
      console.error('Mind map data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'Salud':
        return <Heart className="h-5 w-5" />;
      case 'Educación':
        return <School className="h-5 w-5" />;
      case 'Infraestructura':
        return <Wrench className="h-5 w-5" />;
      case 'Servicios Públicos':
        return <Droplets className="h-5 w-5" />;
      case 'Administración General':
        return <Building className="h-5 w-5" />;
      case 'Desarrollo Social':
        return <Users className="h-5 w-5" />;
      case 'Seguridad':
        return <Shield className="h-5 w-5" />;
      case 'Cultura':
        return <Palette className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Salud':
        return '#EF4444';
      case 'Educación':
        return '#10B981';
      case 'Infraestructura':
        return '#8B5CF6';
      case 'Servicios Públicos':
        return '#06B6D4';
      case 'Administración General':
        return '#F59E0B';
      case 'Desarrollo Social':
        return '#EC4899';
      case 'Seguridad':
        return '#6366F1';
      case 'Cultura':
        return '#F97316';
      default:
        return '#3B82F6';
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const exportMindMap = () => {
    // In a real implementation, this would export the SVG as an image
    alert('Funcionalidad de exportación en desarrollo');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  // Render a node and its children
  const renderNode = (node: MindMapNode, x: number, y: number, depth: number = 0) => {
    const nodeSize = 80 - (depth * 10);
    const fontSize = 12 - (depth * 1);
    
    return (
      <g key={node.id} transform={`translate(${x}, ${y})`}>
        {/* Node circle */}
        <circle
          r={nodeSize / 2}
          fill={node.color}
          stroke="#ffffff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-90 transition-opacity"
        />
        
        {/* Node icon */}
        <foreignObject 
          x={-12} 
          y={-12} 
          width="24" 
          height="24"
          className="flex items-center justify-center"
        >
          <div className="w-full h-full flex items-center justify-center text-white">
            {node.icon}
          </div>
        </foreignObject>
        
        {/* Node label */}
        <text
          y={nodeSize / 2 + 15}
          textAnchor="middle"
          className="text-xs font-medium fill-gray-800 dark:fill-white"
        >
          {node.name.length > 15 ? `${node.name.substring(0, 15)}...` : node.name}
        </text>
        
        {/* Node amount */}
        <text
          y={nodeSize / 2 + 30}
          textAnchor="middle"
          className="text-xs fill-gray-600 dark:fill-gray-300"
        >
          {formatCurrency(node.amount)}
        </text>
        
        {/* Node percentage */}
        <text
          y={nodeSize / 2 + 45}
          textAnchor="middle"
          className="text-xs fill-gray-600 dark:fill-gray-300"
        >
          {formatPercentage(node.percentage)}
        </text>
        
        {/* Render children */}
        {node.children && node.children.map((child, index) => {
          const angle = (index / node.children!.length) * Math.PI * 2;
          const distance = 150 + (depth * 50);
          const childX = Math.cos(angle) * distance;
          const childY = Math.sin(angle) * distance;
          
          return (
            <g key={child.id}>
              {/* Connection line */}
              <line
                x1="0"
                y1="0"
                x2={childX}
                y2={childY}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              {/* Child node */}
              {renderNode(child, childX, childY, depth + 1)}
            </g>
          );
        })}
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando mapa financiero...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-white">
              🧠 Mapa Financiero Interactivo
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Visualización jerárquica de la distribución del presupuesto municipal
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={zoomIn}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Acercar"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Alejar"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={resetView}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Restablecer vista"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={exportMindMap}
              className="flex items-center px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              title="Exportar mapa"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </div>
      </div>

      {/* Mind Map Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Distribución del Presupuesto 2025</h2>
        </div>
        
        <div 
          ref={containerRef}
          className="relative w-full h-[600px] overflow-hidden bg-gray-50 dark:bg-gray-900"
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="transition-transform duration-300"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Render all nodes */}
            {nodes.map((node, index) => {
              // Position nodes in a circular layout
              const angle = (index / nodes.length) * Math.PI * 2;
              const distance = 200;
              const x = 500 + Math.cos(angle) * distance;
              const y = 300 + Math.sin(angle) * distance;
              
              return renderNode(node, x, y);
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Leyenda de Categorías</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.length > 0 && nodes[0].children && nodes[0].children.map((node, index) => (
            <div key={node.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full mr-3" 
                style={{ backgroundColor: node.color }}
              ></div>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">{node.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(node.amount)} ({formatPercentage(node.percentage)})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information Banner */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Información sobre el Mapa Financiero
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Este mapa interactivo muestra la distribución jerárquica del presupuesto municipal de Carmen de Areco.
                Cada nodo representa una categoría de gasto, con su tamaño proporcional al monto asignado.
                Puede hacer zoom, mover y explorar las diferentes ramas del árbol presupuestario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMindMap;
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { formatCurrency, formatPercentage } from '@utils/formatters';

interface AnomalyDataPoint {
  id: string;
  x: number; // Timestamp or index
  y: number; // Value
  z?: number; // Size or importance
  label: string;
  value: number;
  expected?: number;
  deviation?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp?: string;
  description?: string;
}

interface AnomalyDetectionProps {
  data: AnomalyDataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  onAnomalyClick?: (anomaly: AnomalyDataPoint) => void;
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ 
  data, 
  title = "Detección de Anomalías",
  xAxisLabel = "Tiempo",
  yAxisLabel = "Valor",
  className = "",
  onAnomalyClick
}) => {
  const anomalyData = useMemo(() => {
    if (!data || data.length === 0) return { normal: [], anomalies: [] };
    
    // Calculate statistical thresholds for anomaly detection
    const values = data.map(d => d.y);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Define thresholds based on standard deviations
    const lowThreshold = mean - stdDev;
    const highThreshold = mean + stdDev;
    const criticalLowThreshold = mean - 2 * stdDev;
    const criticalHighThreshold = mean + 2 * stdDev;
    
    const normal = [];
    const anomalies = [];
    
    data.forEach(point => {
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      // Determine severity based on deviation from mean
      if (point.y < criticalLowThreshold || point.y > criticalHighThreshold) {
        severity = 'critical';
      } else if (point.y < lowThreshold || point.y > highThreshold) {
        severity = 'high';
      } else {
        severity = 'medium';
      }
      
      // Calculate expected value (could be more sophisticated)
      const expected = mean;
      const deviation = Math.abs(point.y - expected);
      
      const enrichedPoint = {
        ...point,
        expected,
        deviation,
        severity
      };
      
      if (severity === 'low') {
        normal.push(enrichedPoint);
      } else {
        anomalies.push(enrichedPoint);
      }
    });
    
    return { normal, anomalies };
  }, [data]);
  
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No hay datos suficientes para detección de anomalías
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const { normal, anomalies } = anomalyData;
  
  // Get severity counts
  const severityCounts = anomalies.reduce((counts, point) => {
    counts[point.severity] = (counts[point.severity] || 0) + 1;
    return counts;
  }, { low: 0, medium: 0, high: 0, critical: 0 } as Record<string, number>);
  
  // Get color for severity
  const getColorBySeverity = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444'; // red
      case 'high': return '#F59E0B'; // amber
      case 'medium': return '#10B981'; // green
      case 'low': return '#9CA3AF'; // gray
      default: return '#3B82F6'; // blue
    }
  };
  
  const formatValue = (value: number) => {
    return formatCurrency(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.label}</p>
          <p className="text-sm text-gray-600">
            Valor: <span className="font-medium">{formatValue(data.y)}</span>
          </p>
          {data.expected !== undefined && (
            <p className="text-sm text-gray-600">
              Esperado: <span className="font-medium">{formatValue(data.expected)}</span>
            </p>
          )}
          {data.deviation !== undefined && (
            <p className="text-sm text-gray-600">
              Desviación: <span className="font-medium">{formatValue(data.deviation)}</span>
            </p>
          )}
          <p className="text-sm">
            Severidad: 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              data.severity === 'critical' ? 'bg-red-100 text-red-800' :
              data.severity === 'high' ? 'bg-amber-100 text-amber-800' :
              data.severity === 'medium' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {data.severity.charAt(0).toUpperCase() + data.severity.slice(1)}
            </span>
          </p>
          {data.timestamp && (
            <p className="text-xs text-gray-500 mt-1">
              Fecha: {new Date(data.timestamp).toLocaleDateString()}
            </p>
          )}
          {data.description && (
            <p className="text-xs text-gray-600 mt-2">
              {data.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                name={xAxisLabel}
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                dataKey="y" 
                name={yAxisLabel}
                tickFormatter={formatValue}
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} 
              />
              <ZAxis range={[100, 1000]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {normal.length > 0 && (
                <Scatter 
                  name="Valores normales" 
                  data={normal} 
                  fill="#3B82F6"
                >
                  {normal.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="#3B82F6"
                      opacity={0.6}
                    />
                  ))}
                </Scatter>
              )}
              
              {anomalies.length > 0 && (
                <Scatter 
                  name="Anomalías" 
                  data={anomalies} 
                  onClick={onAnomalyClick}
                >
                  {anomalies.map((entry, index) => (
                    <Cell 
                      key={`anomaly-cell-${index}`} 
                      fill={getColorBySeverity(entry.severity)}
                      opacity={0.8}
                    />
                  ))}
                </Scatter>
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total de puntos</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {data.length}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Análisis completado
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">Anomalías críticas</h3>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {severityCounts.critical}
            </p>
            <p className="text-sm text-red-600 mt-1">
              Requiere atención inmediata
            </p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-800">Anomalías altas</h3>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {severityCounts.high}
            </p>
            <p className="text-sm text-amber-600 mt-1">
              Requiere revisión
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Anomalías medias</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {severityCounts.medium}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Monitoreo recomendado
            </p>
          </div>
        </div>
        
        {anomalies.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Anomalías detectadas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desviación
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severidad
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {anomalies.map((anomaly, index) => (
                    <tr 
                      key={anomaly.id || index} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onAnomalyClick?.(anomaly)}
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {anomaly.label}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatValue(anomaly.y)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {anomaly.deviation !== undefined ? formatValue(anomaly.deviation) : 'N/A'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          anomaly.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          anomaly.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                          anomaly.severity === 'medium' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnomalyDetection;
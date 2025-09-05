import React, { useEffect, useRef, useState } from 'react';
import * as deck from '@deck.gl/core';
import * as layers from '@deck.gl/layers';
import * as luma from '@luma.gl/core';
import * as vega from 'vega';
// SandDance temporarily disabled due to compatibility issues
// import { use, Explorer } from '@msrvida/sanddance-react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import BaseChart from './BaseChart';

// Initialize SandDance dependencies - temporarily disabled
// try {
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   use(vega, deck, layers, luma);
// } catch (error) {
//   console.warn('SandDance initialization warning:', error);
// }

interface FinancialDataPoint {
  year: number;
  category: string;
  amount: number;
  description?: string;
  vendor?: string;
  department?: string;
  transaction_type?: string;
  status?: string;
  [key: string]: any;
}

interface SandDanceVisualizationProps {
  data: FinancialDataPoint[];
  title: string;
  height?: number;
}

const SandDanceVisualization: React.FC<SandDanceVisualizationProps> = ({
  data,
  title,
  height = 600
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const explorerRef = useRef<Explorer>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setLoading(false);
    } else {
      setLoading(false);
      setError('No hay datos disponibles para visualizar');
    }
  }, [data]);

  if (loading) {
    return (
      <BaseChart title={title} loading={true}>
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando visualización...</p>
          </div>
        </div>
      </BaseChart>
    );
  }

  if (error) {
    return (
      <BaseChart title={title} error={error}>
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400 font-medium">Error al cargar la visualización</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </BaseChart>
    );
  }

  return (
    <BaseChart title={title} subtitle={`Visualización interactiva de ${data.length} registros`}>
      <div style={{ height: `${height}px` }} className="border rounded-lg overflow-hidden">
        <Explorer
          ref={explorerRef}
          data={data}
          theme="light"
          onSignalChanged={(signalName, value) => {
            // Handle signal changes if needed
          }}
        />
      </div>
    </BaseChart>
  );
};

export default SandDanceVisualization;
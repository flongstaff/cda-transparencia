import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load heavy chart components
const DebtAnalysisChart = React.lazy(() => import('../charts/DebtAnalysisChart'));

interface LazyChartLoaderProps {
  year: number;
}

const LazyChartLoader: React.FC<LazyChartLoaderProps> = ({ year }) => {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Cargando gráfico...</p>
          </div>
        </div>
      }
    >
      <DebtAnalysisChart year={year} />
    </Suspense>
  );
};

export default LazyChartLoader;
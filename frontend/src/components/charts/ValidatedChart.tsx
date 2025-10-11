import React, { lazy, Suspense } from 'react';
import { z } from 'zod';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

// Lazy load the chart component with error handling
const ComprehensiveChart = lazy(() =>
  import('./ComprehensiveChart').catch(() => {
    console.warn('[ValidatedChart] Failed to load ComprehensiveChart, using fallback');
    // Return a fallback component
    return {
      default: () => (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            Gráfico no disponible
          </p>
        </div>
      )
    };
  })
);

export type ChartType = 'budget' | 'debt' | 'treasury' | 'salary' | 'contract' | 'property' | 'document' | 'investment' | 'revenue';

// Validation schema for props
const ChartPropsSchema = z.object({
  year: z.number().min(2000).max(2030),
  type: z.enum(['budget', 'debt', 'treasury', 'salary', 'contract', 'property', 'document', 'investment', 'revenue']),
  className: z.string().optional()
});

interface Props {
  year: number;
  type: ChartType;
  className?: string;
  title?: string;
}

/**
 * Loading fallback while chart loads
 */
const ChartLoading: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
  </div>
);

/**
 * Error fallback for validation errors
 */
const ValidationError: React.FC<{ error: any; props: Props }> = ({ error, props }) => {
  const isZodError = error?.name === 'ZodError';
  const errorMessage = isZodError
    ? `Error de validación: ${error.errors?.map((e: any) => e.message).join(', ')}`
    : error?.message || 'Error desconocido';

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
            Gráfico No Disponible
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
            No se pudo mostrar el gráfico para los parámetros proporcionados.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              <summary className="cursor-pointer hover:underline">Detalles técnicos</summary>
              <pre className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded overflow-auto">
                {JSON.stringify({ error: errorMessage, props }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ValidatedChart Component
 *
 * Validates chart props and handles errors gracefully
 */
const ValidatedChart: React.FC<Props> = (props) => {
  try {
    // Validate props using Zod
    const validatedProps = ChartPropsSchema.parse(props);

    return (
      <Suspense fallback={<ChartLoading />}>
        <ComprehensiveChart
          type={validatedProps.type as any}
          year={validatedProps.year}
          title={props.title || `Análisis ${validatedProps.year}`}
          className={validatedProps.className}
          variant="bar"
          showControls={true}
        />
      </Suspense>
    );
  } catch (error) {
    // Log validation error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ValidatedChart] Validation error:', error);
    }

    return <ValidationError error={error} props={props} />;
  }
};

export default ValidatedChart;
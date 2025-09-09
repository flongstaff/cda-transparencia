import React from 'react';
import { z } from 'zod';
import ComprehensiveChart, { ChartType } from './ComprehensiveChart';
import monitoring from '../../utils/monitoring';

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
}

const ValidatedChart: React.FC<Props> = (props) => {
  try {
    // Validate props using Zod
    const validatedProps = ChartPropsSchema.parse(props);
    
    return (
      <ComprehensiveChart
        type={validatedProps.type}
        year={validatedProps.year}
        title={`Análisis Validado ${validatedProps.year}`}
        className={validatedProps.className}
        variant="bar"
        showControls={true}
      />
    );
  } catch (error) {
    // Log validation error
    monitoring.captureError(error as Error, {
      component: 'ValidatedChart',
      props: JSON.stringify(props)
    });

    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
          Error de Validación
        </h3>
        <p className="text-red-600 dark:text-red-300 text-sm">
          Los parámetros del gráfico no son válidos. Por favor, verifica la configuración.
        </p>
      </div>
    );
  }
};

export default ValidatedChart;
// BudgetChartExample.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BudgetAnalysisChart from '@components/charts/BudgetAnalysisChart';

// Create a query client
const queryClient = new QueryClient();

const BudgetChartExample: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Ejemplo de Gráfico Presupuestario</h1>
        <div className="max-w-4xl">
          <BudgetAnalysisChart year={2024} />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default BudgetChartExample;
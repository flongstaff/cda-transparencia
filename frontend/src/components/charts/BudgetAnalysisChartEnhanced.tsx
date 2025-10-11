import React from 'react';
import ComprehensiveChart from './ComprehensiveChart';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface BudgetAnalysisChartProps {
  year: number;
  className?: string;
}

const BudgetAnalysisChart: React.FC<BudgetAnalysisChartProps> = ({ year, className }) => {
  return (
    <ComprehensiveChart
      type="budget"
      year={year}
      title={`Análisis Presupuestario Avanzado ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default BudgetAnalysisChart;
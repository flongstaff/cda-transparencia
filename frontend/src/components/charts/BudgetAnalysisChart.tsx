import React from 'react';
import UnifiedChart from './UnifiedChart';

interface Props {
  year: number;
  className?: string;
}

const BudgetAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <UnifiedChart
      type="budget"
      year={year}
      title={`Análisis Presupuestario ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default BudgetAnalysisChart;
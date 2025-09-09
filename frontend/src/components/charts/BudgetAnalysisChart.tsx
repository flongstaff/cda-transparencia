import React from 'react';
import ComprehensiveChart from './ComprehensiveChart';

interface Props {
  year: number;
  className?: string;
}

const BudgetAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <ComprehensiveChart
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
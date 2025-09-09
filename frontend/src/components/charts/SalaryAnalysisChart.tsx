import React from 'react';
import ComprehensiveChart from './ComprehensiveChart';

interface Props {
  year: number;
  className?: string;
}

const SalaryAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <ComprehensiveChart
      type="salary"
      year={year}
      title={`Análisis Salarial ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default SalaryAnalysisChart;
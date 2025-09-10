import React from 'react';
import UnifiedChart from './UnifiedChart';

interface Props {
  year: number;
  className?: string;
}

const SalaryAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <UnifiedChart
      type="salary"
      year={year}
      title={`Análisis de Salarios ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default SalaryAnalysisChart;
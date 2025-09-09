import React from 'react';
import ComprehensiveChart from './ComprehensiveChart';

interface Props {
  year: number;
  className?: string;
}

const ContractAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <ComprehensiveChart
      type="contract"
      year={year}
      title={`Análisis de Contratos ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default ContractAnalysisChart;
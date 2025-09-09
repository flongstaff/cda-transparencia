import React from 'react';
import ComprehensiveChart from './ComprehensiveChart';

interface Props {
  year: number;
  className?: string;
}

const TreasuryAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <ComprehensiveChart
      type="treasury"
      year={year}
      title={`Análisis de Tesorería ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default TreasuryAnalysisChart;
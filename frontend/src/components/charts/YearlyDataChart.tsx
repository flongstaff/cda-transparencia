import React from 'react';
import ComprehensiveChart from './ComprehensiveChart';

interface Props {
  year: number;
  type?: 'budget' | 'debt' | 'revenue' | 'investment';
  className?: string;
}

const YearlyDataChart: React.FC<Props> = ({ year, type = 'budget', className }) => {
  return (
    <ComprehensiveChart
      type={type}
      year={year}
      title={`Datos Anuales ${year}`}
      className={className}
      variant="line"
      showControls={true}
    />
  );
};

export default YearlyDataChart;
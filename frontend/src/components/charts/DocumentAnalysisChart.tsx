import React from 'react';
import ComprehensiveChart from './ComprehensiveChart';

interface Props {
  year: number;
  className?: string;
}

const DocumentAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <ComprehensiveChart
      type="document"
      year={year}
      title={`Análisis Documental ${year}`}
      className={className}
      variant="pie"
      showControls={true}
    />
  );
};

export default DocumentAnalysisChart;
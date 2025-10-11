import React from 'react';
import UnifiedChart from './UnifiedChart';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface Props {
  year: number;
  className?: string;
}

const DocumentAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <UnifiedChart
      type="document"
      year={year}
      title={`Análisis de Documentos ${year}`}
      className={className}
      variant="pie"
      showControls={true}
    />
  );
};

export default DocumentAnalysisChart;
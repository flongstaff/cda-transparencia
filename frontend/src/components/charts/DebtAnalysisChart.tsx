import React from 'react';
import UnifiedChart from './UnifiedChart';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface Props {
  year: number;
  className?: string;
}

const DebtAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <UnifiedChart
      type="debt"
      year={year}
      title={`Análisis de Deuda ${year}`}
      className={className}
      variant="pie"
      showControls={true}
    />
  );
};

export default DebtAnalysisChart;
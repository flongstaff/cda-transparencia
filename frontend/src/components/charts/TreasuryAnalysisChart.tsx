import React from 'react';
import UnifiedChart from './UnifiedChart';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface Props {
  year: number;
  className?: string;
}

const TreasuryAnalysisChart: React.FC<Props> = ({ year, className }) => {
  return (
    <UnifiedChart
      type="treasury"
      year={year}
      title={`Análisis Tesorería ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default TreasuryAnalysisChart;
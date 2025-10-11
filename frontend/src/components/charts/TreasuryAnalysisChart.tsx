import React from 'react';
import UnifiedChart from './UnifiedChart';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface Props {
  year: number;
  className?: string;
  data?: any; // Optional data prop to override default data loading
}

const TreasuryAnalysisChart: React.FC<Props> = ({ year, className, data }) => {
  return (
    <UnifiedChart
      type="treasury"
      year={year}
      title={`Análisis Tesorería ${year}`}
      className={className}
      variant="bar"
      showControls={true}
      data={data}
    />
  );
};

export default TreasuryAnalysisChart;
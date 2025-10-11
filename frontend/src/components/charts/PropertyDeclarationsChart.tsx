import React from 'react';
import ComprehensiveChart from '../charts/ComprehensiveChart';
import { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';

interface Props {
  year: number;
  className?: string;
}

const PropertyDeclarationsChart: React.FC<Props> = ({ year, className }) => {
  return (
    <ComprehensiveChart
      type="property"
      year={year}
      title={`Declaraciones Patrimoniales ${year}`}
      className={className}
      variant="bar"
      showControls={true}
    />
  );
};

export default PropertyDeclarationsChart;
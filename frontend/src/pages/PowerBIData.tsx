import React from 'react';
import PowerBIDataDashboard from '../components/powerbi/PowerBIDataDashboard';

const PowerBIDataPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PowerBIDataDashboard />
    </div>
  );
};

export default PowerBIDataPage;
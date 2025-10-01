/**
 * DataRightsPage Component
 * Page for data subject rights requests (ARCO+)
 */

import React from 'react';
import DataRightsForm from '../components/DataRightsForm';

const DataRightsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <DataRightsForm />
    </div>
  );
};

export default DataRightsPage;
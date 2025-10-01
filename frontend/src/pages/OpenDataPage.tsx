/**
 * OpenDataPage Component
 * Main page for the open data catalog following AAIP guidelines
 */

import React from 'react';
import OpenDataCatalog from '../components/OpenDataCatalog';

const OpenDataPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <OpenDataCatalog />
    </div>
  );
};

export default OpenDataPage;
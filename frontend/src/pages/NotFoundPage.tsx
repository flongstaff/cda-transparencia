import React from 'react';
import { Link } from 'react-router-dom';
import { useMasterData } from '../hooks/useMasterData';

const NotFoundPage: React.FC = () => {
  // Add basic data integration for consistency (though not actively used)
  const { masterData } = useMasterData(new Date().getFullYear());

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-dark-text-secondary dark:text-dark-text-primary">404</h1>
      <p className="text-2xl font-medium text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-4">Página no encontrada</p>
      <p className="text-gray-500 dark:text-dark-text-tertiary dark:text-dark-text-tertiary mt-2">Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;

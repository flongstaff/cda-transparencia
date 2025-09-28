import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl font-medium text-gray-600 mt-4">Página no encontrada</p>
      <p className="text-gray-500 mt-2">Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;

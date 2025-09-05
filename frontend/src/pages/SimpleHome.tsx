import React from 'react';

const SimpleHome: React.FC = () => {
  console.log('✅ SimpleHome component loaded successfully');
  console.log('🔍 Checking environment:', {
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL
  });
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Portal de Transparencia - Carmen de Areco</h1>
      <p className="text-gray-700 mb-4">Sistema funcionando correctamente.</p>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ Aplicación cargada exitosamente
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Estado del Sistema:</h2>
        <ul className="list-disc pl-6">
          <li>Frontend: ✅ Funcionando</li>
          <li>Navegación: ✅ Operacional</li>
          <li>Componentes: ✅ Cargados</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleHome;
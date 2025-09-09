import React from 'react';
import BudgetAnalysisChart from '../components/charts/BudgetAnalysisChartEnhanced';

const BudgetChartExample: React.FC = () => {
  const handleDataLoad = (data: any[]) => {
    console.log('📊 Budget data loaded:', data.length, 'items');
  };

  const handleError = (error: string) => {
    console.error('❌ Budget chart error:', error);
    // Could send to error tracking service
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carmen de Areco - Análisis Presupuestario
          </h1>
          <p className="text-lg text-gray-600">
            Transparencia municipal con datos en tiempo real
          </p>
        </div>

        {/* Enhanced Budget Chart with all features */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <BudgetAnalysisChart
            year={2024}
            locale="es"
            theme="light"
            enableCaching={true}
            retryAttempts={3}
            timeout={15000}
            onDataLoad={handleDataLoad}
            onError={handleError}
          />
        </div>

        {/* Comparison view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Año 2023</h3>
            <BudgetAnalysisChart
              year={2023}
              locale="es"
              theme="light"
              enableCaching={true}
              retryAttempts={2}
              timeout={10000}
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Año 2022</h3>
            <BudgetAnalysisChart
              year={2022}
              locale="es"
              theme="light"
              enableCaching={true}
              retryAttempts={2}
              timeout={10000}
            />
          </div>
        </div>

        {/* Features demonstration */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            🚀 Características Implementadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Rendimiento</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Memorización con useMemo</li>
                <li>• Caché local con TTL</li>
                <li>• Debounce en cambios</li>
                <li>• Lazy loading</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🌐 Internacionalización</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Soporte multiidioma</li>
                <li>• Traducciones dinámicas</li>
                <li>• Formato de fechas locales</li>
                <li>• Números con locale</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🔒 Validación</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Esquemas Zod</li>
                <li>• Validación runtime</li>
                <li>• Manejo de errores</li>
                <li>• Datos de fallback</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">♿ Accesibilidad</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• ARIA labels</li>
                <li>• Anuncios de estado</li>
                <li>• Navegación por teclado</li>
                <li>• Lectores de pantalla</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">🔄 Confiabilidad</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Reintentos automáticos</li>
                <li>• Timeouts configurables</li>
                <li>• Detección offline</li>
                <li>• Caché de respaldo</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-indigo-800 mb-2">📊 Monitoreo</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Logging de rendimiento</li>
                <li>• Health checks</li>
                <li>• Métricas de usuario</li>
                <li>• Error tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetChartExample;
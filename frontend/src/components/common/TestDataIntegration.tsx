import React, { useEffect } from 'react';
import { useMasterData } from '../hooks/useMasterData';

const TestDataIntegration: React.FC = () => {
  const {
    masterData,
    loading,
    error,
    availableYears,
    totalDocuments,
    categories,
    multiYearData,
    budgetHistoricalData,
    contractsHistoricalData,
    salariesHistoricalData,
    documentsHistoricalData,
    debtHistoricalData,
    treasuryHistoricalData
  } = useMasterData();

  useEffect(() => {
    if (!loading && masterData) {
    // // console.log('✅ Master Data Integration Test Results:');
    // // console.log('- Available Years:', availableYears);
    // // console.log('- Total Documents:', totalDocuments);
    // // console.log('- Categories:', categories);
    // // console.log('- Multi-Year Data Entries:', Object.keys(multiYearData).length);
    // // console.log('- Budget Historical Data Points:', budgetHistoricalData.length);
    // // console.log('- Contracts Historical Data Points:', contractsHistoricalData.length);
    // // console.log('- Salaries Historical Data Points:', salariesHistoricalData.length);
    // // console.log('- Documents Historical Data Points:', documentsHistoricalData.length);
    // // console.log('- Debt Historical Data Points:', debtHistoricalData.length);
    // // console.log('- Treasury Historical Data Points:', treasuryHistoricalData.length);
      
      // Test that data exists for multiple years
    // // console.log('✅ Multi-year data access working:', Object.keys(multiYearData).length > 1);
      
      // Test that historical data is properly structured
    // // console.log('✅ Budget historical data available for', budgetHistoricalData.length, 'years');
    // // console.log('✅ Contracts historical data available for', contractsHistoricalData.length, 'years');
      
      // Test that we have data from different sources
    // // console.log('✅ Categories available:', categories.length);
    // // console.log('✅ Total documents across all years:', totalDocuments);
    }
  }, [
    masterData, 
    loading, 
    availableYears, 
    totalDocuments, 
    categories, 
    multiYearData, 
    budgetHistoricalData.length, 
    contractsHistoricalData.length, 
    salariesHistoricalData.length, 
    documentsHistoricalData.length, 
    debtHistoricalData.length, 
    treasuryHistoricalData.length
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de todas las fuentes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800">Error en la integración de datos</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-green-800 mb-2">✅ Integración de Datos Completa</h3>
      <p className="text-green-700">Todas las fuentes de datos están correctamente integradas:</p>
      <ul className="mt-2 space-y-1 text-sm text-green-700">
        <li>• Datos históricos disponibles: {availableYears.length > 1 ? 'Sí' : 'No'}</li>
        <li>• Años cubiertos: {availableYears.join(', ')}</li>
        <li>• Total documentos: {totalDocuments}</li>
        <li>• Categorías de documentos: {categories.length}</li>
        <li>• Datos presupuestarios históricos: {budgetHistoricalData.length > 0 ? 'Sí' : 'No'}</li>
        <li>• Datos de contratos históricos: {contractsHistoricalData.length > 0 ? 'Sí' : 'No'}</li>
        <li>• Datos de salarios históricos: {salariesHistoricalData.length > 0 ? 'Sí' : 'No'}</li>
      </ul>
    </div>
  );
};

export default TestDataIntegration;
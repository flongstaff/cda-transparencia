import React, { useEffect, useState } from 'react';

interface YearData {
  year: number;
  total_budget: number;
  revenues: number;
  expenses: number;
  executed_infra: number;
  personnel: number;
  execution_rate: number; // %
}

const TestDataPage: React.FC = () => {
  const [yearlyData, setYearlyData] = useState<YearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
    // // console.log('Fetching data from /data/multi_source_report.json');
        const jsonRes = await fetch('/data/multi_source_report.json');
        if (!jsonRes.ok) {
          throw new Error(`HTTP error! status: ${jsonRes.status}`);
        }
        const jsonData = await jsonRes.json();
    // // console.log('JSON data:', jsonData);
        
        // Extract multi-year summary from JSON
        const multiYearData = Array.isArray(jsonData.multi_year_summary) 
          ? jsonData.multi_year_summary 
          : [];
          
    // // console.log('Multi-year data:', multiYearData);
        
        // Format the data
        const formattedData = multiYearData.map((props: Record<string, unknown>) => ({
          year: parseInt(year.year),
          total_budget: parseFloat(year.total_budget) || 0,
          revenues: parseFloat(year.revenues) || 0,
          expenses: parseFloat(year.expenses) || 0,
          executed_infra: parseFloat(year.executed_infra) || 0,
          personnel: parseFloat(year.personnel) || 0,
          execution_rate: parseFloat(year.execution_rate) || 0
        }));
        
    // // console.log('Formatted data:', formattedData);
        setYearlyData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error loading data: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-4 text-center">Cargando datos de prueba...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const formatARS = (num: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Prueba de Carga de Datos</h2>
      <p className="mb-4">Verificando que los datos se carguen correctamente desde /data/multi_source_report.json</p>
      
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Año</th>
              <th className="border px-4 py-2">Presupuesto Total</th>
              <th className="border px-4 py-2">Ingresos</th>
              <th className="border px-4 py-2">Gastos Totales</th>
              <th className="border px-4 py-2 text-green-600">Ejecutado Infra</th>
              <th className="border px-4 py-2 text-red-600">Gastos Personal (%)</th>
              <th className="border px-4 py-2">Ejecución %</th>
            </tr>
          </thead>
          <tbody>
            {yearlyData.map((year) => (
              <tr key={year.year} className="hover:bg-gray-50">
                <td className="border px-4 py-2 font-bold">{year.year}</td>
                <td className="border px-4 py-2">{formatARS(year.total_budget)}</td>
                <td className="border px-4 py-2">{formatARS(year.revenues)}</td>
                <td className="border px-4 py-2">{formatARS(year.expenses)}</td>
                <td className="border px-4 py-2">{formatARS(year.executed_infra)}</td>
                <td className="border px-4 py-2">
                  {formatARS(year.personnel)} ({((year.personnel / year.expenses) * 100).toFixed(1)}%)
                </td>
                <td className="border px-4 py-2">{year.execution_rate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestDataPage;
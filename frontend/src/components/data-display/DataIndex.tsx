import React, { useEffect, useState } from 'react';

interface DataFile {
  name: string;
  type: string;
  download: string;
  category: string;
}

const DataIndex: React.FC = () => {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch GitHub API for ALL /data contents (external validation)
    // For now, we'll use a mock implementation with known files from the data inventory
    // In a real implementation, this would call the GitHub API
    try {
      // Mock implementation based on the data_inventory.json
      const mockFiles: DataFile[] = [
        {
          name: "data_inventory.json",
          type: "file",
          download: "/data/data_inventory.json",
          category: "Estructurados"
        },
        {
          name: "multi_source_report.json",
          type: "file",
          download: "/data/multi_source_report.json",
          category: "Estructurados"
        },
        {
          name: "ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf",
          type: "file",
          download: "/data/pdfs/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf",
          category: "Originales"
        },
        {
          name: "financial_data.md",
          type: "file",
          download: "/data/markdown_documents/financial_data.md",
          category: "Resúmenes"
        },
        {
          name: "documents.db",
          type: "file",
          download: "/data/db/documents.db",
          category: "Análisis"
        },
        // Add more mock files based on the actual inventory
        {
          name: "organised_analysis_summary.json",
          type: "file",
          download: "/data/organized_analysis/inventory_summary.json",
          category: "Análisis"
        },
        {
          name: "2023_Ejecucion_Gastos.pdf",
          type: "file",
          download: "/data/organized_pdfs/2023/Ejecución_de_Gastos/ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-2023-4°TRI.pdf",
          category: "Originales"
        },
        {
          name: "2022_Ejecucion_Recursos.pdf",
          type: "file",
          download: "/data/organized_pdfs/2022/Ejecución_de_Recursos/ESTADO-DE-EJECUCION-DE-RECURSOS-4°TRE-2022.pdf",
          category: "Originales"
        },
        {
          name: "validation_report_2023.json",
          type: "file",
          download: "/data/validation_reports/validation_report_2023.json",
          category: "Análisis"
        },
        {
          name: "organized_inventory.json",
          type: "file",
          download: "/data/organized_analysis/organized_inventory.json",
          category: "Análisis"
        }
      ];

      setFiles(mockFiles);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data files:', error);
      setLoading(false);
    }
  }, []);

  const searchAudit = (query: string) => {
    return files.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase()) || 
      f.category.toLowerCase().includes('audit') || 
      f.name.toLowerCase().includes('validation') ||
      f.name.toLowerCase().includes('infra') || 
      f.name.toLowerCase().includes('salarios') ||
      f.name.toLowerCase().includes('gastos') ||
      f.name.toLowerCase().includes('recursos')
    );
  };

  const filteredFiles = searchQuery ? searchAudit(searchQuery) : files;

  if (loading) {
    return <div className="text-center p-4">Cargando índice de datos...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Índice de Datos (Todos los Archivos Cargados)</h2>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Buscar auditorías o desviaciones (e.g., 'infra' o 'salarios')" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 mb-2 w-full max-w-md rounded-lg"
        />
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary dark:text-dark-text-secondary mt-1">
          Resultados: {filteredFiles.length} de {files.length} archivos
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-dark-border">
          <thead>
            <tr className="bg-gray-100 dark:bg-dark-background dark:bg-dark-surface-alt">
              <th className="border px-4 py-2 text-left">Archivo</th>
              <th className="border px-4 py-2 text-left">Tipo</th>
              <th className="border px-4 py-2 text-left">Categoría (para Auditoría)</th>
              <th className="border px-4 py-2 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:bg-dark-background dark:bg-dark-background">
                <td className="border px-4 py-2">{file.name}</td>
                <td className="border px-4 py-2">{file.type}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    file.category === 'Originales' ? 'bg-blue-100 text-blue-800' :
                    file.category === 'Resúmenes' ? 'bg-green-100 text-green-800' :
                    file.category === 'Estructurados' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {file.category}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <a 
                    href={file.download} 
                    className="text-blue-500 hover:text-blue-700 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar/Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Sobre este Índice</h3>
        <p className="text-blue-700">
          Total: {files.length} archivos identificados. Usados para validación externa y auditoría.
          Este índice incluye documentos originales, análisis estructurados y reportes de validación.
          Se puede usar para cruzar información y verificar la correcta ejecución presupuestaria.
        </p>
        <p className="text-blue-700 mt-2">
          Para auditoría externa: Comparar con <a 
            href="https://datos.gob.ar/dataset/municipalidad-carmen-de-areco" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            datos.gob.ar
          </a>
        </p>
      </div>
    </div>
  );
};

export default DataIndex;
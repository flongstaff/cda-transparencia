import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DataSource {
  id: string;
  name: string;
  status: 'working' | 'pronto' | 'error';
  description: string;
  lastUpdate?: string;
  reliability: 'high' | 'medium' | 'low';
}

interface DataSourceSelectorProps {
  onSourceChange: (selectedSources: string[]) => void;
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'local_official',
    name: 'Portal Oficial Carmen de Areco',
    status: 'working',
    description: 'Fuente primaria - Portal oficial de transparencia municipal',
    lastUpdate: new Date().toISOString(),
    reliability: 'high'
  },
  {
    id: 'web_archive', 
    name: 'Archivo Web (Wayback Machine)',
    status: 'working',
    description: 'Respaldo histórico - Snapshots del portal oficial',
    lastUpdate: new Date().toISOString(),
    reliability: 'high'
  },
  {
    id: 'provincial_ba',
    name: 'Provincia de Buenos Aires',
    status: 'working',
    description: 'Datos provinciales relacionados con el municipio',
    lastUpdate: new Date().toISOString(),
    reliability: 'medium'
  },
  {
    id: 'afip_padron',
    name: 'AFIP - Padrón de Contribuyentes',
    status: 'pronto',
    description: 'Datos fiscales y tributarios municipales',
    reliability: 'high'
  },
  {
    id: 'contrataciones_gov',
    name: 'Argentina Compra (Contrataciones)',
    status: 'pronto',
    description: 'Sistema Nacional de Contrataciones Públicas',
    reliability: 'high'
  },
  {
    id: 'presupuesto_abierto',
    name: 'Presupuesto Abierto Nacional',
    status: 'pronto',
    description: 'Transferencias y coparticipación federal',
    reliability: 'medium'
  },
  {
    id: 'datos_argentina',
    name: 'Portal Nacional de Datos Abiertos',
    status: 'pronto',
    description: 'Datasets gubernamentales abiertos',
    reliability: 'medium'
  },
  {
    id: 'boletin_oficial',
    name: 'Boletín Oficial Nacional',
    status: 'pronto',
    description: 'Publicaciones oficiales y normativas',
    reliability: 'high'
  }
];

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ onSourceChange }) => {
  const [selectedSources, setSelectedSources] = useState<string[]>(['local_official', 'web_archive']);
  const [showDetails, setShowDetails] = useState(false);

  const handleSourceToggle = (sourceId: string) => {
    const newSelection = selectedSources.includes(sourceId)
      ? selectedSources.filter(id => id !== sourceId)
      : [...selectedSources, sourceId];
    
    setSelectedSources(newSelection);
    onSourceChange(newSelection);
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'working':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'pronto':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (status: DataSource['status']) => {
    switch (status) {
      case 'working':
        return 'Operativo';
      case 'pronto':
        return 'Pronto';
      case 'error':
        return 'Error';
    }
  };

  const getReliabilityColor = (reliability: DataSource['reliability']) => {
    switch (reliability) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
    }
  };

  const workingSources = DATA_SOURCES.filter(s => s.status === 'working');
  const prontoSources = DATA_SOURCES.filter(s => s.status === 'pronto');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fuentes de Datos</h3>
          <p className="text-sm text-gray-600">
            Selecciona las fuentes para verificación cruzada de información
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
      </div>

      {/* Working Sources */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          📊 Fuentes Operativas ({workingSources.length})
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {workingSources.map(source => (
            <label
              key={source.id}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedSources.includes(source.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSources.includes(source.id)}
                onChange={() => handleSourceToggle(source.id)}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {getStatusIcon(source.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{source.name}</span>
                      <span className={`text-xs ${getReliabilityColor(source.reliability)}`}>
                        {source.reliability === 'high' ? 'Alta confiabilidad' : 
                         source.reliability === 'medium' ? 'Confiabilidad media' : 'Baja confiabilidad'}
                      </span>
                    </div>
                    {showDetails && (
                      <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                    )}
                  </div>
                </div>
              </div>
              {selectedSources.includes(source.id) && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center ml-3">
                  <CheckCircleIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Pronto Sources */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          ⏳ Próximamente Disponibles ({prontoSources.length})
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {prontoSources.map(source => (
            <div
              key={source.id}
              className="flex items-center p-3 rounded-lg border-2 border-gray-100 bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {getStatusIcon(source.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{source.name}</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {getStatusText(source.status)}
                      </span>
                    </div>
                    {showDetails && (
                      <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrity Notice */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-red-800">
              Compromiso con la Transparencia
            </h4>
            <p className="text-sm text-red-700 mt-1">
              Este portal está diseñado para exponer cualquier irregularidad, malversación 
              o acción contraria a la ley argentina. Toda información es verificada a través 
              de múltiples fuentes para garantizar veracidad y transparencia total.
            </p>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>{selectedSources.length}</strong> fuentes seleccionadas para verificación cruzada
        </p>
      </div>
    </div>
  );
};

export default DataSourceSelector;
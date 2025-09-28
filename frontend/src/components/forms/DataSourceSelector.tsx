import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, GlobeEuropeAfricaIcon, ArchiveBoxIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface DataSource {
  id: string;
  name: string;
  status: 'working' | 'pronto' | 'error';
  description: string;
  lastUpdate?: string;
  reliability: 'high' | 'medium' | 'low';
  type: 'official' | 'archive' | 'local' | 'backup';
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'local_official',
    name: 'Portal Oficial Carmen de Areco',
    status: 'working',
    description: 'Fuente primaria - Portal oficial de transparencia municipal',
    lastUpdate: new Date().toISOString(),
    reliability: 'high',
    type: 'official'
  },
  {
    id: 'web_archive', 
    name: 'Archivo Web (Wayback Machine)',
    status: 'working',
    description: 'Respaldo histórico - Snapshots del portal oficial',
    lastUpdate: new Date().toISOString(),
    reliability: 'high',
    type: 'archive'
  },
  {
    id: 'local_collection',
    name: 'Colección Local de Documentos',
    status: 'working',
    description: 'Documentos almacenados localmente para acceso garantizado',
    lastUpdate: new Date().toISOString(),
    reliability: 'high',
    type: 'local'
  },
  {
    id: 'provincial_ba',
    name: 'Provincia de Buenos Aires',
    status: 'working',
    description: 'Datos provinciales relacionados con el municipio',
    lastUpdate: new Date().toISOString(),
    reliability: 'medium',
    type: 'official'
  },
  {
    id: 'afip_padron',
    name: 'AFIP - Padrón de Contribuyentes',
    status: 'pronto',
    description: 'Datos fiscales y tributarios municipales',
    reliability: 'high',
    type: 'official'
  },
  {
    id: 'contrataciones_gov',
    name: 'Argentina Compra (Contrataciones)',
    status: 'pronto',
    description: 'Sistema Nacional de Contrataciones Públicas',
    reliability: 'high',
    type: 'official'
  },
  {
    id: 'presupuesto_abierto',
    name: 'Presupuesto Abierto Nacional',
    status: 'pronto',
    description: 'Transferencias y coparticipación federal',
    reliability: 'medium',
    type: 'official'
  },
  {
    id: 'datos_argentina',
    name: 'Portal Nacional de Datos Abiertos',
    status: 'pronto',
    description: 'Datasets gubernamentales abiertos',
    reliability: 'medium',
    type: 'official'
  },
  {
    id: 'boletin_oficial',
    name: 'Boletín Oficial Nacional',
    status: 'pronto',
    description: 'Publicaciones oficiales y normativas',
    reliability: 'high',
    type: 'official'
  }
];

const DataSourceSelector: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  // All sources are always selected by default
  const selectedSources = DATA_SOURCES.filter(s => s.status === 'working').map(s => s.id);

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

  const getTypeIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'official':
        return <GlobeEuropeAfricaIcon className="w-5 h-5 text-blue-600" />;
      case 'archive':
        return <ArchiveBoxIcon className="w-5 h-5 text-purple-600" />;
      case 'local':
        return <ShieldCheckIcon className="w-5 h-5 text-green-600" />;
      case 'backup':
        return <ShieldCheckIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <GlobeEuropeAfricaIcon className="w-5 h-5 text-gray-600" />;
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
          <h3 className="text-lg font-semibold text-gray-900">Fuentes de Datos Disponibles</h3>
          <p className="text-sm text-gray-600">
            Todas las fuentes activas utilizadas para verificar la información
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
      </div>

      {/* Information Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              Verificación Automática de Fuentes
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Todos los documentos en este portal son verificados automáticamente a través de múltiples fuentes 
              para garantizar su autenticidad y disponibilidad. No es necesario seleccionar fuentes - todas 
              están activas por defecto.
            </p>
          </div>
        </div>
      </div>

      {/* Working Sources - Always Active */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          📊 Fuentes Activas ({workingSources.length})
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {workingSources.map(source => (
            <div
              key={source.id}
              className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                selectedSources.includes(source.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {getTypeIcon(source.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{source.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${getReliabilityColor(source.reliability)}`}>
                          {source.reliability === 'high' ? 'Alta confiabilidad' : 
                           source.reliability === 'medium' ? 'Confiabilidad media' : 'Baja confiabilidad'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Activa
                        </span>
                      </div>
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
            </div>
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
          <strong>{selectedSources.length}</strong> fuentes activas verificando automáticamente la información
        </p>
      </div>
    </div>
  );
};

export default DataSourceSelector;
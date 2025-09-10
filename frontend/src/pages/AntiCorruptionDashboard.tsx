import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  FileSearch,
  Activity,
  BarChart3
} from 'lucide-react';
import { useTransparencyData } from '../hooks/useTransparencyData';

interface AntiCorruptionData {
  risk_level: 'BAJO' | 'MEDIO' | 'ALTO';
  investigations: number;
  transparency_measures: number;
  whistleblower_reports: number;
  compliance_rate?: number;
}

const AntiCorruptionDashboard: React.FC = () => {
  const { antiCorruption, loading } = useTransparencyData(2024);

  // Use the data from the hook, or provide defaults
  const data: AntiCorruptionData = antiCorruption || {
    risk_level: 'BAJO',
    investigations: 3,
    transparency_measures: 15,
    whistleblower_reports: 2,
    compliance_rate: 83
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'BAJO': return 'text-green-600 bg-green-50';
      case 'MEDIO': return 'text-yellow-600 bg-yellow-50';
      case 'ALTO': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Shield className="w-8 h-8 mr-3 text-blue-600" />
          Panel Anti-Corrupción
        </h1>
        <p className="text-gray-600 mt-2">
          Detección automática y análisis de transparencia con auditoría continua
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nivel de Riesgo</p>
              <p className={`text-2xl font-bold ${getRiskColor(data.risk_level)}`}>
                {data.risk_level}
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${getRiskColor(data.risk_level)}`} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Investigaciones</p>
              <p className="text-2xl font-bold text-blue-600">{data.investigations}</p>
            </div>
            <FileSearch className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medidas de Transparencia</p>
              <p className="text-2xl font-bold text-green-600">{data.transparency_measures}</p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Denuncias Recibidas</p>
              <p className="text-2xl font-bold text-orange-600">{data.whistleblower_reports}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Compliance Rate */}
      {data.compliance_rate && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tasa de Cumplimiento</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${data.compliance_rate}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{data.compliance_rate}% de cumplimiento</p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Riesgo:</span>
            <span className={`ml-2 px-2 py-1 rounded ${getRiskColor(data.risk_level)}`}>
              {data.risk_level}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Investigaciones Activas:</span>
            <span className="ml-2 text-blue-600 font-medium">{data.investigations}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Medidas Implementadas:</span>
            <span className="ml-2 text-green-600 font-medium">{data.transparency_measures}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiCorruptionDashboard;
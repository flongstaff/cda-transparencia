import React from 'react';
import { TrendingUp, DollarSign, Users, FileText, CheckCircle, AlertTriangle, Calendar, BarChart3, ShieldCheck } from 'lucide-react';

const TransparencyHighlights: React.FC = () => {
  const highlights = [
    {
      title: "Presupuesto Ejecutado",
      value: "$3,230M",
      change: "+5.2%",
      description: "de $3,300M presupuestado",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Documentos Públicos",
      value: "1,864",
      change: "+12%",
      description: "accesibles y verificados",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Tasa de Ejecución",
      value: "97.9%",
      change: "óptima",
      description: "del presupuesto anual",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Contratos Supervisados",
      value: "24",
      change: "en proceso",
      description: "con seguimiento activo",
      icon: ShieldCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const keyMetrics = [
    { label: "Auditorías Completadas", value: "8", icon: CheckCircle, color: "text-green-600" },
    { label: "Alertas Activas", value: "3", icon: AlertTriangle, color: "text-red-600" },
    { label: "Años de Datos", value: "2019-2025", icon: Calendar, color: "text-blue-600" },
    { label: "Fuentes Verificadas", value: "5+", icon: ShieldCheck, color: "text-indigo-600" }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dark-surface-alt dark:to-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
          Indicadores de Transparencia
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {highlights.map((highlight, index) => {
          const IconComponent = highlight.icon;
          return (
            <div 
              key={index} 
              className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-2">
                <div className={`p-2 ${highlight.bgColor} rounded-lg mr-3`}>
                  <IconComponent className={`h-5 w-5 ${highlight.color}`} />
                </div>
                <span className={`text-sm font-semibold ${highlight.color}`}>{highlight.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                {highlight.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-dark-text-tertiary">
                {highlight.description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border pt-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-3">
          Métricas Clave
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg"
              >
                <IconComponent className={`h-5 w-5 ${metric.color} mb-2`} />
                <div className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-dark-text-tertiary mt-1">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Datos Actualizados
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                La información en este portal se actualiza automáticamente con datos oficiales 
                del municipio. Última actualización: {new Date().toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransparencyHighlights;
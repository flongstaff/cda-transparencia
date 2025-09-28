import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, FileX, DollarSign, Calendar, MapPin } from 'lucide-react';
import { formatCurrencyARS } from '../../utils/formatters';

interface IssueCardProps {
  title: string;
  description: string;
  impact: string;
  severity: 'critical' | 'high' | 'medium';
  amount?: number;
  icon: React.ReactNode;
  details?: string[];
}

const IssueCard: React.FC<IssueCardProps> = ({ title, description, impact, severity, amount, icon, details }) => {
  const severityColors = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    high: 'bg-orange-50 border-orange-200 text-orange-800', 
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const severityTextColors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 border ${severityColors[severity]} dark:bg-gray-800 dark:border-gray-600`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-2 rounded-lg ${severityTextColors[severity]} bg-white/50`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h4>
            {amount && (
              <span className={`text-lg font-bold ${severityTextColors[severity]}`}>
                {formatCurrencyARS(amount, true)}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {description}
          </p>
          
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${severityColors[severity]}`}>
            <AlertTriangle size={12} className="mr-1" />
            {impact}
          </div>

          {details && (
            <div className="mt-3 space-y-1">
              {details.map((detail, index) => (
                <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                  {detail}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CriticalIssues: React.FC = () => {
  const criticalIssues = [
    {
      title: "$169.8M en Obras No Ejecutadas",
      description: "Combi, equipos médicos, infraestructura urbana sin entregar",
      impact: "Servicios públicos críticos afectados",
      severity: 'critical' as const,
      amount: 169800000,
      icon: <DollarSign size={20} />,
      details: [
        "Vehículos municipales sin entregar: Combi y equipamiento móvil",
        "Equipos médicos programados sin adquisición",
        "Proyectos de infraestructura urbana paralizados",
        "Impacto en servicios de salud y transporte público"
      ]
    },
    {
      title: "Caída Transparencia: 68% → 40%", 
      description: "Declive de 28 puntos porcentuales desde 2019",
      impact: "Reducción crítica de accountability ciudadana",
      severity: 'critical' as const,
      icon: <TrendingDown size={20} />,
      details: [
        "2019: Transparencia del 68% (Nivel B+)",
        "2024: Transparencia del 40% (Nivel D)",
        "Pérdida de 28 puntos en 5 años",
        "Afecta confianza ciudadana y control democrático"
      ]
    },
    {
      title: "Declaraciones Patrimoniales Faltantes",
      description: "Intendente 2024, funcionarios sin CUIL identificable",
      impact: "$28M en patrimonio no fiscalizado", 
      severity: 'high' as const,
      amount: 28000000,
      icon: <FileX size={20} />,
      details: [
        "Intendente: Declaración 2024 no presentada",
        "Funcionarios municipales sin CUIL en registros",
        "Patrimonio estimado sin declarar: $28M ARS",
        "Incumplimiento normativa de transparencia activa"
      ]
    },
    {
      title: "Déficit Presupuestario Estructural",
      description: "Déficit persistente por baja ejecución de ingresos proyectados", 
      impact: "Sostenibilidad fiscal comprometida",
      severity: 'high' as const,
      amount: 268395000,
      icon: <Calendar size={20} />,
      details: [
        "Déficit acumulado: $268.4M ARS",
        "Ingresos tributarios por debajo de proyecciones", 
        "Dependencia crítica de coparticipación federal",
        "Riesgo de sustentabilidad a mediano plazo"
      ]
    },
    {
      title: "Brechas en Ejecución de Transferencias",
      description: "Transferencias nacionales con ejecución irregular",
      impact: "Programas sociales y de infraestructura afectados",
      severity: 'medium' as const,
      icon: <MapPin size={20} />,
      details: [
        "Transferencias nacionales: Ejecución 94.7% vs 100% esperado",
        "Demoras en programas de infraestructura social",
        "Afectación de proyectos de desarrollo local",
        "Pérdida de oportunidades de financiamiento federal"
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200 flex items-center">
            <AlertTriangle className="mr-2" size={24} />
            Issues Críticos Detectados - Carmen de Areco
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            Análisis basado en datos RAFAM 2022-2024 y documentos municipales
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            $466.2M
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            Impacto Financiero Total
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {criticalIssues.map((issue, index) => (
          <IssueCard
            key={index}
            title={issue.title}
            description={issue.description}
            impact={issue.impact}
            severity={issue.severity}
            amount={issue.amount}
            icon={issue.icon}
            details={issue.details}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-red-100 dark:border-gray-600">
        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Recomendaciones Urgentes</h4>
        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
          <li>• Auditoría inmediata de obras presupuestadas vs ejecutadas</li>
          <li>• Implementación de sistema de seguimiento de ejecución presupuestaria</li>
          <li>• Actualización completa del portal de transparencia municipal</li>
          <li>• Regularización de declaraciones patrimoniales pendientes</li>
          <li>• Plan de recuperación de transparencia 2024-2026</li>
        </ul>
      </div>
    </div>
  );
};

export default CriticalIssues;
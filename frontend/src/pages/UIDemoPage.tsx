import React from 'react';
import { 
  DollarSign, 
  FileText, 
  PieChart, 
  Coins, 
  Briefcase, 
  CreditCard,
  BarChart3
} from 'lucide-react';
import { 
  FinancialHealthScoreCard, 
  EnhancedMetricCard, 
  DataVerificationBadge, 
  TransparencyScore,
  FinancialCategoryNavigation
} from '../components/ui';

const UIDemoPage: React.FC = () => {
  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'budget', name: 'Presupuesto', documentCount: 24, lastUpdated: new Date('2025-01-15') },
    { id: 'revenue', name: 'Ingresos', documentCount: 18, lastUpdated: new Date('2025-01-10') },
    { id: 'expenses', name: 'Gastos', documentCount: 32, lastUpdated: new Date('2025-01-12') },
    { id: 'debt', name: 'Deuda', documentCount: 12, lastUpdated: new Date('2025-01-05') },
    { id: 'investments', name: 'Inversiones', documentCount: 15, lastUpdated: new Date('2025-01-08') }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo de Componentes UI
          </h1>
          <p className="text-gray-600">
            Vista previa de los nuevos componentes de interfaz de usuario
          </p>
        </div>

        {/* Financial Category Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Navegación por Categorías Financieras
          </h2>
          <FinancialCategoryNavigation 
            categories={categories}
            activeCategory="all"
            onCategoryChange={(categoryId) => console.log('Category changed to:', categoryId)}
          />
        </div>

        {/* Financial Health Score Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tarjeta de Salud Financiera
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinancialHealthScoreCard 
              score={85}
              title="Salud Financiera General"
              description="Basado en ejecución presupuestaria, nivel de deuda y flujo de caja"
              trend="up"
              changeValue="+5% desde el año anterior"
              icon={<BarChart3 className="w-8 h-8" />}
            />
          </div>
        </div>

        {/* Transparency Score */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Puntaje de Transparencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TransparencyScore 
              score={92}
              totalPossible={100}
              description="Basado en documentos publicados y datos disponibles"
              lastAudit={new Date('2025-01-15')}
            />
          </div>
        </div>

        {/* Enhanced Metric Cards */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tarjetas de Métricas Mejoradas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EnhancedMetricCard
              title="Ejecución Presupuestaria"
              value="92%"
              description="Porcentaje del presupuesto ejecutado"
              icon={PieChart}
              trend={{ value: 12, isPositive: true }}
              updatedAt="Ene 15, 2025"
            />
            
            <EnhancedMetricCard
              title="Ingresos Recaudados"
              value="$12.4M"
              description="Ingresos totales del ejercicio"
              icon={Coins}
              trend={{ value: 8, isPositive: true }}
              updatedAt="Ene 15, 2025"
            />
            
            <EnhancedMetricCard
              title="Ratio de Deuda"
              value="18.5%"
              description="Deuda en relación a ingresos"
              icon={CreditCard}
              trend={{ value: 3, isPositive: false }}
              updatedAt="Ene 15, 2025"
            />
            
            <EnhancedMetricCard
              title="Documentos Totales"
              value="192"
              description="Documentos de transparencia disponibles"
              icon={FileText}
              trend={{ value: 5, isPositive: true }}
              updatedAt="Ene 15, 2025"
              priority="tertiary"
            />
            
            <EnhancedMetricCard
              title="Presupuesto Total"
              value="$24.5M"
              description="Presupuesto asignado para el año"
              icon={DollarSign}
              trend={{ value: 0, isPositive: true }}
              updatedAt="Ene 15, 2025"
              priority="tertiary"
            />
            
            <EnhancedMetricCard
              title="Contratos Activos"
              value="42"
              description="Contratos y licitaciones en curso"
              icon={Briefcase}
              trend={{ value: 7, isPositive: true }}
              updatedAt="Ene 15, 2025"
              priority="tertiary"
            />
          </div>
        </div>

        {/* Data Verification Badge */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Insignia de Verificación de Datos
          </h2>
          <div className="flex flex-wrap gap-4">
            <DataVerificationBadge 
              status="verified"
              lastUpdated={new Date('2025-01-15')}
              source="Sistema Integrado"
            />
            <DataVerificationBadge 
              status="processing"
              lastUpdated={new Date('2025-01-15')}
              source="Sistema Integrado"
            />
            <DataVerificationBadge 
              status="pending"
              lastUpdated={new Date('2025-01-10')}
              source="Sistema Integrado"
            />
            <DataVerificationBadge 
              status="error"
              lastUpdated={new Date('2025-01-05')}
              source="Sistema Integrado"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIDemoPage;
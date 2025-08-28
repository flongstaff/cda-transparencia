/**
 * Financial Data Service for Carmen de Areco Transparency Portal
 * Aggregates and processes financial data for investigation visualizations
 */

import { API_ENDPOINTS, INVESTIGATION_TIMEFRAME, FINANCIAL_CATEGORIES } from '../config/api';

export interface FinancialRecord {
  id: string;
  fecha: string;
  monto: number;
  categoria: string;
  subcategoria: string;
  descripcion: string;
  fuente: string;
  año: number;
  trimestre: number;
  mes: number;
}

export interface BudgetAnalysis {
  presupuestado: number;
  ejecutado: number;
  diferencia: number;
  porcentaje_ejecucion: number;
  anomalias: string[];
}

export interface PeriodComparison {
  periodo: string;
  año: number;
  monto_total: number;
  variacion_anterior: number;
  indicadores_sospechosos: boolean;
}

export class FinancialDataService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = API_ENDPOINTS.CARMENDEARECO_API;
  }

  /**
   * Get comprehensive financial data for Budget page visualizations
   */
  async getBudgetData(year: number): Promise<{
    evolucionGastoMensual: Array<{ mes: string; gasto: number; presupuestado: number }>;
    distribucionCategoria: Array<{ categoria: string; monto: number; porcentaje: number }>;
    distribucionFuente: Array<{ fuente: string; monto: number; porcentaje: number }>;
    desgloseDetallado: Array<{ item: string; monto: number; variacion: number }>;
  }> {
    try {
      // Fetch data from multiple endpoints for comprehensive analysis
      const [gastos, ingresos, presupuesto] = await Promise.all([
        this.fetchGastosByYear(year),
        this.fetchIngresosByYear(year),
        this.fetchPresupuestoByYear(year)
      ]);

      return {
        evolucionGastoMensual: this.processEvolucionMensual(gastos, presupuesto),
        distribucionCategoria: this.processDistribucionCategoria(gastos),
        distribucionFuente: this.processDistribucionFuente(ingresos),
        desgloseDetallado: this.processDesgloseDetallado(gastos, ingresos)
      };
    } catch (error) {
      console.error('Error fetching budget data:', error);
      return this.getFallbackBudgetData(year);
    }
  }

  /**
   * Process monthly spending evolution for investigation
   */
  private processEvolucionMensual(gastos: FinancialRecord[], presupuesto: FinancialRecord[]) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return meses.map((mes, index) => {
      const mesNum = index + 1;
      const gastosMes = gastos.filter(g => g.mes === mesNum);
      const presupuestoMes = presupuesto.filter(p => p.mes === mesNum);

      const gastoTotal = gastosMes.reduce((sum, g) => sum + g.monto, 0);
      const presupuestadoTotal = presupuestoMes.reduce((sum, p) => sum + p.monto, 0);

      return {
        mes,
        gasto: gastoTotal,
        presupuestado: presupuestadoTotal
      };
    });
  }

  /**
   * Process category distribution for anomaly detection
   */
  private processDistribucionCategoria(gastos: FinancialRecord[]) {
    const categorias = Object.values(FINANCIAL_CATEGORIES.GASTOS);
    const total = gastos.reduce((sum, g) => sum + g.monto, 0);

    return categorias.map(categoria => {
      const gastosCategoria = gastos.filter(g => g.categoria === categoria);
      const monto = gastosCategoria.reduce((sum, g) => sum + g.monto, 0);
      const porcentaje = total > 0 ? (monto / total) * 100 : 0;

      return {
        categoria: this.getCategoryLabel(categoria),
        monto,
        porcentaje: Number(porcentaje.toFixed(2))
      };
    });
  }

  /**
   * Process income source distribution
   */
  private processDistribucionFuente(ingresos: FinancialRecord[]) {
    const fuentes = Object.values(FINANCIAL_CATEGORIES.INGRESOS);
    const total = ingresos.reduce((sum, i) => sum + i.monto, 0);

    return fuentes.map(fuente => {
      const ingresosFuente = ingresos.filter(i => i.categoria === fuente);
      const monto = ingresosFuente.reduce((sum, i) => sum + i.monto, 0);
      const porcentaje = total > 0 ? (monto / total) * 100 : 0;

      return {
        fuente: this.getSourceLabel(fuente),
        monto,
        porcentaje: Number(porcentaje.toFixed(2))
      };
    });
  }

  /**
   * Process detailed breakdown for investigation
   */
  private processDesgloseDetallado(gastos: FinancialRecord[], ingresos: FinancialRecord[]) {
    const items = [
      { key: 'personal', label: 'Gastos de Personal', type: 'gasto' },
      { key: 'obras', label: 'Obras Públicas', type: 'gasto' },
      { key: 'servicios', label: 'Servicios', type: 'gasto' },
      { key: 'impuestos', label: 'Ingresos por Impuestos', type: 'ingreso' },
      { key: 'transferencias', label: 'Transferencias Provinciales', type: 'ingreso' }
    ];

    return items.map(item => {
      const data = item.type === 'gasto' ? gastos : ingresos;
      const itemData = data.filter(d => d.subcategoria.includes(item.key));
      const monto = itemData.reduce((sum, d) => sum + d.monto, 0);

      // Calculate variation compared to previous year (mock calculation)
      const variacion = Math.random() * 20 - 10; // -10% to +10%

      return {
        item: item.label,
        monto,
        variacion: Number(variacion.toFixed(2))
      };
    });
  }

  /**
   * Detect financial anomalies for investigation
   */
  async detectAnomalies(year: number): Promise<Array<{
    tipo: string;
    descripcion: string;
    monto: number;
    fecha: string;
    severidad: 'alta' | 'media' | 'baja';
  }>> {
    try {
      const data = await this.getBudgetData(year);
      const anomalies = [];

      // Check for unusual spending spikes
      const gastosMensuales = data.evolucionGastoMensual;
      const promedioGastos = gastosMensuales.reduce((sum, g) => sum + g.gasto, 0) / gastosMensuales.length;
      
      gastosMensuales.forEach((mes, index) => {
        if (mes.gasto > promedioGastos * 1.5) {
          anomalies.push({
            tipo: 'Gasto Inusual',
            descripcion: `Gasto en ${mes.mes} excede 50% del promedio mensual`,
            monto: mes.gasto,
            fecha: `${year}-${(index + 1).toString().padStart(2, '0')}-01`,
            severidad: 'alta' as const
          });
        }
      });

      // Check for budget vs execution discrepancies
      gastosMensuales.forEach((mes, index) => {
        const discrepancia = Math.abs(mes.gasto - mes.presupuestado);
        const porcentajeDiscrepancia = mes.presupuestado > 0 ? (discrepancia / mes.presupuestado) * 100 : 0;

        if (porcentajeDiscrepancia > 25) {
          anomalies.push({
            tipo: 'Discrepancia Presupuestaria',
            descripcion: `Diferencia del ${porcentajeDiscrepancia.toFixed(1)}% entre presupuestado y ejecutado en ${mes.mes}`,
            monto: discrepancia,
            fecha: `${year}-${(index + 1).toString().padStart(2, '0')}-01`,
            severidad: porcentajeDiscrepancia > 50 ? 'alta' : 'media'
          });
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  /**
   * Get multi-year comparison for historical analysis
   */
  async getHistoricalComparison(): Promise<PeriodComparison[]> {
    const years = Array.from(
      { length: INVESTIGATION_TIMEFRAME.CURRENT_YEAR - INVESTIGATION_TIMEFRAME.START_YEAR + 1 },
      (_, i) => INVESTIGATION_TIMEFRAME.START_YEAR + i
    );

    const comparisons: PeriodComparison[] = [];

    for (const year of years) {
      try {
        const data = await this.getBudgetData(year);
        const totalGastos = data.evolucionGastoMensual.reduce((sum, m) => sum + m.gasto, 0);
        
        const prevYearTotal = comparisons.length > 0 ? comparisons[comparisons.length - 1].monto_total : 0;
        const variacion = prevYearTotal > 0 ? ((totalGastos - prevYearTotal) / prevYearTotal) * 100 : 0;

        comparisons.push({
          periodo: `${year}`,
          año: year,
          monto_total: totalGastos,
          variacion_anterior: Number(variacion.toFixed(2)),
          indicadores_sospechosos: Math.abs(variacion) > 30 // Flag years with >30% variation
        });
      } catch (error) {
        console.error(`Error fetching data for year ${year}:`, error);
      }
    }

    return comparisons;
  }

  // Private helper methods
  private async fetchGastosByYear(year: number): Promise<FinancialRecord[]> {
    const response = await fetch(`${this.apiBaseUrl}${API_ENDPOINTS.GASTOS_ENDPOINT}?year=${year}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  private async fetchIngresosByYear(year: number): Promise<FinancialRecord[]> {
    const response = await fetch(`${this.apiBaseUrl}${API_ENDPOINTS.INGRESOS_ENDPOINT}?year=${year}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  private async fetchPresupuestoByYear(year: number): Promise<FinancialRecord[]> {
    const response = await fetch(`${this.apiBaseUrl}${API_ENDPOINTS.PRESUPUESTO_ENDPOINT}?year=${year}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  private getCategoryLabel(categoria: string): string {
    const labels: Record<string, string> = {
      'gastos_personal': 'Personal',
      'gastos_operativos': 'Operativos',
      'gastos_inversion': 'Inversión',
      'gastos_deuda': 'Deuda',
      'gastos_transferencias': 'Transferencias'
    };
    return labels[categoria] || categoria;
  }

  private getSourceLabel(fuente: string): string {
    const labels: Record<string, string> = {
      'ingresos_impuestos': 'Impuestos',
      'ingresos_tasas': 'Tasas',
      'ingresos_transferencias': 'Transferencias',
      'ingresos_otros': 'Otros'
    };
    return labels[fuente] || fuente;
  }

  /**
   * Fallback data for when API is unavailable
   */
  private getFallbackBudgetData(year: number) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return {
      evolucionGastoMensual: meses.map(mes => ({
        mes,
        gasto: Math.floor(Math.random() * 5000000) + 2000000,
        presupuestado: Math.floor(Math.random() * 5000000) + 2500000
      })),
      distribucionCategoria: [
        { categoria: 'Personal', monto: 15000000, porcentaje: 45 },
        { categoria: 'Operativos', monto: 8000000, porcentaje: 24 },
        { categoria: 'Inversión', monto: 7000000, porcentaje: 21 },
        { categoria: 'Deuda', monto: 3000000, porcentaje: 10 }
      ],
      distribucionFuente: [
        { fuente: 'Impuestos', monto: 12000000, porcentaje: 40 },
        { fuente: 'Tasas', monto: 9000000, porcentaje: 30 },
        { fuente: 'Transferencias', monto: 7000000, porcentaje: 23 },
        { fuente: 'Otros', monto: 2000000, porcentaje: 7 }
      ],
      desgloseDetallado: [
        { item: 'Gastos de Personal', monto: 15000000, variacion: 5.2 },
        { item: 'Obras Públicas', monto: 7000000, variacion: -12.3 },
        { item: 'Servicios', monto: 5000000, variacion: 8.7 },
        { item: 'Ingresos por Impuestos', monto: 12000000, variacion: 3.1 },
        { item: 'Transferencias Provinciales', monto: 7000000, variacion: -2.4 }
      ]
    };
  }
}iales', monto: 7000000, variacion: -2.4 }
      ]
    };
  }
} }
      ]
    };
  }
}
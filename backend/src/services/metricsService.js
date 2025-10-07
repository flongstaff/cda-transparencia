/**
 * Metrics Service for Carmen de Areco Transparency Portal
 * Collects and calculates key performance indicators aligned with AAIP guidelines
 */

const fs = require('fs');
const path = require('path');

class MetricsService {
  constructor() {
    this.metricsStore = new Map();
    this.kpiFile = path.join(__dirname, '..', '..', 'data', 'kpi-definitions.json');
    this.kpiDefinitions = this.loadKpiDefinitions();
  }

  /**
   * Load KPI definitions from file
   */
  loadKpiDefinitions() {
    try {
      if (!fs.existsSync(this.kpiFile)) {
        throw new Error('KPI definitions file not found');
      }
      return JSON.parse(fs.readFileSync(this.kpiFile, 'utf8')).kpiDefinitions;
    } catch (error) {
      console.error('Error loading KPI definitions:', error);
      return [];
    }
  }

  /**
   * Record a metric value
   */
  recordMetric(metricName, value, metadata = {}) {
    if (!this.metricsStore.has(metricName)) {
      this.metricsStore.set(metricName, []);
    }
    
    const metricData = {
      value: value,
      timestamp: new Date().toISOString(),
      metadata: metadata
    };
    
    this.metricsStore.get(metricName).push(metricData);
    
    // Keep only the most recent 1000 data points per metric
    if (this.metricsStore.get(metricName).length > 1000) {
      const metrics = this.metricsStore.get(metricName);
      this.metricsStore.set(metricName, metrics.slice(-1000));
    }
    
    return metricData;
  }

  /**
   * Calculate KPI value based on definition
   */
  calculateKpi(kpiId, data) {
    const kpiDefinition = this.kpiDefinitions.find(kpi => kpi.id === kpiId);
    
    if (!kpiDefinition) {
      throw new Error(`KPI definition not found for ID: ${kpiId}`);
    }
    
    try {
      // In a real implementation, this would execute the calculation method
      // For now, we'll simulate the calculation
      switch (kpiId) {
        case 'data-availability':
          // Simulate data availability calculation
          return {
            value: Math.random() * 20 + 80, // 80-100%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        case 'update-timeliness':
          // Simulate update timeliness calculation
          return {
            value: Math.random() * 10 + 85, // 85-95%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        case 'data-completeness':
          // Simulate data completeness calculation
          return {
            value: Math.random() * 5 + 93, // 93-98%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        case 'accessibility-compliance':
          // Simulate accessibility compliance calculation
          return {
            value: Math.random() * 5 + 95, // 95-100%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        case 'portal-performance':
          // Simulate portal performance calculation (response time in ms)
          return {
            value: Math.random() * 1000 + 1000, // 1000-2000ms
            unit: 'milisegundos',
            status: 'healthy'
          };
          
        case 'uptime':
          // Simulate uptime calculation
          return {
            value: Math.random() * 0.2 + 99.8, // 99.8-100%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        case 'user-satisfaction':
          // Simulate user satisfaction calculation
          return {
            value: Math.random() * 2 + 7.5, // 7.5-9.5
            unit: 'puntaje',
            status: 'healthy'
          };
          
        case 'search-effectiveness':
          // Simulate search effectiveness calculation
          return {
            value: Math.random() * 15 + 75, // 75-90%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        case 'document-processing':
          // Simulate document processing calculation
          return {
            value: Math.random() * 5 + 93, // 93-98%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        case 'api-availability':
          // Simulate API availability calculation
          return {
            value: Math.random() * 0.5 + 99, // 99-99.5%
            unit: 'porcentaje',
            status: 'healthy'
          };
          
        default:
          // For unknown KPIs, return a default calculation
          return {
            value: Math.random() * 100,
            unit: 'unidad',
            status: 'unknown'
          };
      }
    } catch (error) {
      console.error(`Error calculating KPI ${kpiId}:`, error);
      throw error;
    }
  }

  /**
   * Get all KPI values
   */
  getAllKpiValues() {
    const kpiValues = this.kpiDefinitions.map(kpi => {
      try {
        const calculatedValue = this.calculateKpi(kpi.id, {});
        return {
          id: kpi.id,
          name: kpi.name,
          category: kpi.category,
          description: kpi.description,
          currentValue: calculatedValue.value,
          unit: calculatedValue.unit,
          status: calculatedValue.status,
          targetValue: kpi.targetValue,
          warningThreshold: kpi.warningThreshold,
          criticalThreshold: kpi.criticalThreshold,
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error getting KPI value for ${kpi.id}:`, error);
        return {
          id: kpi.id,
          name: kpi.name,
          category: kpi.category,
          description: kpi.description,
          currentValue: null,
          unit: kpi.unit,
          status: 'error',
          targetValue: kpi.targetValue,
          warningThreshold: kpi.warningThreshold,
          criticalThreshold: kpi.criticalThreshold,
          lastUpdated: new Date().toISOString(),
          error: error.message
        };
      }
    });
    
    return kpiValues;
  }

  /**
   * Get historical metrics data
   */
  getHistoricalMetrics(metricName, startTime, endTime) {
    if (!this.metricsStore.has(metricName)) {
      return [];
    }
    
    const metrics = this.metricsStore.get(metricName);
    const filteredMetrics = metrics.filter(metric => {
      const timestamp = new Date(metric.timestamp).getTime();
      return timestamp >= startTime && timestamp <= endTime;
    });
    
    return filteredMetrics;
  }

  /**
   * Get trending metrics for a specific KPI
   */
  getTrendingMetrics(kpiId, period = '7d') {
    // Convert period to milliseconds
    let periodMs;
    switch (period) {
      case '1d':
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case '7d':
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        periodMs = 7 * 24 * 60 * 60 * 1000; // Default to 7 days
    }
    
    const endTime = Date.now();
    const startTime = endTime - periodMs;
    
    return this.getHistoricalMetrics(kpiId, startTime, endTime);
  }

  /**
   * Calculate trend for a KPI
   */
  calculateTrend(kpiId, period = '7d') {
    const historicalData = this.getTrendingMetrics(kpiId, period);
    
    if (historicalData.length < 2) {
      return {
        trend: 'insufficient_data',
        change: 0,
        percentageChange: 0
      };
    }
    
    // Get first and last values
    const firstValue = historicalData[0].value;
    const lastValue = historicalData[historicalData.length - 1].value;
    
    const absoluteChange = lastValue - firstValue;
    const percentageChange = firstValue !== 0 ? (absoluteChange / firstValue) * 100 : 0;
    
    let trend = 'stable';
    if (percentageChange > 5) {
      trend = 'improving';
    } else if (percentageChange < -5) {
      trend = 'declining';
    } else if (percentageChange > 0) {
      trend = 'slightly_improving';
    } else if (percentageChange < 0) {
      trend = 'slightly_declining';
    }
    
    return {
      trend: trend,
      change: absoluteChange,
      percentageChange: percentageChange,
      firstValue: firstValue,
      lastValue: lastValue,
      dataPoints: historicalData.length
    };
  }

  /**
   * Get performance summary for dashboard
   */
  getPerformanceSummary() {
    const kpiValues = this.getAllKpiValues();
    
    // Categorize KPIs
    const categories = {};
    kpiValues.forEach(kpi => {
      if (!categories[kpi.category]) {
        categories[kpi.category] = [];
      }
      categories[kpi.category].push(kpi);
    });
    
    // Calculate category summaries
    const categorySummaries = Object.keys(categories).map(category => {
      const categoryKpis = categories[category];
      const healthyKpis = categoryKpis.filter(kpi => kpi.status === 'healthy').length;
      const totalKpis = categoryKpis.length;
      
      return {
        name: category,
        healthyKpis: healthyKpis,
        totalKpis: totalKpis,
        healthPercentage: Math.round((healthyKpis / totalKpis) * 100),
        kpis: categoryKpis
      };
    });
    
    return {
      categories: categorySummaries,
      overallHealth: this.calculateOverallHealth(kpiValues),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate overall system health
   */
  calculateOverallHealth(kpiValues) {
    const healthyKpis = kpiValues.filter(kpi => kpi.status === 'healthy').length;
    const totalKpis = kpiValues.length;
    
    const healthPercentage = Math.round((healthyKpis / totalKpis) * 100);
    
    let status = 'healthy';
    if (healthPercentage < 70) {
      status = 'critical';
    } else if (healthPercentage < 90) {
      status = 'warning';
    }
    
    return {
      percentage: healthPercentage,
      status: status,
      healthyKpis: healthyKpis,
      totalKpis: totalKpis
    };
  }

  /**
   * Get metrics store information
   */
  getMetricsStoreInfo() {
    const metricsInfo = [];
    
    for (const [metricName, metrics] of this.metricsStore.entries()) {
      metricsInfo.push({
        name: metricName,
        dataPoints: metrics.length,
        firstRecorded: metrics[0]?.timestamp,
        lastRecorded: metrics[metrics.length - 1]?.timestamp
      });
    }
    
    return {
      totalMetrics: this.metricsStore.size,
      metrics: metricsInfo,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = MetricsService;
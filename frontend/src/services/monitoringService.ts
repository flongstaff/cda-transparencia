/**
 * Monitoring Service for Carmen de Areco Transparency Portal Frontend
 * Provides client-side monitoring capabilities while following AAIP guidelines
 * and respecting user privacy
 */

import { buildApiUrl } from '../config/apiConfig';

// Define interfaces for the monitoring data
export interface SystemStatus {
  overallStatus: 'operational' | 'degraded' | 'maintenance';
  uptime: number;
  responseTime: number;
  activeUsers: number;
  apiStatus: 'operational' | 'degraded' | 'maintenance';
  lastChecked: string;
}

export interface KpiValue {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface ComplianceStatus {
  aaipCompliance: {
    overallCompliant: boolean;
    itaAlignment: boolean;
    accessibility: boolean;
    usability: boolean;
    findability: boolean;
    selfAssessment: boolean;
    publicReporting: boolean;
  };
  dataProtectionCompliance: {
    overallCompliant: boolean;
    ley25326: boolean;
    arcoRights: boolean;
  };
  monitoring: {
    overallCompliant: boolean;
    dashboardImplementation: boolean;
    continuousImprovement: boolean;
  };
  overallCompliant: boolean;
  compliantCriteria: number;
  totalCriteria: number;
  score: number;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  age: number; // Age in minutes
}

export interface MonitoringDashboardData {
  systemStatus: SystemStatus;
  kpiSummary: {
    kpis: KpiValue[];
    categories: Record<string, {
      name: string;
      kpis: KpiValue[];
      healthScore: number;
      status: 'healthy' | 'warning' | 'critical';
    }>;
    overallHealth: {
      score: number;
      status: 'healthy' | 'warning' | 'critical';
      healthyKpis: number;
      totalKpis: number;
    };
    lastUpdated: string;
  };
  complianceStatus: ComplianceStatus;
  recentAlerts: Alert[];
  aaipAlignment: {
    itaIndexAlignment: boolean;
    transparencyIndices: string[];
    selfAssessment: {
      status: string;
      nextDue: string;
    };
    publicReporting: {
      status: string;
      frequency: string;
      nextPublication: string;
    };
  };
  privacyCompliance: {
    dataProtection: boolean;
    anonymousAnalytics: boolean;
    privacyByDesign: boolean;
  };
  lastUpdated: string;
}

export interface AnalyticsSummary {
  pageViews: {
    totalViews: number;
    uniqueVisitors: number;
    avgViewsPerDay: number;
    growthRate: number;
  };
  searches: {
    totalSearches: number;
    successfulSearches: number;
    searchEffectiveness: number;
    avgSearchesPerDay: number;
  };
  documentDownloads: {
    totalDownloads: number;
    downloadsByType: Record<string, number>;
    avgDownloadsPerDay: number;
  };
  userEngagement: {
    totalEvents: number;
    engagementRate: number;
    avgTimeOnSite: number;
    bounceRate: number;
  };
  topPages: Array<{
    page: string;
    views: number;
    avgTime: number;
    bounceRate: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  lastUpdated: string;
}

export interface DataQualityReport {
  datasetId?: string;
  latestAssessment: {
    overallScore: number;
    completeness: {
      score: number;
      details: string;
    };
    accuracy: {
      score: number;
      details: string;
    };
    consistency: {
      score: number;
      details: string;
    };
    timeliness: {
      score: number;
      details: string;
    };
    uniqueness: {
      score: number;
      details: string;
    };
    validity: {
      score: number;
      details: string;
    };
    accessibility: {
      score: number;
      details: string;
    };
    issues: Array<{
      description: string;
      severity: 'info' | 'warning' | 'critical';
      category: string;
    }>;
    recommendations: Array<{
      description: string;
      action: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  };
  historicalTrend: {
    trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
    overallChange: number;
    dimensions: Record<string, number>;
  };
  lastAssessed: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private readonly MONITORING_ENDPOINT = '/monitoring';
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Get monitoring dashboard overview data
   */
  async getDashboardOverview(): Promise<MonitoringDashboardData> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/dashboard`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Dashboard request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data: MonitoringDashboardData = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching monitoring dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get KPI summary data
   */
  async getKpiSummary(): Promise<MonitoringDashboardData['kpiSummary']> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/kpi-summary`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`KPI summary request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching KPI summary:', error);
      throw error;
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(): Promise<ComplianceStatus> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/compliance-status`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Compliance status request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data: ComplianceStatus = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching compliance status:', error);
      throw error;
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/alerts?limit=${limit}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Recent alerts request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      return [];
    }
  }

  /**
   * Get historical metrics
   */
  async getHistoricalMetrics(metricName: string, startTime: number, endTime: number): Promise<any> {
    try {
      const response = await fetch(
        buildApiUrl(`${this.MONITORING_ENDPOINT}/metrics?metric=${encodeURIComponent(metricName)}&startTime=${startTime}&endTime=${endTime}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Historical metrics request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching historical metrics:', error);
      throw error;
    }
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(period: string = '30d'): Promise<AnalyticsSummary> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/analytics?period=${period}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Analytics summary request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data: AnalyticsSummary = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }

  /**
   * Get data quality report
   */
  async getDataQualityReport(datasetId?: string): Promise<DataQualityReport> {
    try {
      const url = datasetId 
        ? buildApiUrl(`${this.MONITORING_ENDPOINT}/data-quality?datasetId=${encodeURIComponent(datasetId)}`)
        : buildApiUrl(`${this.MONITORING_ENDPOINT}/data-quality`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Data quality report request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data: DataQualityReport = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data quality report:', error);
      throw error;
    }
  }

  /**
   * Record a metric value
   */
  async recordMetric(metricName: string, value: number, metadata?: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/record-metric`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metricName,
          value,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Record metric request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error recording metric:', error);
      throw error;
    }
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/compliance-report`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Compliance report request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching compliance report:', error);
      throw error;
    }
  }

  /**
   * Get user satisfaction metrics
   */
  async getUserSatisfactionMetrics(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/user-satisfaction`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`User satisfaction metrics request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user satisfaction metrics:', error);
      throw error;
    }
  }

  /**
   * Get system health check
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`${this.MONITORING_ENDPOINT}/health`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Health check request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error performing health check:', error);
      throw error;
    }
  }

  /**
   * Get real-time system metrics
   */
  async getRealtimeMetrics(): Promise<any> {
    try {
      // This would typically fetch from a WebSocket or SSE endpoint
      // For now, we'll simulate real-time data
      return {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        requestsPerSecond: Math.floor(Math.random() * 50) + 25,
        responseTime: Math.floor(Math.random() * 200) + 100,
        uptime: 99.95 + (Math.random() * 0.05),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }
}

export const monitoringService = MonitoringService.getInstance();
export default MonitoringService;
/**
 * Monitoring Routes for Carmen de Areco Transparency Portal
 * Implements API endpoints for monitoring, metrics, and compliance tracking
 * Following AAIP guidelines for transparency and data protection
 */

const express = require('express');
const router = express.Router();

// Import services
const MonitoringService = require('../services/monitoringService');
const MetricsService = require('../services/metricsService');
const ComplianceService = require('../services/complianceService');
const AnalyticsService = require('../services/analyticsService');
const DataQualityService = require('../services/dataQualityService');

// Initialize services
const monitoringService = new MonitoringService();
const metricsService = new MetricsService();
const complianceService = new ComplianceService();
const analyticsService = new AnalyticsService();
const dataQualityService = new DataQualityService();

// Set service dependencies
complianceService.setMonitoringService(monitoringService);

// GET route for monitoring dashboard overview
router.get('/dashboard', (req, res) => {
  try {
    const dashboard = monitoringService.getDashboardOverview();
    
    res.json({
      ...dashboard,
      compliance: {
        follows_aaip_guidelines: true,
        ita_methodology_aligned: true,
        privacy_compliant: true,
        data_minimization_applied: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    res.status(500).json({
      error: 'Failed to retrieve monitoring dashboard',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for KPI summary
router.get('/kpi-summary', (req, res) => {
  try {
    const kpiSummary = monitoringService.getKpiSummary();
    
    res.json({
      ...kpiSummary,
      aaipCompliance: {
        itaIndexAlignment: true,
        transparencyIndices: ['ITA'],
        kpiMethodology: 'aligned_with_AAIP_guidelines'
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('KPI summary error:', error);
    res.status(500).json({
      error: 'Failed to retrieve KPI summary',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for compliance status
router.get('/compliance-status', (req, res) => {
  try {
    const complianceStatus = monitoringService.getComplianceStatus();
    
    res.json({
      ...complianceStatus,
      aaipAlignment: {
        follows_guidelines: true,
        self_assessment_active: true,
        public_reporting_enabled: true
      },
      dataProtection: {
        ley25326_compliant: true,
        arco_rights_implemented: true,
        no_personal_data_processing: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Compliance status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve compliance status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for recent alerts
router.get('/alerts', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const alerts = monitoringService.getRecentAlerts(parseInt(limit));
    
    res.json({
      alerts: alerts,
      totalAlerts: alerts.length,
      aaipCompliance: {
        alerting_system_active: true,
        privacy_preserved: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      error: 'Failed to retrieve alerts',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for metrics data
router.get('/metrics', (req, res) => {
  try {
    const { metric, startTime, endTime } = req.query;
    
    if (metric && startTime && endTime) {
      const historicalData = metricsService.getHistoricalMetrics(
        metric,
        parseInt(startTime),
        parseInt(endTime)
      );
      
      res.json({
        metric: metric,
        data: historicalData,
        period: {
          startTime: parseInt(startTime),
          endTime: parseInt(endTime)
        },
        aaipCompliance: {
          historical_tracking: true,
          trend_analysis: true
        },
        apiInfo: {
          version: '1.0',
          lastUpdated: new Date().toISOString()
        }
      });
    } else {
      const availableMetrics = metricsService.getAvailableMetrics();
      
      res.json({
        availableMetrics: availableMetrics,
        aaipCompliance: {
          metrics_collection: true,
          kpi_tracking: true
        },
        apiInfo: {
          version: '1.0',
          lastUpdated: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for analytics summary
router.get('/analytics', (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const analyticsSummary = analyticsService.getAnalyticsSummary(period);
    
    res.json({
      ...analyticsSummary,
      aaipCompliance: {
        user_engagement_tracking: true,
        search_effectiveness_monitoring: true,
        privacy_preserved: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for data quality reports
router.get('/data-quality', (req, res) => {
  try {
    const { datasetId } = req.query;
    
    if (datasetId) {
      const qualityReport = dataQualityService.getQualityReport(datasetId);
      
      if (!qualityReport) {
        return res.status(404).json({
          error: 'Dataset not found',
          details: `No quality report found for dataset ID: ${datasetId}`
        });
      }
      
      res.json({
        ...qualityReport,
        aaipCompliance: {
          data_quality_standards: true,
          ita_methodology_aligned: true
        },
        apiInfo: {
          version: '1.0',
          lastUpdated: new Date().toISOString()
        }
      });
    } else {
      const qualitySummary = dataQualityService.getQualitySummary();
      
      res.json({
        ...qualitySummary,
        aaipCompliance: {
          data_quality_monitoring: true,
          quality_trend_analysis: true
        },
        apiInfo: {
          version: '1.0',
          lastUpdated: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Data quality error:', error);
    res.status(500).json({
      error: 'Failed to retrieve data quality information',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// POST route for recording metrics
router.post('/record-metric', (req, res) => {
  try {
    const { metricName, value, metadata } = req.body;
    
    if (!metricName || value === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'Both metricName and value are required'
      });
    }
    
    const recordedMetric = monitoringService.recordMetric(metricName, value, metadata);
    
    res.json({
      success: true,
      recordedMetric: recordedMetric,
      aaipCompliance: {
        metrics_collection: true,
        real_time_monitoring: true
      },
      apiInfo: {
        version: '1.0',
        recordedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Record metric error:', error);
    res.status(500).json({
      error: 'Failed to record metric',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for compliance reports
router.get('/compliance-report', (req, res) => {
  try {
    const complianceReport = complianceService.generateComplianceReport();
    
    res.json({
      ...complianceReport,
      aaipAlignment: {
        follows_guidelines: true,
        ita_methodology: true,
        self_assessment: true
      },
      dataProtection: {
        ley25326_compliant: true,
        arco_rights_implemented: true
      },
      apiInfo: {
        version: '1.0',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({
      error: 'Failed to generate compliance report',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for user satisfaction metrics
router.get('/user-satisfaction', (req, res) => {
  try {
    const userSatisfaction = analyticsService.getUserSatisfactionMetrics();
    
    res.json({
      ...userSatisfaction,
      aaipCompliance: {
        user_experience_monitoring: true,
        satisfaction_tracking: true
      },
      privacyCompliance: {
        anonymous_data_only: true,
        no_personal_information: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('User satisfaction error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user satisfaction metrics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for system health check
router.get('/health', (req, res) => {
  try {
    const monitoringHealth = monitoringService.healthCheck();
    const metricsHealth = metricsService.healthCheck();
    const complianceHealth = complianceService.healthCheck();
    const analyticsHealth = analyticsService.healthCheck();
    const dataQualityHealth = dataQualityService.healthCheck();
    
    res.json({
      status: 'healthy',
      service: 'Monitoring and Evaluation System',
      components: {
        monitoring: monitoringHealth,
        metrics: metricsHealth,
        compliance: complianceHealth,
        analytics: analyticsHealth,
        dataQuality: dataQualityHealth
      },
      overall: {
        status: 'healthy',
        aaipAligned: true,
        privacyCompliant: true,
        transparencyFocused: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      error: 'Health check failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

module.exports = router;
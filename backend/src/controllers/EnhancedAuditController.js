// Enhanced Audit Controller - Works with real audit data from system.py and local files
const EnhancedAuditService = require('../services/EnhancedAuditService');

class EnhancedAuditController {
  constructor() {
    this.auditService = new EnhancedAuditService();
  }

  /**
   * Get comprehensive audit overview
   */
  async getAuditOverview(req, res) {
    try {
      const result = await this.auditService.getComprehensiveAuditOverview();
      
      if (result.success) {
        res.json({
          status: 'success',
          data: result.data,
          cached: result.cached || false,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: 'error',
          error: result.error,
          fallback_data: result.fallback_data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get audit metadata only (lightweight)
   */
  async getAuditMetadata(req, res) {
    try {
      const metadata = await this.auditService.getLatestAuditMetadata();
      res.json({
        status: 'success',
        data: metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get document analysis summary
   */
  async getDocumentAnalysis(req, res) {
    try {
      const analysis = await this.auditService.getDocumentAnalysis();
      res.json({
        status: 'success',
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get financial overview from audit data
   */
  async getFinancialOverview(req, res) {
    try {
      const overview = await this.auditService.getFinancialOverview();
      res.json({
        status: 'success',
        data: overview,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(req, res) {
    try {
      const compliance = await this.auditService.getComplianceStatus();
      res.json({
        status: 'success',
        data: compliance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get red flags and irregularities
   */
  async getRedFlags(req, res) {
    try {
      const redFlags = await this.auditService.getRedFlags();
      res.json({
        status: 'success',
        data: redFlags,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get peer comparison data
   */
  async getPeerComparison(req, res) {
    try {
      const comparison = await this.auditService.getPeerComparison();
      res.json({
        status: 'success',
        data: comparison,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get data sources information
   */
  async getDataSources(req, res) {
    try {
      const sources = await this.auditService.getDataSources();
      res.json({
        status: 'success',
        data: sources,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get online verification status
   */
  async getOnlineVerification(req, res) {
    try {
      const verification = await this.auditService.getOnlineVerificationStatus();
      res.json({
        status: 'success',
        data: verification,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Health check for audit system
   */
  async healthCheck(req, res) {
    try {
      const health = {
        system_status: 'operational',
        services: {
          audit_service: 'active',
          local_databases: 'accessible',
          document_repositories: 'accessible'
        },
        last_audit: await this.auditService.getLatestAuditMetadata(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      res.json({
        status: 'success',
        data: health
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = EnhancedAuditController;
// Vendor Relationship Controller
const VendorRelationshipService = require('../services/VendorRelationshipService');
const { handleError, handleSuccess } = require('../utils/responseHandlers');

class VendorRelationshipController {
  constructor() {
    this.vendorRelationshipService = new VendorRelationshipService();
    
    // Bind methods to preserve 'this' context
    this.analyzeVendor = this.analyzeVendor.bind(this);
    this.generateVendorReport = this.generateVendorReport.bind(this);
    this.validateVendorData = this.validateVendorData.bind(this);
  }

  /**
   * Analyze vendor relationships for potential conflicts and risks
   */
  async analyzeVendor(req, res) {
    try {
      console.log('🔍 Analyzing vendor relationship...');
      
      const { vendorData } = req.body;
      
      if (!vendorData) {
        return res.status(400).json({
          success: false,
          error: 'Vendor data is required for analysis'
        });
      }

      const result = await this.vendorRelationshipService.analyzeVendorRelationships(vendorData);
      
      if (result.success) {
        return handleSuccess(res, result.analysis, 'Vendor analysis completed successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error analyzing vendor relationship');
      }
    } catch (error) {
      console.error('Error in analyzeVendor:', error);
      return handleError(res, error, 'Internal server error while analyzing vendor relationship');
    }
  }

  /**
   * Generate comprehensive vendor relationship report 
   */
  async generateVendorReport(req, res) {
    try {
      console.log('📋 Generating vendor relationship report...');
      
      const { vendorData } = req.body;
      
      if (!vendorData) {
        return res.status(400).json({
          success: false,
          error: 'Vendor data is required for report generation'
        });
      }

      const result = await this.vendorRelationshipService.generateVendorReport(vendorData);
      
      if (result.success) {
        return handleSuccess(res, result.report, 'Vendor report generated successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error generating vendor report');
      }
    } catch (error) {
      console.error('Error in generateVendorReport:', error);
      return handleError(res, error, 'Internal server error while generating vendor report');
    }
  }

  /**
   * Validate vendor data against established criteria
   */
  async validateVendorData(req, res) {
    try {
      console.log('✅ Validating vendor data...');
      
      const { vendorData } = req.body;
      
      if (!vendorData) {
        return res.status(400).json({
          success: false,
          error: 'Vendor data is required for validation'
        });
      }

      const validationResult = this.vendorRelationshipService.validateVendorData(vendorData);
      
      return handleSuccess(res, validationResult, 'Vendor data validation completed');
    } catch (error) {
      console.error('Error in validateVendorData:', error);
      return handleError(res, error, 'Internal server error while validating vendor data');
    }
  }

  /**
   * Get current vendor relationship system status
   */
  async getSystemStatus(req, res) {
    try {
      console.log('📊 Getting vendor relationship system status...');
      
      const status = {
        serviceStatus: 'active',
        timestamp: new Date().toISOString(),
        configuration: this.vendorRelationshipService.relationshipThresholds
      };
      
      return handleSuccess(res, status, 'Vendor relationship system status retrieved successfully');
    } catch (error) {
      console.error('Error in getSystemStatus:', error);
      return handleError(res, error, 'Internal server error while retrieving system status');
    }
  }
}

module.exports = VendorRelationshipController;

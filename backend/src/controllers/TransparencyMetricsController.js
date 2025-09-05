const TransparencyMetricsService = require('../services/TransparencyMetricsService');
const { handleError, handleSuccess } = require('../utils/responseHandlers');
const { validateYear, validateYearArray } = require('../utils/validators');

class TransparencyMetricsController {
  constructor() {
    this.transparencyService = new TransparencyMetricsService();
    
    // Bind methods to preserve 'this' context
    this.getTransparencyScore = this.getTransparencyScore.bind(this);
    this.getRedFlagAlerts = this.getRedFlagAlerts.bind(this);
    this.getTransparencyTrends = this.getTransparencyTrends.bind(this);
  }

  /**
   * Get transparency score for a specific year
   */
  async getTransparencyScore(req, res) {
    try {
      const year = parseInt(req.params.year);
      
      const validation = validateYear(year);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.message
        });
      }

      console.log(`📊 Calculating transparency score for year ${year}...`);
      const score = await this.transparencyService.calculateTransparencyScore(year);
      
      return handleSuccess(res, score, 'Transparency score calculated successfully');

    } catch (error) {
      console.error('Error calculating transparency score:', error);
      return handleError(res, error, 'Error calculating transparency score');
    }
  }

  /**
   * Get red flag alerts for a specific year
   */
  async getRedFlagAlerts(req, res) {
    try {
      const year = parseInt(req.params.year);
      
      const validation = validateYear(year);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.message
        });
      }

      console.log(`🚨 Generating red flag alerts for year ${year}...`);
      const alerts = await this.transparencyService.generateRedFlagAlerts(year);
      
      return handleSuccess(res, alerts, 'Red flag alerts generated successfully');

    } catch (error) {
      console.error('Error generating red flag alerts:', error);
      return handleError(res, error, 'Error generating red flag alerts');
    }
  }

  /**
   * Compare transparency trends across multiple years
   */
  async getTransparencyTrends(req, res) {
    try {
      const yearsParam = req.query.years;
      let years = [2024, 2023, 2022]; // Default years
      
      if (yearsParam) {
        years = yearsParam.split(',').map(y => parseInt(y));
        const validation = validateYearArray(years);
        
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: validation.message
          });
        }
      }

      console.log(`📈 Comparing transparency trends for years: ${years.join(', ')}`);
      const trends = await this.transparencyService.compareTransparencyTrends(years);
      
      return handleSuccess(res, trends, 'Transparency trends calculated successfully');

    } catch (error) {
      console.error('Error comparing transparency trends:', error);
      return handleError(res, error, 'Error comparing transparency trends');
    }
  }
}

module.exports = TransparencyMetricsController;
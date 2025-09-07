// Contractor Performance Dashboard Service
class ContractorPerformanceDashboardService {
  constructor() {
    // Configuration for contractor performance dashboard  
    this.performanceThresholds = {
      onTimeCompletion: 90, // 90% of projects completed on time
      budgetAdherence: 5,    // Within 5% of estimated budget
      qualityRating: 4.0,    // Minimum average quality rating (out of 5)
      riskScoreThreshold: 70, // Risk score threshold requiring attention
      performancePeriod: 'annual' // Performance analysis period (monthly, quarterly, annual)
    };
    
    this.riskCategories = [
      'High Risk', 
      'Medium Risk',
      'Low Risk'
    ];
  }

  /**
   * Calculate contractor performance metrics for dashboard display
   * @param {Object} contractorData - Contractor data including project history
   * @returns {Object} Performance dashboard metrics and analytics 
   */
  async calculateContractorPerformance(contractorData) {
    try {
      const performanceMetrics = {
        contractorId: contractorData.id,
        contractorName: contractorData.name,
        totalProjects: contractorData.projects ? contractorData.projects.length : 0,
        completedProjects: 0,
        onTimeCompletionRate: 0,
        budgetVariancePercentage: 0,
        qualityRating: 0,
        riskScore: 0,
        recommendations: [],
        timestamp: new Date().toISOString(),
        rating: 'Good'
      };

      if (!contractorData.projects || contractorData.projects.length === 0) {
        return {
          success: true,
          performance: performanceMetrics
        };
      }

      // Calculate completed projects (projects with completion date)
      const completedProjects = contractorData.projects.filter(project => 
        project.actual_completion && new Date(project.actual_completion) <= new Date(project.scheduled_completion)
      );
      
      performanceMetrics.completedProjects = completedProjects.length;
      
      // Calculate on-time completion rate
      if (contractorData.projects.length > 0) {
        performanceMetrics.onTimeCompletionRate = 
          (completedProjects.length / contractorData.projects.length) * 100;
      }

      // Calculate average budget variance
      let totalBudgetVariance = 0;
      contractorData.projects.forEach(project => {
        if (project.budgeted_amount && project.actual_spent) {
          const variance = ((project.actual_spent - project.budgeted_amount) / project.budgeted_amount) * 100;
          totalBudgetVariance += variance;
        }
      });
      
      performanceMetrics.budgetVariancePercentage = 
        contractorData.projects.length > 0 ? totalBudgetVariance / contractorData.projects.length : 0;

      // Calculate quality rating (if provided)
      const projectRatings = contractorData.projects
        .filter(project => project.quality_rating !== undefined)
        .map(project => project.quality_rating);
      
      if (projectRatings.length > 0) {
        const avgQuality = projectRatings.reduce((sum, rating) => sum + rating, 0) / projectRatings.length;
        performanceMetrics.qualityRating = parseFloat(avgQuality.toFixed(2));
      }

      // Calculate risk score based on multiple factors
      performanceMetrics.riskScore = this.calculateRiskScore(performanceMetrics);

      // Determine overall rating
      performanceMetrics.rating = this.determinePerformanceRating(performanceMetrics);

      // Generate recommendations based on poor performance indicators
      const recommendations = [];
      
      if (performanceMetrics.onTimeCompletionRate < this.performanceThresholds.onTimeCompletion) {
        recommendations.push({
          type: 'timeliness',
          severity: performanceMetrics.onTimeCompletionRate < 70 ? 'high' : 'medium',
          message: `Contractor has completed only ${performanceMetrics.onTimeCompletionRate.toFixed(1)}% of projects on time`,
          recommendation: 'Implement closer project monitoring'
        });
      }
      
      if (Math.abs(performanceMetrics.budgetVariancePercentage) > this.performanceThresholds.budgetAdherence) {
        recommendations.push({
          type: 'budget',
          severity: Math.abs(performanceMetrics.budgetVariancePercentage) > 10 ? 'high' : 'medium',
          message: `Contractor has budget variances of ${performanceMetrics.budgetVariancePercentage.toFixed(1)}%`,
          recommendation: 'Require detailed budget variance justification'
        });
      }
      
      if (performanceMetrics.qualityRating < this.performanceThresholds.qualityRating) {
        recommendations.push({
          type: 'quality',
          severity: performanceMetrics.qualityRating < 3.0 ? 'high' : 'medium',
          message: `Average quality rating of ${performanceMetrics.qualityRating} is below threshold`,
          recommendation: 'Implement enhanced quality control measures'
        });
      }

      performanceMetrics.recommendations = recommendations;

      return {
        success: true,
        performance: performanceMetrics
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate risk score for contractor based on performance factors
   */
  calculateRiskScore(performanceMetrics) {
    let riskScore = 0;

    // On-time completion: weight 35%
    const onTimeFactor = (100 - performanceMetrics.onTimeCompletionRate) * 0.35;
    
    // Budget variance: weight 25%
    const budgetFactor = Math.abs(performanceMetrics.budgetVariancePercentage) * 0.25;
    
    // Quality rating: weight 25%
    const qualityFactor = performanceMetrics.qualityRating > 0 ? 
      (5 - performanceMetrics.qualityRating) * 20 * 0.25 : 0;
    
    // Project count factor: weight 15%
    const projectFactor = performanceMetrics.totalProjects < 5 ? 15 * 0.15 : 0;

    riskScore = onTimeFactor + budgetFactor + qualityFactor + projectFactor;
    
    return Math.min(Math.max(riskScore, 0), 100);
  }

  /**
   * Determine overall performance rating based on metrics
   */
  determinePerformanceRating(performanceMetrics) {
    if (performanceMetrics.riskScore > 70) {
      return 'Poor';
    } else if (performanceMetrics.riskScore > 40) {
      return 'Fair';
    } else if (performanceMetrics.riskScore > 20) {
      return 'Good';
    } else {
      return 'Excellent';
    }
  }

  /**
   * Generate contractor performance dashboard data
   */
  async generateDashboardData(contractorsData) {
    try {
      const dashboardData = {
        totalContractors: contractorsData.length,
        performanceMetrics: [],
        riskDistribution: { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0 },
        averageMetrics: {
          onTimeCompletionRate: 0,
          budgetVariancePercentage: 0,
          qualityRating: 0
        },
        timestamp: new Date().toISOString()
      };

      for (const contractor of contractorsData) {
        const performance = await this.calculateContractorPerformance(contractor);
        if (performance.success) {
          dashboardData.performanceMetrics.push(performance.performance);
          
          // Update risk distribution
          if (performance.performance.riskScore > 70) {
            dashboardData.riskDistribution['High Risk']++;
          } else if (performance.performance.riskScore > 40) {
            dashboardData.riskDistribution['Medium Risk']++;
          } else {
            dashboardData.riskDistribution['Low Risk']++;
          }
        }
      }

      // Calculate averages
      if (dashboardData.performanceMetrics.length > 0) {
        dashboardData.averageMetrics.onTimeCompletionRate = 
          dashboardData.performanceMetrics.reduce((sum, metric) => sum + metric.onTimeCompletionRate, 0) / 
          dashboardData.performanceMetrics.length;
        
        dashboardData.averageMetrics.budgetVariancePercentage = 
          dashboardData.performanceMetrics.reduce((sum, metric) => sum + Math.abs(metric.budgetVariancePercentage), 0) / 
          dashboardData.performanceMetrics.length;
        
        const ratingsWithValues = dashboardData.performanceMetrics.filter(metric => metric.qualityRating > 0);
        if (ratingsWithValues.length > 0) {
          dashboardData.averageMetrics.qualityRating = 
            ratingsWithValues.reduce((sum, metric) => sum + metric.qualityRating, 0) / ratingsWithValues.length;
        }
      }

      return {
        success: true,
        data: dashboardData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ContractorPerformanceDashboardService;
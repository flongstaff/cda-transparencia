// Vendor Relationship Service
class VendorRelationshipService {
  constructor() {
    // Configuration for vendor relationship management
    this.relationshipThresholds = {
      contractValue: 100000, // Threshold for requiring detailed vendor analysis
      annualSpending: 500000, // Threshold for vendor review requirements
      riskScoreThreshold: 70 // Risk score threshold that requires attention
    };
    
    this.vendorCategories = [
      'Construction', 
      'Consulting', 
      'Technology', 
      'Supply Chain',
      'Professional Services'
    ];
  }

  /**
   * Analyze vendor relationships for potential issues
   * @param {Object} vendorData - Vendor data to analyze 
   * @returns {Object} Risk analysis and recommendations
   */
  async analyzeVendorRelationships(vendorData) {
    try {
      const analysis = {
        vendorId: vendorData.id,
        vendorName: vendorData.name,
        riskScore: 0,
        potentialConflicts: [],
        recommendations: [],
        analysisTimestamp: new Date().toISOString()
      };

      // Calculate risk score based on multiple factors
      analysis.riskScore = this.calculateVendorRisk(vendorData);
      
      // Check for potential conflicts of interest
      const conflictAnalysis = this.checkForConflicts(vendorData);
      analysis.potentialConflicts = conflictAnalysis.conflicts;
      
      // Generate recommendations based on risk and conflicts
      analysis.recommendations = this.generateRecommendations(analysis, vendorData);
      
      return {
        success: true,
        analysis: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate risk score for vendor based on various factors
   */
  calculateVendorRisk(vendorData) {
    let riskScore = 0;
    
    // Factor 1: Contract value (higher values increase risk)
    const contractValueFactor = vendorData.totalContracts ? 
      Math.min(100, (vendorData.totalContracts / 500000)) : 0;
    
    // Factor 2: Annual spending (higher spending increases risk)
    const annualSpendingFactor = vendorData.annualSpending ? 
      Math.min(100, (vendorData.annualSpending / 2000000)) : 0;
    
    // Factor 3: Number of contracts (more contracts = higher risk profile)
    const contractCountFactor = vendorData.totalContracts ? 
      Math.min(100, (vendorData.totalContracts * 5)) : 0;
    
    // Factor 4: Duration of relationship (longer relationships may increase risk)
    const relationshipDurationFactor = vendorData.yearsOfRelationship ? 
      Math.min(100, (vendorData.yearsOfRelationship * 10)) : 0;
    
    // Factor 5: Compliance history (penalize poor compliance)
    const complianceFactor = vendorData.complianceScore ? 
      Math.max(0, 100 - (vendorData.complianceScore * 10)) : 0;
    
    riskScore = contractValueFactor + annualSpendingFactor + 
                contractCountFactor + relationshipDurationFactor + complianceFactor;
    
    // Normalize to 0-100 scale
    riskScore = Math.min(100, riskScore);
    
    return Math.round(riskScore * 100) / 100; // Round to two decimal places
  }

  /**
   * Check for potential conflicts of interest in vendor relationships
   */
  checkForConflicts(vendorData) {
    const conflicts = [];
    
    // Check if vendor has affiliations with officials
    if (vendorData.affiliations) {
      const officialAffiliations = vendorData.affiliations.filter(
        aff => aff.type === 'official' || aff.type === 'public_official'
      );
      
      if (officialAffiliations.length > 0) {
        conflicts.push({
          type: 'affiliation_conflict',
          details: `Vendor has ${officialAffiliations.length} official affiliations`,
          severity: 'high'
        });
      }
    }
    
    // Check for geographic proximity to key officials
    if (vendorData.location && vendorData.proximityToOfficials) {
      const proximityConflicts = vendorData.proximityToOfficials.filter(
        official => official.distanceInKm < 50 // Within 50km 
      );
      
      if (proximityConflicts.length > 0) {
        conflicts.push({
          type: 'geographic_conflict', 
          details: `Vendor located near ${proximityConflicts.length} officials`,
          severity: 'medium'
        });
      }
    }

    // Check for shared board members or ownership
    if (vendorData.ownership && vendorData.ownership.sharedMembers) {
      const sharedOwnership = vendorData.ownership.sharedMembers;
      if (sharedOwnership.length > 0) {
        conflicts.push({
          type: 'ownership_conflict',
          details: `Vendor shares ${sharedOwnership.length} board members with officials`,
          severity: 'high'
        });
      }
    }

    return {
      conflicts: conflicts,
      hasConflicts: conflicts.length > 0
    };
  }

  /**
   * Generate recommendations based on vendor analysis results
   */
  generateRecommendations(analysis, vendorData) {
    const recommendations = [];
    
    // Risk-based recommendations
    if (analysis.riskScore > this.relationshipThresholds.riskScoreThreshold) {
      recommendations.push({
        type: 'risk_assessment',
        severity: 'high',
        actionRequired: true,
        recommendation: `High risk vendor (${analysis.riskScore}%) requires additional due diligence`,
        priority: 'critical'
      });
    } else if (analysis.riskScore > 60) {
      recommendations.push({
        type: 'risk_assessment',
        severity: 'medium', 
        actionRequired: true,
        recommendation: `Moderate risk vendor (${analysis.riskScore}%) needs monitoring`,
        priority: 'high'
      });
    }
    
    // Conflict-based recommendations
    if (analysis.potentialConflicts && analysis.potentialConflicts.length > 0) {
      const conflictTypes = [...new Set(analysis.potentialConflicts.map(c => c.type))];
      recommendations.push({
        type: 'conflict_check',
        severity: analysis.potentialConflicts.find(c => c.severity === 'high') ? 'high' : 'medium',
        actionRequired: true,
        recommendation: `Vendor has ${analysis.potentialConflicts.length} potential conflict${analysis.potentialConflicts.length > 1 ? 's' : ''} - review required`,
        priority: analysis.potentialConflicts.some(c => c.severity === 'high') ? 'critical' : 'high'
      });
    }
    
    // Contract value recommendations
    if (vendorData.totalContracts && vendorData.totalContracts > this.relationshipThresholds.contractValue) {
      recommendations.push({
        type: 'contract_value',
        severity: vendorData.totalContracts > 1000000 ? 'high' : 'medium',
        actionRequired: true,
        recommendation: `Vendor contract total ($${vendorData.totalContracts.toLocaleString()}) exceeds threshold - requires approval`,
        priority: vendorData.totalContracts > 1000000 ? 'critical' : 'high'
      });
    }
    
    return recommendations;
  }

  /**
   * Get comprehensive vendor relationship report
   */
  async generateVendorReport(vendorData) {
    try {
      const analysis = await this.analyzeVendorRelationships(vendorData);
      
      if (!analysis.success) {
        return analysis;
      }

      const report = {
        vendorInfo: {
          id: vendorData.id,
          name: vendorData.name,
          category: vendorData.category || null,
          location: vendorData.location
        },
        riskAssessment: {
          score: analysis.analysis.riskScore,
          level: this.determineRiskLevel(analysis.analysis.riskScore),
          timestamp: analysis.analysis.analysisTimestamp
        },
        conflicts: analysis.analysis.potentialConflicts,
        recommendations: analysis.analysis.recommendations,
        complianceHistory: vendorData.complianceScore || 0,
        contractSummary: {
          totalContracts: vendorData.totalContracts || 0,
          annualSpending: vendorData.annualSpending || 0
        }
      };

      return {
        success: true,
        report: report
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Determine risk level based on score
   */
  determineRiskLevel(score) {
    if (score >= 90) return 'Very High';
    if (score >= 75) return 'High'; 
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low';
    return 'Very Low';
  }

  /**
   * Validate vendor relationship data against established criteria
   */
  validateVendorData(vendorData) {
    const validation = {
      isValid: true,
      issues: []
    };

    // Check required fields
    if (!vendorData.id) {
      validation.isValid = false;
      validation.issues.push('Vendor ID is required');
    }
    
    if (!vendorData.name) {
      validation.isValid = false;
      validation.issues.push('Vendor name is required');
    }

    // Check for any suspicious patterns
    if (vendorData.totalContracts && vendorData.totalContracts < 0) {
      validation.issues.push('Contract total cannot be negative');
    }

    return validation;
  }
}

module.exports = VendorRelationshipService;

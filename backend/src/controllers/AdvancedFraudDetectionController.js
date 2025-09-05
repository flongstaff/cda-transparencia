const AdvancedFraudDetectionService = require('../services/AdvancedFraudDetectionService');

class AdvancedFraudDetectionController {
  constructor() {
    this.advancedFraudService = new AdvancedFraudDetectionService();
  }

  async getSignatureIrregularities(req, res) {
    try {
      const { year, official } = req.params;
      const { include_evidence = true } = req.query;

      if (!year || isNaN(parseInt(year))) {
        return res.status(400).json({
          error: 'Valid year parameter is required'
        });
      }

      const result = await this.advancedFraudService.detectSignatureIrregularities(
        parseInt(year),
        official,
        include_evidence === 'true'
      );

      res.json({
        detection_type: 'signature_irregularities',
        year: parseInt(year),
        official: official || 'all',
        ...result,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error detecting signature irregularities:', error);
      res.status(500).json({
        error: 'Error detecting signature irregularities',
        details: error.message
      });
    }
  }

  async getInfrastructureFraudAnalysis(req, res) {
    try {
      const { year } = req.params;
      const { detailed = true } = req.query;

      if (!year || isNaN(parseInt(year))) {
        return res.status(400).json({
          error: 'Valid year parameter is required'
        });
      }

      const result = await this.advancedFraudService.detectInfrastructureFraud(
        parseInt(year),
        detailed === 'true'
      );

      res.json({
        detection_type: 'infrastructure_fraud',
        year: parseInt(year),
        ...result,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error analyzing infrastructure fraud:', error);
      res.status(500).json({
        error: 'Error analyzing infrastructure fraud',
        details: error.message
      });
    }
  }

  async getSophisticatedEvasionPatterns(req, res) {
    try {
      const { years } = req.query;
      const yearList = years ? years.split(',').map(y => parseInt(y.trim())) : [2023, 2024, 2025];

      const result = await this.advancedFraudService.detectSophisticatedEvasionPatterns(yearList);

      res.json({
        detection_type: 'sophisticated_evasion_patterns',
        analysis_years: yearList,
        ...result,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error detecting evasion patterns:', error);
      res.status(500).json({
        error: 'Error detecting sophisticated evasion patterns',
        details: error.message
      });
    }
  }

  async getFraudInvestigationReport(req, res) {
    try {
      const { year } = req.params;
      const { include_recommendations = true, priority_only = false } = req.query;

      if (!year || isNaN(parseInt(year))) {
        return res.status(400).json({
          error: 'Valid year parameter is required'
        });
      }

      const result = await this.advancedFraudService.generateInvestigationReport(
        parseInt(year),
        {
          includeRecommendations: include_recommendations === 'true',
          priorityOnly: priority_only === 'true'
        }
      );

      res.json({
        report_type: 'fraud_investigation',
        year: parseInt(year),
        ...result,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating fraud investigation report:', error);
      res.status(500).json({
        error: 'Error generating fraud investigation report',
        details: error.message
      });
    }
  }

  async getForensicAnalysis(req, res) {
    try {
      const { documentId } = req.params;
      const { analysis_type = 'comprehensive' } = req.query;

      if (!documentId) {
        return res.status(400).json({
          error: 'Document ID parameter is required'
        });
      }

      const result = await this.advancedFraudService.performForensicAnalysis(
        documentId,
        analysis_type
      );

      res.json({
        analysis_type: 'forensic_document_analysis',
        document_id: documentId,
        ...result,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error performing forensic analysis:', error);
      res.status(500).json({
        error: 'Error performing forensic analysis',
        details: error.message
      });
    }
  }

  async getAdvancedFraudDashboard(req, res) {
    try {
      const { years = '2023,2024,2025' } = req.query;
      const yearList = years.split(',').map(y => parseInt(y.trim()));

      // Get comprehensive advanced fraud analysis
      const [
        signatureAnalysis,
        infrastructureAnalysis,
        evasionPatterns
      ] = await Promise.all([
        this.advancedFraudService.detectSignatureIrregularities(2024),
        this.advancedFraudService.detectInfrastructureFraud(2024),
        this.advancedFraudService.detectSophisticatedEvasionPatterns(yearList)
      ]);

      // Calculate overall risk assessment
      const overallRisk = this._calculateOverallRisk([
        signatureAnalysis,
        infrastructureAnalysis,
        evasionPatterns
      ]);

      const dashboardData = {
        system_status: 'advanced_fraud_detection_active',
        overall_risk_level: overallRisk.level,
        risk_score: overallRisk.score,
        analysis_summary: {
          signature_irregularities: {
            detected_count: signatureAnalysis.irregularities?.length || 0,
            high_priority_count: signatureAnalysis.irregularities?.filter(i => i.severity === 'high').length || 0,
            alicia_batallon_case: signatureAnalysis.irregularities?.find(i => 
              i.official_name?.toLowerCase().includes('alicia_batallon') || 
              i.official_name?.toLowerCase().includes('batallon')
            ) ? 'detected' : 'monitoring'
          },
          infrastructure_fraud: {
            detected_instances: infrastructureAnalysis.fraud_indicators?.length || 0,
            financial_impact: infrastructureAnalysis.total_impact || 0,
            national_compliance: infrastructureAnalysis.compliance_status || 'under_review'
          },
          evasion_patterns: {
            sophisticated_techniques: evasionPatterns.detected_patterns?.length || 0,
            concealment_methods: evasionPatterns.concealment_indicators?.length || 0,
            pattern_complexity: evasionPatterns.complexity_score || 0
          }
        },
        priority_investigations: this._getPriorityInvestigations([
          signatureAnalysis,
          infrastructureAnalysis,
          evasionPatterns
        ]),
        legal_implications: {
          potential_criminal_violations: this._identifyPotentialViolations([
            signatureAnalysis,
            infrastructureAnalysis,
            evasionPatterns
          ]),
          evidence_strength: overallRisk.evidence_strength,
          recommended_actions: this._getRecommendedActions(overallRisk)
        },
        monitoring_status: {
          active_surveillance: true,
          detection_algorithms: 'enhanced',
          data_sources: ['pdf_documents', 'signature_analysis', 'financial_records', 'powerbi_comparison'],
          last_analysis: new Date().toISOString()
        }
      };

      res.json(dashboardData);

    } catch (error) {
      console.error('Error generating advanced fraud dashboard:', error);
      res.status(500).json({
        error: 'Error generating advanced fraud detection dashboard',
        details: error.message
      });
    }
  }

  _calculateOverallRisk(analyses) {
    let totalScore = 0;
    let evidenceStrength = 'low';
    
    analyses.forEach(analysis => {
      if (analysis.risk_score) {
        totalScore += analysis.risk_score;
      }
      if (analysis.evidence_level === 'high' || analysis.confidence_level === 'high') {
        evidenceStrength = 'high';
      } else if (analysis.evidence_level === 'medium' && evidenceStrength !== 'high') {
        evidenceStrength = 'medium';
      }
    });

    const avgScore = totalScore / analyses.length;
    let level = 'low';
    
    if (avgScore >= 80) level = 'critical';
    else if (avgScore >= 60) level = 'high';
    else if (avgScore >= 40) level = 'medium';

    return {
      score: Math.round(avgScore),
      level,
      evidence_strength: evidenceStrength
    };
  }

  _getPriorityInvestigations(analyses) {
    const investigations = [];

    // Check for Alicia Batallon signature substitution
    const signatureAnalysis = analyses[0];
    if (signatureAnalysis?.irregularities?.some(i => 
      i.official_name?.toLowerCase().includes('batallon') && i.severity === 'high'
    )) {
      investigations.push({
        case_id: 'CDA-2024-001',
        title: 'Alicia Batallon Signature Substitution Investigation',
        priority: 'critical',
        status: 'active',
        estimated_impact: 'high',
        legal_implications: 'document_forgery_administrative_fraud'
      });
    }

    // Check for infrastructure fund malversion
    const infrastructureAnalysis = analyses[1];
    if (infrastructureAnalysis?.fraud_indicators?.length > 0) {
      investigations.push({
        case_id: 'CDA-2024-002',
        title: 'Infrastructure Fund Malversion Investigation',
        priority: 'critical',
        status: 'active',
        estimated_impact: 'severe',
        legal_implications: 'malversion_of_public_funds'
      });
    }

    return investigations;
  }

  _identifyPotentialViolations(analyses) {
    const violations = [];
    
    if (analyses[0]?.irregularities?.length > 0) {
      violations.push({
        type: 'document_forgery',
        code: 'Article 292 - Penal Code',
        description: 'Falsification of public documents'
      });
    }
    
    if (analyses[1]?.fraud_indicators?.length > 0) {
      violations.push({
        type: 'malversion_of_funds',
        code: 'Article 260 - Penal Code',
        description: 'Malversion of public funds'
      });
    }
    
    return violations;
  }

  _getRecommendedActions(riskAssessment) {
    const actions = [];
    
    if (riskAssessment.level === 'critical' || riskAssessment.level === 'high') {
      actions.push('Immediate forensic audit of identified documents');
      actions.push('Legal consultation for potential criminal proceedings');
      actions.push('Enhanced monitoring of all signature processes');
    }
    
    if (riskAssessment.evidence_strength === 'high') {
      actions.push('Prepare evidence package for judicial authorities');
      actions.push('Implement document authentication protocols');
    }
    
    actions.push('Continue systematic monitoring of all municipal processes');
    
    return actions;
  }
}

module.exports = AdvancedFraudDetectionController;
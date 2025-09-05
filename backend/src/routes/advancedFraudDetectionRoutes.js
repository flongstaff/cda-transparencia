const express = require('express');
const router = express.Router();
const AdvancedFraudDetectionController = require('../controllers/AdvancedFraudDetectionController');
const rateLimit = require('express-rate-limit');

// Rate limiting for advanced fraud detection endpoints (more restrictive due to computational intensity)
const fraudDetectionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { 
    error: 'Too many fraud detection requests, please try again later.',
    retry_after: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize controller
const controller = new AdvancedFraudDetectionController();

// Advanced fraud detection dashboard - comprehensive overview
router.get('/dashboard', fraudDetectionLimiter, async (req, res) => {
  await controller.getAdvancedFraudDashboard(req, res);
});

// Signature irregularity detection endpoints
router.get('/signatures/:year', fraudDetectionLimiter, async (req, res) => {
  await controller.getSignatureIrregularities(req, res);
});

router.get('/signatures/:year/:official', fraudDetectionLimiter, async (req, res) => {
  await controller.getSignatureIrregularities(req, res);
});

// Infrastructure fraud analysis
router.get('/infrastructure/:year', fraudDetectionLimiter, async (req, res) => {
  await controller.getInfrastructureFraudAnalysis(req, res);
});

// Sophisticated evasion pattern detection
router.get('/evasion-patterns', fraudDetectionLimiter, async (req, res) => {
  await controller.getSophisticatedEvasionPatterns(req, res);
});

// Comprehensive fraud investigation report
router.get('/investigation-report/:year', fraudDetectionLimiter, async (req, res) => {
  await controller.getFraudInvestigationReport(req, res);
});

// Forensic document analysis
router.get('/forensic/:documentId', fraudDetectionLimiter, async (req, res) => {
  await controller.getForensicAnalysis(req, res);
});

// Specific case endpoints for known issues
router.get('/cases/alicia-batallon', fraudDetectionLimiter, async (req, res) => {
  try {
    // Specific endpoint for Alicia Batallon signature substitution case
    const years = [2023, 2024];
    const results = {};
    
    for (const year of years) {
      results[year] = await controller.advancedFraudService.detectSignatureIrregularities(
        year, 
        'alicia_batallon', 
        true
      );
    }
    
    res.json({
      case_name: 'alicia_batallon_signature_substitution',
      investigation_status: 'active',
      years_analyzed: years,
      findings: results,
      legal_implications: [
        'Potential document forgery (Article 292 - Penal Code)',
        'Administrative fraud',
        'Unauthorized representation'
      ],
      recommended_actions: [
        'Forensic signature analysis',
        'Cross-reference with official authorization records',
        'Interview involved parties',
        'Secure original documents for evidence'
      ],
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing Alicia Batallon case:', error);
    res.status(500).json({
      error: 'Error analyzing Alicia Batallon signature substitution case',
      details: error.message
    });
  }
});

router.get('/cases/infrastructure-malversion', fraudDetectionLimiter, async (req, res) => {
  try {
    // Specific endpoint for infrastructure fund malversion case
    const years = [2023, 2024];
    const results = {};
    
    for (const year of years) {
      results[year] = await controller.advancedFraudService.detectInfrastructureFraud(year, true);
    }
    
    res.json({
      case_name: 'infrastructure_fund_malversion',
      investigation_status: 'active',
      national_government_action: 'fine_issued',
      years_analyzed: years,
      findings: results,
      legal_implications: [
        'Malversion of public funds (Article 260 - Penal Code)',
        'Failure to execute infrastructure projects',
        'Violation of national compliance requirements'
      ],
      financial_impact: {
        estimated_diverted_funds: 'Under investigation',
        unexecuted_projects: 'Infrastructure development programs',
        national_fine_status: 'Issued by National Government'
      },
      recommended_actions: [
        'Complete audit of infrastructure fund allocation',
        'Track fund disbursement and execution',
        'Verify project completion status',
        'Coordinate with national oversight bodies'
      ],
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing infrastructure malversion case:', error);
    res.status(500).json({
      error: 'Error analyzing infrastructure fund malversion case',
      details: error.message
    });
  }
});

// System status and health check
router.get('/system-status', async (req, res) => {
  try {
    res.json({
      system_name: 'Advanced Fraud Detection System',
      status: 'operational',
      capabilities: [
        'Signature irregularity detection',
        'Infrastructure fund malversion tracking',
        'Sophisticated evasion pattern analysis',
        'Forensic document analysis',
        'Multi-year trend analysis',
        'Legal compliance monitoring'
      ],
      active_investigations: [
        'alicia_batallon_signature_substitution',
        'infrastructure_fund_malversion'
      ],
      detection_algorithms: 'enhanced',
      data_sources: [
        'pdf_document_analysis',
        'signature_pattern_matching',
        'financial_flow_tracking',
        'powerbi_data_comparison',
        'cross_validation_systems'
      ],
      legal_framework: [
        'Argentine Penal Code Articles 260, 292',
        'Administrative fraud regulations',
        'Public fund management laws'
      ],
      last_update: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({
      error: 'Error retrieving advanced fraud detection system status',
      details: error.message
    });
  }
});

module.exports = router;
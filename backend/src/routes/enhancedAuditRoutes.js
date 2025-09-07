// Enhanced Audit Routes - Routes for real audit data from system.py and local files
const express = require('express');
const router = express.Router();
const EnhancedAuditController = require('../controllers/EnhancedAuditController');

const auditController = new EnhancedAuditController();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditOverview:
 *       type: object
 *       properties:
 *         audit_metadata:
 *           type: object
 *         document_analysis:
 *           type: object
 *         financial_overview:
 *           type: object
 *         compliance_status:
 *           type: object
 *         red_flags:
 *           type: object
 *         peer_comparison:
 *           type: object
 */

/**
 * @swagger
 * /api/audit/overview:
 *   get:
 *     summary: Get comprehensive audit overview from all sources
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Complete audit overview including all data sources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AuditOverview'
 *                 cached:
 *                   type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/overview', auditController.getAuditOverview.bind(auditController));

/**
 * @swagger
 * /api/audit/metadata:
 *   get:
 *     summary: Get audit metadata (lightweight)
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Latest audit metadata
 */
router.get('/metadata', auditController.getAuditMetadata.bind(auditController));

/**
 * @swagger
 * /api/audit/documents:
 *   get:
 *     summary: Get document analysis summary
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Document analysis from organized analysis data
 */
router.get('/documents', auditController.getDocumentAnalysis.bind(auditController));

/**
 * @swagger
 * /api/audit/financial:
 *   get:
 *     summary: Get financial overview from audit data
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Financial overview with budget and expenses
 */
router.get('/financial', auditController.getFinancialOverview.bind(auditController));

/**
 * @swagger
 * /api/audit/compliance:
 *   get:
 *     summary: Get legal compliance status
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Compliance status with law analysis
 */
router.get('/compliance', auditController.getComplianceStatus.bind(auditController));

/**
 * @swagger
 * /api/audit/red-flags:
 *   get:
 *     summary: Get red flags and irregularities
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Red flags from irregularities database
 */
router.get('/red-flags', auditController.getRedFlags.bind(auditController));

/**
 * @swagger
 * /api/audit/peer-comparison:
 *   get:
 *     summary: Get peer municipality comparison
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Comparison with other municipalities
 */
router.get('/peer-comparison', auditController.getPeerComparison.bind(auditController));

/**
 * @swagger
 * /api/audit/data-sources:
 *   get:
 *     summary: Get information about data sources
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Local databases and document repositories status
 */
router.get('/data-sources', auditController.getDataSources.bind(auditController));

/**
 * @swagger
 * /api/audit/online-verification:
 *   get:
 *     summary: Get online verification status
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: Status of online sources and APIs from system.py
 */
router.get('/online-verification', auditController.getOnlineVerification.bind(auditController));

/**
 * @swagger
 * /api/audit/health:
 *   get:
 *     summary: Health check for audit system
 *     tags: [Enhanced Audit]
 *     responses:
 *       200:
 *         description: System health status
 */
router.get('/health', auditController.healthCheck.bind(auditController));

module.exports = router;
const express = require('express');
const StaticDataService = require('../services/StaticDataService');
const EnhancedAuditService = require('../services/EnhancedAuditService');
const markdownpdf = require('markdown-pdf');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const staticDataService = new StaticDataService();
const enhancedAuditService = new EnhancedAuditService();

// Dashboard endpoint - returns all integrated data
router.get('/dashboard', async (req, res) => {
    try {
        const dashboardData = await staticDataService.getDashboardData();
        res.json({
            success: true,
            data: dashboardData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard data',
            message: error.message
        });
    }
});

// Financial data endpoints
router.get('/financial/budget/:year?', async (req, res) => {
    try {
        const year = req.params.year || 2024;
        const budgetData = await staticDataService.getBudgetData(year);
        
        if (!budgetData) {
            return res.status(404).json({
                success: false,
                error: `Budget data not found for year ${year}`
            });
        }
        
        res.json({
            success: true,
            data: budgetData
        });
    } catch (error) {
        console.error('Budget data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load budget data',
            message: error.message
        });
    }
});

router.get('/financial/salaries/:year?', async (req, res) => {
    try {
        const year = req.params.year || 2024;
        const salaryData = await staticDataService.getSalaryData(year);
        
        if (!salaryData) {
            return res.status(404).json({
                success: false,
                error: `Salary data not found for year ${year}`
            });
        }
        
        res.json({
            success: true,
            data: salaryData
        });
    } catch (error) {
        console.error('Salary data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load salary data',
            message: error.message
        });
    }
});

router.get('/financial/debt/:year?', async (req, res) => {
    try {
        const year = req.params.year || 2024;
        const debtData = await staticDataService.getDebtData(year);
        
        if (!debtData) {
            return res.status(404).json({
                success: false,
                error: `Debt data not found for year ${year}`
            });
        }
        
        res.json({
            success: true,
            data: debtData
        });
    } catch (error) {
        console.error('Debt data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load debt data',
            message: error.message
        });
    }
});

// Analysis and audit endpoints
router.get('/analysis/anomalies/:year?', async (req, res) => {
    try {
        const year = req.params.year || 2024;
        const anomalyData = await staticDataService.getAnomalyData(year);
        
        if (!anomalyData) {
            return res.status(404).json({
                success: false,
                error: `Anomaly data not found for year ${year}`
            });
        }
        
        res.json({
            success: true,
            data: anomalyData
        });
    } catch (error) {
        console.error('Anomaly data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load anomaly data',
            message: error.message
        });
    }
});

router.get('/analysis/audit-results', async (req, res) => {
    try {
        const auditResults = await staticDataService.getEnhancedAuditResults();
        
        if (!auditResults) {
            return res.status(404).json({
                success: false,
                error: 'Enhanced audit results not found'
            });
        }
        
        res.json({
            success: true,
            data: auditResults
        });
    } catch (error) {
        console.error('Audit results error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load audit results',
            message: error.message
        });
    }
});

router.get('/analysis/inventory', async (req, res) => {
    try {
        const inventory = await staticDataService.getInventorySummary();
        const detailedInventory = await staticDataService.getDetailedInventory();
        
        res.json({
            success: true,
            data: {
                summary: inventory,
                detailed: detailedInventory
            }
        });
    } catch (error) {
        console.error('Inventory error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load inventory data',
            message: error.message
        });
    }
});

router.get('/analysis/comparison', async (req, res) => {
    try {
        const comparison = await staticDataService.getComparisonReport();
        
        if (!comparison) {
            return res.status(404).json({
                success: false,
                error: 'Comparison report not found'
            });
        }
        
        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        console.error('Comparison error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load comparison data',
            message: error.message
        });
    }
});

// Documents endpoints
router.get('/documents/carmen-export', async (req, res) => {
    try {
        const carmenData = await staticDataService.getCarmenDocumentExport();
        
        if (!carmenData) {
            return res.status(404).json({
                success: false,
                error: 'Carmen document export not found'
            });
        }
        
        res.json({
            success: true,
            data: carmenData
        });
    } catch (error) {
        console.error('Carmen export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load Carmen document export',
            message: error.message
        });
    }
});

router.get('/documents/markdown-index', async (req, res) => {
    try {
        const markdownIndex = await staticDataService.getMarkdownDocuments();
        
        res.json({
            success: true,
            data: markdownIndex
        });
    } catch (error) {
        console.error('Markdown index error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load markdown document index',
            message: error.message
        });
    }
});

// Governance endpoints
router.get('/governance/web-sources', async (req, res) => {
    try {
        const webSources = await staticDataService.getWebSources();
        
        if (!webSources) {
            return res.status(404).json({
                success: false,
                error: 'Web sources data not found'
            });
        }
        
        res.json({
            success: true,
            data: webSources
        });
    } catch (error) {
        console.error('Web sources error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load web sources data',
            message: error.message
        });
    }
});

router.get('/governance/audit-cycle', async (req, res) => {
    try {
        const auditCycle = await staticDataService.getLatestAuditCycle();
        
        if (!auditCycle) {
            return res.status(404).json({
                success: false,
                error: 'Latest audit cycle not found'
            });
        }
        
        res.json({
            success: true,
            data: auditCycle
        });
    } catch (error) {
        console.error('Audit cycle error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load audit cycle data',
            message: error.message
        });
    }
});

// Cache management endpoints
router.get('/cache/stats', async (req, res) => {
    try {
        const stats = staticDataService.getCacheStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Cache stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cache stats',
            message: error.message
        });
    }
});

router.post('/cache/clear', async (req, res) => {
    try {
        staticDataService.clearCache();
        res.json({
            success: true,
            message: 'Cache cleared successfully'
        });
    } catch (error) {
        console.error('Cache clear error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
            message: error.message
        });
    }
});

// PDF generation endpoint for markdown files
router.get('/documents/markdown/:year/:filename/pdf', async (req, res) => {
    try {
        const { year, filename } = req.params;
        
        // Validate inputs
        if (!year || !filename) {
            return res.status(400).json({
                success: false,
                error: 'Year and filename are required'
            });
        }
        
        // Check if filename ends with .md
        if (!filename.endsWith('.md')) {
            return res.status(400).json({
                success: false,
                error: 'Filename must be a markdown file (.md)'
            });
        }
        
        // Construct the path to the markdown file
        const markdownPath = path.join(__dirname, '../../../data/markdown_documents', year, filename);
        
        // Check if file exists
        if (!fs.existsSync(markdownPath)) {
            return res.status(404).json({
                success: false,
                error: 'Markdown file not found'
            });
        }
        
        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename.replace('.md', '.pdf')}"`);
        
        // Convert markdown to PDF and send as response
        markdownpdf().from(markdownPath).to.buffer((err, buffer) => {
            if (err) {
                console.error('PDF generation error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to generate PDF',
                    message: err.message
                });
            }
            
            res.send(buffer);
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate PDF',
            message: error.message
        });
    }
});

// Enhanced Audit endpoints
router.get('/audit/comprehensive', async (req, res) => {
    try {
        const auditData = await enhancedAuditService.getComprehensiveAuditData();
        
        res.json({
            success: true,
            data: auditData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Comprehensive audit data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load comprehensive audit data',
            message: error.message
        });
    }
});

router.get('/audit/dashboard', async (req, res) => {
    try {
        const auditDashboard = await enhancedAuditService.getAuditDashboard();
        
        res.json({
            success: true,
            data: auditDashboard,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Audit dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load audit dashboard',
            message: error.message
        });
    }
});

router.get('/audit/cache/stats', async (req, res) => {
    try {
        const stats = enhancedAuditService.getCacheStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Audit cache stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get audit cache stats',
            message: error.message
        });
    }
});

router.post('/audit/cache/clear', async (req, res) => {
    try {
        enhancedAuditService.clearCache();
        res.json({
            success: true,
            message: 'Audit cache cleared successfully'
        });
    } catch (error) {
        console.error('Audit cache clear error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear audit cache',
            message: error.message
        });
    }
});

module.exports = router;
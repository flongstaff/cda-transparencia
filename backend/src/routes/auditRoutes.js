const express = require('express');
const router = express.Router();
const AuditTrailService = require('../services/AuditTrailService');

const auditService = new AuditTrailService();

router.get('/overview', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [trail, activity] = await Promise.all([
      auditService.getAuditTrail(year),
      auditService.getSystemActivity()
    ]);

    res.json({
      audit_trail: trail,
      system_activity: activity,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit data' });
  }
});

router.get('/trail', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const limit = parseInt(req.query.limit) || 50;
    const trail = await auditService.getAuditTrail(year, limit);
    res.json(trail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

module.exports = router;
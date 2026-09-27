const express = require('express');
const router = express.Router();
const { 
  validateDateRange,
  sanitizeRequestBody 
} = require('../middleware/validation');
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/auth');
const { 
  generateMemberReports,
  generateGroupSummary,
  exportToCSV
} = require('../controllers/reportController');

// Apply validation and sanitization to all routes
router.use(sanitizeRequestBody);

// GET /api/reports/members - Generate member balance reports (Admin only)
router.get('/members', authenticateToken, requireAdmin, validateDateRange, generateMemberReports);

// GET /api/reports/group-summary - Generate group summary report (Admin only)
router.get('/group-summary', authenticateToken, requireAdmin, validateDateRange, generateGroupSummary);

// GET /api/reports/export-csv - Export data to CSV (Admin only)
router.get('/export-csv', authenticateToken, requireAdmin, validateDateRange, exportToCSV);

module.exports = router;
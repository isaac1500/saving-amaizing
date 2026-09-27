const express = require('express');
const router = express.Router();
const { 
  validateMemberRegistration, 
  sanitizeRequestBody 
} = require('../middleware/validation');
const { 
  authenticateToken, 
  requireAdmin,
  requireMemberOrAdmin 
} = require('../middleware/auth');
const { 
  createMember, 
  getMembers, 
  updateMember, 
  deleteMember 
} = require('../controllers/memberController');

// Apply validation and sanitization to all routes
router.use(sanitizeRequestBody);

// POST /api/members - Create a new member (Admin only)
router.post('/', authenticateToken, requireAdmin, validateMemberRegistration, createMember);

// GET /api/members - Get all members with optional filtering
router.get('/', authenticateToken, getMembers);

// PUT /api/members/:id - Update a member (Admin or self)
router.put('/:id', authenticateToken, requireMemberOrAdmin, updateMember);

// DELETE /api/members/:id - Delete a member (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteMember);

module.exports = router;
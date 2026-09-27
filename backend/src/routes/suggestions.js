const express = require('express');
const router = express.Router();
const admin = require('../services/firebaseService');

// GET /api/suggestions/members?q=searchTerm
router.get('/members', async (req, res) => {
  try {
    const { q } = req.query;
    console.log(`🔍 Fetching members with query: "${q || 'all'}"`);
    
    const db = admin.firestore();
    
    // ✅ Get ALL members from root collection (no filter)
    const membersSnapshot = await db.collection('members').get();
    
    const members = [];
    membersSnapshot.forEach(doc => {
      const data = doc.data();
      members.push({
        id: doc.id,
        fullName: data.fullName || data.username || 'Unknown',
        username: data.username || '',
        email: data.email || '',
        gender: data.gender || '',
        residence: data.residence || '',
        dateJoined: data.dateJoined || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        role: data.role || 'member'
      });
    });
    
    // ✅ Filter by search query if provided
    let filteredMembers = members;
    if (q && q.length >= 1) {
      const searchTerm = q.toLowerCase().trim();
      filteredMembers = members.filter(m => 
        (m.fullName && m.fullName.toLowerCase().includes(searchTerm)) ||
        (m.username && m.username.toLowerCase().includes(searchTerm)) ||
        (m.email && m.email.toLowerCase().includes(searchTerm))
      );
    }
    
    console.log(`✅ Found ${filteredMembers.length} members matching "${q || 'all'}"`);
    res.json(filteredMembers);
    
  } catch (error) {
    console.error('❌ Error fetching member suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members',
      details: error.message 
    });
  }
});

module.exports = router;
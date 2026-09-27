const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

// GET /api/suggestions?q=searchTerm
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const membersRef = db.collection('members');
    const snapshot = await membersRef.where('isActive', '==', true).get();
    
    if (snapshot.empty) {
      return res.json([]);
    }

    const members = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      members.push({ id: doc.id, ...data });
    });

    // Simple fuzzy search by name or username
    const searchTerm = q.toLowerCase();
    const suggestions = members.filter(member => 
      member.fullName?.toLowerCase().includes(searchTerm) || 
      member.username?.toLowerCase().includes(searchTerm)
    ).slice(0, 10);

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
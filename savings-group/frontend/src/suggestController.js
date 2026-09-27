const { db } = require('../services/firebaseAdmin');

const searchMembers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Search members in Firestore
    const membersRef = db.collection('members');
    const snapshot = await membersRef
      .where('role', '==', 'member')
      .get();

    const members = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Simple search - in production, use more sophisticated search
      if (
        data.fullName.toLowerCase().includes(query.toLowerCase()) ||
        data.username.toLowerCase().includes(query.toLowerCase()) ||
        data.email.toLowerCase().includes(query.toLowerCase())
      ) {
        members.push({
          id: doc.id,
          fullName: data.fullName,
          username: data.username,
          email: data.email
        });
      }
    });

    res.json(members.slice(0, 10)); // Return max 10 results
  } catch (error) {
    console.error('Error searching members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { searchMembers };
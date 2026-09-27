const express = require('express');
const router = express.Router();
const admin = require('../services/firebaseService');

// Update user email (admin only)
router.put('/users/:uid/email', async (req, res) => {
  try {
    const { uid } = req.params;
    const { email } = req.body;
    
    console.log(`📝 Updating email for user ${uid} to ${email}`);
    
    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // 1. Update Firebase Auth
    await admin.auth().updateUser(uid, { email });
    console.log('✅ Firebase Auth email updated');
    
    // 2. Update Firestore
    await admin.firestore().collection('members').doc(uid).update({ email });
    console.log('✅ Firestore email updated');
    
    res.json({ 
      success: true, 
      message: 'Email updated successfully',
      data: { uid, email }
    });
  } catch (error) {
    console.error('❌ Error updating email:', error);
    // Check if email is already in use
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'Email already in use by another account' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    console.log(`🗑️ Deleting user ${uid}`);
    
    // 1. Delete from Firebase Auth
    await admin.auth().deleteUser(uid);
    console.log('✅ Firebase Auth user deleted');
    
    // 2. Delete from Firestore
    await admin.firestore().collection('members').doc(uid).delete();
    console.log('✅ Firestore member deleted');
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
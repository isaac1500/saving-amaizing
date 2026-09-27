const express = require('express');
const router = express.Router();
const admin = require('../services/firebaseService');

// GET /api/transactions - Get all transactions (admin) or member's transactions
router.get('/', async (req, res) => {
  try {
    const { memberId } = req.query;
    const db = admin.firestore();
    
    console.log('📋 Fetching transactions with memberId:', memberId || 'all');
    
    let query = db.collection('transactions');
    
    // If memberId is provided, filter by member
    if (memberId) {
      query = query.where('memberId', '==', memberId);
    }
    
    const snapshot = await query.orderBy('date', 'desc').get();
    const transactions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({ 
        id: doc.id, 
        ...data,
        // Convert Firestore timestamp to Date if needed
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      });
    });
    
    console.log(`✅ Found ${transactions.length} transactions`);
    res.json(transactions);
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions - Create a new transaction
router.post('/', async (req, res) => {
  try {
    const transactionData = req.body;
    const db = admin.firestore();
    
    console.log('📝 Creating transaction for member:', transactionData.memberId);
    
    // Validate required fields
    if (!transactionData.memberId || !transactionData.date || !transactionData.type) {
      return res.status(400).json({ 
        error: 'Missing required fields: memberId, date, and type are required' 
      });
    }
    
    // Add timestamp
    const newTransaction = {
      ...transactionData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('transactions').add(newTransaction);
    console.log('✅ Transaction created with ID:', docRef.id);
    
    res.status(201).json({ 
      id: docRef.id, 
      ...transactionData 
    });
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PUT /api/transactions/:id - Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = admin.firestore();
    
    console.log('✏️ Updating transaction:', id);
    
    // Check if transaction exists
    const docRef = db.collection('transactions').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await docRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Transaction updated:', id);
    res.json({ id, ...updateData });
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = admin.firestore();
    
    console.log('🗑️ Deleting transaction:', id);
    
    // Check if transaction exists
    const docRef = db.collection('transactions').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await docRef.delete();
    console.log('✅ Transaction deleted:', id);
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
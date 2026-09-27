const admin = require('firebase-admin');

const createTransaction = async (req, res) => {
  try {
    const {
      memberId,
      memberName,
      date,
      type,
      weeklySaving = 0,
      munomukabi = 0,
      otherSaving = 0,
      withdrawal = 0,
      enteredBy
    } = req.body;

    // Validate required fields
    if (!memberId || !memberName || !date || !type || !enteredBy) {
      return res.status(400).json({
        error: 'Missing required fields: memberId, memberName, date, type, enteredBy'
      });
    }

    // Validate transaction type - FIXED: Match frontend capitalization
    if (!['SAVING', 'WITHDRAWAL'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid transaction type. Use "SAVING" or "WITHDRAWAL"' });
    }

    const transactionType = type.toUpperCase();

    // FIXED: Validate amounts based on transaction type
    if (transactionType === 'SAVING') {
      // For savings, withdrawal should be 0
      if (withdrawal > 0) {
        return res.status(400).json({ 
          error: 'Withdrawal amount must be 0 for SAVING transactions' 
        });
      }
      
      // At least one saving amount should be positive
      const totalSaving = parseFloat(weeklySaving) + parseFloat(munomukabi) + parseFloat(otherSaving);
      if (totalSaving <= 0) {
        return res.status(400).json({ 
          error: 'For SAVING transactions, at least one saving amount must be greater than 0' 
        });
      }
    }

    if (transactionType === 'WITHDRAWAL') {
      // For withdrawals, all saving amounts should be 0
      if (weeklySaving > 0 || munomukabi > 0 || otherSaving > 0) {
        return res.status(400).json({ 
          error: 'Saving amounts must be 0 for WITHDRAWAL transactions' 
        });
      }
      
      // Withdrawal amount must be positive
      if (withdrawal <= 0) {
        return res.status(400).json({ 
          error: 'Withdrawal amount must be greater than 0 for WITHDRAWAL transactions' 
        });
      }
    }

    // Validate amounts are not negative
    const amounts = [weeklySaving, munomukabi, otherSaving, withdrawal];
    if (amounts.some(amount => parseFloat(amount) < 0)) {
      return res.status(400).json({ error: 'Amounts cannot be negative' });
    }

    // FIXED: Create transaction with proper data structure
    const transactionData = {
      memberId,
      memberName,
      date: new Date(date).toISOString(),
      type: transactionType, // Use standardized type
      weeklySaving: transactionType === 'SAVING' ? parseFloat(weeklySaving) || 0 : 0,
      munomukabi: transactionType === 'SAVING' ? parseFloat(munomukabi) || 0 : 0,
      otherSaving: transactionType === 'SAVING' ? parseFloat(otherSaving) || 0 : 0,
      withdrawal: transactionType === 'WITHDRAWAL' ? parseFloat(withdrawal) || 0 : 0,
      enteredBy,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const transactionRef = await admin.firestore()
      .collection('transactions')
      .add(transactionData);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: { id: transactionRef.id, ...transactionData }
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      memberId, 
      startDate, 
      endDate,
      type 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = admin.firestore()
      .collection('transactions')
      .orderBy('date', 'desc');

    // Apply filters
    if (memberId) {
      query = query.where('memberId', '==', memberId);
    }

    if (type) {
      // FIXED: Handle case-insensitive type matching
      query = query.where('type', '==', type.toUpperCase());
    }

    if (startDate) {
      query = query.where('date', '>=', new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.where('date', '<=', new Date(endDate).toISOString());
    }

    const snapshot = await query.get();
    
    let transactions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // FIXED: Format the data for frontend display
      transactions.push({ 
        id: doc.id, 
        ...data,
        // Ensure proper formatting for frontend table
        weeklySaving: data.type === 'SAVING' ? (data.weeklySaving || 0) : 0,
        munomukabi: data.type === 'SAVING' ? (data.munomukabi || 0) : 0,
        otherSaving: data.type === 'SAVING' ? (data.otherSaving || 0) : 0,
        withdrawal: data.type === 'WITHDRAWAL' ? (data.withdrawal || 0) : 0
      });
    });

    // Apply pagination
    const total = transactions.length;
    const paginatedTransactions = transactions.slice(offset, offset + limitNum);

    res.status(200).json({
      transactions: paginatedTransactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// FIXED: getMemberBalance to handle type matching
const getMemberBalance = async (req, res) => {
  try {
    const { memberId } = req.params;

    const snapshot = await admin.firestore()
      .collection('transactions')
      .where('memberId', '==', memberId)
      .get();

    let totalSavings = 0;
    let totalWithdrawals = 0;

    snapshot.forEach(doc => {
      const transaction = doc.data();
      // FIXED: Use consistent type checking
      if (transaction.type === 'SAVING') {
        totalSavings += (transaction.weeklySaving || 0) + 
                       (transaction.munomukabi || 0) + 
                       (transaction.otherSaving || 0);
      } else if (transaction.type === 'WITHDRAWAL') {
        totalWithdrawals += transaction.withdrawal || 0;
      }
    });

    const balance = totalSavings - totalWithdrawals;

    res.status(200).json({
      totalSavings,
      totalWithdrawals,
      balance
    });

  } catch (error) {
    console.error('Error calculating balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// FIXED: updateTransaction with proper validation
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate transaction type if being updated
    if (updates.type && !['SAVING', 'WITHDRAWAL'].includes(updates.type.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    if (updates.type) {
      updates.type = updates.type.toUpperCase();
    }

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.createdAt;
    delete updates.enteredBy;

    // Add updated timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await admin.firestore()
      .collection('transactions')
      .doc(id)
      .update(updates);

    res.status(200).json({ message: 'Transaction updated successfully' });

  } catch (error) {
    console.error('Error updating transaction:', error);
    
    if (error.code === 5) { // Firestore 'not-found' error code
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Keep other functions the same (they should work fine)
const getMemberTransactions = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { limit = 50 } = req.query;

    const snapshot = await admin.firestore()
      .collection('transactions')
      .where('memberId', '==', memberId)
      .orderBy('date', 'desc')
      .limit(parseInt(limit))
      .get();

    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ transactions });

  } catch (error) {
    console.error('Error fetching member transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await admin.firestore()
      .collection('transactions')
      .doc(id)
      .delete();

    res.status(200).json({ message: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    
    if (error.code === 5) { // Firestore 'not-found' error code
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getMemberTransactions,
  getMemberBalance,
  updateTransaction,
  deleteTransaction
};
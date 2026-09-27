// src/services/transactionService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Add a new transaction
export const addTransaction = async (transactionData) => {
  try {
    console.log('💾 Starting to save transaction:', transactionData);
    
    // Validate required fields
    if (!transactionData.memberId || !transactionData.date || !transactionData.type) {
      throw new Error('Missing required fields: memberId, date, and type are required');
    }

    const transactionWithTimestamp = {
      // Include ALL fields from the form
      memberId: transactionData.memberId,
      memberName: transactionData.memberName || 'Unknown Member', // CRITICAL: This was missing!
      date: transactionData.date,
      type: transactionData.type,
      weeklySaving: parseFloat(transactionData.weeklySaving || 0),
      munomukabi: parseFloat(transactionData.munomukabi || 0),
      otherSaving: parseFloat(transactionData.otherSaving || 0),
      withdrawal: parseFloat(transactionData.withdrawal || 0),
      enteredBy: transactionData.enteredBy || 'admin',
      createdAt: Timestamp.now()
    };

    console.log('📊 Transaction data to save:', transactionWithTimestamp);

    const docRef = await addDoc(collection(db, 'transactions'), transactionWithTimestamp);
    
    console.log('✅ Transaction saved successfully with ID:', docRef.id);
    
    return { 
      id: docRef.id, 
      ...transactionWithTimestamp 
    };
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
    throw new Error(`Failed to add transaction: ${error.message}`);
  }
};

// Get all transactions for a specific member
export const getTransactionsByMemberId = async (memberId) => {
  try {
    console.log('📥 Fetching transactions for member:', memberId);
    
    const q = query(
      collection(db, 'transactions'),
      where('memberId', '==', memberId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Ensure all fields have proper fallbacks
        memberId: data.memberId || '',
        memberName: data.memberName || 'Unknown Member',
        date: data.date || '',
        type: data.type || '',
        weeklySaving: data.weeklySaving || 0,
        munomukabi: data.munomukabi || 0,
        otherSaving: data.otherSaving || 0,
        withdrawal: data.withdrawal || 0,
        enteredBy: data.enteredBy || 'Unknown',
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
    
    console.log(`✅ Found ${transactions.length} transactions for member ${memberId}`);
    
    return transactions;
  } catch (error) {
    console.error('❌ Error getting transactions for member:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
};

// Get all transactions (admin view)
export const getAllTransactions = async () => {
  try {
    console.log('📥 Fetching all transactions...');
    
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Ensure all required fields exist with proper fallbacks
      return {
        id: doc.id,
        memberId: data.memberId || '',
        memberName: data.memberName || 'Unknown Member', // Handle missing memberName
        date: data.date || '',
        type: data.type || '',
        weeklySaving: data.weeklySaving || 0,
        munomukabi: data.munomukabi || 0,
        otherSaving: data.otherSaving || 0,
        withdrawal: data.withdrawal || 0,
        enteredBy: data.enteredBy || 'Unknown',
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
    
    console.log(`✅ Loaded ${transactions.length} transactions from Firestore`);
    
    if (transactions.length > 0) {
      console.log('📊 Sample transaction structure:', {
        id: transactions[0].id,
        memberName: transactions[0].memberName,
        type: transactions[0].type,
        weeklySaving: transactions[0].weeklySaving,
        munomukabi: transactions[0].munomukabi,
        otherSaving: transactions[0].otherSaving,
        withdrawal: transactions[0].withdrawal
      });
    }
    
    return transactions;
  } catch (error) {
    console.error('❌ Error getting all transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
};

// Update a transaction
export const updateTransaction = async (transactionId, updatedData) => {
  try {
    console.log('✏️ Updating transaction:', transactionId, updatedData);
    
    // Validate transaction exists
    const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    // Prepare update data with proper field names
    const cleanUpdateData = {
      ...updatedData,
      // Ensure numeric fields are properly converted
      weeklySaving: parseFloat(updatedData.weeklySaving || 0),
      munomukabi: parseFloat(updatedData.munomukabi || 0),
      otherSaving: parseFloat(updatedData.otherSaving || 0),
      withdrawal: parseFloat(updatedData.withdrawal || 0),
      updatedAt: Timestamp.now()
    };

    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, cleanUpdateData);
    
    console.log('✅ Transaction updated successfully');
    
    return { 
      id: transactionId, 
      ...cleanUpdateData 
    };
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }
};

// Delete a transaction
export const deleteTransaction = async (transactionId) => {
  try {
    console.log('🗑️ Deleting transaction:', transactionId);
    
    // Validate transaction exists
    const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    await deleteDoc(doc(db, 'transactions', transactionId));
    
    console.log('✅ Transaction deleted successfully');
    
    return transactionId;
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
};

// Get transaction by ID
export const getTransactionById = async (transactionId) => {
  try {
    console.log('📋 Fetching transaction by ID:', transactionId);
    
    const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    const data = transactionDoc.data();
    
    const transaction = {
      id: transactionDoc.id,
      memberId: data.memberId || '',
      memberName: data.memberName || 'Unknown Member',
      date: data.date || '',
      type: data.type || '',
      weeklySaving: data.weeklySaving || 0,
      munomukabi: data.munomukabi || 0,
      otherSaving: data.otherSaving || 0,
      withdrawal: data.withdrawal || 0,
      enteredBy: data.enteredBy || 'Unknown',
      createdAt: data.createdAt?.toDate() || new Date()
    };
    
    console.log('✅ Transaction found:', transaction);
    
    return transaction;
  } catch (error) {
    console.error('❌ Error getting transaction by ID:', error);
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (startDate, endDate) => {
  try {
    console.log('📅 Fetching transactions from', startDate, 'to', endDate);
    
    const q = query(
      collection(db, 'transactions'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        memberId: data.memberId || '',
        memberName: data.memberName || 'Unknown Member',
        date: data.date || '',
        type: data.type || '',
        weeklySaving: data.weeklySaving || 0,
        munomukabi: data.munomukabi || 0,
        otherSaving: data.otherSaving || 0,
        withdrawal: data.withdrawal || 0,
        enteredBy: data.enteredBy || 'Unknown',
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
    
    console.log(`✅ Found ${transactions.length} transactions in date range`);
    
    return transactions;
  } catch (error) {
    console.error('❌ Error getting transactions by date range:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
};

// Helper function to fix existing transactions with missing memberName
export const fixTransactionsMissingMemberName = async (members) => {
  try {
    console.log('🔧 Fixing transactions with missing memberName...');
    
    const allTransactions = await getAllTransactions();
    const transactionsToFix = allTransactions.filter(t => !t.memberName || t.memberName === 'Unknown Member');
    
    console.log(`📋 Found ${transactionsToFix.length} transactions to fix`);
    
    for (const transaction of transactionsToFix) {
      if (transaction.memberId) {
        // Find the member by ID
        const member = members.find(m => m.id === transaction.memberId);
        if (member) {
          await updateTransaction(transaction.id, {
            memberName: member.fullName || member.username
          });
          console.log(`✅ Fixed transaction ${transaction.id} with member name: ${member.fullName}`);
        }
      }
    }
    
    console.log('🎉 Finished fixing transactions');
    
    return transactionsToFix.length;
  } catch (error) {
    console.error('❌ Error fixing transactions:', error);
    throw error;
  }
};
// src/hooks/useTransactions.js
import { useState, useEffect } from 'react';
import { 
  addTransaction, 
  getTransactionsByMemberId, 
  getAllTransactions, 
  updateTransaction, 
  deleteTransaction 
} from '../services/transactionService';

export const useTransactions = (memberId = null) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [memberId]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (memberId) {
        data = await getTransactionsByMemberId(memberId);
      } else {
        data = await getAllTransactions();
      }
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      setError(null);
      const newTransaction = await addTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeTransaction = async (transactionId) => {
    try {
      setError(null);
      await deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      return transactionId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const modifyTransaction = async (transactionId, updatedData) => {
    try {
      setError(null);
      const updatedTransaction = await updateTransaction(transactionId, updatedData);
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? updatedTransaction : t)
      );
      return updatedTransaction;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction: createTransaction,
    deleteTransaction: removeTransaction,
    updateTransaction: modifyTransaction,
    refreshTransactions: fetchTransactions
  };
};
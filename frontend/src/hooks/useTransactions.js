import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiService';

export const useTransactions = (memberId = null) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = memberId ? `/transactions?memberId=${memberId}` : '/transactions';
      console.log('📊 Fetching from URL:', url);
      
      const response = await apiClient.get(url);
      console.log('✅ Response data:', response.data);
      
      setTransactions(response.data || []);
      return response.data;
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (data) => {
    try {
      setError(null);
      const response = await apiClient.post('/transactions', data);
      const newTransaction = response.data;
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err.message || 'Failed to create transaction');
      throw err;
    }
  };

  const removeTransaction = async (id) => {
    try {
      setError(null);
      await apiClient.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
      return id;
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    }
  };

  const modifyTransaction = async (id, data) => {
    try {
      setError(null);
      const response = await apiClient.put(`/transactions/${id}`, data);
      const updated = response.data;
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
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
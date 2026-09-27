const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getTransactions, 
  getMemberTransactions,
  updateTransaction,
  deleteTransaction,
  getMemberBalance 
} = require('../controllers/transactionController');

// POST /api/transactions - Create a new transaction
router.post('/', createTransaction);

// GET /api/transactions - Get all transactions with filtering
router.get('/', getTransactions);

// GET /api/transactions/member/:memberId - Get transactions for specific member
router.get('/member/:memberId', getMemberTransactions);

// GET /api/transactions/balance/:memberId - Get member balance
router.get('/balance/:memberId', getMemberBalance);

// PUT /api/transactions/:id - Update a transaction
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
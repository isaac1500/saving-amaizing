// src/utils/calculateTotals.js

export const calculateMemberBalance = (transactions) => {
  let totalSavings = 0;
  let totalWithdrawals = 0;
  let totalInterest = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'Saving') {
      totalSavings += (transaction.weeklySaving || 0) + 
                     (transaction.munomukabi || 0) + 
                     (transaction.otherSaving || 0);
    } else if (transaction.type === 'Withdrawal') {
      totalWithdrawals += transaction.withdrawal || 0;
    } else if (transaction.type === 'Interest') {
      totalInterest += transaction.otherSaving || 0;
    }
  });

  return {
    totalSavings,
    totalWithdrawals,
    totalInterest,
    // ✅ CORRECT: Balance includes interest
    balance: totalSavings + totalInterest - totalWithdrawals
  };
};

export const calculateGroupTotals = (transactions, members) => {
  let totalWeeklySaving = 0;
  let totalMunomukabi = 0;
  let totalOtherSaving = 0;
  let totalWithdrawals = 0;
  let totalInterest = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'Saving') {
      totalWeeklySaving += transaction.weeklySaving || 0;
      totalMunomukabi += transaction.munomukabi || 0;
      totalOtherSaving += transaction.otherSaving || 0;
    } else if (transaction.type === 'Withdrawal') {
      totalWithdrawals += transaction.withdrawal || 0;
    } else if (transaction.type === 'Interest') {
      totalInterest += transaction.otherSaving || 0;
    }
  });

  const totalSavings = totalWeeklySaving + totalMunomukabi + totalOtherSaving;
  // ✅ CORRECT: Net Balance includes interest
  const netBalance = totalSavings + totalInterest - totalWithdrawals;

  return {
    totalMembers: members.length,
    totalTransactions: transactions.length,
    totalSavings,
    totalWeeklySaving,
    totalMunomukabi,
    totalOtherSaving,
    totalWithdrawals,
    totalInterest, // ← ADD THIS LINE
    netBalance,
    averageSavings: members.length > 0 ? totalSavings / members.length : 0
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
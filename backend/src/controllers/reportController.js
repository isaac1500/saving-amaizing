const admin = require('firebase-admin');
const { Parser } = require('json2csv');

const generateMemberReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all active members
    const membersSnapshot = await admin.firestore()
      .collection('members')
      .where('isActive', '==', true)
      .get();

    const members = [];
    for (const doc of membersSnapshot.docs) {
      const member = { id: doc.id, ...doc.data() };
      
      // Get member transactions with optional date filtering
      let transactionsQuery = admin.firestore()
        .collection('transactions')
        .where('memberId', '==', member.id);

      if (startDate && endDate) {
        transactionsQuery = transactionsQuery
          .where('date', '>=', new Date(startDate).toISOString())
          .where('date', '<=', new Date(endDate).toISOString());
      }

      const transactionsSnapshot = await transactionsQuery.get();
      
      let totalSavings = 0;
      let totalWithdrawals = 0;
      const transactions = [];

      transactionsSnapshot.forEach(tDoc => {
        const transaction = { id: tDoc.id, ...tDoc.data() };
        transactions.push(transaction);

        if (transaction.type === 'Saving') {
          totalSavings += (transaction.weeklySaving || 0) + 
                         (transaction.munomukabi || 0) + 
                         (transaction.otherSaving || 0);
        } else if (transaction.type === 'Withdrawal') {
          totalWithdrawals += transaction.withdrawal || 0;
        }
      });

      const balance = totalSavings - totalWithdrawals;

      members.push({
        ...member,
        totalSavings,
        totalWithdrawals,
        balance,
        transactionCount: transactions.length,
        lastTransaction: transactions.length > 0 
          ? transactions[transactions.length - 1].date 
          : null
      });
    }

    // Sort by balance (highest first)
    members.sort((a, b) => b.balance - a.balance);

    res.status(200).json({
      members,
      reportDate: new Date().toISOString(),
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    console.error('Error generating member reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generateGroupSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all transactions with optional date filtering
    let transactionsQuery = admin.firestore()
      .collection('transactions');

    if (startDate && endDate) {
      transactionsQuery = transactionsQuery
        .where('date', '>=', new Date(startDate).toISOString())
        .where('date', '<=', new Date(endDate).toISOString());
    }

    const transactionsSnapshot = await transactionsQuery.get();
    
    let totalWeeklySaving = 0;
    let totalMunomukabi = 0;
    let totalOtherSaving = 0;
    let totalWithdrawals = 0;
    let transactionCount = 0;
    let memberCount = new Set();

    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      memberCount.add(transaction.memberId);
      transactionCount++;

      if (transaction.type === 'Saving') {
        totalWeeklySaving += transaction.weeklySaving || 0;
        totalMunomukabi += transaction.munomukabi || 0;
        totalOtherSaving += transaction.otherSaving || 0;
      } else if (transaction.type === 'Withdrawal') {
        totalWithdrawals += transaction.withdrawal || 0;
      }
    });

    const totalSavings = totalWeeklySaving + totalMunomukabi + totalOtherSaving;
    const netBalance = totalSavings - totalWithdrawals;

    // Get active member count
    const activeMembersSnapshot = await admin.firestore()
      .collection('members')
      .where('isActive', '==', true)
      .get();

    res.status(200).json({
      summary: {
        totalMembers: activeMembersSnapshot.size,
        activeMembers: memberCount.size,
        totalTransactions: transactionCount,
        totalSavings,
        totalWeeklySaving,
        totalMunomukabi,
        totalOtherSaving,
        totalWithdrawals,
        netBalance,
        averageSavings: activeMembersSnapshot.size > 0 ? totalSavings / activeMembersSnapshot.size : 0
      },
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating group summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const exportToCSV = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (!['transactions', 'members', 'balances'].includes(type)) {
      return res.status(400).json({ error: 'Invalid export type' });
    }

    let data = [];
    let filename = '';

    if (type === 'transactions') {
      let query = admin.firestore()
        .collection('transactions')
        .orderBy('date', 'desc');

      if (startDate && endDate) {
        query = query
          .where('date', '>=', new Date(startDate).toISOString())
          .where('date', '<=', new Date(endDate).toISOString());
      }

      const snapshot = await query.get();
      data = snapshot.docs.map(doc => {
        const transaction = doc.data();
        return {
          Date: new Date(transaction.date).toLocaleDateString(),
          'Member Name': transaction.memberName,
          Type: transaction.type,
          'Weekly Saving': transaction.weeklySaving,
          Munomukabi: transaction.munomukabi,
          'Other Saving': transaction.otherSaving,
          Withdrawal: transaction.withdrawal,
          'Total Amount': transaction.type === 'Saving' 
            ? transaction.weeklySaving + transaction.munomukabi + transaction.otherSaving
            : transaction.withdrawal,
          'Entered By': transaction.enteredBy
        };
      });
      filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    }
    else if (type === 'members') {
      const snapshot = await admin.firestore()
        .collection('members')
        .get();
      
      data = snapshot.docs.map(doc => {
        const member = doc.data();
        return {
          'Full Name': member.fullName,
          Username: member.username,
          Email: member.email,
          Gender: member.gender,
          Residence: member.residence,
          Role: member.role,
          'Date Joined': new Date(member.dateJoined).toLocaleDateString(),
          Status: member.isActive ? 'Active' : 'Inactive'
        };
      });
      filename = `members-${new Date().toISOString().split('T')[0]}.csv`;
    }
    else if (type === 'balances') {
      const report = await generateMemberReports(req, res, true);
      data = report.members.map(member => ({
        'Full Name': member.fullName,
        Username: member.username,
        'Total Savings': member.totalSavings,
        'Total Withdrawals': member.totalWithdrawals,
        Balance: member.balance,
        'Transaction Count': member.transactionCount,
        'Last Transaction': member.lastTransaction ? new Date(member.lastTransaction).toLocaleDateString() : 'Never'
      }));
      filename = `balances-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  generateMemberReports,
  generateGroupSummary,
  exportToCSV
};
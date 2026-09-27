const admin = require('./firebaseService');

// Daily rate: 11.5% annual => 11.5 / 365 / 100
const DAILY_RATE = 0.115 / 365;

/**
 * Helper: calculate the net impact of a transaction on balance.
 * Savings and Interest add; Withdrawals subtract.
 */
function calculateTransactionImpact(tx) {
  let impact = 0;
  if (tx.type === 'Saving') {
    impact += (tx.weeklySaving || 0) + (tx.munomukabi || 0) + (tx.otherSaving || 0);
  } else if (tx.type === 'Withdrawal') {
    impact -= (tx.withdrawal || 0);
  } else if (tx.type === 'Interest') {
    impact += (tx.otherSaving || 0);
  }
  return impact;
}

/**
 * Apply daily compound interest to all active members.
 * Calculates balance from transactions (no stored balance needed).
 */
async function applyDailyInterest() {
  const db = admin.firestore();
  const startTime = Date.now();
  
  console.log('🚀 Starting daily interest calculation...');
  
  try {
    // Update status to running
    await db.collection('system').doc('interestStatus').set({
      status: 'running',
      startedAt: new Date().toISOString()
    });

    // Get all active members
    const membersSnapshot = await db.collection('members')
      .where('isActive', '==', true)
      .get();
    
    console.log(`📊 Found ${membersSnapshot.size} active members`);
    
    if (membersSnapshot.empty) {
      console.log('ℹ️ No active members found');
      await db.collection('system').doc('interestStatus').set({
        status: 'completed',
        processed: 0,
        totalInterest: 0,
        completedAt: new Date().toISOString()
      });
      return { processed: 0, totalInterest: 0, skipped: 0 };
    }

    let processed = 0;
    let totalInterest = 0;
    let skipped = 0;
    const BATCH_SIZE = 50;
    const memberIds = [];
    
    membersSnapshot.forEach(doc => {
      memberIds.push(doc.id);
    });

    // Process members in chunks
    for (let i = 0; i < memberIds.length; i += BATCH_SIZE) {
      const chunk = memberIds.slice(i, i + BATCH_SIZE);
      const batch = db.batch();
      let batchProcessed = 0;
      let batchInterest = 0;
      
      console.log(`🔄 Processing chunk ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(memberIds.length/BATCH_SIZE)}`);
      
      for (const memberId of chunk) {
        const memberDoc = await db.collection('members').doc(memberId).get();
        if (!memberDoc.exists) continue;
        
        const memberData = memberDoc.data();

        // Determine the start date for interest calculation
        const lastInterestDate = memberData.lastInterestDate
          ? new Date(memberData.lastInterestDate + 'T00:00:00')
          : memberData.dateJoined 
            ? new Date(memberData.dateJoined)
            : new Date();
        lastInterestDate.setHours(0, 0, 0, 0);

        // Yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // If we've already applied interest up to yesterday, skip
        if (lastInterestDate >= yesterday) {
          skipped++;
          console.log(`⏭️  Skipped ${memberData.fullName || memberId}: already up to date`);
          continue;
        }

        // Fetch all transactions for this member
        const txSnapshot = await db.collection('transactions')
          .where('memberId', '==', memberId)
          .get();

        // Build a map of transactions by date
        const txMap = new Map();
        txSnapshot.docs.forEach(doc => {
          const tx = doc.data();
          const dateKey = tx.date;
          if (!txMap.has(dateKey)) {
            txMap.set(dateKey, []);
          }
          txMap.get(dateKey).push(tx);
        });

        // ✅ CALCULATE BALANCE FROM TRANSACTIONS (not from stored balance field)
        let balance = 0;
        const startDateStr = lastInterestDate.toISOString().split('T')[0];
        txSnapshot.docs.forEach(doc => {
          const tx = doc.data();
          if (tx.date <= startDateStr) {
            balance += calculateTransactionImpact(tx);
          }
        });

        // If no balance, update lastInterestDate and skip
        if (balance <= 0) {
          skipped++;
          console.log(`⏭️  Skipped ${memberData.fullName || memberId}: balance = ${balance.toFixed(2)}`);
          const memberRef = db.collection('members').doc(memberId);
          batch.update(memberRef, {
            lastInterestDate: yesterday.toISOString().split('T')[0],
            balance: balance,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          continue;
        }

        // Accumulate interest for each day
        let totalMemberInterest = 0;
        let currentDate = new Date(lastInterestDate);
        currentDate.setDate(currentDate.getDate() + 1);

        let daysProcessed = 0;
        const MAX_DAYS = 365;
        
        while (currentDate <= yesterday && daysProcessed < MAX_DAYS) {
          const dateKey = currentDate.toISOString().split('T')[0];

          if (txMap.has(dateKey)) {
            const dayTxs = txMap.get(dateKey);
            for (const tx of dayTxs) {
              balance += calculateTransactionImpact(tx);
            }
          }

          if (balance > 0) {
            const interest = balance * DAILY_RATE;
            totalMemberInterest += interest;
            balance += interest;
          }

          currentDate.setDate(currentDate.getDate() + 1);
          daysProcessed++;
        }

        // If any interest was accrued, add to batch
        if (totalMemberInterest > 0.01) {
          const txData = {
            memberId: memberId,
            memberName: memberData.fullName || memberData.username || memberData.displayName || 'Unknown',
            date: yesterday.toISOString().split('T')[0],
            type: 'Interest',
            weeklySaving: 0,
            munomukabi: 0,
            otherSaving: totalMemberInterest,
            withdrawal: 0,
            enteredBy: 'system',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          const interestRef = db.collection('transactions').doc();
          batch.set(interestRef, txData);
          
          // Update member balance and lastInterestDate
          const memberRef = db.collection('members').doc(memberId);
          batch.update(memberRef, {
            balance: balance, // Store the calculated new balance
            lastInterestDate: yesterday.toISOString().split('T')[0],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          totalInterest += totalMemberInterest;
          processed++;
          batchProcessed++;
          batchInterest += totalMemberInterest;
          
          console.log(`✅ ${memberData.fullName || memberId}: ${totalMemberInterest.toFixed(2)} interest (${daysProcessed} days), new balance: ${balance.toFixed(2)}`);
        } else {
          const memberRef = db.collection('members').doc(memberId);
          batch.update(memberRef, {
            balance: balance,
            lastInterestDate: yesterday.toISOString().split('T')[0],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          skipped++;
          console.log(`⏭️  Skipped ${memberData.fullName || memberId}: no interest accrued`);
        }
      }

      // Commit the batch
      if (batchProcessed > 0 || chunk.length > 0) {
        await batch.commit();
        console.log(`✅ Committed chunk: ${batchProcessed} members, interest: ${batchInterest.toFixed(2)}`);
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    
    // Save last run info
    await db.collection('system').doc('interestLastRun').set({
      processed,
      totalInterest,
      skipped,
      duration,
      timestamp: new Date().toISOString()
    });

    // Update status to completed
    await db.collection('system').doc('interestStatus').set({
      status: 'completed',
      processed,
      totalInterest,
      skipped,
      duration,
      completedAt: new Date().toISOString()
    });

    console.log(`✅ Interest calculation completed in ${duration}s`);
    console.log(`📊 Processed: ${processed}, Skipped: ${skipped}, Total Interest: ${totalInterest.toFixed(2)}`);
    
    return { processed, totalInterest, skipped, duration };
    
  } catch (error) {
    console.error('❌ Error in interest calculation:', error);
    
    await db.collection('system').doc('interestStatus').set({
      status: 'failed',
      error: error.message,
      failedAt: new Date().toISOString()
    });
    
    throw error;
  }
}

module.exports = { applyDailyInterest };
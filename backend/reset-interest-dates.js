const admin = require('./src/services/firebaseService');

async function resetInterestDates() {
  const db = admin.firestore();
  
  // Get all active members
  const membersSnapshot = await db.collection('members')
    .where('isActive', '==', true)
    .get();
  
  let count = 0;
  
  for (const doc of membersSnapshot.docs) {
    const memberData = doc.data();
    
    // Set lastInterestDate to dateJoined
    // This ensures interest is calculated from the day they joined
    await doc.ref.update({
      lastInterestDate: memberData.dateJoined
    });
    
    console.log(`✅ Updated ${memberData.fullName || memberData.username}: ${memberData.dateJoined}`);
    count++;
  }
  
  console.log(`\n✅ Updated ${count} members`);
  process.exit(0);
}

resetInterestDates().catch(console.error);
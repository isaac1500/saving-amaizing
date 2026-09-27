// reset-interest.js
const admin = require('firebase-admin');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Check if variables are loaded
console.log('📁 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('📁 FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('📁 FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Validate before initializing
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  console.error('❌ Missing Firebase credentials in .env file');
  console.error('Please check that FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function resetInterestDates() {
  try {
    console.log('🔄 Fetching members...');
    const membersSnapshot = await db.collection('members')
      .where('isActive', '==', true)
      .get();
    
    console.log(`📋 Found ${membersSnapshot.size} active members`);
    let count = 0;
    
    for (const doc of membersSnapshot.docs) {
      const memberData = doc.data();
      await doc.ref.update({
        lastInterestDate: memberData.dateJoined
      });
      console.log(`✅ Updated ${memberData.fullName || memberData.username}: ${memberData.dateJoined}`);
      count++;
    }
    
    console.log(`\n🎉 Successfully updated ${count} members`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetInterestDates();
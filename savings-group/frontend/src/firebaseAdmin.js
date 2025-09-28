const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optional: add your database URL if using Realtime Database
  // databaseURL: "https://your-project-default-rtdb.firebaseio.com"
});

// Export Firestore and Auth instances
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
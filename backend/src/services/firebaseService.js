const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin SDK already initialized');
      return admin.app();
    }

    console.log('🚀 Initializing Firebase Admin SDK...');
    console.log('📁 Environment:', process.env.NODE_ENV || 'development');
    
    // FIRST: Try environment variables (Railway, Render, etc.)
    const hasEnvVars = process.env.FIREBASE_PROJECT_ID && 
                       process.env.FIREBASE_PRIVATE_KEY && 
                       process.env.FIREBASE_CLIENT_EMAIL;
    
    if (hasEnvVars) {
      console.log('✅ Using environment variables for Firebase config...');
      
      // Clean the private key - handle both \n and actual newlines
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) {
        // Replace escaped newlines with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        // Trim any extra whitespace
        privateKey = privateKey.trim();
      }
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || '',
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || ''
      };

      console.log('🔧 Firebase config validated, project:', serviceAccount.project_id);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully with environment variables!');
      return admin;
    }
    
    // SECOND: Try to use the service account JSON file (local development)
    console.log('📁 Environment variables not found, checking for service account file...');
    const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
    console.log('📁 Looking for service account file at:', serviceAccountPath);
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('✅ Found service account file, initializing...');
      
      const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('Service account JSON is missing required fields');
      }
      
      console.log('🔧 Service account validated, project:', serviceAccount.project_id);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully with service account file!');
      return admin;
    }
    
    // If we get here, no credentials found
    throw new Error('No Firebase credentials found. Please set environment variables or provide a service account file.');

  } catch (error) {
    console.error('❌ FATAL: Error initializing Firebase Admin SDK:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. For Railway: Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL as environment variables');
    console.log('   2. For local development: Place serviceAccountKey.json in the backend folder');
    console.log('   3. Ensure the private key has proper newline characters');
    console.log('   4. Check that your Firebase project is active and accessible');
    
    throw error;
  }
};

// Initialize immediately
console.log('🔧 Starting Firebase Admin initialization...');
const adminApp = initializeFirebaseAdmin();

module.exports = adminApp;
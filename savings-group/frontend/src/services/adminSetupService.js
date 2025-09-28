import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ADMIN_CREDENTIALS = {
  email: "byabajunguhenry@gmail.com",
  password: "@123456",
  fullName: "Henry Byabajungu",
  username: "henryadmin",
  role: "admin"
};

export const checkAndSetupInitialAdmin = async () => {
  try {
    console.log('🔧 Checking initial admin setup...');
    
    // Check if admin setup is complete
    const configDoc = await getDoc(doc(db, 'systemConfig', 'app-config'));
    
    if (configDoc.exists() && configDoc.data().adminSetup) {
      console.log('✅ Admin already set up');
      return true;
    }

    console.log('🚀 Setting up initial admin...');
    
    // Create admin account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      ADMIN_CREDENTIALS.email, 
      ADMIN_CREDENTIALS.password
    );

    const adminUser = userCredential.user;

    // Create admin document in Firestore
    await setDoc(doc(db, 'members', adminUser.uid), {
      fullName: ADMIN_CREDENTIALS.fullName,
      username: ADMIN_CREDENTIALS.username,
      email: ADMIN_CREDENTIALS.email,
      role: ADMIN_CREDENTIALS.role,
      dateJoined: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      isActive: true
    });

    // Mark admin setup as complete
    await setDoc(doc(db, 'systemConfig', 'app-config'), {
      adminSetup: true,
      initialAdminId: adminUser.uid,
      appVersion: '1.0.0',
      createdAt: new Date()
    });

    console.log('✅ Initial admin setup completed');
    return true;

  } catch (error) {
    // If admin already exists, that's okay
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin email already exists, marking setup complete');
      
      await setDoc(doc(db, 'systemConfig', 'app-config'), {
        adminSetup: true,
        appVersion: '1.0.0',
        createdAt: new Date()
      });
      
      return true;
    }
    
    console.error('❌ Admin setup failed:', error);
    throw error;
  }
};
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail // ✅ Added missing import
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Store current user token for API calls
let currentUserToken = null;

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: "byabajunguhenry@gmail.com",
  password: "@123456",
  role: 'admin',
  uid: 'admin-user-id',
  displayName: 'Henry Byabajungu'
};

// Get current user's Firebase ID token
export const getCurrentUserToken = async () => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(true);
      currentUserToken = token;
      return token;
    } catch (error) {
      console.error('❌ Error getting user token:', error);
      return null;
    }
  }
  return null;
};

// Updated loginUser function with better error handling
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Attempting login for:', email);
    
    // 1. First check for hardcoded admin
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      console.log('👑 Admin login successful');
      return {
        uid: ADMIN_CREDENTIALS.uid,
        email: ADMIN_CREDENTIALS.email,
        displayName: ADMIN_CREDENTIALS.displayName,
        role: ADMIN_CREDENTIALS.role
      };
    }
    
    // 2. For regular members, use Firebase Auth
    console.log('🔐 Attempting Firebase auth for member:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase auth successful, UID:', user.uid);
    
    // Get the token immediately after login
    const token = await user.getIdToken();
    currentUserToken = token;
    
    // 3. Get member data from Firestore
    console.log('📋 Fetching member data from Firestore for UID:', user.uid);
    const userDoc = await getDoc(doc(db, 'members', user.uid));
    
    if (!userDoc.exists()) {
      console.error('❌ Member document not found in Firestore for UID:', user.uid);
      throw new Error('Member account not found. Please contact administrator.');
    }
    
    const userData = userDoc.data();
    console.log('✅ Member data found:', userData);
    
    // Check if user is active
    if (userData.isActive === false) {
      console.log('❌ Member account is deactivated');
      await firebaseSignOut(auth);
      throw new Error('Account is deactivated. Please contact administrator.');
    }
    
    // Return complete user object
    const completeUser = {
      uid: user.uid,
      email: user.email,
      displayName: userData.fullName || user.displayName,
      role: userData.role || 'member',
      ...userData
    };
    
    console.log('✅ Login successful, returning user:', completeUser);
    return completeUser;
    
  } catch (error) {
    console.error('❌ Login error details:', {
      code: error.code,
      message: error.message,
      email: email
    });
    
    // User-friendly error messages
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please check your credentials.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Account is disabled. Please contact administrator.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('not found')) {
      errorMessage = 'Account not registered. Please contact administrator.';
    } else if (error.message.includes('deactivated')) {
      errorMessage = error.message;
    }
    
    console.error('❌ Login failed with message:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Register a new member (admin only)
export const registerMember = async (memberData, password) => {
  try {
    console.log('👤 Registering new member:', memberData.email);
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      memberData.email, 
      password
    );
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth user created:', user.uid);
    
    // Create member document in Firestore
    const memberDoc = {
      id: user.uid,
      fullName: memberData.fullName,
      username: memberData.username,
      email: memberData.email,
      gender: memberData.gender,
      residence: memberData.residence,
      role: 'member',
      dateJoined: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      createdBy: auth.currentUser ? auth.currentUser.uid : 'system',
      isActive: true
    };
    
    await setDoc(doc(db, 'members', user.uid), memberDoc);
    console.log('✅ Member document created in Firestore');
    
    return {
      uid: user.uid,
      ...memberDoc
    };
  } catch (error) {
    console.error('❌ Error registering member:', error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Failed to register member. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email address is already in use by another account.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    throw new Error(errorMessage);
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    console.log('🚪 Logging out user...');
    await firebaseSignOut(auth);
    currentUserToken = null;
    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Logout error:', error);
    currentUserToken = null;
    throw new Error('Failed to logout. Please try again.');
  }
};

// Password reset function
export const resetPassword = async (email) => {
  try {
    console.log('🔐 Sending password reset email to:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
  } catch (error) {
    console.error('❌ Password reset error:', error);
    
    let errorMessage = 'Failed to send password reset email.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    throw new Error(errorMessage);
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if current user is admin
export const isAdmin = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    // Check if it's the hardcoded admin
    if (user.email === ADMIN_CREDENTIALS.email) {
      return true;
    }
    
    // Check role in Firestore
    const userDoc = await getDoc(doc(db, 'members', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength,
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    score: [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    ].filter(Boolean).length
  };
};

// Export aliases for compatibility
export const login = loginUser;
export const logout = logoutUser;
export const signOut = logoutUser;
export const register = registerMember;
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

let currentUserToken = null;

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'byabajunguhenry@gmail.com';

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

export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Attempting Firebase login for:', email);

    // Sign in via Firebase Auth for ALL users including admin
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Firebase auth successful, UID:', user.uid);

    const token = await user.getIdToken();
    currentUserToken = token;

    // If admin — return admin user object directly, no Firestore lookup needed
    if (email === ADMIN_EMAIL) {
      console.log('👑 Admin login successful');
      return {
        uid: user.uid,           // real Firebase UID
        email: user.email,
        displayName: 'Henry Byabajungu',
        role: 'admin',
      };
    }

    // For regular members — fetch data from Firestore
    console.log('📋 Fetching member data from Firestore for UID:', user.uid);
    const userDoc = await getDoc(doc(db, 'members', user.uid));

    if (!userDoc.exists()) {
      console.error('❌ Member document not found in Firestore for UID:', user.uid);
      await firebaseSignOut(auth);
      throw new Error('Member account not found. Please contact administrator.');
    }

    const userData = userDoc.data();

    if (userData.isActive === false) {
      console.log('❌ Member account is deactivated');
      await firebaseSignOut(auth);
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    const completeUser = {
      uid: user.uid,
      email: user.email,
      displayName: userData.fullName || user.displayName,
      role: userData.role || 'member',
      ...userData,
    };

    console.log('✅ Member login successful:', completeUser);
    return completeUser;

  } catch (error) {
    console.error('❌ Login error:', error.code, error.message);

    let errorMessage = 'Login failed. Please try again.';

    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Account is disabled. Please contact administrator.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('not found') || error.message.includes('deactivated')) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const registerMember = async (memberData, password) => {
  try {
    console.log('👤 Registering new member:', memberData.email);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      memberData.email,
      password
    );
    const user = userCredential.user;

    console.log('✅ Firebase Auth user created:', user.uid);

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
      isActive: true,
    };

    await setDoc(doc(db, 'members', user.uid), memberDoc);
    console.log('✅ Member document created in Firestore');

    return { uid: user.uid, ...memberDoc };

  } catch (error) {
    console.error('❌ Error registering member:', error);

    let errorMessage = 'Failed to register member. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email address is already in use.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak.';
    }

    throw new Error(errorMessage);
  }
};

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

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
  } catch (error) {
    let errorMessage = 'Failed to send password reset email.';
    if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email.';
    else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address format.';
    throw new Error(errorMessage);
  }
};

export const isAuthenticated = () => auth.currentUser !== null;
export const getCurrentUser = () => auth.currentUser;

export const isAdmin = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    if (user.email === ADMIN_EMAIL) return true;
    const userDoc = await getDoc(doc(db, 'members', user.uid));
    if (userDoc.exists()) return userDoc.data().role === 'admin';
    return false;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
};

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePasswordStrength = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return {
    isValid: password.length >= 6,
    length: password.length >= 6,
    hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar,
    score: [password.length >= 6, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
  };
};

export const login = loginUser;
export const logout = logoutUser;
export const signOut = logoutUser;
export const register = registerMember;
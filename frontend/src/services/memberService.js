import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// Get all members with optional filters
export const getAllMembers = async (filters = {}) => {
  try {
    console.log('📋 Fetching members from Firestore...');
    
    let membersQuery = query(
      collection(db, 'members'),
      orderBy('fullName')
    );

    if (filters.status === 'active') {
      membersQuery = query(membersQuery, where('isActive', '==', true));
    } else if (filters.status === 'inactive') {
      membersQuery = query(membersQuery, where('isActive', '==', false));
    }

    const querySnapshot = await getDocs(membersQuery);
    const members = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        id: doc.id,
        fullName: data.fullName || '',
        username: data.username || '',
        email: data.email || '',
        gender: data.gender || '',
        residence: data.residence || '',
        dateJoined: data.dateJoined || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        role: data.role || 'member',
        createdAt: data.createdAt || '',
        createdBy: data.createdBy || '',
        lastInterestDate: data.lastInterestDate || data.dateJoined || ''
      });
    });

    console.log('✅ Members fetched from Firestore:', members.length);
    return members;
    
  } catch (error) {
    console.error('❌ Error fetching members from Firestore:', error);
    return [];
  }
};

// Create new member
export const createMember = async (memberData) => {
  try {
    console.log('👤 Creating new member:', memberData);
    
    if (!memberData.fullName || !memberData.email || !memberData.username || !memberData.password) {
      throw new Error('Missing required fields: fullName, email, username, and password are required');
    }

    const usernameExists = await checkUsernameExists(memberData.username);
    if (usernameExists) {
      throw new Error('Username already exists. Please choose a different username.');
    }

    const emailExists = await checkEmailExists(memberData.email);
    if (emailExists) {
      throw new Error('Email already exists. Please use a different email address.');
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      memberData.email, 
      memberData.password
    );

    const newUser = userCredential.user;
    console.log('✅ Firebase Auth account created:', newUser.uid);

    const today = new Date().toISOString().split('T')[0];

    const memberDoc = {
      fullName: memberData.fullName.trim(),
      username: memberData.username.toLowerCase().trim(),
      email: memberData.email.toLowerCase().trim(),
      gender: memberData.gender || '',
      residence: memberData.residence || '',
      role: 'member',
      dateJoined: today,
      createdAt: new Date(),
      createdBy: auth.currentUser?.uid || 'system',
      isActive: true,
      lastInterestDate: today
    };

    await setDoc(doc(db, 'members', newUser.uid), memberDoc);
    console.log('✅ Member data saved to Firestore');

    return {
      id: newUser.uid,
      ...memberDoc
    };

  } catch (error) {
    console.error('❌ Error creating member:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email address is already in use by another account');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters');
    }
    
    throw new Error(error.message || 'Failed to create member account');
  }
};

// Update existing member
export const updateMember = async (memberId, updateData) => {
  try {
    console.log('📝 Updating member:', memberId);
    
    const memberDoc = await getDoc(doc(db, 'members', memberId));
    if (!memberDoc.exists()) {
      throw new Error('Member not found');
    }

    if (updateData.username) {
      const usernameExists = await checkUsernameExists(updateData.username, memberId);
      if (usernameExists) {
        throw new Error('Username already exists. Please choose a different username.');
      }
    }

    if (updateData.email) {
      const emailExists = await checkEmailExists(updateData.email, memberId);
      if (emailExists) {
        throw new Error('Email already exists. Please use a different email address.');
      }
    }

    const cleanUpdateData = {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: auth.currentUser?.uid || 'system'
    };

    Object.keys(cleanUpdateData).forEach(key => {
      if (cleanUpdateData[key] === undefined) {
        delete cleanUpdateData[key];
      }
    });

    await updateDoc(doc(db, 'members', memberId), cleanUpdateData);
    console.log('✅ Member updated successfully');

    const updatedDoc = await getDoc(doc(db, 'members', memberId));
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };

  } catch (error) {
    console.error('❌ Error updating member:', error);
    throw new Error(error.message || 'Failed to update member');
  }
};

// ✅ UPDATED: Delete member with cascade delete for transactions
export const deleteMember = async (memberId) => {
  try {
    console.log('🗑️ Deleting member:', memberId);
    
    const memberDoc = await getDoc(doc(db, 'members', memberId));
    if (!memberDoc.exists()) {
      throw new Error('Member not found');
    }

    const memberData = memberDoc.data();
    
    // ✅ STEP 1: Delete all transactions for this member
    console.log('📦 Deleting all transactions for member...');
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('memberId', '==', memberId)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    if (!transactionsSnapshot.empty) {
      const batch = writeBatch(db);
      transactionsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${transactionsSnapshot.size} transactions for member`);
    } else {
      console.log('ℹ️ No transactions found for this member');
    }
    
    // ✅ STEP 2: Delete the member document
    await deleteDoc(doc(db, 'members', memberId));
    console.log('✅ Member document deleted successfully');

    // ✅ STEP 3: Note about Firebase Auth deletion
    try {
      console.log('⚠️ Firebase Auth account deletion requires admin privileges');
      console.log('💡 Use the admin API endpoint: DELETE /api/admin/users/${memberId}');
    } catch (authError) {
      console.warn('Could not delete Firebase Auth account:', authError);
    }

    return true;

  } catch (error) {
    console.error('❌ Error deleting member:', error);
    throw new Error(error.message || 'Failed to delete member');
  }
};

// Helper function to check if username exists
const checkUsernameExists = async (username, excludeId = null) => {
  try {
    const membersQuery = query(
      collection(db, 'members'),
      where('username', '==', username.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(membersQuery);
    
    let exists = false;
    querySnapshot.forEach((doc) => {
      if (!excludeId || doc.id !== excludeId) {
        exists = true;
      }
    });
    
    return exists;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

// Helper function to check if email exists
const checkEmailExists = async (email, excludeId = null) => {
  try {
    const membersQuery = query(
      collection(db, 'members'),
      where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(membersQuery);
    
    let exists = false;
    querySnapshot.forEach((doc) => {
      if (!excludeId || doc.id !== excludeId) {
        exists = true;
      }
    });
    
    return exists;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

export const fixMemberActiveStatus = async () => {
  try {
    console.log('🔧 Fixing member active status...');
    
    const membersQuery = query(collection(db, 'members'));
    const querySnapshot = await getDocs(membersQuery);
    
    let count = 0;
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.isActive === undefined || data.isActive !== true) {
        await updateDoc(doc.ref, { isActive: true });
        console.log(`✅ Updated member ${data.fullName || data.username} to active`);
        count++;
      }
    }
    
    console.log(`✅ Fixed ${count} members`);
    return count;
  } catch (error) {
    console.error('❌ Error fixing member active status:', error);
    return 0;
  }
};
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
  deleteDoc
} from 'firebase/firestore';

// Get all members with optional filters
export const getAllMembers = async (filters = {}) => {
  try {
    console.log('📋 Fetching members from Firestore...');
    
    let membersQuery = query(
      collection(db, 'members'),
      orderBy('fullName')
    );

    // Apply status filter if provided
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
        createdBy: data.createdBy || ''
      });
    });

    console.log('✅ Members fetched from Firestore:', members.length);
    return members;
    
  } catch (error) {
    console.error('❌ Error fetching members from Firestore:', error);
    
    // Return empty array instead of mock data for production
    return [];
  }
};

// Create new member
export const createMember = async (memberData) => {
  try {
    console.log('👤 Creating new member:', memberData);
    
    // Validate required fields
    if (!memberData.fullName || !memberData.email || !memberData.username || !memberData.password) {
      throw new Error('Missing required fields: fullName, email, username, and password are required');
    }

    // Check if username already exists
    const usernameExists = await checkUsernameExists(memberData.username);
    if (usernameExists) {
      throw new Error('Username already exists. Please choose a different username.');
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(memberData.email);
    if (emailExists) {
      throw new Error('Email already exists. Please use a different email address.');
    }

    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      memberData.email, 
      memberData.password
    );

    const newUser = userCredential.user;
    console.log('✅ Firebase Auth account created:', newUser.uid);

    // Prepare member data for Firestore
    const memberDoc = {
      fullName: memberData.fullName.trim(),
      username: memberData.username.toLowerCase().trim(),
      email: memberData.email.toLowerCase().trim(),
      gender: memberData.gender || '',
      residence: memberData.residence || '',
      role: 'member',
      dateJoined: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      createdBy: auth.currentUser?.uid || 'system',
      isActive: true
    };

    // Save member data to Firestore
    await setDoc(doc(db, 'members', newUser.uid), memberDoc);
    console.log('✅ Member data saved to Firestore');

    return {
      id: newUser.uid,
      ...memberDoc
    };

  } catch (error) {
    console.error('❌ Error creating member:', error);
    
    // Handle specific Firebase Auth errors
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
    
    // Validate member exists
    const memberDoc = await getDoc(doc(db, 'members', memberId));
    if (!memberDoc.exists()) {
      throw new Error('Member not found');
    }

    // Check for username conflicts (if username is being updated)
    if (updateData.username) {
      const usernameExists = await checkUsernameExists(updateData.username, memberId);
      if (usernameExists) {
        throw new Error('Username already exists. Please choose a different username.');
      }
    }

    // Check for email conflicts (if email is being updated)
    if (updateData.email) {
      const emailExists = await checkEmailExists(updateData.email, memberId);
      if (emailExists) {
        throw new Error('Email already exists. Please use a different email address.');
      }
    }

    // Prepare update data
    const cleanUpdateData = {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: auth.currentUser?.uid || 'system'
    };

    // Remove undefined values
    Object.keys(cleanUpdateData).forEach(key => {
      if (cleanUpdateData[key] === undefined) {
        delete cleanUpdateData[key];
      }
    });

    // Update member document
    await updateDoc(doc(db, 'members', memberId), cleanUpdateData);
    console.log('✅ Member updated successfully');

    // Return updated member data
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

// Delete member
export const deleteMember = async (memberId) => {
  try {
    console.log('🗑️ Deleting member:', memberId);
    
    // Validate member exists
    const memberDoc = await getDoc(doc(db, 'members', memberId));
    if (!memberDoc.exists()) {
      throw new Error('Member not found');
    }

    // Get member data to check if they have a Firebase Auth account
    const memberData = memberDoc.data();
    
    try {
      // Try to delete the Firebase Auth account if it exists
      // Note: This requires admin privileges or the user to be currently signed in
      // For now, we'll just delete the Firestore document
      console.log('⚠️ Firebase Auth account deletion requires admin privileges');
    } catch (authError) {
      console.warn('Could not delete Firebase Auth account:', authError);
    }

    // Delete the Firestore document
    await deleteDoc(doc(db, 'members', memberId));
    console.log('✅ Member document deleted successfully');

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
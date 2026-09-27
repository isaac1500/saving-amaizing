const admin = require('firebase-admin');

const createMember = async (req, res) => {
  try {
    const { 
      fullName, 
      username, 
      email, 
      password, 
      gender, 
      residence, 
      role = 'member',
      createdBy 
    } = req.body;

    // Validate required fields
    if (!fullName || !username || !email || !password || !createdBy) {
      return res.status(400).json({ 
        error: 'Missing required fields: fullName, username, email, password, createdBy' 
      });
    }

    // Check if username or email already exists
    const existingMember = await admin.firestore()
      .collection('members')
      .where('username', '==', username)
      .get();

    if (!existingMember.empty) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await admin.firestore()
      .collection('members')
      .where('email', '==', email)
      .get();

    if (!existingEmail.empty) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: fullName,
        disabled: false
      });
    } catch (authError) {
      console.error('Firebase Auth error:', authError);
      return res.status(400).json({ error: 'Failed to create user account: ' + authError.message });
    }

    // Create member in Firestore
    const memberData = {
      id: firebaseUser.uid,
      fullName,
      username,
      email,
      gender: gender || '',
      residence: residence || '',
      role,
      dateJoined: new Date().toISOString(),
      createdBy,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore()
      .collection('members')
      .doc(firebaseUser.uid)
      .set(memberData);

    res.status(201).json({
      message: 'Member created successfully',
      member: memberData
    });

  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', activeOnly = true } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = admin.firestore()
      .collection('members')
      .orderBy('createdAt', 'desc');

    // Filter by active status
    if (activeOnly === 'true') {
      query = query.where('isActive', '==', true);
    }

    const snapshot = await query.get();
    
    let members = [];
    snapshot.forEach(doc => {
      members.push({ id: doc.id, ...doc.data() });
    });

    // Apply search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      members = members.filter(member => 
        member.fullName.toLowerCase().includes(searchTerm) ||
        member.username.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const total = members.length;
    const paginatedMembers = members.slice(offset, offset + limitNum);

    res.status(200).json({
      members: paginatedMembers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.createdAt;
    delete updates.dateJoined;

    // Add updated timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await admin.firestore()
      .collection('members')
      .doc(id)
      .update(updates);

    // Also update Firebase Auth user if email or display name changed
    if (updates.email || updates.fullName) {
      const authUpdates = {};
      if (updates.email) authUpdates.email = updates.email;
      if (updates.fullName) authUpdates.displayName = updates.fullName;
      
      await admin.auth().updateUser(id, authUpdates);
    }

    res.status(200).json({ message: 'Member updated successfully' });

  } catch (error) {
    console.error('Error updating member:', error);
    
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - mark as inactive
    await admin.firestore()
      .collection('members')
      .doc(id)
      .update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Disable the Firebase Auth user
    await admin.auth().updateUser(id, {
      disabled: true
    });

    res.status(200).json({ message: 'Member deleted successfully' });

  } catch (error) {
    console.error('Error deleting member:', error);
    
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createMember,
  getMembers,
  updateMember,
  deleteMember
};
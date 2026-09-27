const admin = require('../services/firebaseService');

const addTestMembers = async () => {
  try {
    const db = admin.firestore();
    
    const testMembers = [
      {
        fullName: "Isaac Johnson",
        username: "isaacj",
        email: "isaac@example.com",
        residence: "Kampala",
        gender: "Male",
        role: "member",
        dateJoined: "2024-01-15",
        isActive: true,
        createdAt: new Date()
      },
      {
        fullName: "Nathan Smith",
        username: "nathans",
        email: "nathan@example.com",
        residence: "Entebbe",
        gender: "Male",
        role: "member",
        dateJoined: "2024-01-20",
        isActive: true,
        createdAt: new Date()
      },
      {
        fullName: "Sarah Johnson",
        username: "sarahj",
        email: "sarah@example.com",
        residence: "Kampala",
        gender: "Female",
        role: "member",
        dateJoined: "2024-01-25",
        isActive: true,
        createdAt: new Date()
      }
    ];

    console.log('📝 Adding test members to Firestore...');
    
    for (const member of testMembers) {
      const docRef = await db.collection('members').add(member);
      console.log(`✅ Added member: ${member.fullName} (ID: ${docRef.id})`);
    }

    console.log('🎉 Test members added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test members:', error);
    process.exit(1);
  }
};

// Run the script
addTestMembers();
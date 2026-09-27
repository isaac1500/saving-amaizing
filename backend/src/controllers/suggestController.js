const admin = require('../services/firebaseService');

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const searchMembers = async (searchTerm) => {
  try {
    console.log('🔍 Backend: Searching for:', searchTerm);
    
    // ✅ FIXED: Get ALL members without filtering first
    const membersRef = admin.firestore().collection('members');
    const snapshot = await membersRef.get();
    
    console.log(`📊 Backend: Found ${snapshot.size} total members in database`);
    
    if (snapshot.empty) {
      console.log('❌ Backend: No members found in database');
      return [];
    }
    
    const allMembers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // ✅ Check if this is a valid member document (has fullName or username)
      if (data.fullName || data.username) {
        const member = { 
          id: doc.id, 
          ...data,
          // ✅ Ensure isActive defaults to true if missing
          isActive: data.isActive !== undefined ? data.isActive : true
        };
        allMembers.push(member);
        console.log(`👤 Backend: Member - ${member.fullName || member.username} (${member.username})`);
      } else {
        console.log(`⚠️ Backend: Skipping invalid member document: ${doc.id}`);
      }
    });
    
    // If no search term, return all members
    if (!searchTerm || searchTerm.length < 2) {
      console.log(`✅ Backend: Returning all ${allMembers.length} members`);
      return allMembers;
    }
    
    // Simple fuzzy search implementation
    const results = allMembers.filter(member => {
      // Skip inactive members if you want to filter them
      // if (member.isActive === false) return false;
      
      const searchFields = [
        member.fullName || '',
        member.username || '',
        member.email || '',
        member.residence || ''
      ].map(field => field.toLowerCase());
      
      const found = searchFields.some(field => 
        field.includes(searchTerm.toLowerCase())
      );
      
      if (found) {
        console.log(`✅ Backend: Match found - ${member.fullName || member.username}`);
      }
      
      return found;
    });
    
    console.log(`🎯 Backend: Found ${results.length} matches for "${searchTerm}"`);
    
    // Limit to 10 results and rank by relevance
    const finalResults = results
      .sort((a, b) => {
        const aName = (a.fullName || a.username || '').toLowerCase();
        const bName = (b.fullName || b.username || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        const aStartsWith = aName.startsWith(searchLower);
        const bStartsWith = bName.startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return 0;
      })
      .slice(0, 10)
      .map(member => ({
        id: member.id,
        fullName: member.fullName || member.username || 'Unknown',
        username: member.username || '',
        email: member.email || '',
        residence: member.residence || '',
        gender: member.gender || '',
        dateJoined: member.dateJoined || '',
        isActive: member.isActive !== undefined ? member.isActive : true,
        role: member.role || 'member'
      }));

    console.log('📤 Backend: Sending results:', finalResults.length);
    return finalResults;
  } catch (error) {
    console.error('❌ Backend: Error searching members:', error);
    throw error;
  }
};

const getMemberSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    console.log('🌐 Backend: API called with query:', q);
    
    // ✅ Allow empty query to return all members
    if (!q || q.length < 1) {
      console.log('ℹ️ Backend: No query, returning all members');
      const allMembers = await searchMembers('');
      return res.status(200).json(allMembers);
    }
    
    const searchTerm = q.toLowerCase().trim();
    const cacheKey = `suggestions:${searchTerm}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('💾 Backend: Returning cached results');
      return res.status(200).json(cached.data);
    }
    
    // Search in Firebase
    const suggestions = await searchMembers(searchTerm);
    
    // Cache the results
    cache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now()
    });
    
    console.log(`🚀 Backend: Sending ${suggestions.length} suggestions`);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('💥 Backend: Error in getMemberSuggestions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// ✅ NEW: Force clear cache (useful for debugging)
const clearCache = () => {
  cache.clear();
  console.log('🧹 Backend: Cache cleared');
};

module.exports = {
  getMemberSuggestions,
  clearCache
};
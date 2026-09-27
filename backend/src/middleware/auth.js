const admin = require('firebase-admin');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'Token revoked' });
    }
    
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin in Firestore
    const userDoc = await admin.firestore()
      .collection('members')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const requireMemberOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    
    // Allow access if user is admin or accessing their own data
    if (id === req.user.uid) {
      return next();
    }

    // Check if user is admin
    const userDoc = await admin.firestore()
      .collection('members')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rate limiting middleware
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    requests.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    });

    // Check rate limit
    const requestCount = Array.from(requests.values()).filter(
      timestamp => timestamp > windowStart
    ).length;

    if (requestCount >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil((requests.get(ip) + windowMs - now) / 1000)
      });
    }

    // Record this request
    requests.set(ip, now);
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireMemberOrAdmin,
  rateLimit
};
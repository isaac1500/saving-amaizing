const express = require('express');
const router = express.Router();

/**
 * Validate API key from header or query parameter
 */
const validateApiKey = (req) => {
  const headerKey = req.headers['x-api-key'];
  if (headerKey && headerKey === process.env.INTEREST_API_KEY) {
    return true;
  }
  
  const queryKey = req.query.key;
  if (queryKey && queryKey === process.env.INTEREST_API_KEY) {
    return true;
  }
  
  return false;
};

/**
 * POST /api/interest/apply
 * GET /api/interest/apply
 * Trigger daily compound interest calculation - responds IMMEDIATELY
 */
router.all('/apply', async (req, res) => {
  if (!validateApiKey(req)) {
    return res.status(401).json({ 
      error: 'Unauthorized: missing or invalid API key',
      required: 'x-api-key header or ?key=your-key query parameter'
    });
  }

  console.log(`🚀 Interest calculation triggered (${req.method})`);
  
  // ✅ Send response IMMEDIATELY - before any processing
  res.status(200).json({
    success: true,
    message: 'Interest calculation started in background',
    timestamp: new Date().toISOString()
  });

  // ✅ Run AFTER the response has been fully sent
  res.on('finish', () => {
    setImmediate(async () => {
      try {
        console.log('🔄 Starting background interest calculation...');
        // Lazy require to avoid blocking
        const { applyDailyInterest } = require('../services/interestService');
        const result = await applyDailyInterest();
        console.log(`✅ Background interest completed: ${result.processed} members, ${result.totalInterest.toFixed(2)} interest`);
      } catch (error) {
        console.error('❌ Background interest calculation failed:', error);
      }
    });
  });
});

/**
 * GET /api/interest/status
 * Check the status of the last interest calculation
 */
router.get('/status', async (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.key;
  if (!apiKey || apiKey !== process.env.INTEREST_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const admin = require('../services/firebaseService');
    const db = admin.firestore();
    
    const [statusDoc, lastRunDoc] = await Promise.all([
      db.collection('system').doc('interestStatus').get(),
      db.collection('system').doc('interestLastRun').get()
    ]);
    
    res.status(200).json({
      status: 'ok',
      currentStatus: statusDoc.exists ? statusDoc.data() : null,
      lastRun: lastRunDoc.exists ? lastRunDoc.data() : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
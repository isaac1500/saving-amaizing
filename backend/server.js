const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('./src/services/firebaseService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// ============================================================
// ✅ FIXED CORS - Allow both localhost and Netlify
// ============================================================
const allowedOrigins = [
  'https://amazingmen.netlify.app',
  'https://amazingmen.netlify.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked CORS origin:', origin);
      // In development, you might want to allow all
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'same-origin'}`);
  next();
});

// ============================================================
// ROUTES
// ============================================================

// ✅ Check if routes exist before using them
try {
  require.resolve('./src/routes/suggestions');
  app.use('/api/suggestions', require('./src/routes/suggestions'));
  console.log('✅ Suggestions routes loaded');
} catch (error) {
  console.warn('⚠️ Suggestions routes not found');
}

try {
  require.resolve('./src/routes/interest');
  app.use('/api/interest', require('./src/routes/interest'));
  console.log('✅ Interest routes loaded');
} catch (error) {
  console.warn('⚠️ Interest routes not found');
}

try {
  require.resolve('./src/routes/transactions');
  app.use('/api/transactions', require('./src/routes/transactions'));
  console.log('✅ Transactions routes loaded');
} catch (error) {
  console.warn('⚠️ Transactions routes not found');
}

try {
  require.resolve('./src/routes/admin');
  app.use('/api/admin', require('./src/routes/admin'));
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.warn('⚠️ Admin routes not found');
}

// ============================================================
// HEALTH & TEST ENDPOINTS
// ============================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      isOriginAllowed: req.headers.origin ? allowedOrigins.includes(req.headers.origin) : true
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin || 'same-origin',
      allowed: allowedOrigins
    }
  });
});

// ============================================================
// REPORTS ENDPOINTS
// ============================================================

// Group summary report
app.get('/api/reports/group-summary', async (req, res) => {
  try {
    console.log('📊 Generating group summary...');
    
    const db = admin.firestore();
    
    const [membersSnapshot, transactionsSnapshot] = await Promise.all([
      db.collection('members')
        .where('isActive', '==', true)
        .get(),
      db.collection('transactions').get()
    ]);
    
    let totalSavings = 0;
    let totalWithdrawals = 0;
    let totalInterest = 0;
    
    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      if (transaction.type === 'Saving') {
        totalSavings += (parseFloat(transaction.weeklySaving) || 0) +
                       (parseFloat(transaction.munomukabi) || 0) +
                       (parseFloat(transaction.otherSaving) || 0);
      } else if (transaction.type === 'Withdrawal') {
        totalWithdrawals += parseFloat(transaction.withdrawal) || 0;
      } else if (transaction.type === 'Interest') {
        totalInterest += parseFloat(transaction.otherSaving) || 0;
      }
    });
    
    const summary = {
      totalMembers: membersSnapshot.size,
      totalSavings: totalSavings,
      totalWithdrawals: totalWithdrawals,
      totalInterest: totalInterest,
      netBalance: totalSavings + totalInterest - totalWithdrawals,
      recentActivity: [],
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Group summary generated:', summary);
    res.status(200).json(summary);
  } catch (error) {
    console.error('❌ Error generating group summary:', error.message);
    res.status(200).json({
      totalMembers: 0,
      totalSavings: 0,
      totalWithdrawals: 0,
      totalInterest: 0,
      netBalance: 0,
      recentActivity: [],
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Members reports
app.get('/api/reports/members', async (req, res) => {
  try {
    const db = admin.firestore();
    const membersSnapshot = await db.collection('members')
      .where('isActive', '==', true)
      .get();
    
    const members = [];
    membersSnapshot.forEach(doc => {
      members.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(members);
  } catch (error) {
    console.error('❌ Error fetching member reports:', error.message);
    res.status(200).json([]);
  }
});

// Quick summary
app.get('/api/reports/quick-summary', async (req, res) => {
  try {
    const db = admin.firestore();
    const membersSnapshot = await db.collection('members')
      .where('isActive', '==', true)
      .get();
    
    res.status(200).json({
      totalMembers: membersSnapshot.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in quick summary:', error);
    res.status(200).json({
      totalMembers: 0,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// ROOT ENDPOINT
// ============================================================

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Savings Group Management API',
    version: '1.0.0',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      suggestions: '/api/suggestions/members',
      reports: '/api/reports/group-summary',
      quickReports: '/api/reports/quick-summary',
      interest: '/api/interest/apply (POST, requires API key)',
      transactions: '/api/transactions',
      admin: '/api/admin/users/:uid (PUT/DELETE)'
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// 404 HANDLER - Helps debug missing endpoints
// ============================================================

app.use((req, res) => {
  const availableEndpoints = [
    'GET /',
    'GET /api/health',
    'GET /api/test',
    'GET /api/suggestions/members',
    'GET /api/reports/group-summary',
    'GET /api/reports/members',
    'GET /api/reports/quick-summary',
    'POST /api/interest/apply',
    'GET /api/transactions',
    'POST /api/transactions',
    'PUT /api/transactions/:id',
    'DELETE /api/transactions/:id',
    'PUT /api/admin/users/:uid/email',
    'DELETE /api/admin/users/:uid'
  ];

  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: availableEndpoints,
    tip: 'Check if the route exists and is properly configured'
  });
});

// ============================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  console.error('❌ Stack:', err.stack);
  
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'An unexpected error occurred';
  
  res.status(500).json({
    error: 'Internal server error',
    message: errorMessage,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// START SERVER
// ============================================================

// ✅ Bind to 0.0.0.0 for Railway/Cloud hosting
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Cloud: http://144.24.242.189:${PORT}`);
  console.log('='.repeat(60));
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🔍 Suggestions API: http://localhost:${PORT}/api/suggestions/members`);
  console.log(`📊 Reports API: http://localhost:${PORT}/api/reports/group-summary`);
  console.log(`⚡ Quick Reports: http://localhost:${PORT}/api/reports/quick-summary`);
  console.log(`💰 Interest API: POST http://localhost:${PORT}/api/interest/apply`);
  console.log(`📋 Transactions API: http://localhost:${PORT}/api/transactions`);
  console.log(`👤 Admin API: http://localhost:${PORT}/api/admin/users/:uid`);
  console.log('='.repeat(60));
  console.log('✅ Server is ready to accept requests');
});
const validateMemberRegistration = (req, res, next) => {
  const { fullName, username, email, password, gender, residence } = req.body;
  const errors = [];

  // Required fields validation
  if (!fullName || fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters long');
  }

  if (!username || username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters long');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  // Optional fields validation
  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }

  if (residence && residence.trim().length > 100) {
    errors.push('Residence must be less than 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors 
    });
  }

  next();
};

const validateTransaction = (req, res, next) => {
  const { memberId, memberName, date, type, weeklySaving, munomukabi, otherSaving, withdrawal } = req.body;
  const errors = [];

  // Required fields validation
  if (!memberId || memberId.trim().length === 0) {
    errors.push('Member ID is required');
  }

  if (!memberName || memberName.trim().length < 2) {
    errors.push('Member name is required');
  }

  if (!date || !isValidDate(date)) {
    errors.push('Valid date is required');
  }

  if (!type || !['Saving', 'Withdrawal'].includes(type)) {
    errors.push('Transaction type must be Saving or Withdrawal');
  }

  // Amount validation
  const amounts = [
    { name: 'weeklySaving', value: weeklySaving },
    { name: 'munomukabi', value: munomukabi },
    { name: 'otherSaving', value: otherSaving },
    { name: 'withdrawal', value: withdrawal }
  ];

  amounts.forEach(({ name, value }) => {
    if (value !== undefined && value !== null) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        errors.push(`${name} must be a positive number`);
      }
    }
  });

  // Type-specific validation
  if (type === 'Saving') {
    const totalSaving = (parseFloat(weeklySaving) || 0) + 
                       (parseFloat(munomukabi) || 0) + 
                       (parseFloat(otherSaving) || 0);
    if (totalSaving <= 0) {
      errors.push('At least one saving amount must be greater than 0 for Saving transactions');
    }
  }

  if (type === 'Withdrawal' && (!withdrawal || parseFloat(withdrawal) <= 0)) {
    errors.push('Withdrawal amount must be greater than 0 for Withdrawal transactions');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Transaction validation failed',
      details: errors 
    });
  }

  next();
};

const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && !isValidDate(startDate)) {
    return res.status(400).json({ error: 'Invalid start date format' });
  }

  if (endDate && !isValidDate(endDate)) {
    return res.status(400).json({ error: 'Invalid end date format' });
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Start date cannot be after end date' });
  }

  next();
};

// Utility functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return input;
};

// Middleware to sanitize all request body fields
const sanitizeRequestBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validateMemberRegistration,
  validateTransaction,
  validateDateRange,
  sanitizeRequestBody,
  isValidEmail,
  isValidDate
};
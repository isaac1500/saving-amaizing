export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateAmount = (amount) => {
  if (amount === '' || amount === null || amount === undefined) return true;
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateTransaction = (transaction) => {
  const errors = {};

  if (!validateRequired(transaction.memberId)) {
    errors.memberId = 'Member selection is required';
  }

  if (!validateDate(transaction.date)) {
    errors.date = 'Valid date is required';
  }

  if (!validateRequired(transaction.type)) {
    errors.type = 'Transaction type is required';
  }

  if (transaction.type === 'Saving') {
    const totalSaving = (parseFloat(transaction.weeklySaving) || 0) + 
                       (parseFloat(transaction.munomukabi) || 0) + 
                       (parseFloat(transaction.otherSaving) || 0);
    if (totalSaving <= 0) {
      errors.amount = 'At least one saving amount is required';
    }
  } else if (transaction.type === 'Withdrawal') {
    if (!validateAmount(transaction.withdrawal) || parseFloat(transaction.withdrawal) <= 0) {
      errors.withdrawal = 'Valid withdrawal amount is required';
    }
  }

  return errors;
};

export const validateMember = (member) => {
  const errors = {};

  if (!validateName(member.fullName)) {
    errors.fullName = 'Full name must be at least 2 characters long';
  }

  if (!validateUsername(member.username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscores only)';
  }

  if (!validateEmail(member.email)) {
    errors.email = 'Valid email address is required';
  }

  if (!validatePassword(member.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return errors;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+=\s*"[^"]*"/gi, '')
    .replace(/on\w+=\s*'[^']*'/gi, '')
    .replace(/on\w+=\s*[^>]*/gi, '');
};

export const formatValidationErrors = (errors) => {
  return Object.values(errors).join(', ');
};
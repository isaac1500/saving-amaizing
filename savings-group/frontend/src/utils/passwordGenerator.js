 src/utils/passwordGenerator.js

/**
 * Generate a secure random password for new members
 * @param {number} length - Password length (default: 10)
 * @param {Object} options - Password generation options
 * @returns {string} Generated password
 */
export const generateSecurePassword = (length = 10, options = {}) => {
  const defaultOptions = {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecialChars: false, // Keep false for user-friendly passwords
    excludeSimilar: true, // Exclude similar characters like 0, O, l, I
    minUppercase: 2,
    minLowercase: 2,
    minNumbers: 2
  };

  const config = { ...defaultOptions, ...options };

  // Character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Exclude similar-looking characters if requested
  const similarChars = '0O1lI|`';
  
  let availableChars = '';
  let guaranteedChars = '';

  // Build character set based on options
  if (config.includeUppercase) {
    const upperSet = config.excludeSimilar ? 
      uppercase.split('').filter(char => !similarChars.includes(char)).join('') : 
      uppercase;
    availableChars += upperSet;
    
    // Add minimum required uppercase characters
    for (let i = 0; i < config.minUppercase; i++) {
      guaranteedChars += upperSet[Math.floor(Math.random() * upperSet.length)];
    }
  }

  if (config.includeLowercase) {
    const lowerSet = config.excludeSimilar ? 
      lowercase.split('').filter(char => !similarChars.includes(char)).join('') : 
      lowercase;
    availableChars += lowerSet;
    
    // Add minimum required lowercase characters
    for (let i = 0; i < config.minLowercase; i++) {
      guaranteedChars += lowerSet[Math.floor(Math.random() * lowerSet.length)];
    }
  }

  if (config.includeNumbers) {
    const numberSet = config.excludeSimilar ? 
      numbers.split('').filter(char => !similarChars.includes(char)).join('') : 
      numbers;
    availableChars += numberSet;
    
    // Add minimum required numbers
    for (let i = 0; i < config.minNumbers; i++) {
      guaranteedChars += numberSet[Math.floor(Math.random() * numberSet.length)];
    }
  }

  if (config.includeSpecialChars) {
    const specialSet = config.excludeSimilar ? 
      specialChars.split('').filter(char => !similarChars.includes(char)).join('') : 
      specialChars;
    availableChars += specialSet;
  }

  if (!availableChars) {
    throw new Error('At least one character type must be enabled');
  }

  // Generate remaining characters randomly
  let password = guaranteedChars;
  const remainingLength = length - guaranteedChars.length;

  for (let i = 0; i < remainingLength; i++) {
    password += availableChars[Math.floor(Math.random() * availableChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  password = shuffleString(password);

  return password;
};

/**
 * Shuffle a string randomly
 * @param {string} str - String to shuffle
 * @returns {string} Shuffled string
 */
const shuffleString = (str) => {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
};

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {Object} Strength analysis
 */
export const checkPasswordStrength = (password) => {
  const analysis = {
    score: 0,
    level: 'Very Weak',
    suggestions: [],
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[^A-Za-z0-9]/.test(password),
    length: password.length
  };

  // Length scoring
  if (analysis.length >= 8) analysis.score += 25;
  if (analysis.length >= 12) analysis.score += 25;

  // Character variety scoring
  if (analysis.hasUppercase) analysis.score += 15;
  if (analysis.hasLowercase) analysis.score += 15;
  if (analysis.hasNumbers) analysis.score += 15;
  if (analysis.hasSpecialChars) analysis.score += 15;

  // Determine level
  if (analysis.score >= 90) analysis.level = 'Very Strong';
  else if (analysis.score >= 70) analysis.level = 'Strong';
  else if (analysis.score >= 50) analysis.level = 'Moderate';
  else if (analysis.score >= 30) analysis.level = 'Weak';
  else analysis.level = 'Very Weak';

  // Generate suggestions
  if (analysis.length < 8) {
    analysis.suggestions.push('Use at least 8 characters');
  }
  if (!analysis.hasUppercase) {
    analysis.suggestions.push('Include uppercase letters');
  }
  if (!analysis.hasLowercase) {
    analysis.suggestions.push('Include lowercase letters');
  }
  if (!analysis.hasNumbers) {
    analysis.suggestions.push('Include numbers');
  }
  if (!analysis.hasSpecialChars) {
    analysis.suggestions.push('Include special characters');
  }

  return analysis;
};

/**
 * Generate multiple password options for user to choose from
 * @param {number} count - Number of passwords to generate
 * @param {number} length - Password length
 * @param {Object} options - Generation options
 * @returns {Array} Array of password objects
 */
export const generatePasswordOptions = (count = 3, length = 10, options = {}) => {
  const passwords = [];
  
  for (let i = 0; i < count; i++) {
    const password = generateSecurePassword(length, options);
    const strength = checkPasswordStrength(password);
    
    passwords.push({
      password,
      strength: strength.level,
      score: strength.score
    });
  }
  
  // Sort by strength score (strongest first)
  return passwords.sort((a, b) => b.score - a.score);
};

/**
 * Generate a memorable password using word-based approach
 * @param {number} wordCount - Number of words to use
 * @param {boolean} includeNumbers - Whether to include numbers
 * @returns {string} Memorable password
 */
export const generateMemorablePassword = (wordCount = 3, includeNumbers = true) => {
  const words = [
    'Apple', 'Brave', 'Cloud', 'Dance', 'Eagle', 'Flash', 'Green', 'Happy',
    'Island', 'Jump', 'King', 'Light', 'Magic', 'Night', 'Ocean', 'Peace',
    'Quick', 'River', 'Star', 'Tree', 'Unity', 'Victory', 'Water', 'Xray',
    'Yellow', 'Zebra', 'Bright', 'Calm', 'Dream', 'Fire', 'Gold', 'Hope'
  ];

  let password = '';
  
  // Select random words
  for (let i = 0; i < wordCount; i++) {
    const word = words[Math.floor(Math.random() * words.length)];
    password += word;
    
    // Add numbers between words (except for the last word)
    if (includeNumbers && i < wordCount - 1) {
      password += Math.floor(Math.random() * 100);
    }
  }
  
  // Add final numbers if requested
  if (includeNumbers) {
    password += Math.floor(Math.random() * 100);
  }
  
  return password;
};

/**
 * Validate password meets minimum requirements
 * @param {string} password - Password to validate
 * @param {Object} requirements - Minimum requirements
 * @returns {Object} Validation result
 */
export const validatePassword = (password, requirements = {}) => {
  const defaultRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  };

  const reqs = { ...defaultRequirements, ...requirements };
  const errors = [];

  if (password.length < reqs.minLength) {
    errors.push(`Password must be at least ${reqs.minLength} characters long`);
  }

  if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (reqs.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (reqs.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (reqs.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
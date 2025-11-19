// Validation regex patterns (matching Flask backend)

export const validationPatterns = {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  phone: /^\+?[0-9]{10,15}$/,
  name: /^[a-zA-Z\s]{3,50}$/,
  amount: /^\d+(\.\d{2})?$/,
};

export const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: validationPatterns.email,
      message: 'Invalid email format',
    },
  },
  
  phone: {
    required: 'Phone number is required',
    pattern: {
      value: validationPatterns.phone,
      message: 'Phone must be 10-15 digits, can start with +',
    },
  },
  
  fullName: {
    required: 'Full name is required',
    pattern: {
      value: validationPatterns.name,
      message: 'Name must be 3-50 characters, letters and spaces only',
    },
  },
  
  amount: {
    required: 'Amount is required',
    pattern: {
      value: validationPatterns.amount,
      message: 'Amount must be a valid number (e.g., 50.00)',
    },
    min: {
      value: 5,
      message: 'Minimum donation is $5',
    },
  },
  
  motivation: {
    required: 'Motivation is required',
    minLength: {
      value: 100,
      message: 'Motivation must be at least 100 words',
    },
    maxLength: {
      value: 2500,
      message: 'Motivation must not exceed 500 words',
    },
  },
};

// Helper to count words
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Validate motivation word count
export const validateMotivationWords = (text: string): string | boolean => {
  const wordCount = countWords(text);
  if (wordCount < 100) {
    return `Motivation must be at least 100 words (current: ${wordCount})`;
  }
  if (wordCount > 500) {
    return `Motivation must not exceed 500 words (current: ${wordCount})`;
  }
  return true;
};
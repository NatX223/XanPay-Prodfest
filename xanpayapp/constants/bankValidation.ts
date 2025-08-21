export const ErrorMessages = {
  BANK_REQUIRED: 'Please select a bank',
  ACCOUNT_INVALID: 'Account number must contain only numbers',
  ACCOUNT_LENGTH: 'Account number must be 8-17 digits',
  ACCOUNT_REQUIRED: 'Account number is required',
  SAVE_FAILED: 'Failed to save bank details. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTHENTICATION_ERROR: 'Please sign in to continue',
  VALIDATION_ERROR: 'Please correct the errors below'
} as const;

export const ValidationRules = {
  ACCOUNT_NUMBER: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 17,
    PATTERN: /^\d+$/
  }
} as const;

export const validateAccountNumber = (accountNumber: string): { isValid: boolean; error?: string } => {
  if (!accountNumber.trim()) {
    return { isValid: false, error: ErrorMessages.ACCOUNT_REQUIRED };
  }
  
  if (!ValidationRules.ACCOUNT_NUMBER.PATTERN.test(accountNumber)) {
    return { isValid: false, error: ErrorMessages.ACCOUNT_INVALID };
  }
  
  if (accountNumber.length < ValidationRules.ACCOUNT_NUMBER.MIN_LENGTH || 
      accountNumber.length > ValidationRules.ACCOUNT_NUMBER.MAX_LENGTH) {
    return { isValid: false, error: ErrorMessages.ACCOUNT_LENGTH };
  }
  
  return { isValid: true };
};

export const validateBankCode = (bankCode: string): { isValid: boolean; error?: string } => {
  if (!bankCode.trim()) {
    return { isValid: false, error: ErrorMessages.BANK_REQUIRED };
  }
  
  return { isValid: true };
};

export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }
  
  const lastFour = accountNumber.slice(-4);
  const masked = '*'.repeat(accountNumber.length - 4);
  return masked + lastFour;
};
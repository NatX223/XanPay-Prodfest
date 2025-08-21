import { validateAccountNumber, validateBankCode, maskAccountNumber } from '@/constants/bankValidation';
import { BANK_OPTIONS, getBankByCode, getBankNameByCode } from '@/constants/bankOptions';

describe('Bank Details Validation', () => {
  describe('validateAccountNumber', () => {
    it('should validate correct account numbers', () => {
      const result = validateAccountNumber('12345678');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty account numbers', () => {
      const result = validateAccountNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Account number is required');
    });

    it('should reject non-numeric account numbers', () => {
      const result = validateAccountNumber('123abc456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Account number must contain only numbers');
    });

    it('should reject account numbers that are too short', () => {
      const result = validateAccountNumber('1234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Account number must be 8-17 digits');
    });

    it('should reject account numbers that are too long', () => {
      const result = validateAccountNumber('123456789012345678');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Account number must be 8-17 digits');
    });
  });

  describe('validateBankCode', () => {
    it('should validate non-empty bank codes', () => {
      const result = validateBankCode('BOA');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty bank codes', () => {
      const result = validateBankCode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please select a bank');
    });
  });

  describe('maskAccountNumber', () => {
    it('should mask account numbers correctly', () => {
      const masked = maskAccountNumber('1234567890');
      expect(masked).toBe('******7890');
    });

    it('should not mask short account numbers', () => {
      const masked = maskAccountNumber('1234');
      expect(masked).toBe('1234');
    });
  });
});

describe('Bank Options', () => {
  it('should have valid bank options', () => {
    expect(BANK_OPTIONS.length).toBeGreaterThan(0);
    expect(BANK_OPTIONS[0]).toHaveProperty('code');
    expect(BANK_OPTIONS[0]).toHaveProperty('name');
    expect(BANK_OPTIONS[0]).toHaveProperty('displayName');
  });

  it('should find bank by code', () => {
    const bank = getBankByCode('BOA');
    expect(bank).toBeDefined();
    expect(bank?.name).toBe('Bank of America');
  });

  it('should return undefined for invalid bank code', () => {
    const bank = getBankByCode('INVALID');
    expect(bank).toBeUndefined();
  });

  it('should get bank name by code', () => {
    const name = getBankNameByCode('BOA');
    expect(name).toBe('Bank of America');
  });

  it('should return code for invalid bank code', () => {
    const name = getBankNameByCode('INVALID');
    expect(name).toBe('INVALID');
  });
});
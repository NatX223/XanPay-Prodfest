import AsyncStorage from '@react-native-async-storage/async-storage';

import { BankDetails, BankDetailsFormData } from '@/types/bankDetails';
import { getBankNameByCode } from '@/constants/bankOptions';
import { maskAccountNumber, ErrorMessages } from '@/constants/bankValidation';

const STORAGE_KEY = 'bank_details';
const ENCRYPTION_KEY = 'xanpay_bank_encryption_key'; // In production, this should be from secure storage

export class BankDetailsService {
  private static instance: BankDetailsService;

  public static getInstance(): BankDetailsService {
    if (!BankDetailsService.instance) {
      BankDetailsService.instance = new BankDetailsService();
    }
    return BankDetailsService.instance;
  }

  private encrypt(text: string): string {
    try {
      // Simple base64 encoding for demo purposes
      // In production, use proper encryption like expo-crypto or react-native-keychain
      return Buffer.from(text).toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  private decrypt(encryptedText: string): string {
    try {
      // Simple base64 decoding for demo purposes
      return Buffer.from(encryptedText, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  async saveBankDetails(
    userId: string,
    formData: BankDetailsFormData
  ): Promise<BankDetails> {
    try {
      const encryptedAccountNumber = this.encrypt(formData.accountNumber);
      const maskedAccountNumber = maskAccountNumber(formData.accountNumber);
      const bankName = getBankNameByCode(formData.bankCode);

      const bankDetails: BankDetails = {
        id: Date.now().toString(), // Simple ID generation
        userId,
        bankCode: formData.bankCode,
        bankName,
        accountNumber: encryptedAccountNumber,
        accountNumberMasked: maskedAccountNumber,
        isActive: true,
        isVerified: false, // Would be set by backend verification process
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in AsyncStorage (in production, consider more secure storage)
      const storageKey = `${STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(bankDetails));

      return bankDetails;
    } catch (error) {
      console.error('Failed to save bank details:', error);
      throw new Error(ErrorMessages.SAVE_FAILED);
    }
  }

  async getBankDetails(userId: string): Promise<BankDetails | null> {
    try {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      const storedData = await AsyncStorage.getItem(storageKey);

      if (!storedData) {
        return null;
      }

      const bankDetails: BankDetails = JSON.parse(storedData);
      
      // Convert date strings back to Date objects
      bankDetails.createdAt = new Date(bankDetails.createdAt);
      bankDetails.updatedAt = new Date(bankDetails.updatedAt);

      return bankDetails;
    } catch (error) {
      console.error('Failed to retrieve bank details:', error);
      return null;
    }
  }

  async getBankDetailsForForm(userId: string): Promise<BankDetailsFormData | null> {
    try {
      const bankDetails = await this.getBankDetails(userId);
      
      if (!bankDetails) {
        return null;
      }

      // Decrypt account number for form editing
      const decryptedAccountNumber = this.decrypt(bankDetails.accountNumber);

      return {
        bankCode: bankDetails.bankCode,
        accountNumber: decryptedAccountNumber,
        isVerified: bankDetails.isVerified,
        lastUpdated: bankDetails.updatedAt,
      };
    } catch (error) {
      console.error('Failed to get bank details for form:', error);
      return null;
    }
  }

  async updateBankDetails(
    userId: string,
    formData: BankDetailsFormData
  ): Promise<BankDetails> {
    try {
      const existingDetails = await this.getBankDetails(userId);
      
      if (!existingDetails) {
        // If no existing details, create new ones
        return this.saveBankDetails(userId, formData);
      }

      const encryptedAccountNumber = this.encrypt(formData.accountNumber);
      const maskedAccountNumber = maskAccountNumber(formData.accountNumber);
      const bankName = getBankNameByCode(formData.bankCode);

      const updatedDetails: BankDetails = {
        ...existingDetails,
        bankCode: formData.bankCode,
        bankName,
        accountNumber: encryptedAccountNumber,
        accountNumberMasked: maskedAccountNumber,
        isVerified: false, // Reset verification on update
        updatedAt: new Date(),
      };

      const storageKey = `${STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedDetails));

      return updatedDetails;
    } catch (error) {
      console.error('Failed to update bank details:', error);
      throw new Error(ErrorMessages.SAVE_FAILED);
    }
  }

  async deleteBankDetails(userId: string): Promise<void> {
    try {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to delete bank details:', error);
      throw new Error('Failed to delete bank details');
    }
  }

  async clearAllBankDetails(): Promise<void> {
    try {
      // Get all keys and remove bank details keys
      const allKeys = await AsyncStorage.getAllKeys();
      const bankDetailsKeys = allKeys.filter(key => key.startsWith(STORAGE_KEY));
      
      if (bankDetailsKeys.length > 0) {
        await AsyncStorage.multiRemove(bankDetailsKeys);
      }
    } catch (error) {
      console.error('Failed to clear all bank details:', error);
    }
  }

  // Simulate API calls for future backend integration
  async syncWithBackend(userId: string): Promise<BankDetails | null> {
    try {
      // This would make actual API calls to backend
      // For now, just return local data
      return this.getBankDetails(userId);
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      throw new Error(ErrorMessages.NETWORK_ERROR);
    }
  }

  async verifyBankDetails(userId: string): Promise<boolean> {
    try {
      // This would make API call to verify bank details with banking partner
      // For now, simulate verification
      const bankDetails = await this.getBankDetails(userId);
      
      if (bankDetails) {
        bankDetails.isVerified = true;
        bankDetails.updatedAt = new Date();
        
        const storageKey = `${STORAGE_KEY}_${userId}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(bankDetails));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to verify bank details:', error);
      return false;
    }
  }
}

// Export singleton instance
export const bankDetailsService = BankDetailsService.getInstance();
import { auth } from '@/config/firebase';

export interface BusinessDetails {
  businessName: string | null;
  businessImage: string | null;
  userAddress: string | null;
  userBalance: number;
}

export interface LoginResponse {
  message: string;
  business: BusinessDetails;
}

export class BusinessService {
  private static readonly BASE_URL = 'https://275267bbecad.ngrok-free.app';
  private static readonly LOGIN_ENDPOINT = '/login';

  static async getUserBusinessDetails(): Promise<BusinessDetails> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Get the ID token
      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${this.BASE_URL}${this.LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch business details: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result: LoginResponse = await response.json();
      return result.business;
    } catch (error) {
      console.error('Business details fetch error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch business details. Please try again.'
      );
    }
  }
}
export interface Transaction {
  id: string;
  type: "Purchase" | "Deposit" | "Send";
  amount: number;
  currency: string;
  createdAt: number;
  note?: string;
  hash?: string;
  invoiceCode?: string;
  productName?: string;
  quantity?: number;
}

export interface TransactionsResponse {
  success: boolean;
  message: string;
  count: number;
  transactions: Transaction[];
}

export class TransactionService {
  private static readonly BASE_URL = 'https://275267bbecad.ngrok-free.app';
  private static readonly TRANSACTIONS_ENDPOINT = '/transactions';

  static async getUserTransactions(): Promise<Transaction[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Get the ID token
      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${this.BASE_URL}${this.TRANSACTIONS_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch transactions: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result: TransactionsResponse = await response.json();
      return result.transactions || [];
    } catch (error) {
      console.error('Transactions fetch error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch transactions. Please try again.'
      );
    }
  }
}
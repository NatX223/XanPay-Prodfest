import { auth } from '@/config/firebase';

export interface WithdrawFiatRequest {
  amount: number;
}

export interface WithdrawFiatResponse {
  success: boolean;
  message: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  rate: string;
}

export class WithdrawService {
  private static readonly BASE_URL = 'https://26eb07f60a19.ngrok-free.app';
  private static readonly WITHDRAW_FIAT_ENDPOINT = '/withdrawFiat';

  static async withdrawFiat(data: WithdrawFiatRequest): Promise<WithdrawFiatResponse> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Get the ID token
      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${this.BASE_URL}${this.WITHDRAW_FIAT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Withdrawal failed: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result: WithdrawFiatResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Withdraw fiat error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to process withdrawal. Please try again.'
      );
    }
  }
}
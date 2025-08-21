export interface CreateAccountRequest {
  email: string;
  password: string;
  businessName: string;
  businessImage: string; // URL from image upload
}

export interface CreateAccountResponse {
  success: boolean;
  token: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  };
}

export class AccountService {
  private static readonly BASE_URL = 'https://4ddcaaaa1b75.ngrok-free.app';
  private static readonly CREATE_ACCOUNT_ENDPOINT = '/createAccount';
  private static readonly SIGNIN_ENDPOINT = '/signin';

  static async createAccount(data: CreateAccountRequest): Promise<CreateAccountResponse> {
    try {
      // Validate required fields
      if (!data.email || !data.password || !data.businessName) {
        throw new Error('Missing required fields');
      }

      const response = await fetch(`${this.BASE_URL}${this.CREATE_ACCOUNT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Account creation failed: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use the text as error message
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const token = result.token;
      return { success: true, token };
    } catch (error) {
      console.error('Account creation error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create account. Please try again.'
      );
    }
  }

  static async signIn(data: SignInRequest): Promise<SignInResponse> {
    try {
      // Validate required fields
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch(`${this.BASE_URL}${this.SIGNIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Sign in failed: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use the text as error message
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result: SignInResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to sign in. Please try again.'
      );
    }
  }
}
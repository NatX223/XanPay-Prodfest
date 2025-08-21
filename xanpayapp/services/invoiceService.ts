import { auth } from '@/config/firebase';

export interface Product {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  currency: string;
  quantity: number;
  createdAt: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  count: number;
  products: Product[];
}

export interface CreateInvoiceRequest {
  product: string;
  quantity: number;
}

export interface CreateInvoiceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class InvoiceService {
  private static readonly BASE_URL = 'http://xanpay-prodfest-production.up.railway.app';

  static async getProducts(): Promise<Product[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${this.BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch products: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result: ProductsResponse = await response.json();
      return result.products || [];
    } catch (error) {
      console.error('Products fetch error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch products. Please try again.'
      );
    }
  }

  static async createInvoice(request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${this.BASE_URL}/createInvoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to create invoice: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result: CreateInvoiceResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Invoice creation error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create invoice. Please try again.'
      );
    }
  }
}
import { APIRequestContext } from '@playwright/test';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  created_at?: string;
}

export interface Order {
  id?: number;
  customer_name: string;
  customer_email: string;
  product_id: number;
  quantity: number;
  total_price?: number;
  created_at?: string;
}

export class APITestHelpers {
  constructor(private request: APIRequestContext) {}

  async createTestProduct(productData: Partial<Product> = {}): Promise<Product> {
    const defaultProduct: Product = {
      name: 'Test Product',
      description: 'A product created for testing',
      price: 99.99,
      category: 'Test',
      stock: 10,
      ...productData
    };

    const response = await this.request.post('http://localhost:8000/products', {
      data: defaultProduct
    });

    if (!response.ok()) {
      throw new Error(`Failed to create test product: ${response.status()}`);
    }

    return await response.json();
  }

  async createTestOrder(orderData: Partial<Order>): Promise<Order> {
    const response = await this.request.post('http://localhost:8000/orders', {
      data: orderData
    });

    if (!response.ok()) {
      throw new Error(`Failed to create test order: ${response.status()}`);
    }

    return await response.json();
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await this.request.get('http://localhost:8000/products');
    
    if (!response.ok()) {
      throw new Error(`Failed to fetch products: ${response.status()}`);
    }

    return await response.json();
  }

  async getAllOrders(): Promise<Order[]> {
    const response = await this.request.get('http://localhost:8000/orders');
    
    if (!response.ok()) {
      throw new Error(`Failed to fetch orders: ${response.status()}`);
    }

    return await response.json();
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.request.get(`http://localhost:8000/products/${id}`);
    
    if (!response.ok()) {
      throw new Error(`Failed to fetch product ${id}: ${response.status()}`);
    }

    return await response.json();
  }

  async waitForBackendReady(maxRetries: number = 10): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.request.get('http://localhost:8000/');
        if (response.ok()) {
          return;
        }
      } catch (error) {
        // Backend not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Backend did not become ready within timeout');
  }

  generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test${timestamp}${random}@example.com`;
  }

  generateRandomProductName(): string {
    const adjectives = ['Amazing', 'Fantastic', 'Premium', 'Deluxe', 'Ultimate'];
    const nouns = ['Widget', 'Gadget', 'Device', 'Tool', 'Product'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${adjective} ${noun} ${number}`;
  }
}
import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:8000';

test.describe('Products API', () => {
  test('should get all products', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/products`);
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    // Verify product structure
    const firstProduct = products[0];
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('description');
    expect(firstProduct).toHaveProperty('price');
    expect(firstProduct).toHaveProperty('category');
    expect(firstProduct).toHaveProperty('stock');
    expect(firstProduct).toHaveProperty('created_at');
    
    // Verify data types
    expect(typeof firstProduct.id).toBe('number');
    expect(typeof firstProduct.name).toBe('string');
    expect(typeof firstProduct.description).toBe('string');
    expect(typeof firstProduct.price).toBe('number');
    expect(typeof firstProduct.category).toBe('string');
    expect(typeof firstProduct.stock).toBe('number');
    expect(typeof firstProduct.created_at).toBe('string');
  });

  test('should get a specific product by ID', async ({ request }) => {
    // First get all products to get a valid ID
    const allProductsResponse = await request.get(`${API_BASE_URL}/products`);
    const products = await allProductsResponse.json();
    const firstProductId = products[0].id;
    
    // Test getting specific product
    const response = await request.get(`${API_BASE_URL}/products/${firstProductId}`);
    expect(response.status()).toBe(200);
    
    const product = await response.json();
    expect(product.id).toBe(firstProductId);
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('stock');
  });

  test('should return 404 for non-existent product', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/products/99999`);
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error.detail).toBe('Product not found');
  });

  test('should create a new product', async ({ request }) => {
    const newProduct = {
      name: 'Test Product',
      description: 'A test product for automated testing',
      price: 29.99,
      category: 'Test',
      stock: 10
    };

    const response = await request.post(`${API_BASE_URL}/products`, {
      data: newProduct
    });
    
    expect(response.status()).toBe(200);
    
    const createdProduct = await response.json();
    expect(createdProduct.name).toBe(newProduct.name);
    expect(createdProduct.description).toBe(newProduct.description);
    expect(createdProduct.price).toBe(newProduct.price);
    expect(createdProduct.category).toBe(newProduct.category);
    expect(createdProduct.stock).toBe(newProduct.stock);
    expect(createdProduct).toHaveProperty('id');
    expect(createdProduct).toHaveProperty('created_at');
  });

  test('should validate product categories', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/products`);
    const products = await response.json();
    
    const categories = [...new Set(products.map((p: any) => p.category))];
    expect(categories.length).toBeGreaterThan(0);
    
    // Check that we have expected categories from seed data
    const expectedCategories = ['Electronics', 'Appliances', 'Sports', 'Accessories'];
    expectedCategories.forEach(category => {
      expect(categories).toContain(category);
    });
  });

  test('should validate product prices are positive', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/products`);
    const products = await response.json();
    
    products.forEach((product: any) => {
      expect(product.price).toBeGreaterThan(0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
    });
  });

  test('should handle API root endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.message).toBe('Welcome to the Online Store API');
  });
});
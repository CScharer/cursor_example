import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:8000';

test.describe('Orders API', () => {
  let testProductId: number;
  let initialStock: number;

  test.beforeAll(async ({ request }) => {
    // Get a product to use for testing orders
    const response = await request.get(`${API_BASE_URL}/products`);
    const products = await response.json();
    testProductId = products[0].id;
    initialStock = products[0].stock;
  });

  test('should get all orders', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/orders`);
    expect(response.status()).toBe(200);
    
    const orders = await response.json();
    expect(Array.isArray(orders)).toBe(true);
  });

  test('should create a new order successfully', async ({ request }) => {
    const newOrder = {
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com',
      product_id: testProductId,
      quantity: 1
    };

    const response = await request.post(`${API_BASE_URL}/orders`, {
      data: newOrder
    });
    
    expect(response.status()).toBe(200);
    
    const createdOrder = await response.json();
    expect(createdOrder.customer_name).toBe(newOrder.customer_name);
    expect(createdOrder.customer_email).toBe(newOrder.customer_email);
    expect(createdOrder.product_id).toBe(newOrder.product_id);
    expect(createdOrder.quantity).toBe(newOrder.quantity);
    expect(createdOrder).toHaveProperty('id');
    expect(createdOrder).toHaveProperty('total_price');
    expect(createdOrder).toHaveProperty('created_at');
    expect(createdOrder.total_price).toBeGreaterThan(0);
  });

  test('should calculate correct total price', async ({ request }) => {
    // Get product details first
    const productResponse = await request.get(`${API_BASE_URL}/products/${testProductId}`);
    const product = await productResponse.json();
    
    const quantity = 2;
    const expectedTotal = product.price * quantity;
    
    const newOrder = {
      customer_name: 'Jane Smith',
      customer_email: 'jane.smith@example.com',
      product_id: testProductId,
      quantity: quantity
    };

    const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
      data: newOrder
    });
    
    const createdOrder = await orderResponse.json();
    expect(createdOrder.total_price).toBe(expectedTotal);
  });

  test('should update product stock after order', async ({ request }) => {
    // Get initial stock
    const initialProductResponse = await request.get(`${API_BASE_URL}/products/${testProductId}`);
    const initialProduct = await initialProductResponse.json();
    const initialStockLevel = initialProduct.stock;
    
    // Place an order
    const orderQuantity = 1;
    const newOrder = {
      customer_name: 'Stock Test User',
      customer_email: 'stock.test@example.com',
      product_id: testProductId,
      quantity: orderQuantity
    };

    await request.post(`${API_BASE_URL}/orders`, {
      data: newOrder
    });
    
    // Check updated stock
    const updatedProductResponse = await request.get(`${API_BASE_URL}/products/${testProductId}`);
    const updatedProduct = await updatedProductResponse.json();
    
    expect(updatedProduct.stock).toBe(initialStockLevel - orderQuantity);
  });

  test('should reject order with insufficient stock', async ({ request }) => {
    // Get product with current stock
    const productResponse = await request.get(`${API_BASE_URL}/products/${testProductId}`);
    const product = await productResponse.json();
    
    // Try to order more than available stock
    const newOrder = {
      customer_name: 'Insufficient Stock Test',
      customer_email: 'insufficient@example.com',
      product_id: testProductId,
      quantity: product.stock + 10 // More than available
    };

    const response = await request.post(`${API_BASE_URL}/orders`, {
      data: newOrder
    });
    
    expect(response.status()).toBe(400);
    
    const error = await response.json();
    expect(error.detail).toBe('Insufficient stock');
  });

  test('should reject order for non-existent product', async ({ request }) => {
    const newOrder = {
      customer_name: 'Non-existent Product Test',
      customer_email: 'nonexistent@example.com',
      product_id: 99999, // Non-existent product ID
      quantity: 1
    };

    const response = await request.post(`${API_BASE_URL}/orders`, {
      data: newOrder
    });
    
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error.detail).toBe('Product not found');
  });

  test('should validate order data types', async ({ request }) => {
    const validOrder = {
      customer_name: 'Data Type Test',
      customer_email: 'datatype@example.com',
      product_id: testProductId,
      quantity: 1
    };

    const response = await request.post(`${API_BASE_URL}/orders`, {
      data: validOrder
    });
    
    expect(response.status()).toBe(200);
    
    const order = await response.json();
    expect(typeof order.id).toBe('number');
    expect(typeof order.customer_name).toBe('string');
    expect(typeof order.customer_email).toBe('string');
    expect(typeof order.product_id).toBe('number');
    expect(typeof order.quantity).toBe('number');
    expect(typeof order.total_price).toBe('number');
    expect(typeof order.created_at).toBe('string');
  });

  test('should handle multiple orders for same product', async ({ request }) => {
    const order1 = {
      customer_name: 'Customer 1',
      customer_email: 'customer1@example.com',
      product_id: testProductId,
      quantity: 1
    };

    const order2 = {
      customer_name: 'Customer 2',
      customer_email: 'customer2@example.com',
      product_id: testProductId,
      quantity: 1
    };

    const response1 = await request.post(`${API_BASE_URL}/orders`, { data: order1 });
    const response2 = await request.post(`${API_BASE_URL}/orders`, { data: order2 });
    
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    
    const createdOrder1 = await response1.json();
    const createdOrder2 = await response2.json();
    
    expect(createdOrder1.id).not.toBe(createdOrder2.id);
    expect(createdOrder1.customer_name).toBe(order1.customer_name);
    expect(createdOrder2.customer_name).toBe(order2.customer_name);
  });
});
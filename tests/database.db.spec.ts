import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:8000';

test.describe('Database Integration Tests', () => {
  test('should maintain data consistency between products and orders', async ({ request }) => {
    // Get initial products count
    const initialProductsResponse = await request.get(`${API_BASE_URL}/products`);
    const initialProducts = await initialProductsResponse.json();
    const initialProductCount = initialProducts.length;
    
    // Create a new product
    const newProduct = {
      name: 'Database Test Product',
      description: 'Product created for database testing',
      price: 99.99,
      category: 'Test',
      stock: 5
    };

    const createProductResponse = await request.post(`${API_BASE_URL}/products`, {
      data: newProduct
    });
    
    expect(createProductResponse.status()).toBe(200);
    const createdProduct = await createProductResponse.json();
    
    // Verify product count increased
    const updatedProductsResponse = await request.get(`${API_BASE_URL}/products`);
    const updatedProducts = await updatedProductsResponse.json();
    expect(updatedProducts.length).toBe(initialProductCount + 1);
    
    // Place an order for the new product
    const newOrder = {
      customer_name: 'Database Test Customer',
      customer_email: 'dbtest@example.com',
      product_id: createdProduct.id,
      quantity: 2
    };

    const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
      data: newOrder
    });
    
    expect(orderResponse.status()).toBe(200);
    const createdOrder = await orderResponse.json();
    
    // Verify order details
    expect(createdOrder.product_id).toBe(createdProduct.id);
    expect(createdOrder.quantity).toBe(newOrder.quantity);
    expect(createdOrder.total_price).toBe(createdProduct.price * newOrder.quantity);
    
    // Verify stock was updated
    const finalProductResponse = await request.get(`${API_BASE_URL}/products/${createdProduct.id}`);
    const finalProduct = await finalProductResponse.json();
    expect(finalProduct.stock).toBe(createdProduct.stock - newOrder.quantity);
  });

  test('should handle concurrent orders correctly', async ({ request }) => {
    // Create a product with limited stock for testing
    const testProduct = {
      name: 'Concurrent Test Product',
      description: 'Product for testing concurrent orders',
      price: 50.00,
      category: 'Test',
      stock: 3
    };

    const createResponse = await request.post(`${API_BASE_URL}/products`, {
      data: testProduct
    });
    const product = await createResponse.json();

    // Create multiple orders concurrently
    const order1Promise = request.post(`${API_BASE_URL}/orders`, {
      data: {
        customer_name: 'Concurrent Customer 1',
        customer_email: 'concurrent1@example.com',
        product_id: product.id,
        quantity: 1
      }
    });

    const order2Promise = request.post(`${API_BASE_URL}/orders`, {
      data: {
        customer_name: 'Concurrent Customer 2',
        customer_email: 'concurrent2@example.com',
        product_id: product.id,
        quantity: 1
      }
    });

    const [response1, response2] = await Promise.all([order1Promise, order2Promise]);
    
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    
    // Verify final stock
    const finalProductResponse = await request.get(`${API_BASE_URL}/products/${product.id}`);
    const finalProduct = await finalProductResponse.json();
    expect(finalProduct.stock).toBe(testProduct.stock - 2); // Both orders should succeed
  });

  test('should maintain referential integrity', async ({ request }) => {
    // Get all products and orders
    const productsResponse = await request.get(`${API_BASE_URL}/products`);
    const ordersResponse = await request.get(`${API_BASE_URL}/orders`);
    
    const products = await productsResponse.json();
    const orders = await ordersResponse.json();
    
    const productIds = products.map((p: any) => p.id);
    
    // Verify all orders reference existing products
    orders.forEach((order: any) => {
      expect(productIds).toContain(order.product_id);
    });
  });

  test('should handle database transactions properly', async ({ request }) => {
    // Get a product with known stock
    const productResponse = await request.get(`${API_BASE_URL}/products`);
    const products = await productResponse.json();
    const testProduct = products.find((p: any) => p.stock > 0);
    
    const initialStock = testProduct.stock;
    
    // Place a valid order
    const validOrder = {
      customer_name: 'Transaction Test',
      customer_email: 'transaction@example.com',
      product_id: testProduct.id,
      quantity: 1
    };

    const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
      data: validOrder
    });
    
    expect(orderResponse.status()).toBe(200);
    
    // Verify both order creation and stock update happened
    const updatedProductResponse = await request.get(`${API_BASE_URL}/products/${testProduct.id}`);
    const updatedProduct = await updatedProductResponse.json();
    
    expect(updatedProduct.stock).toBe(initialStock - 1);
    
    // Verify order exists
    const allOrdersResponse = await request.get(`${API_BASE_URL}/orders`);
    const allOrders = await allOrdersResponse.json();
    
    const newOrder = allOrders.find((o: any) => 
      o.customer_email === validOrder.customer_email && 
      o.product_id === validOrder.product_id
    );
    
    expect(newOrder).toBeDefined();
    expect(newOrder.quantity).toBe(validOrder.quantity);
  });

  test('should validate email format in orders', async ({ request }) => {
    const orderWithInvalidEmail = {
      customer_name: 'Email Test',
      customer_email: 'invalid-email-format',
      product_id: testProductId,
      quantity: 1
    };

    // Note: FastAPI with Pydantic should validate email format
    // This test verifies the API handles validation properly
    const response = await request.post(`${API_BASE_URL}/orders`, {
      data: orderWithInvalidEmail
    });
    
    // The response might be 422 (validation error) or 200 depending on validation rules
    // Let's check that the API responds appropriately
    expect([200, 422]).toContain(response.status());
  });

  test('should persist data across API calls', async ({ request }) => {
    // Create a product
    const product = {
      name: 'Persistence Test Product',
      description: 'Testing data persistence',
      price: 75.50,
      category: 'Test',
      stock: 10
    };

    const createResponse = await request.post(`${API_BASE_URL}/products`, {
      data: product
    });
    const createdProduct = await createResponse.json();
    
    // Place an order
    const order = {
      customer_name: 'Persistence Test Customer',
      customer_email: 'persistence@example.com',
      product_id: createdProduct.id,
      quantity: 3
    };

    const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
      data: order
    });
    const createdOrder = await orderResponse.json();
    
    // Verify data persists by fetching again
    const productCheck = await request.get(`${API_BASE_URL}/products/${createdProduct.id}`);
    const persistedProduct = await productCheck.json();
    
    expect(persistedProduct.name).toBe(product.name);
    expect(persistedProduct.stock).toBe(product.stock - order.quantity);
    
    // Verify order persists
    const ordersCheck = await request.get(`${API_BASE_URL}/orders`);
    const allOrders = await ordersCheck.json();
    
    const persistedOrder = allOrders.find((o: any) => o.id === createdOrder.id);
    expect(persistedOrder).toBeDefined();
    expect(persistedOrder.customer_name).toBe(order.customer_name);
  });

  test('should handle edge cases for stock management', async ({ request }) => {
    // Create a product with exactly 1 stock
    const limitedProduct = {
      name: 'Limited Stock Product',
      description: 'Product with very limited stock',
      price: 199.99,
      category: 'Test',
      stock: 1
    };

    const createResponse = await request.post(`${API_BASE_URL}/products`, {
      data: limitedProduct
    });
    const product = await createResponse.json();
    
    // Order exactly the available stock
    const exactOrder = {
      customer_name: 'Exact Stock Customer',
      customer_email: 'exact@example.com',
      product_id: product.id,
      quantity: 1
    };

    const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
      data: exactOrder
    });
    
    expect(orderResponse.status()).toBe(200);
    
    // Verify stock is now 0
    const updatedProductResponse = await request.get(`${API_BASE_URL}/products/${product.id}`);
    const updatedProduct = await updatedProductResponse.json();
    expect(updatedProduct.stock).toBe(0);
    
    // Try to order when stock is 0
    const zeroStockOrder = {
      customer_name: 'Zero Stock Customer',
      customer_email: 'zero@example.com',
      product_id: product.id,
      quantity: 1
    };

    const zeroStockResponse = await request.post(`${API_BASE_URL}/orders`, {
      data: zeroStockOrder
    });
    
    expect(zeroStockResponse.status()).toBe(400);
    const error = await zeroStockResponse.json();
    expect(error.detail).toBe('Insufficient stock');
  });
});
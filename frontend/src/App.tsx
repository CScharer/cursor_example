import React, { useState, useEffect } from 'react';
import './App.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  created_at: string;
}

interface Order {
  customer_name: string;
  customer_email: string;
  product_id: number;
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState<Order>({
    customer_name: '',
    customer_email: '',
    product_id: 0,
    quantity: 1
  });
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const response = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderForm,
          product_id: selectedProduct.id
        }),
      });

      if (response.ok) {
        setOrderSuccess(true);
        setSelectedProduct(null);
        setOrderForm({ customer_name: '', customer_email: '', product_id: 0, quantity: 1 });
        fetchProducts(); // Refresh to update stock
        setTimeout(() => setOrderSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🛒 Online Store</h1>
        <p>Welcome to our amazing online store!</p>
      </header>

      {orderSuccess && (
        <div className="success-message">
          ✅ Order placed successfully! Thank you for your purchase.
        </div>
      )}

      <main className="main-content">
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-category">Category: {product.category}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-stock">Stock: {product.stock} available</p>
              <button 
                className="buy-button"
                onClick={() => setSelectedProduct(product)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="order-modal">
            <div className="modal-content">
              <h2>Place Order</h2>
              <h3>{selectedProduct.name}</h3>
              <p>Price: ${selectedProduct.price.toFixed(2)}</p>
              
              <form onSubmit={handleOrderSubmit}>
                <div className="form-group">
                  <label htmlFor="customer_name">Your Name:</label>
                  <input
                    type="text"
                    id="customer_name"
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm({...orderForm, customer_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer_email">Your Email:</label>
                  <input
                    type="email"
                    id="customer_email"
                    value={orderForm.customer_email}
                    onChange={(e) => setOrderForm({...orderForm, customer_email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={selectedProduct.stock}
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div className="total-price">
                  Total: ${(selectedProduct.price * orderForm.quantity).toFixed(2)}
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-button">Place Order</button>
                  <button type="button" className="cancel-button" onClick={() => setSelectedProduct(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

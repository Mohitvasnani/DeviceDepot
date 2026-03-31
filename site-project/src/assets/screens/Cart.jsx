import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/cart.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    setEmail(userEmail);
    if (userEmail) {
      fetchCartItems(userEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCartItems = async (email) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/product/allcart?email=${email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Error loading cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/product/remove/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.cart.items);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const increment = async (itemId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/product/increment/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error('Error incrementing quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const decrement = async (itemId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/product/decrement/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error('Error decrementing quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.warning('Please enter a delivery address');
      return;
    }

    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    try {
      setCheckingOut(true);
      await axios.post(
        `${API_URL}/api/orders/purchase`,
        {
          email,
          status: 'pending',
          address,
          totalAmount,
          file: cartItems[0]?.file,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed successfully!');
      setCartItems([]);
      setAddress('');
      setTimeout(() => navigate('/userdash/trackorder'), 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <ToastContainer />
        <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#ccc' }}></i>
        <h3 className="mt-3 text-muted">Your cart is empty</h3>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/home')}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <ToastContainer />
      <div className="cart">
        <h1>Shopping Cart</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={`${API_URL}/${item.file}`}
                    alt={item.name}
                    className="product-image"
                    onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=No+Image' }}
                  />
                </td>
                <td>{item.name}</td>
                <td>£{item.price}</td>
                <td>
                  <button
                    className="qty-btn"
                    onClick={() => decrement(item._id)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={item.quantity}
                    readOnly
                    className="quantity-input"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => increment(item._id)}
                  >
                    +
                  </button>
                </td>
                <td>£{(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="address-section">
              <label htmlFor="address" className="fw-bold mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-control"
                placeholder="Enter your full delivery address"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="cart-totals">
              <div className="totals">
                <p>Subtotal: <strong>£{subtotal.toFixed(2)}</strong></p>
                <p>Shipping: <strong>Free</strong></p>
                <p>Total: <strong>£{subtotal.toFixed(2)}</strong></p>
              </div>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? 'Placing Order...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
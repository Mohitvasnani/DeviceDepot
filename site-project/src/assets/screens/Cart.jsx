import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/cart.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import {
  fetchCart,
  incrementItem,
  decrementItem,
  removeItem as removeCartItem,
  cartCleared,
  selectCartItems,
  selectCartStatus,
  selectCartSubtotal,
} from '../../store/cartSlice';
import { selectAuth } from '../../store/authSlice';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const [address, setAddress] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Items live in the store, so the navbar badge and this page cannot
  // disagree. This page used to hold its own copy in useState.
  const cartItems = useSelector(selectCartItems);
  const cartStatus = useSelector(selectCartStatus);
  const subtotal = useSelector(selectCartSubtotal);
  const { token, isAuthenticated } = useSelector(selectAuth);
  const loading = cartStatus === 'loading';

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated, dispatch]);

  const removeItem = async (itemId) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (message) {
      toast.error(message || 'Failed to remove item');
    }
  };

  const increment = async (itemId) => {
    try {
      await dispatch(incrementItem(itemId)).unwrap();
    } catch (message) {
      toast.error(message || 'Failed to update quantity');
    }
  };

  const decrement = async (itemId) => {
    try {
      await dispatch(decrementItem(itemId)).unwrap();
    } catch (message) {
      toast.error(message || 'Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.warning('Please enter a delivery address');
      return;
    }

    const totalAmount = subtotal;

    try {
      setCheckingOut(true);
      const response = await axios.post(
        `${API_URL}/api/payments/create-payment-intent`,
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientSecret(response.data.clientSecret);
      setShowPayment(true);
    } catch (error) {
      toast.error('Failed to initialise payment');
    } finally {
      setCheckingOut(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      // The server re-prices the cart and verifies the payment itself -
      // it no longer takes the total or status from this request.
      await axios.post(
        `${API_URL}/api/orders/purchase`,
        {
          address,
          file: cartItems[0]?.file,
          paymentIntentId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed successfully!');
      dispatch(cartCleared());
      setAddress('');
      setShowPayment(false);
      setTimeout(() => navigate('/userdash/trackorder'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Order placement failed. Contact support.');
    }
  };

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
                    src={item.file}
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

              {!showPayment ? (
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Preparing Payment...' : 'Proceed to Checkout'}
                </button>
              ) : (
                <div className="mt-3 p-3 border rounded">
                  <h5 className="mb-3">Complete Payment</h5>
                  {clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret }}
                    >
                      <CheckoutForm onSuccess={handlePaymentSuccess} />
                    </Elements>
                  )}
                  <button
                    className="btn btn-outline-dark w-100 mt-2"
                    onClick={() => setShowPayment(false)}
                  >
                    Back to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
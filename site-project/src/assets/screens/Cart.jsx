import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/cart.css';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    setEmail(userEmail);
    if (userEmail) {
      fetchCartItems(userEmail);
    }
  }, []);

  const fetchCartItems = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/product/allcart?email=${email}`);
      setCartItems(response.data.items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };
  const removeItem = async (itemId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/product/remove/${itemId}`);
      setCartItems(response.data.cart.items); 
    } catch (error) {
      console.error('Error removing item:', error);
      
    }
  };

  const increment = async (itemId) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/product/increment/${itemId}`);
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error('Error incrementing quantity:', error);
    }
  };
 

  const decrement = async (itemId) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/product/decrement/${itemId}`);
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error('Error decrementing quantity:', error);
    }
  };


  const updateQuantity = async (itemId, quantity) => {
    if (quantity > 0) {
      increment(itemId);
    } else if (quantity < 0) {
      decrement(itemId);
    }
  };

  const handleCheckout = async () => {
    if (!address) {
      alert('Please enter an address');
      return;
    }
    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    try {
      const response = await axios.post('http://localhost:8080/api/orders/purchase', {
        email,
        status: 'pending',
        address,
        totalAmount,
        file: cartItems[0]?.file, // Assuming all items have the same file
      });
      console.log('Order created:', response.data);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

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
                  <img src={item.file} alt={item.name} className="product-image" />
                </td>
                <td>{item.name}</td>
                <td>₹{item.price}</td>
                <td>
                  <button className="qty-btn" onClick={() => updateQuantity(item._id, -1)} disabled={item.quantity <= 1}>
                    -
                  </button>
                  <input type="text" value={item.quantity} readOnly className="quantity-input" />
                  <button className="qty-btn" onClick={() => updateQuantity(item._id, 1)}>
                    +
                  </button>
                </td>
                <td>₹{item.price * item.quantity}</td>
                <td>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="coupon-section">
              <label htmlFor="couponCode">Coupon</label>
              <input type="text" id="couponCode" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button className="qty-btn">Apply Coupon</button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="address-section">
              <label htmlFor="address">Address</label>
              <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-75" />
            </div>
          </div>
        </div>

        <div className="cart-totals">
          <div className="totals">
            <p>Subtotal: ₹{cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}</p>
            <p>Total: ₹{cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}</p>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/table.css';

const API_URL = import.meta.env.VITE_API_URL;

function TrackOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setUserEmail(storedEmail);
      fetchOrders(storedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (email) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/orders/allorders`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    try {
      await axios.put(
        `${API_URL}/api/orders/cancel`,
        { email: userEmail, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order cancelled successfully');
      // Update status in state directly
      setOrders(prev => prev.map(order =>
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error cancelling order');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'pending':    'bg-warning text-dark',
      'processing': 'bg-info text-dark',
      'shipped':    'bg-primary',
      'delivered':  'bg-success',
      'cancelled':  'bg-danger',
    };
    return `badge ${styles[status?.toLowerCase()] || 'bg-secondary'}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <ToastContainer />
        <i className="bi bi-bag-x" style={{ fontSize: '4rem', color: '#ccc' }}></i>
        <h3 className="mt-3 text-muted">No orders yet</h3>
        <p className="text-muted">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="container">
      <ToastContainer />
      <h2 className="my-4">Your Orders</h2>
      <p className="text-muted mb-4">
        {orders.length} order{orders.length !== 1 ? 's' : ''} found
      </p>
      <div className="table-wrapper">
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Address</th>
                <th>Order Time</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const total = order.items.reduce(
                  (sum, item) => sum + item.price * item.quantity, 0
                );
                return (
                  <React.Fragment key={order._id}>
                    <tr>
                      <td>{index + 1}</td>
                      <td>
                        <small className="text-muted">{order._id.slice(-8)}</small>
                      </td>
                      <td>
                        <span className={getStatusBadge(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.address}</td>
                      <td>{new Date(order.orderTime).toLocaleString()}</td>
                      <td><strong>£{total.toFixed(2)}</strong></td>
                      <td>
                        {order.status !== 'cancelled' &&
                         order.status !== 'delivered' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => cancelOrder(order._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="7" className="bg-light">
                        <div className="table-responsive">
                          <table className="table table-sm mb-0">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, itemIndex) => (
                                <tr key={itemIndex}>
                                  <td>{item.name}</td>
                                  <td className="text-muted small">
                                    {item.description?.length > 50
                                      ? `${item.description.substring(0, 50)}...`
                                      : item.description}
                                  </td>
                                  <td>£{item.price}</td>
                                  <td>{item.quantity}</td>
                                  <td>£{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TrackOrders;
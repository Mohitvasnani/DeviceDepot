import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/table.css'; 

function TrackOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setUserEmail(storedEmail);
      fetchOrders(storedEmail);
    } else {
      setError('User email not found');
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (email) => {
    try {
      const response = await axios.post('http://localhost:8080/api/orders/allorders', { email });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error fetching orders');
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.put('http://localhost:8080/api/orders/cancel', { email: userEmail, orderId });
      toast.success('Order cancelled successfully', { className: 'toast-success' });
      fetchOrders(userEmail);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error cancelling order', { className: 'toast-error' });
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-danger mt-5">{error}</p>;
  }

  return (
    <div className="container">
      <ToastContainer />
      <h2 className="my-4">Welcome, {userEmail}</h2>
      <h3 className="mb-4">Your Orders</h3>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{order._id}</td>
                    <td>{order.status}</td>
                    <td>{order.address}</td>
                    <td>{new Date(order.orderTime).toLocaleString()}</td>
                    <td>
                      {order.status !== 'cancelled' && (
                        <button
                          className="btn btn-danger btn-rounded"
                          onClick={() => cancelOrder(order._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6">
                      <div className="table-responsive table-items">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Description</th>
                              <th>Price</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, itemIndex) => (
                              <tr key={itemIndex}>
                                <td data-label="Product Name">{item.name}</td>
                                <td data-label="Description">{item.description}</td>
                                <td data-label="Price">{item.price}</td>
                                <td data-label="Quantity">{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TrackOrders;

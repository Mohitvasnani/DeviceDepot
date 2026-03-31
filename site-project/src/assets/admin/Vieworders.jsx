import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/table.css';

const API_URL = import.meta.env.VITE_API_URL;

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/orders/getall`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await axios.put(`${API_URL}/api/orders/updatestatus/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
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

  const filteredOrders = orders.filter(order =>
    order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items?.some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <ToastContainer />
      <h2 className="mb-4">View Orders</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Total Orders: {orders.length}</h5>
        <input
          type="text"
          className="form-control ms-3 w-50"
          placeholder="Search by status, address or item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted">
            {searchQuery ? 'No orders match your search.' : 'No orders yet.'}
          </p>
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Order ID</th>
              <th scope="col">Customer</th>
              <th scope="col">Status</th>
              <th scope="col">Address</th>
              <th scope="col">Order Time</th>
              <th scope="col">Items</th>
              <th scope="col">Total</th>
              <th scope="col">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => {
              const total = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
              );
              return (
                <tr key={order._id}>
                  <td data-label="Order ID">
                    <small className="text-muted">{order._id.slice(-8)}</small>
                  </td>
                  <td data-label="Customer">
                    <strong>{order.userId?.name}</strong>
                    <br />
                    <small className="text-muted">{order.userId?.email}</small>
                  </td>
                  <td data-label="Status">
                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Address">{order.address}</td>
                  <td data-label="Order Time">
                    {new Date(order.orderTime).toLocaleString()}
                  </td>
                  <td data-label="Items">
                    <ul className="mb-0 ps-3">
                      {order.items.map(item => (
                        <li key={item.productId}>
                          {item.name} × {item.quantity} — £{item.price}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td data-label="Total">
                    <strong>£{total.toFixed(2)}</strong>
                  </td>
                  <td data-label="Update Status">
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewOrders;

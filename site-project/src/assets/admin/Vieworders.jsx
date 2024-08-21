import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/table.css';

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/orders/getall`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage('Error fetching orders');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOrders = orders.filter(order =>
    order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="table-wrapper " >
      <ToastContainer />
      <h2 className="mb-4">View Orders</h2>
      {message && <p className="text-danger">{message}</p>} {/* Display error message */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Search Orders:</h5>
        <input 
          type="text" 
          className="form-control ms-3 w-50" 
          placeholder="Enter status, address, or item name..."
          value={searchQuery} 
          onChange={handleSearchChange} 
        />
      </div>
      <table className="table table-striped overflow-auto" style={{maxHeight:'60vh'}} >
        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">User Email</th>
            <th scope="col">User Name</th>
            <th scope="col">Status</th>
            <th scope="col">Address</th>
            <th scope="col">Order Time</th>
            <th scope="col">Items</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order._id}>
              <td data-label="Order ID">{order._id}</td>
              <td data-label="User ID">{order.userId.email}</td> 
              <td data-label="User ID">{order.userId.name}</td> 
              <td data-label="Status">{order.status}</td>
              <td data-label="Address">{order.address}</td>
              <td data-label="Order Time">{new Date(order.orderTime).toLocaleString()}</td>
              <td data-label="Items">
                <ul>
                  {order.items.map(item => (
                    <li key={item.productId}>
                      {item.name} - {item.quantity} x ₹{item.price}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewOrders;

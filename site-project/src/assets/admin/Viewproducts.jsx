import React, { useEffect, useState } from 'react';
import '../css/table.css';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';

function Viewproducts() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [setUserCount, userCount] = useOutletContext(); // Destructure the returned array

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/users');
      setUsers(response.data); // Use response.data directly
      setUserCount(response.data.length);
    } catch (error) {
      setMessage('Error fetching users');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/user/deluser/${userId}`);
      setMessage(response.data.message);
      fetchUsers(); // Refresh the list of users
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Error deleting user');
    }
  };

  const changeRole = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/user/updaterole/${userId}`);
      const updatedUsers = users.map(user =>
        user._id === userId ? { ...user, admin: !user.admin } : user
      );
      setUsers(updatedUsers);
      setMessage(response.data.message);
    } catch (error) {
      console.error('Unable to change role:', error);
      setMessage('Error changing role');
    }
  };

  const handleEdit = (userId) => {
    navigate(`/edituser/${userId}`);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.toString().includes(searchTerm))
  );

  return (
    <>
      <div className="table-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>View Users</h2>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ maxWidth: '300px' }}
          />
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">SL No.</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Role</th>
              <th scope="col">Is Admin</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user._id}>
                <td data-label="SL No.">{index + 1}</td>
                <td data-label="Name">{user.name}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Phone">{user.phone}</td>
                <td data-label="Role">{user.role}</td>
                <td data-label="Is Admin">{user.admin.toString()}</td>
                <td data-label="Actions">
                  {/* <button className="btn btn-sm btn-secondary me-2 btn-rounded" onClick={() => handleEdit(user._id)}>Edit</button> */}
                  <button className="btn btn-sm btn-info me-2 btn-rounded" onClick={() => changeRole(user._id)}>
                    {user.admin ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                  <button className="btn btn-sm btn-danger btn-rounded" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Viewproducts;

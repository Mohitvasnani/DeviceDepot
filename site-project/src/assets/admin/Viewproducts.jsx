import React, { useEffect, useState } from 'react';
import '../css/table.css';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

function Viewproducts() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [setUserCount, userCount] = useOutletContext();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/user/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setUserCount(response.data.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      setDeleteId(userId);
      await axios.delete(`${API_URL}/api/user/deluser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      setUsers(prev => prev.filter(u => u._id !== userId));
      setUserCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setDeleteId(null);
    }
  };

  const changeRole = async (userId) => {
    try {
      setRoleId(userId);
      const response = await axios.put(
        `${API_URL}/api/user/updaterole/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update role from server response — don't guess the new value
      const updatedRole = response.data.user.role;
      const updatedAdmin = response.data.user.admin;
      setUsers(prev => prev.map(user =>
        user._id === userId
          ? { ...user, role: updatedRole, admin: updatedAdmin }
          : user
      ));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Unable to change role:', error);
      toast.error('Error changing role');
    } finally {
      setRoleId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.toString().includes(searchTerm))
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>View Users ({users.length})</h2>
        <input
          type="text"
          className="form-control"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted">
            {searchTerm ? 'No users match your search.' : 'No users found.'}
          </p>
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Role</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user._id}>
                <td data-label="#">{index + 1}</td>
                <td data-label="Name">{user.name}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Phone">{user.phone}</td>
                <td data-label="Role">
                  <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                    {user.role}
                  </span>
                </td>
                <td data-label="Actions">
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => changeRole(user._id)}
                    disabled={roleId === user._id}
                  >
                    {roleId === user._id
                      ? 'Updating...'
                      : user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(user._id)}
                    disabled={deleteId === user._id}
                  >
                    {deleteId === user._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Viewproducts;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/profile.css';

const API_URL = import.meta.env.VITE_API_URL;

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    address3: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      fetchUserProfile(storedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (email) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/user/profile/${email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      setUpdatedInfo({
        name: response.data.name || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        address1: response.data.address1 || '',
        address2: response.data.address2 || '',
        address3: response.data.address3 || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error fetching user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedInfo({ ...updatedInfo, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${API_URL}/api/user/updateprofile/${user._id}`,
        updatedInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully');
      setEditing(false);
      setUser({ ...user, ...updatedInfo });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handleCancel = () => {
    setUpdatedInfo({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      address1: user.address1 || '',
      address2: user.address2 || '',
      address3: user.address3 || ''
    });
    setEditing(false);
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

  if (!user) {
    return (
      <div className="text-center mt-5">
        <p className="text-danger">Could not load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container profile-cont">
      <ToastContainer />
      <div className="profile-card">
        <div className="text-center mb-4">
          <div
            className="rounded-circle bg-primary d-inline-flex justify-content-center align-items-center text-white mb-3"
            style={{ width: '80px', height: '80px', fontSize: '2rem' }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-title">{user.name}</h2>
          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
            {user.role}
          </span>
        </div>

        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <tbody>
                <tr>
                  <th style={{ width: '30%' }}>Name</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={updatedInfo.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={updatedInfo.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={updatedInfo.phone}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Address Line 1</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="address1"
                      value={updatedInfo.address1}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Street address"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Address Line 2</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="address2"
                      value={updatedInfo.address2}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="City"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Address Line 3</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="address3"
                      value={updatedInfo.address3}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Postcode"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-3 d-flex justify-content-center gap-2">
          {editing ? (
            <>
              <button className="btn btn-success" onClick={handleSave}>
                <i className="bi bi-check-lg me-1"></i>Save Changes
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <i className="bi bi-pencil me-1"></i>Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
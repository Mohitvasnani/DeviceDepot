import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/profile.css'; 

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    address3: ''
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      fetchUserProfile(storedEmail);
    } else {
      setError('User email not found');
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/user/profile/${email}`);
      setUser(response.data);
      setUpdatedInfo({
        name: response.data.name,
        phone: response.data.phone,
        email: response.data.email,
        address1: response.data.address1,
        address2: response.data.address2,
        address3: response.data.address3
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Error fetching user profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedInfo({ ...updatedInfo, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8080/api/user/updateprofilebyemail/${user.email}`, updatedInfo);
      toast.success('Profile updated successfully', { className: 'toast-success' });
      setEditing(false);
      fetchUserProfile(user.email);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile', { className: 'toast-error' });
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
    <div className="container profile-cont">
      <ToastContainer />
      <div className="profile-card">
        <h2 className="profile-title">{user.name}</h2>
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <tbody>
                <tr>
                  <th>Name</th>
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
                  <th>Address 1</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="address1"
                      value={updatedInfo.address1}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Address 2</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="address2"
                      value={updatedInfo.address2}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Address 3</th>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="address3"
                      value={updatedInfo.address3}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center">
          <button
            className={`btn btn-pro ${editing ? 'btn-success' : 'btn-primary'}`}
            onClick={editing ? handleSave : () => setEditing(true)}
          >
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

// src/components/EnterNewPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/enterEmail.css'; // Reusing the custom CSS

const EnterNewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state; // Get email and otp from location state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/emails/change-password', {
        email,
        otp,
        newPassword,
      });
      setMessage(response.data.message);
      navigate('/'); // Navigate to home or login page after password change
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div className="container cont-em mt-5">
      <div className="card-em">
        <div className="card-body">
          <h1 className="card-title text-center">Enter New Password</h1>
          <form onSubmit={handleSubmit} className="mtt-4 mt-4 p-4">
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                className="form-control formctrl"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary prim btn-block mt-3">Change Password</button>
          </form>
          {message && <p className="mtt-3 mt-3 text-center">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default EnterNewPassword;

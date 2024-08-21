// src/components/EnterOTP.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/enterEmail.css'; // Reusing the custom CSS

const EnterOTP = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state; // Get email from location state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/emails/verify-otp', { email, otp });
      setMessage(response.data.message);
      navigate('/enter-new-password', { state: { email, otp } }); // Navigate to EnterNewPassword page with email and otp state
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div className="container cont-em mt-5">
      <div className="card-em">
        <div className="card-body">
          <h1 className="card-title text-center">Enter OTP</h1>
          <form onSubmit={handleSubmit} className="mtt-4 mt-4 p-4">
            <div className="form-group">
              <label htmlFor="otp">OTP:</label>
              <input
                type="text"
                id="otp"
                className="form-control formctrl"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary prim btn-block mt-3">Verify OTP</button>
          </form>
          {message && <p className="mtt-3 mt-3 text-center">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default EnterOTP;

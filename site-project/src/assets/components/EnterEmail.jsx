// src/components/EnterEmail.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/enterEmail.css'; 

const EnterEmail = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/emails/send-otp', { email });
      setMessage(response.data.message);
      navigate('/enter-otp', { state: { email } }); // Navigate to EnterOTP page with email state
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div className="container cont-em mt-5">
      <div className="card-em">
        <div className="card-body">
          <h1 className="card-title text-center">Enter Email</h1>
          <form onSubmit={handleSubmit} className=" mtt-4 mt-4 p-4">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                className="form-control formctrl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary prim btn-block mt-3">Send OTP</button>
          </form>
          {message && <p className="mtt-3 mt-3 text-center">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default EnterEmail;

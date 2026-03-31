import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/enterEmail.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

const EnterOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // Guard — if user lands here without going through EnterEmail
  if (!email) {
    return (
      <div className="container cont-em mt-5">
        <div className="card-em">
          <div className="card-body text-center">
            <h2>Invalid Access</h2>
            <p className="text-muted">Please start the password reset process from the beginning.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate('/enter-email')}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/emails/verify-otp`, { email, otp });
      toast.success(response.data.message || 'OTP verified!');
      navigate('/enter-new-password', { state: { email, otp } });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container cont-em mt-5">
      <ToastContainer />
      <div className="card-em">
        <div className="card-body">
          <h1 className="card-title text-center">Enter OTP</h1>
          <p className="text-center text-muted">
            We sent a code to <strong>{email}</strong>
          </p>
          <form onSubmit={handleSubmit} className="mtt-4 mt-4 p-4">
            <div className="form-group">
              <label htmlFor="otp">OTP Code:</label>
              <input
                type="text"
                id="otp"
                className="form-control formctrl"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the code from your email"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary prim btn-block mt-3"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <p className="text-center mt-3">
              <span
                className="text-primary"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/enter-email')}
              >
                Resend OTP
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnterOTP;
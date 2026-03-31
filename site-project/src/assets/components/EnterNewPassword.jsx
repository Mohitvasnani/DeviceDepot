import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/enterEmail.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

const EnterNewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Safe destructure — avoid crash if state is missing
  const email = location.state?.email;
  const otp = location.state?.otp;

  // Guard — if user lands here directly without going through OTP flow
  if (!email || !otp) {
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

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/emails/change-password`, {
        email,
        otp,
        newPassword,
      });
      toast.success(response.data.message || 'Password changed successfully!');
      setTimeout(() => navigate('/loginregister'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container cont-em mt-5">
      <ToastContainer />
      <div className="card-em">
        <div className="card-body">
          <h1 className="card-title text-center">Set New Password</h1>
          <form onSubmit={handleSubmit} className="mtt-4 mt-4 p-4">
            <div className="form-group mb-3">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                className="form-control formctrl"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control formctrl"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary prim btn-block mt-3"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnterNewPassword;
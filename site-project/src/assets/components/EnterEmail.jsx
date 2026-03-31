import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/enterEmail.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

const EnterEmail = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/emails/send-otp`, { email });
      toast.success(response.data.message || 'OTP sent successfully!');
      navigate('/enter-otp', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container cont-em mt-5">
      <ToastContainer />
      <div className="card-em">
        <div className="card-body">
          <h1 className="card-title text-center">Forgot Password</h1>
          <form onSubmit={handleSubmit} className="mtt-4 mt-4 p-4">
            <div className="form-group">
              <label htmlFor="email">Enter your account email:</label>
              <input
                type="email"
                id="email"
                className="form-control formctrl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@email.com"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary prim btn-block mt-3"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnterEmail;
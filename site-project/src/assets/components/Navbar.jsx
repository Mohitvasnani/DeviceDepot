import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Navbar.css';

const API_URL = import.meta.env.VITE_API_URL;

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') !== null
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/user/logout`);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local storage and redirect even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/loginregister');
    }
  };

  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();
          if (isExpired) {
            handleLogout();
          } else {
            setIsAuthenticated(true);
            setIsAdmin(decoded.role === 'admin');
          }
        } catch (err) {
          // Token is malformed
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    validateToken();
    const intervalId = setInterval(validateToken, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#21618C' }}>
      <div className="container-fluid">
        <NavLink to='/home' className="navbar-brand">DeviceDepot.</NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <NavLink
                className="nav-link dropdown-toggle"
                to="#"
                id="shopDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                Shop
              </NavLink>
              <div className="dropdown-menu">
                <NavLink to="/accessories" className="dropdown-item">Accessories</NavLink>
                <NavLink to="/mobile" className="dropdown-item">Mobiles</NavLink>
                <NavLink to="/laptop" className="dropdown-item">Laptops</NavLink>
              </div>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/liked-items">
                <i className="bi bi-heart me-1"></i>Liked
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <NavLink
                className="nav-link dropdown-toggle"
                to="#"
                id="accountDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person me-1"></i>Account
              </NavLink>
              <div className="dropdown-menu dropdown-menu-end">
                {isAuthenticated ? (
                  <>
                    <NavLink className="dropdown-item" to="/userdash/userprofile">
                      My Profile
                    </NavLink>
                    <NavLink className="dropdown-item" to="/userdash/trackorder">
                      Track Orders
                    </NavLink>
                    <hr className="dropdown-divider" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-item text-danger"
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink className="dropdown-item" to="/loginregister">
                      Sign In
                    </NavLink>
                    <NavLink className="dropdown-item" to="/loginregister">
                      Create Account
                    </NavLink>
                  </>
                )}
              </div>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/cart">
                <i className="bi bi-cart me-1"></i>Cart
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
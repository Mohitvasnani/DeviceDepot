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
    <nav className="navbar navbar-expand-lg">
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
            {/* Dropdown toggles are buttons, not NavLinks. A NavLink to "#"
                resolves to the current path, so React Router marked them
                permanently active. */}
            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle"
                id="shopDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Shop
              </button>
              <div className="dropdown-menu" aria-labelledby="shopDropdown">
                <NavLink to="/laptop" className="dropdown-item">Laptops</NavLink>
                <NavLink to="/mobile" className="dropdown-item">Mobiles</NavLink>
                <NavLink to="/accessories" className="dropdown-item">Accessories</NavLink>
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
                <i className="bi bi-heart me-1" aria-hidden="true"></i>Liked
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <button
                type="button"
                className="nav-link dropdown-toggle"
                id="accountDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person me-1" aria-hidden="true"></i>Account
              </button>
              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
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
                      className="dropdown-item dd-signout"
                    >
                      <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Log out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink className="dropdown-item" to="/loginregister">
                      Sign in
                    </NavLink>
                    <NavLink className="dropdown-item" to="/loginregister">
                      Create account
                    </NavLink>
                  </>
                )}
              </div>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/cart">
                <i className="bi bi-cart me-1" aria-hidden="true"></i>Cart
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

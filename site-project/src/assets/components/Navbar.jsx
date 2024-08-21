import React, { useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Navbar.css'; // Custom CSS file

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/user/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('email');

      navigate('/loginregister');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAuthenticated = localStorage.getItem('token') !== null;
  const count = localStorage.getItem('itemCount');

  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          handleLogout();
        }
      }
    };

    const intervalId = setInterval(validateToken, 60000); // Check token validity every 60 seconds

    validateToken(); // Initial check on component mount

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [navigate]);

  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#21618C ' }}>
      <div className="container-fluid">
        <NavLink to={'/home'} className="navbar-brand">DeviceDepot.</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <NavLink className="nav-link dropdown-toggle" to="#" id="shopDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Shop
              </NavLink>
              <div className="dropdown-menu" aria-labelledby="shopDropdown">
                <NavLink to="/accessories" className="dropdown-item">Accessories</NavLink>
                <NavLink to="/mobile" className="dropdown-item">Mobile</NavLink>
                <NavLink to="/laptop" className="dropdown-item">Tablets</NavLink>
                <NavLink to="/laptops" className="dropdown-item">Laptops</NavLink>
              </div>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            
          </ul>
          <form className="d-flex mx-auto my-2 my-lg-0">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-warning" type="submit">Search</button>
          </form>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/liked-items">Liked Items</NavLink>
            </li>
            <li className="nav-item dropdown">
              <NavLink className="nav-link dropdown-toggle" to="#" id="accountDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Account
              </NavLink>
              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                {isAuthenticated ? (
                  <>
                    <NavLink className="dropdown-item" to="/userdash">View Profile</NavLink>
                    <button type="button" onClick={handleLogout} className="dropdown-item">Log-Out</button>
                  </>
                ) : (
                  <>
                    <NavLink className="dropdown-item" to="/loginregister">Create Account</NavLink>
                    <NavLink className="dropdown-item" to="/loginregister">Log-In</NavLink>
                  </>
                )}
              </div>
            </li>
            <li className="nav-item position-relative">
              <NavLink className="nav-link" to="/cart">
                Cart
                {count > 0 && (
                  <span className="badge badge-danger position-absolute top-0 start-100 translate-middle">
                    {count}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

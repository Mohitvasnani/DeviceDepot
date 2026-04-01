import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

function Userdashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/loginregister');
  };

  return (
    <div className="admin_dashboard_parent container-fluid">
      <div className="row">
        <section
          className="userdash col-12 col-lg-2 p-3 d-flex flex-column"
          style={{ background: '#343a40', color: '#fff', minHeight: '100vh', overflowY: 'auto' }}
        >
          <div className="user_dash_items pt-4">
            <h6 className="text-muted px-3 mb-3 text-uppercase" style={{ fontSize: '0.75rem' }}>
              My Account
            </h6>
            <ul className="d-flex flex-column gap-2 list-unstyled">
              <li>
                <NavLink className="nav-link dash_nav_admin p-3" to="userprofile">
                  <i className="bi bi-person me-2"></i>Profile
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link dash_nav_admin p-3" to="trackorder">
                  <i className="bi bi-bag me-2"></i>My Orders
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link dash_nav_admin p-3" to="/liked-items">
                  <i className="bi bi-heart me-2"></i>Liked Items
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link dash_nav_admin p-3" to="/cart">
                  <i className="bi bi-cart me-2"></i>My Cart
                </NavLink>
              </li>
            </ul>
            <div className="mt-auto pt-4">
              <button
                className="btn btn-outline-danger w-100 mt-3"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>Log Out
              </button>
            </div>
          </div>
        </section>
        <div
          className="dashboard_area col-12 col-lg-10 p-3"
          style={{ overflowY: 'auto' }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Userdashboard;
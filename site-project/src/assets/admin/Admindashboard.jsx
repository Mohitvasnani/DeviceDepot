import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signedOut } from '../../store/authSlice';
import { cartCleared } from '../../store/cartSlice';

function Admindashboard({ setUserCount, userCount }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Was a <NavLink> with no "to" prop, so it navigated nowhere and never
  // signed anyone out.
  const handleLogout = () => {
    dispatch(signedOut());
    dispatch(cartCleared());
    navigate('/loginregister');
  };

  return (
    <div className="dd-dash">
      <aside className="dd-dash-side">
        <p className="dd-dash-label">Admin</p>
        <nav className="dd-dash-nav">
          <NavLink to="mngproducts" className="dd-dash-link">
            <i className="bi bi-box-seam" aria-hidden="true"></i>Manage products
          </NavLink>
          <NavLink to="vieworders" className="dd-dash-link">
            <i className="bi bi-receipt" aria-hidden="true"></i>View orders
          </NavLink>
          <NavLink to="viewusers" className="dd-dash-link">
            <i className="bi bi-people" aria-hidden="true"></i>View users
            {userCount > 0 && <span className="dd-dash-badge">{userCount}</span>}
          </NavLink>
          <NavLink to="mngbanner" className="dd-dash-link">
            <i className="bi bi-image" aria-hidden="true"></i>View banners
          </NavLink>
          <NavLink to="/home" className="dd-dash-link">
            <i className="bi bi-shop" aria-hidden="true"></i>Back to store
          </NavLink>
        </nav>

        <button type="button" className="dd-dash-signout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true"></i>Log out
        </button>
      </aside>

      <main className="dd-dash-main">
        <Outlet context={[setUserCount, userCount]} />
      </main>
    </div>
  );
}

export default Admindashboard;

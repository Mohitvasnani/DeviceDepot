import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signedOut } from '../../store/authSlice';
import { cartCleared } from '../../store/cartSlice';

function Userdashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Clearing localStorage directly left the store thinking you were still
  // signed in, so the navbar did not update.
  const handleLogout = () => {
    dispatch(signedOut());
    dispatch(cartCleared());
    navigate('/loginregister');
  };

  return (
    <div className="dd-dash">
      <aside className="dd-dash-side">
        <p className="dd-dash-label">My account</p>
        <nav className="dd-dash-nav">
          <NavLink to="userprofile" className="dd-dash-link">
            <i className="bi bi-person" aria-hidden="true"></i>Profile
          </NavLink>
          <NavLink to="trackorder" className="dd-dash-link">
            <i className="bi bi-bag" aria-hidden="true"></i>My orders
          </NavLink>
          <NavLink to="/liked-items" className="dd-dash-link">
            <i className="bi bi-heart" aria-hidden="true"></i>Saved items
          </NavLink>
          <NavLink to="/cart" className="dd-dash-link">
            <i className="bi bi-cart" aria-hidden="true"></i>My cart
          </NavLink>
        </nav>

        <button type="button" className="dd-dash-signout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true"></i>Log out
        </button>
      </aside>

      <main className="dd-dash-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Userdashboard;

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function Admindashboard({ setUserCount, userCount }) {
  return (
    <div className="admin_dashboard_parent container-fluid">
      <div className="row">
        <section className="userdash col-12 col-lg-2 p-3" style={{ background: '#343a40', color: '#fff' }}>
          <div className="user_dash_items pt-4">
            <ul className="d-flex flex-column gap-3 list-unstyled col-7 col-lg-12">
              <li><NavLink className="nav-link dash_nav_admin p-3" to="mngproducts">Manage Products</NavLink></li>
              <li><NavLink className="nav-link dash_nav_admin p-3" to="vieworders">View Orders</NavLink></li>
              <li><NavLink className="nav-link dash_nav_admin p-3" to="viewusers">View Users <span className="badge badge-primary">{userCount}</span></NavLink></li>
              <li><NavLink className="nav-link dash_nav_admin p-3" to="mngbanner">View Banners</NavLink></li>
              <li><NavLink className="nav-link dash_nav_admin p-3" to="/">Home</NavLink></li>
              <li><NavLink className="nav-link dash_nav_admin btn btn-danger" style={{ padding: '20px 0px 20px 0px' }}>Logout</NavLink></li>
            </ul>
          </div>
        </section>
        <div className="dashboard_area col-12 col-lg-10 p-3">
          <Outlet context={[setUserCount, userCount]} />
        </div>
      </div>
    </div>
  );
}

export default Admindashboard;

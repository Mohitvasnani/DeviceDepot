import React from 'react';
import { NavLink, Routes, Route, Outlet } from 'react-router-dom';




function Userdashboard() {
  return (
    <div className="admin_dashboard_parent container-fluid" >
      <div className="row"  >
        <section className="userdash col-12 col-lg-2 p-3 d-flex flex-column"  style={{ background: '#343a40', color: '#fff', Height:'auto',overflowY: 'auto' }}>
          <div className="user_dash_items pt-4">
            <ul className="d-flex flex-column gap-3 list-unstyled col-7 col-lg-12">
              
              <li><NavLink className="nav-link dash_nav_admin p-3" to="userprofile">Profile</NavLink></li>
              <li><NavLink className="nav-link dash_nav_admin p-3" to="trackorder">View Orders</NavLink></li>
              
            </ul>
          </div>
        </section>
        <div className="dashboard_area col-12 col-lg-10 p-3" style={{ overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Userdashboard;

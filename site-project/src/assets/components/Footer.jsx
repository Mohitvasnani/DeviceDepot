import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="bg-dark text-light" style={{ height: 'auto', width: '100%' }}>
            <div className="footer-child d-md-flex d-sm-block justify-content-around">
                <div className="d-flex flex-column p-4">
                    <div>
                        <h3>Quick Links</h3>
                        <hr className='w-100' />
                    </div>
                    <div className='d-flex flex-column'>
                        <Link to="/home" className='text-decoration-none text-light mb-1'>Home</Link>
                        <Link to="/mobile" className='text-decoration-none text-light mb-1'>Mobiles</Link>
                        <Link to="/laptop" className='text-decoration-none text-light mb-1'>Laptops</Link>
                        <Link to="/accessories" className='text-decoration-none text-light mb-1'>Accessories</Link>
                        <Link to="/about" className='text-decoration-none text-light mb-1'>About Us</Link>
                    </div>
                </div>
                <div className="d-flex flex-column p-4">
                    <div>
                        <h3>Customer Service</h3>
                        <hr className='w-100' />
                    </div>
                    <div className='d-flex flex-column'>
                        <Link to="/userdash/trackorder" className='text-decoration-none text-light mb-1'>Track Order</Link>
                        <Link to="/userdash/userprofile" className='text-decoration-none text-light mb-1'>My Profile</Link>
                        <Link to="/cart" className='text-decoration-none text-light mb-1'>My Cart</Link>
                        <Link to="/liked-items" className='text-decoration-none text-light mb-1'>Liked Items</Link>
                    </div>
                </div>
                <div className="d-flex flex-column p-4">
                    <div>
                        <h3>Company</h3>
                        <hr className='w-100' />
                    </div>
                    <div className='d-flex flex-column'>
                        <Link to="/about" className='text-decoration-none text-light mb-1'>Our Story</Link>
                        <Link to="/loginregister" className='text-decoration-none text-light mb-1'>Sign In</Link>
                        <Link to="/loginregister" className='text-decoration-none text-light mb-1'>Register</Link>
                    </div>
                </div>
                <div className="d-flex flex-column p-4">
                    <div>
                        <h3>Contact</h3>
                        <hr className='w-100' />
                    </div>
                    <div className='d-flex flex-column'>
                        <address>
                            <strong>Device Depot</strong><br />
                            Liverpool, United Kingdom<br />
                            <abbr title="Email">E:</abbr> support@devicedepot.com
                        </address>
                        <div className='text-info'>
                            <i className="bi bi-twitter-x pe-4 fs-4"></i>
                            <i className="bi bi-facebook pe-4 fs-4"></i>
                            <i className="bi bi-whatsapp pe-4 fs-4"></i>
                            <i className="bi bi-instagram pe-4 fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center py-3 border-top border-secondary">
                <small className="text-muted">© {new Date().getFullYear()} Device Depot. All rights reserved.</small>
            </div>
        </footer>
    )
}

export default Footer
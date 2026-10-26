import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="dd-footer">
            <div className="dd-footer-inner">
                <div className="dd-footer-brand">
                    <span className="dd-footer-logo">DeviceDepot.</span>
                    <span className="dd-footer-place">Liverpool, United Kingdom</span>
                </div>

                <nav className="dd-footer-nav" aria-label="Footer">
                    <Link to="/laptop">Laptops</Link>
                    <Link to="/mobile">Mobiles</Link>
                    <Link to="/accessories">Accessories</Link>
                    <Link to="/about">About</Link>
                    <Link to="/userdash/trackorder">Track order</Link>
                    <Link to="/cart">Cart</Link>
                </nav>
            </div>

            <div className="dd-footer-base">
                <small>© {new Date().getFullYear()} Device Depot</small>
                <a href="mailto:support@devicedepot.com">support@devicedepot.com</a>
            </div>
        </footer>
    )
}

export default Footer

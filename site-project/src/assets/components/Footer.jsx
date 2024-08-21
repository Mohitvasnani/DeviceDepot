import React from 'react'

function Footer() {
    return (
        <>
            <footer className=" bg-dark text-light " style={{ height: 'auto', width: '100%' }}>
                <div className="footer-child d-md-flex d-sm-block justify-content-around  ">
                    <div className="d-flex flex-column p-4">
                        <div className="">
                            <h3>Quick Links</h3>
                            <hr className='w-100' />
                        </div>
                        <div className='d-flex flex-column'>
                            <a href="/" className=' text-decoration-none'>Home</a>
                            <a href="/" className=' text-decoration-none'>Shop</a>
                            <a href="/" className=' text-decoration-none'>Contact Us</a>
                            <a href="/" className=' text-decoration-none'>FAQ</a>
                            <a href="/" className=' text-decoration-none'>Terms and Conditions</a>
                        </div>
                    </div>
                    <div className="d-flex flex-column p-4">
                        <div className="">
                            <h3>Customer Service</h3>
                            <hr className='w-100' />
                        </div>
                        <div className='d-flex flex-column'>
                            <a href="/" className=' text-decoration-none'>Help Center</a>
                            <a href="/" className=' text-decoration-none'>Order Status</a>
                            <a href="/" className=' text-decoration-none'>Track Order</a>
                            <a href="/" className=' text-decoration-none'>Returns & Exchanges</a>
                            <a href="/" className=' text-decoration-none'>Privacy Policy</a>
                        </div>
                    </div>
                    <div className="d-flex flex-column p-4">
                        <div className="">
                            <h3>Company Information:</h3>
                            <hr className='w-100' />
                        </div>
                        <div className='d-flex flex-column'>
                            <a href="/" className=' text-decoration-none'>Our Story</a>
                            <a href="/" className=' text-decoration-none'>Careers</a>
                            <a href="/" className=' text-decoration-none'>Blog</a>

                        </div>
                    </div>
                    <div className="d-flex flex-column p-4">
                        <div className="">
                            <h3>Socials</h3>
                            <hr className='w-100' />
                        </div>
                        <div className='d-flex flex-column'>
                            <address>
                                <strong>storesKart</strong><br />
                                123 Street Name, City<br />
                                Country<br />
                                <abbr title="Phone">P:</abbr> (+91) 88900
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



            </footer>
        </>
    )
}

export default Footer

import React from 'react'

function Aboutus() {
    return (
        <div className="about_parent d-flex justify-content-center" style={{ width: '100%' }}>
            <div className="about_child">
                <h1 className='p-4 bg-dark text-light'>About Us</h1>
                <div className='d-flex flex-wrap'>
                    <div className='col-12 col-md-8'>
                        <div className="about_text p-4" style={{ textAlign: 'justify' }}>
                            <p>Welcome to <strong>Device Depot</strong>, your ultimate destination for the latest technology products. Built as a full-stack e-commerce platform, Device Depot offers a seamless shopping experience for mobiles, laptops, and accessories.</p>

                            <p>At Device Depot, we believe that great technology should be accessible to everyone. That's why we've curated a selection of products across categories including mobile phones, laptops, and accessories — each chosen to meet high standards of quality and value.</p>

                            <p>Our platform features secure user authentication, a dynamic cart and checkout flow, order management, and a powerful admin dashboard — all built with the MERN stack (MongoDB, Express.js, React.js, Node.js).</p>

                            <p>We are committed to providing a safe and secure shopping experience. Your personal information is protected with JWT-based authentication and industry-standard security practices.</p>

                            <p>Thank you for choosing Device Depot. We look forward to serving you.</p>
                        </div>
                    </div>

                    <div className='col-12 col-md-4'>
                        <div
                            id="carouselAbout"
                            className="carousel slide"
                            data-bs-ride="carousel"
                        >
                            <div className="carousel-inner">
                                <div className="carousel-item active" data-bs-interval="3000">
                                    <img
                                        src="./delivery.webp"
                                        className="d-block w-100"
                                        style={{ minHeight: '300px', objectFit: 'cover' }}
                                        alt="Fast Delivery"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Device+Depot' }}
                                    />
                                </div>
                                <div className="carousel-item" data-bs-interval="3000">
                                    <img
                                        src="./d2.webp"
                                        className="d-block w-100"
                                        style={{ minHeight: '300px', objectFit: 'cover' }}
                                        alt="Quality Products"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Device+Depot' }}
                                    />
                                </div>
                                <div className="carousel-item" data-bs-interval="3000">
                                    <img
                                        src="./d3.webp"
                                        className="d-block w-100"
                                        style={{ minHeight: '300px', objectFit: 'cover' }}
                                        alt="Secure Shopping"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Device+Depot' }}
                                    />
                                </div>
                            </div>
                            <button
                                className="carousel-control-prev"
                                type="button"
                                data-bs-target="#carouselAbout"
                                data-bs-slide="prev"
                            >
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button
                                className="carousel-control-next"
                                type="button"
                                data-bs-target="#carouselAbout"
                                data-bs-slide="next"
                            >
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Aboutus
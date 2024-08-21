import React from 'react'

function Aboutus() {
    return (
        <>
            <div className="about_parent d-flex justify-content-center  " style={{ maxHeight: '100vh', width: '100%' }}>

                <div className="about_child ">
                    <h1 className='p-4 bg-danger'>About Us</h1>
                    <div className='d-flex'>


                        <div className='col-8'>


                            <div className="about_text p-4   " style={{ textAlign: 'justify' }}>
                                <p>Welcome to ShopEase, your ultimate destination for a seamless and delightful online shopping experience. Founded in 2021, ShopEase has quickly grown into a trusted marketplace that connects millions of customers with a diverse range of high-quality products. Our mission is to make shopping easy, enjoyable, and accessible for everyone, everywhere.</p>

                                <p>At ShopEase, we believe that shopping should be more than just a transaction—it should be an experience. That's why we've curated a vast selection of items across categories such as fashion, electronics, home goods, beauty, and more. Each product is handpicked by our team of experts to ensure it meets our stringent standards for quality, value, and style.</p>

                                <p>Our commitment to excellence extends beyond our product range. We pride ourselves on providing exceptional customer service, with a dedicated support team available 24/7 to assist you with any queries or concerns. From the moment you visit our site to the time your order arrives at your doorstep, we strive to make every step of your shopping journey smooth and enjoyable.</p>

                                <p>ShopEase is also deeply committed to sustainability and ethical practices. We partner with brands and suppliers who share our values, ensuring that our products are not only great for you but also kind to the planet. By choosing ShopEase, you’re supporting a business that prioritizes environmental responsibility and social good.</p>

                                <p>We understand that trust is the cornerstone of any successful e-commerce platform. That's why we employ the latest security measures to protect your personal information and ensure that your transactions are safe and secure. With fast shipping, easy returns, and a commitment to customer satisfaction, ShopEase is designed to offer you the best shopping experience possible.</p>

                                <p>Thank you for choosing ShopEase. We look forward to serving you and making your shopping dreams come true.</p>
                            </div>
                        </div>

                        <div className=' col-4' style={{minHeight:'100%'}} >
                            <div id="carouselExampleInterval" className="carousel slide " accordion-body data-bs-ride="carousel">
                                <div className="carousel-inner">
                                    <div className="carousel-item active" data-bs-interval="10000">
                                        <img src="./delivery.webp" className="d-block w-100 h-100 " style={{minHeight:'100%'}} alt="..." />
                                    </div>
                                    <div className="carousel-item" data-bs-interval="2000">
                                        <img src="./d2.webp" style={{minHeight:'100%'}} className="d-block w-100 h-100 " alt="..." />
                                    </div>
                                    <div className="carousel-item">
                                        <img src="./d3.webp" style={{minHeight:'100%' }} className="d-block w-100 h-100 " alt="..." />
                                    </div>
                                </div>
                                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </div>

                        </div>
                        </div>



                    </div>
                </div>
            </>
            )
}

            export default Aboutus

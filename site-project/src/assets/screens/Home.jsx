import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Productcard from '../components/Productcard';
import { ProductsContext } from '../components/Productcontext';
import '../css/Home.css'

function Home() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [length, setLength] = useState([]);
  const { likedProducts } = useContext(ProductsContext);

  const fetchBanners = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/banner/getbanner');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/product/allproducts');
      setProducts(response.data);
      setLength(response.data.length);

    } catch (error) {
      console.error('Error fetching products', error);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    // Handle product click
    console.log(product);
  };

  return (
    <div className="home_parent" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden'}}>
      <div className="home_child">
        <section className="home_banner" style={{ width: '100%', marginBottom: '0px' }}>
          <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {banners.map((banner, index) => (
                <div
                  key={index}
                  className={`carousel-item ${index === 0 ? 'active' : ''}`}
                  data-bs-interval="10000"
                >
                  <img src={banner.file} className="d-block w-100 " style={{height:'400px' }} alt="..." />
                </div>
              ))}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleInterval"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleInterval"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </section>
        <section className="home_top_seller text-light d-flex flex-column gap-3 align-items-center p-2" style={{ background: '#31363F', marginTop: '0px' }}>
          <h3>Top Selling Products</h3>
          <div className="home_display_card text-dark d-flex row row-gap-4">

            {products.slice(0,4).map((product) =>(
              <Productcard key={product._id} product={product} handleClick={handleProductClick} />
            ))}
          </div>
        </section>
        <section className="home_new_arrivals text-light d-flex flex-column gap-3 justify-content-center align-items-center px-3 py-5" style={{ marginTop: '0px' }}>
          <h3>New Arrivals</h3>
          <div className="home_display_card text-dark d-flex row row-gap-4">
          {products.slice((length-4),length).map((product) =>(
              <Productcard key={product._id} product={product} handleClick={handleProductClick} />
            ))}
          </div>
        </section>
        <div className="home_categories"></div>
        <div className="home_offers"></div>
      </div>
    </div>
  );
}

export default Home;

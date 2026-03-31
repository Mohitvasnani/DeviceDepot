import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Productcard from '../components/Productcard';
import { ProductsContext } from '../components/Productcontext';
import '../css/Home.css';

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const { likedProducts } = useContext(ProductsContext);
  const navigate = useNavigate();

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/banner/getbanner`);
      // Guard — make sure response is an array
      setBanners(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching banners', error);
      setBanners([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/product/allproducts`);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    navigate('/view-product', { state: { productData: product } });
  };

  return (
    <div className="home_parent" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <div className="home_child">

        {/* Banner Carousel */}
        <section className="home_banner" style={{ width: '100%', marginBottom: '0px' }}>
          {banners.length > 0 ? (
            <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-inner">
                {banners.map((banner, index) => (
                  <div
                    key={banner._id || index}
                    className={`carousel-item ${index === 0 ? 'active' : ''}`}
                    data-bs-interval="10000"
                  >
                    <img
                      src={`${API_URL}/${banner.file}`}
                      className="d-block w-100"
                      style={{ height: '400px', objectFit: 'cover' }}
                      alt={banner.name || 'Banner'}
                      onError={(e) => { e.target.src = 'https://placehold.co/1200x400?text=Device+Depot' }}
                    />
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
          ) : (
            // Placeholder when no banners exist yet
            <div
              className="d-flex justify-content-center align-items-center bg-dark text-light"
              style={{ height: '400px' }}
            >
              <div className="text-center">
                <h2>Welcome to Device Depot</h2>
                <p>Your one-stop shop for tech</p>
              </div>
            </div>
          )}
        </section>

        {/* Top Selling Products */}
        <section
          className="home_top_seller text-light d-flex flex-column gap-3 align-items-center p-2"
          style={{ background: '#31363F', marginTop: '0px' }}
        >
          <h3>Top Selling Products</h3>
          <div className="home_display_card text-dark d-flex row row-gap-4">
            {products.slice(0, 4).map((product) => (
              <Productcard
                key={product._id}
                product={product}
                handleClick={handleProductClick}
              />
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section
          className="home_new_arrivals text-light d-flex flex-column gap-3 justify-content-center align-items-center px-3 py-5"
          style={{ marginTop: '0px' }}
        >
          <h3>New Arrivals</h3>
          <div className="home_display_card text-dark d-flex row row-gap-4">
            {products.slice(-4).map((product) => (
              <Productcard
                key={product._id}
                product={product}
                handleClick={handleProductClick}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Home;
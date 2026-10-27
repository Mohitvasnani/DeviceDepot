import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, NavLink } from 'react-router-dom';
import Productcard from '../components/Productcard';
import { ProductsContext } from '../components/Productcontext';
import WakeNotice from '../components/WakeNotice';
import '../css/Home.css';

const API_URL = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  { slug: 'laptop', to: '/laptop', label: 'Laptops' },
  { slug: 'mobile', to: '/mobile', label: 'Mobiles' },
  { slug: 'accessories', to: '/accessories', label: 'Accessories' },
];

function SkeletonRow({ count = 4 }) {
  return (
    <div className="row home_display_card">
      {Array.from({ length: count }, (_, i) => (
        <div className="col-12 col-sm-6 col-lg-3" key={i}>
          <div className="dd-skeleton-card">
            <div className="dd-skeleton dd-skeleton-img"></div>
            <div className="dd-skeleton dd-skeleton-line"></div>
            <div className="dd-skeleton dd-skeleton-line short"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Home() {
  const [banners, setBanners] = useState([]);
  const { products, loading, error, refetchProducts } = useContext(ProductsContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/banner/getbanner`);
        setBanners(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching banners', err);
        setBanners([]);
      }
    };
    fetchBanners();
  }, []);

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  const countIn = (slug) => products.filter((p) => p.categories === slug).length;

  return (
    <div className="home_parent">
      <div className="home_child">

        {banners.length > 0 ? (
          <section className="home_banner">
            <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-inner">
                {banners.map((banner, index) => (
                  <div
                    key={banner._id || index}
                    className={`carousel-item ${index === 0 ? 'active' : ''}`}
                    data-bs-interval="10000"
                  >
                    <img
                      src={banner.file}
                      className="d-block w-100"
                      alt={banner.name || 'Banner'}
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x400/141412/f5ce2e/png?text=DeviceDepot'; }}
                    />
                  </div>
                ))}
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
          </section>
        ) : (
          <section className="dd-hero">
            <h1>Laptops, phones and the kit that goes with them.</h1>
            <p>
              Specs up front, prices in plain sight, next-day delivery across the UK.
            </p>
            <nav className="dd-hero-links" aria-label="Shop by category">
              {CATEGORIES.map((c) => (
                <NavLink key={c.slug} to={c.to} className="dd-hero-link">
                  {c.label}
                  {!loading && (
                    <span className="dd-hero-link-count">{countIn(c.slug)} in stock</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </section>
        )}

        <section className="home_top_seller">
          <div className="dd-section-head">
            <h2>Top selling</h2>
            {!loading && !error && (
              <span className="dd-count">{products.length} products in the catalogue</span>
            )}
          </div>

          {loading && (
            <>
              <WakeNotice />
              <SkeletonRow />
            </>
          )}

          {!loading && error && (
            <div className="dd-empty">
              <h4>The catalogue did not load</h4>
              <p>
                The server may still be waking up. The free tier sleeps after a period of
                inactivity and can take up to a minute to respond.
              </p>
              <button className="btn btn-primary" onClick={refetchProducts}>Try again</button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="dd-empty">
              <h4>Nothing in the catalogue yet</h4>
              <p>Add products from the admin dashboard and they will appear here.</p>
              <NavLink className="btn btn-primary" to="/admin/addproduct">Add a product</NavLink>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="row home_display_card">
              {products.slice(0, 4).map((product) => (
                <Productcard key={product._id} product={product} handleClick={handleProductClick} />
              ))}
            </div>
          )}
        </section>

        {!error && (products.length > 4 || loading) && (
          <section className="home_new_arrivals">
            <div className="dd-section-head">
              <h2>Latest additions</h2>
            </div>
            {loading ? (
              <SkeletonRow />
            ) : (
              <div className="row home_display_card">
                {products.slice(-4).map((product) => (
                  <Productcard key={product._id} product={product} handleClick={handleProductClick} />
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

export default Home;

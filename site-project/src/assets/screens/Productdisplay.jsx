import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/productdisplay.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

function Productdisplay() {
  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const product_data = location.state?.productData;
  const token = localStorage.getItem('token');

  // Guard — if user navigates here directly with no product data
  if (!product_data) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <h3 className="text-muted">No product selected</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </div>
    );
  }

  const addToCart = async (productId) => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      toast.warning('Please log in to add items to cart');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/product/addcart`,
        { productId, email: userEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Product added to cart!');
      } else {
        toast.error('Failed to add product to cart.');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Error adding to cart');
    }
  };

  const addLike = async (productId) => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      toast.warning('Please log in to like products');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/product/addlike`,
        { productId, email: userEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Added to liked items!');
      }
    } catch (error) {
      console.error('Error adding to liked:', error);
      toast.error('Error adding to liked');
    }
  };

  const removeLike = async (productId) => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) return;
    try {
      const response = await axios.delete(
        `${API_URL}/api/product/removelike`,
        {
          data: { productId, email: userEmail },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        toast.info('Removed from liked items');
      }
    } catch (error) {
      console.error('Error removing like:', error);
      toast.error('Error removing like');
    }
  };

  const toggleLike = async () => {
    if (liked) {
      await removeLike(product_data._id);
    } else {
      await addLike(product_data._id);
    }
    setLiked(!liked);
  };

  return (
    <div className="parent_displayitem p-5">
      <ToastContainer />
      <div className="child_displayitem d-flex justify-content-center">
        <div className="detail_displayarea d-flex p-4 border border-1 shadow-lg bg-secondary-subtle">

          {/* Image Section */}
          <div className="col-6 d-flex justify-content-evenly align-items-center">
            <div className="bottom_img col-2">
              {product_data.files.slice(0, 4).map((file, index) => (
                <img
                  key={index}
                  src={`${API_URL}/${file}`}
                  alt={`${product_data.name} view ${index + 1}`}
                  className={`thumb_img mb-2 ${selectedImage === index ? 'border border-primary' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  style={{ cursor: 'pointer' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=No+Image' }}
                />
              ))}
            </div>
            <div className="main_img_container">
              <img
                src={`${API_URL}/${product_data.files[selectedImage]}`}
                alt={product_data.name}
                className="main_img"
                onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=No+Image' }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className='p-2'>
            <span className="badge bg-secondary mb-2">{product_data.categories}</span>
            <h4>{product_data.name}</h4>
            <h5 className="text-danger">£{product_data.price}</h5>
            <div className="mb-2 text-warning">
              {'⭐'.repeat(Math.min(product_data.rating, 5))}
            </div>
            <p className="mt-2">{product_data.description}</p>

            {/* Stock Status */}
            <p>
              {product_data.quantity > 0 ? (
                <span className="badge bg-success">In Stock ({product_data.quantity} available)</span>
              ) : (
                <span className="badge bg-danger">Out of Stock</span>
              )}
            </p>

            <div className="mt-3">
              <button
                type="button"
                className="me-3 btn btn-primary"
                onClick={() => addToCart(product_data._id)}
                disabled={product_data.quantity === 0}
              >
                <i className="bi bi-cart-plus me-1"></i>Add To Cart
              </button>
              <i
                className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'} me-2 fs-4 text-danger`}
                onClick={toggleLike}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>

            {/* Features Accordion */}
            <div className="mt-4">
              <div className="accordion" id="accordionExample">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-expanded="true"
                    >
                      Key Features
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      <ul className="mb-0">
                        <li>{product_data.feature1}</li>
                        <li>{product_data.feature2}</li>
                        <li>{product_data.feature3}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Productdisplay;
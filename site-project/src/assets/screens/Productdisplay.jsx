import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/productdisplay.css';

function Productdisplay() {
  const [liked, setLiked] = useState(false);
  const location = useLocation();
  const product_data = location.state?.productData;

  // Function to add product to the cart
  const addToCart = async (productId) => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      console.error('User email not found in local storage.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/product/addcart', {
        productId,
        email: userEmail
      });
      if (response.data.success) {
        console.log('Product added to cart successfully!');
      } else {
        console.error('Failed to add product to cart.');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const addLike = async (productId) => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      console.error('Email not saved');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/product/addlike', {
        productId,
        email: userEmail
      });
      if (response.data.success) {
        console.log('Product liked');
        toggleLike(productId);
      } else {
        console.error('Failed to add to liked');
      }
    } catch (error) {
      console.error('Error adding to liked:', error);
    }
  };

  const removeLike = async (productId) => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      console.error('Email not saved');
      return;
    }
    try {
      const response = await axios.delete('http://localhost:8080/api/product/removelike', {
        data: {
          productId,
          email: userEmail
        }
      });
      if (response.data.success) {
        console.log('Product unliked');
        setLiked(false);
      } else {
        console.error('Failed to remove like');
      }
    } catch (error) {
      console.error('Error removing like:', error);
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
    <>
      <div className="parent_displayitem p-5">
        <div className="child_displayitem d-flex justify-content-center">
          <div className="detail_displayarea d-flex p-4 border border-1 shadow-lg bg-secondary-subtle">
            <div className="col-6 d-flex justify-content-evenly align-items-center align-content-center">
              <div className="bottom_img col-2">
                {product_data.files.slice(1, 5).map((file, index) => (
                  <img key={index} src={file} alt="" className="thumb_img mb-2" />
                ))}
              </div>
              <div className="main_img_container">
                <img src={product_data.files[0]} alt="" className="main_img" />
              </div>
            </div>
            <div className='p-2'>
              <div className=''>
                <h4>{product_data.name}</h4>
                <h5>₹{product_data.price}</h5>
                {/* <div className="display rating">
                  <span className="text-warning">
                    <i className="me-1 bi bi-star-fill"></i>
                    <i className="me-1 bi bi-star-fill"></i>
                    <i className="me-1 bi bi-star-fill"></i>
                    <i className="me-1 bi bi-star-fill"></i>
                  </span>
                  <i className="bi bi-star-fill"></i>
                </div> */}
                <p className="mt-3">{product_data.description}</p>
                <div>
                  <button type="button" className="me-3 btn btn-info" onClick={() => addToCart(product_data._id)}>Add To Cart</button>
                  <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'} me-2 fs-4`} onClick={toggleLike}></i>
                </div>
              </div>
              <div className="mt-4">
                <div className="accordion" id="accordionExample">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                        Features
                      </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                      <div className="accordion-body">
                      {product_data.feature1}
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        Additional Features
                      </button>
                    </h2>
                    <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                      <div className="accordion-body">
                       {product_data.feature2}
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Productdisplay;

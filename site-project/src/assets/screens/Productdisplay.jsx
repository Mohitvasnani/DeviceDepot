import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/productdisplay.css';
import { toast } from 'react-toastify';
import { ProductsContext } from '../components/Productcontext';

const API_URL = import.meta.env.VITE_API_URL;
const FALLBACK = 'https://placehold.co/600x600/f3f1ea/6f6d64/png?text=No+image';

function Productdisplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { likedProducts } = useContext(ProductsContext);

  // Loaded from the backend by id, not from React Router navigation state -
  // that meant a direct link, a refresh, or opening in a new tab all showed
  // an empty page even though the product existed. See REVIEW.md item 5.
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not-found | error
  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setSelectedImage(0);

    axios.get(`${API_URL}/api/product/${id}`)
      .then((res) => {
        if (cancelled) return;
        setProduct(res.data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setStatus('not-found');
        } else {
          console.error('Error fetching product:', err);
          setStatus('error');
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  // Reflect whether this product is already saved, once the shared liked
  // list (fetched once at app load) and this product are both in.
  useEffect(() => {
    if (product) setLiked(Boolean(likedProducts[product._id]));
  }, [product, likedProducts]);

  if (status === 'loading') {
    return (
      <div className="parent_displayitem">
        <div className="dd-detail">
          <div className="dd-gallery">
            <div className="dd-skeleton dd-skeleton-img" style={{ width: '100%', aspectRatio: '1 / 1' }}></div>
          </div>
          <div className="dd-detail-info">
            <div className="dd-skeleton dd-skeleton-line"></div>
            <div className="dd-skeleton dd-skeleton-line short"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="parent_displayitem">
        <div className="dd-empty">
          <h4>We could not find that product</h4>
          <p>It may have been removed, or the link is wrong.</p>
          <button className="btn btn-primary" onClick={() => navigate('/home')}>
            Browse the catalogue
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="parent_displayitem">
        <div className="dd-empty">
          <h4>This product did not load</h4>
          <p>
            The server may still be waking up. The free tier sleeps after a period
            of inactivity and can take up to a minute to respond.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  const images = product.files?.length ? product.files : [FALLBACK];
  const inStock = product.quantity > 0;
  const features = [product.feature1, product.feature2, product.feature3].filter(Boolean);

  const addToCart = async () => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) return toast.warning('Sign in to add items to your cart');
    try {
      const res = await axios.post(
        `${API_URL}/api/product/addcart`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      res.data.success
        ? toast.success(`${product.name} added to cart`)
        : toast.error('Could not add to cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Could not add to cart');
    }
  };

  const toggleLike = async () => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) return toast.warning('Sign in to save items');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (liked) {
        await axios.delete(`${API_URL}/api/product/removelike`, {
          data: { productId: product._id },
          headers,
        });
        toast.info('Removed from saved items');
      } else {
        await axios.post(
          `${API_URL}/api/product/addlike`,
          { productId: product._id },
          { headers }
        );
        toast.success('Saved');
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error updating saved items:', error);
      toast.error('Could not update saved items');
    }
  };

  return (
    <div className="parent_displayitem">
      <div className="dd-detail">

        <div className="dd-gallery">
          <div className="dd-thumbs">
            {images.slice(0, 4).map((file, index) => (
              <button
                key={index}
                type="button"
                className={`dd-thumb ${selectedImage === index ? 'is-active' : ''}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`Show image ${index + 1} of ${Math.min(images.length, 4)}`}
                aria-pressed={selectedImage === index}
              >
                {/* files[] holds absolute URLs already. Do not prefix API_URL. */}
                <img
                  src={file}
                  alt=""
                  onError={(e) => { e.currentTarget.src = FALLBACK; }}
                />
              </button>
            ))}
          </div>

          <div className="dd-stage">
            <img
              src={images[selectedImage]}
              alt={product.name}
              onError={(e) => { e.currentTarget.src = FALLBACK; }}
            />
          </div>
        </div>

        <div className="dd-detail-info">
          <span className="dd-detail-cat">{product.categories}</span>
          <h1>{product.name}</h1>

          <div className="dd-detail-pricerow">
            <span className="dd-price dd-price-lg">£{product.price}</span>
            <span className="dd-detail-rating" aria-label={`Rated ${product.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={`bi ${i < product.rating ? 'bi-star-fill' : 'bi-star'}`} aria-hidden="true"></i>
              ))}
            </span>
          </div>

          <p className="dd-detail-desc">{product.description}</p>

          <p className={`dd-stock ${inStock ? 'in' : 'out'}`}>
            {inStock ? `In stock, ${product.quantity} available` : 'Out of stock'}
          </p>

          <div className="dd-detail-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={addToCart}
              disabled={!inStock}
            >
              Add to cart
            </button>
            <button
              type="button"
              className={`dd-save-btn ${liked ? 'is-saved' : ''}`}
              onClick={toggleLike}
              aria-pressed={liked}
              aria-label={liked ? 'Remove from saved items' : 'Save this product'}
            >
              <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true"></i>
            </button>
          </div>

          {features.length > 0 && (
            <section className="dd-specs">
              <h2>Specification</h2>
              <ul className="dd-spec-list">
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

      </div>
    </div>
  );
}

export default Productdisplay;

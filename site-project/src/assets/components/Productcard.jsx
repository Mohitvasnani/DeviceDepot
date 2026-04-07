import React, { useContext } from 'react';
import { ProductsContext } from './Productcontext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

function Productcard({ product, handleClick }) {
    const { likedProducts, removeLike, addToCart, addLike } = useContext(ProductsContext);

    const handleAddToCart = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warning('Please log in to add items to cart');
            return;
        }
        addToCart(product._id);
        toast.success('Product added to cart!');
    };

    const handleToggleLike = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warning('Please log in to like products');
            return;
        }
        if (likedProducts[product._id]) {
            removeLike(product._id);
            toast.info('Removed from liked items');
        } else {
            addLike(product._id);
            toast.success('Added to liked items!');
        }
    };

    return (
        <div className="col-lg-3 col-md-6 col-sm-8 mt-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
                <div className="position-relative">
                    <img
                        src={product.files[0]}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '300px', objectFit: 'contain', cursor: 'pointer' }}
                        onClick={() => handleClick(product)}
                        onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=No+Image' }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                        <i
                            className={`bi ${likedProducts[product._id] ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-4`}
                            onClick={handleToggleLike}
                            style={{ cursor: 'pointer' }}
                        ></i>
                    </div>
                    <div className="position-absolute top-0 start-0 p-2">
                        <span className="badge bg-secondary">{product.categories}</span>
                    </div>
                </div>
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted small">
                        {product.description.length > 80
                            ? `${product.description.substring(0, 80)}...`
                            : product.description}
                    </p>
                    <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="text-danger mb-0">£{product.price}</h5>
                            <small className="text-warning">
                                {'⭐'.repeat(Math.min(product.rating, 5))}
                            </small>
                        </div>
                        {product.quantity > 0 ? (
                            <button
                                className="btn btn-primary w-100"
                                onClick={handleAddToCart}
                            >
                                <i className="bi bi-cart-plus me-1"></i>Add to Cart
                            </button>
                        ) : (
                            <button className="btn btn-secondary w-100" disabled>
                                Out of Stock
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Productcard;
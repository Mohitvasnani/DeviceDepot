import React, { useContext } from 'react';
import { ProductsContext } from '../components/Productcontext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/ViewLikedItems.css';

const API_URL = import.meta.env.VITE_API_URL;

const ViewLikedItems = () => {
    const { likedItems, removeLike, addToCart } = useContext(ProductsContext);
    const navigate = useNavigate();

    const handleRemoveLike = (productId) => {
        removeLike(productId);
        toast.info('Removed from liked items');
    };

    const handleAddToCart = (productId) => {
        addToCart(productId);
        toast.success('Added to cart!');
    };

    if (likedItems.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <ToastContainer />
                <i className="bi bi-heart" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                <h3 className="mt-3 text-muted">No liked items yet</h3>
                <p className="text-muted">Browse products and click the heart icon to save them here</p>
                <button
                    className="btn btn-primary mt-2"
                    onClick={() => navigate('/home')}
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="container container-liked mt-5">
            <ToastContainer />
            <h2 className="mb-4">
                Liked Items
                <span className="badge bg-secondary ms-2">{likedItems.length}</span>
            </h2>
            <div className="row">
                {likedItems.map((item) => (
                    <div key={item._id} className="col-lg-3 col-md-6 col-sm-12 mb-4">
                        <div className="card h-100 border-0 shadow-sm">
                            <div className="position-relative">
                                <img
                                    src={item.file}
                                    className="card-img-top"
                                    alt={item.name}
                                    style={{ height: '300px', objectFit: 'contain' }}
                                    onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=No+Image' }}
                                />
                                <div className="position-absolute top-0 end-0 p-2">
                                    <i
                                        className="bi bi-heart-fill text-danger fs-4"
                                        onClick={() => handleRemoveLike(item.productId)}
                                        style={{ cursor: 'pointer' }}
                                        title="Remove from liked"
                                    ></i>
                                </div>
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{item.name}</h5>
                                <p className="card-text text-muted small">
                                    {item.description?.length > 80
                                        ? `${item.description.substring(0, 80)}...`
                                        : item.description}
                                </p>
                                <div className="mt-auto">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="text-danger mb-0">£{item.price}</h5>
                                    </div>
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={() => handleAddToCart(item.productId)}
                                    >
                                        <i className="bi bi-cart-plus me-1"></i>Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewLikedItems;
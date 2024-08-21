import React, { useContext } from 'react';
import { ProductsContext } from './Productcontext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Productcard({ product, handleClick }) {
    const { likedProducts, removeLike, addToCart, addLike } = useContext(ProductsContext);

    const handleAddToCart = () => {
        addToCart(product._id);
        toast.success('Product added to cart!');
    };

    const handleToggleLike = () => {
        if (likedProducts[product._id]) {
            removeLike(product._id);
            toast.info('Product removed from likes.');
        } else {
            addLike(product._id);
            toast.success('Product added to likes!');
        }
    };

    return (
        <div className="col-lg-3 col-md-6 col-sm-8 mt-3 mb-3" >
            <div className="card  border-0 shadow-sm">
                <div className="position-relative">
                    <img
                        src={product.files[0]}
                        className="card-img-top"
                        alt="Product"
                        style={{ height: '300px', objectFit: 'contain' }}
                        onClick={() => handleClick(product)}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                        <i
                            className={`bi ${likedProducts[product._id] ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-4`}
                            onClick={handleToggleLike}
                        ></i>
                    </div>
                </div>
                <div className="card-body d-flex flex-column">
                    <div className="position-absolute top-0 start-0 p-2">
                        <span className="badge bg-secondary">{product.categories}</span>
                    </div>
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted">{product.description}</p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                        <h4 className="text-danger mb-0">₹{product.price}</h4>
                        <button className="btn btn-primary" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Productcard;

import React, { useContext } from 'react';
import { ProductsContext } from './Productcontext';
import { toast } from 'react-toastify';
import '../css/Productcard.css';

function Productcard({ product, handleClick }) {
    const { likedProducts, removeLike, addToCart, addLike } = useContext(ProductsContext);
    const isLiked = Boolean(likedProducts[product._id]);
    const inStock = product.quantity > 0;

    const handleAddToCart = () => {
        if (!localStorage.getItem('token')) {
            toast.warning('Sign in to add items to your cart');
            return;
        }
        addToCart(product._id);
        toast.success(`${product.name} added to cart`);
    };

    const handleToggleLike = () => {
        if (!localStorage.getItem('token')) {
            toast.warning('Sign in to save items');
            return;
        }
        if (isLiked) {
            removeLike(product._id);
            toast.info('Removed from saved items');
        } else {
            addLike(product._id);
            toast.success('Saved');
        }
    };

    const blurb = (product.description || '').length > 90
        ? `${product.description.slice(0, 90).trimEnd()}...`
        : product.description;

    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <article className="dd-card">
                <div className="dd-card-media">
                    <button
                        type="button"
                        className="dd-card-imgbtn"
                        onClick={() => handleClick(product)}
                        aria-label={`View ${product.name}`}
                    >
                        <img
                            src={product.files?.[0]}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x450/f3f4f6/6b737d/png?text=No+image'; }}
                        />
                    </button>

                    <span className="dd-card-cat">{product.categories}</span>

                    <button
                        type="button"
                        className={`dd-card-save ${isLiked ? 'is-saved' : ''}`}
                        onClick={handleToggleLike}
                        aria-pressed={isLiked}
                        aria-label={isLiked ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
                    >
                        <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true"></i>
                    </button>

                    {!inStock && <span className="dd-card-oos">Out of stock</span>}
                </div>

                <div className="dd-card-body">
                    <h3 className="dd-card-title">
                        <button type="button" onClick={() => handleClick(product)}>
                            {product.name}
                        </button>
                    </h3>

                    <p className="dd-card-blurb">{blurb}</p>

                    <div className="dd-card-foot">
                        <div className="dd-card-figures">
                            <span className="dd-price dd-price-md">£{product.price}</span>
                            <span className="dd-card-rating" aria-label={`Rated ${product.rating} out of 5`}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <i
                                        key={i}
                                        className={`bi ${i < product.rating ? 'bi-star-fill' : 'bi-star'}`}
                                        aria-hidden="true"
                                    ></i>
                                ))}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={handleAddToCart}
                            disabled={!inStock}
                        >
                            {inStock ? 'Add to cart' : 'Out of stock'}
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
}

export default Productcard;

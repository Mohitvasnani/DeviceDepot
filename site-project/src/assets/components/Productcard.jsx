import React, { memo, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProductsContext } from './Productcontext';
import { addItem } from '../../store/cartSlice';
import { selectIsAuthenticated } from '../../store/authSlice';
import { toast } from 'react-toastify';
import '../css/Productcard.css';

function Productcard({ product, handleClick }) {
    const { likedProducts, removeLike, addLike } = useContext(ProductsContext);
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLiked = Boolean(likedProducts[product._id]);
    const inStock = product.quantity > 0;

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.warning('Sign in to add items to your cart');
            return;
        }
        try {
            await dispatch(addItem(product._id)).unwrap();
            toast.success(`${product.name} added to cart`);
        } catch (message) {
            toast.error(message || 'Could not add to cart');
        }
    };

    const handleToggleLike = () => {
        if (!isAuthenticated) {
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

    // Reveal once on first scroll into view. The hiding class is added here
    // rather than in the markup, so a card is visible if this never runs.
    const cardRef = useRef(null);
    useEffect(() => {
        const el = cardRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        el.classList.add('dd-reveal');
        const io = new IntersectionObserver(
            ([entry], obs) => {
                if (!entry.isIntersecting) return;
                el.classList.add('is-in');
                obs.disconnect();
            },
            { rootMargin: '0px 0px -40px 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const blurb = (product.description || '').length > 90
        ? `${product.description.slice(0, 90).trimEnd()}...`
        : product.description;

    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <article className="dd-card" ref={cardRef}>
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
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x450/f3f1ea/6f6d64/png?text=No+image'; }}
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

// Memoised: with a memoised context value above it, a card now only
// re-renders when its own product or liked state actually changes.
export default memo(Productcard);

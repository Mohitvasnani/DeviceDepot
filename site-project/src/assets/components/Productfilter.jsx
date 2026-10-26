import React, { useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ProductsContext } from './Productcontext';
import Productcard from './Productcard';
import WakeNotice from './WakeNotice';

const ProductFilter = ({ category }) => {
    const { products, loading, error, refetchProducts } = useContext(ProductsContext);
    const navigate = useNavigate();

    const handleClick = (product) => {
        navigate('/view-product', { state: { productData: product } });
    };

    if (loading) {
        return (
            <>
            <WakeNotice />
            <div className="row home_display_card">
                {Array.from({ length: 8 }, (_, i) => (
                    <div className="col-12 col-sm-6 col-lg-3" key={i}>
                        <div className="dd-skeleton-card">
                            <div className="dd-skeleton dd-skeleton-img"></div>
                            <div className="dd-skeleton dd-skeleton-line"></div>
                            <div className="dd-skeleton dd-skeleton-line short"></div>
                        </div>
                    </div>
                ))}
            </div>
            </>
        );
    }

    if (error) {
        return (
            <div className="dd-empty">
                <h4>The catalogue did not load</h4>
                <p>
                    The server may still be waking up. The free tier sleeps after a period
                    of inactivity and can take up to a minute to respond.
                </p>
                <button className="btn btn-primary" onClick={refetchProducts}>Try again</button>
            </div>
        );
    }

    const filteredProducts = products.filter(
        product => product.categories === category
    );

    if (filteredProducts.length === 0) {
        return (
            <div className="dd-empty">
                <h4>Nothing in this category yet</h4>
                <p>Try another part of the catalogue while this one fills up.</p>
                <NavLink className="btn btn-primary" to="/home">Back to the catalogue</NavLink>
            </div>
        );
    }

    return (
        <div className="row home_display_card">
            {filteredProducts.map((product) => (
                <Productcard
                    key={product._id}
                    product={product}
                    handleClick={handleClick}
                />
            ))}
        </div>
    );
};

export default ProductFilter;

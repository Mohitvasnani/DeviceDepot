import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsContext } from './Productcontext';
import Productcard from './Productcard';

const ProductFilter = ({ category }) => {
    const { products } = useContext(ProductsContext);
    const navigate = useNavigate();

    const filteredProducts = products.filter(
        product => product.categories === category
    );

    const handleClick = (product) => {
        navigate('/view-product', { state: { productData: product } });
    };

    if (filteredProducts.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-box-seam fs-1 text-muted"></i>
                <p className="text-muted mt-3">No products found in this category.</p>
            </div>
        );
    }

    return (
        <div className="home_display_card text-dark d-flex row row-gap-4">
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
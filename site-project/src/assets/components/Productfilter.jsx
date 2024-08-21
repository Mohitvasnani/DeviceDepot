import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsContext } from './Productcontext';
import Productcard from './Productcard';


const ProductFilter = ({ category }) => {
    const { products } = useContext(ProductsContext);
    const navigate = useNavigate();

    const filteredProducts = products.filter(product => product.categories === category);

    const handleClick = (product) => {
        navigate('/view-product', { state: { productData: product } });
    };

    return (
        <div className="home_display_card text-dark d-flex row row-gap-4">
            {filteredProducts.map((product, index) => (
                <Productcard key={index} product={product} handleClick={handleClick} />
            ))}
        </div>
    );
};

export default ProductFilter;

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
    const [likedProducts, setLikedProducts] = useState({});
    const [products, setProducts] = useState([]);
    const [likedItems, setLikedItems] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchLikedProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/product/allproducts');
            setProducts(response.data);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching products:', error);
        }
    };

    const fetchLikedProducts = async () => {
        const userEmail = localStorage.getItem('email');
        if (!userEmail) {
            console.error('User email not found in local storage.');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/api/product/getlike/${userEmail}`);
            const likes = response.data.reduce((acc, product) => {
                acc[product.productId] = true;
                return acc;
            }, {});
            setLikedProducts(likes);
            setLikedItems(response.data); // Set the liked items state
        } catch (error) {
            setError(error.message);
            console.error('Error fetching liked products:', error);
        }
    };

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
                setLikedProducts(prevState => {
                    const newState = { ...prevState };
                    delete newState[productId];
                    return newState;
                });
                setLikedItems(prevState => prevState.filter(item => item.productId !== productId));
            } else {
                console.error('Failed to remove like');
            }
        } catch (error) {
            console.error('Error removing like:', error);
        }
    };

    const toggleLike = (productId) => {
        setLikedProducts(prevState => ({
            ...prevState,
            [productId]: !prevState[productId],
        }));
    };

    return (
        <ProductsContext.Provider value={{ products, likedProducts, likedItems, removeLike, addToCart, addLike, fetchLikedProducts }}>
            {children}
        </ProductsContext.Provider>
    );
};

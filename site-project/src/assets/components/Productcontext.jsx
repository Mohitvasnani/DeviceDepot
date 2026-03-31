import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ProductsContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const ProductsProvider = ({ children }) => {
    const [likedProducts, setLikedProducts] = useState({});
    const [products, setProducts] = useState([]);
    const [likedItems, setLikedItems] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
        const userEmail = localStorage.getItem('email');
        if (userEmail) fetchLikedProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/product/allproducts`);
            setProducts(response.data);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching products:', error);
        }
    };

    const fetchLikedProducts = async () => {
        const userEmail = localStorage.getItem('email');
        if (!userEmail) return;
        try {
            const response = await axios.get(`${API_URL}/api/product/getlike/${userEmail}`);
            const likes = response.data.reduce((acc, product) => {
                acc[product.productId] = true;
                return acc;
            }, {});
            setLikedProducts(likes);
            setLikedItems(response.data);
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
            const response = await axios.post(`${API_URL}/api/product/addcart`, {
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
            const response = await axios.post(`${API_URL}/api/product/addlike`, {
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
            const response = await axios.delete(`${API_URL}/api/product/removelike`, {
                data: { productId, email: userEmail }
            });
            if (response.data.success) {
                console.log('Product unliked');
                setLikedProducts(prevState => {
                    const newState = { ...prevState };
                    delete newState[productId];
                    return newState;
                });
                setLikedItems(prevState => 
                    prevState.filter(item => item.productId !== productId)
                );
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
        <ProductsContext.Provider value={{ 
            products, 
            likedProducts, 
            likedItems, 
            removeLike, 
            addToCart, 
            addLike, 
            fetchLikedProducts 
        }}>
            {children}
        </ProductsContext.Provider>
    );
};
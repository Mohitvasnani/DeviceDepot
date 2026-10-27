import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const ProductsContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const ProductsProvider = ({ children }) => {
    const [likedProducts, setLikedProducts] = useState({});
    const [products, setProducts] = useState([]);
    const [likedItems, setLikedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
        const userEmail = localStorage.getItem('email');
        if (userEmail) fetchLikedProducts();
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/product/allproducts`);
            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLikedProducts = useCallback(async () => {
        const userEmail = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        if (!userEmail || !token) return;
        try {
            const response = await axios.get(`${API_URL}/api/product/getlike/${userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
    }, []);

    const toggleLike = useCallback((productId) => {
        setLikedProducts(prevState => ({
            ...prevState,
            [productId]: !prevState[productId],
        }));
    }, []);

    const addToCart = useCallback(async (productId) => {
        const userEmail = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        if (!userEmail || !token) {
            console.error('User email not found in local storage.');
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/api/product/addcart`, {
                productId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                console.log('Product added to cart successfully!');
            } else {
                console.error('Failed to add product to cart.');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
        }
    }, []);

    const addLike = useCallback(async (productId) => {
        const userEmail = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        if (!userEmail || !token) {
            console.error('Email not saved');
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/api/product/addlike`, {
                productId
            }, {
                headers: { Authorization: `Bearer ${token}` }
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
    }, [toggleLike]);

    const removeLike = useCallback(async (productId) => {
        const userEmail = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        if (!userEmail || !token) {
            console.error('Email not saved');
            return;
        }
        try {
            const response = await axios.delete(`${API_URL}/api/product/removelike`, {
                data: { productId },
                headers: { Authorization: `Bearer ${token}` }
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
    }, []);


    // A fresh object literal here gives every consumer a new reference on
    // every render, so all 36 product cards re-rendered whenever anything in
    // this provider changed. Memoising it is the single biggest win on this
    // page.
    const value = useMemo(
        () => ({
            products,
            loading,
            error,
            refetchProducts: fetchProducts,
            likedProducts,
            likedItems,
            removeLike,
            addToCart,
            addLike,
            fetchLikedProducts,
        }),
        [products, loading, error, likedProducts, likedItems,
         fetchProducts, removeLike, addToCart, addLike, fetchLikedProducts]
    );

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    );
};

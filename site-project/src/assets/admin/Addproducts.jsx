import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/AddProducts.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

function AddProducts() {
    const [images, setImages] = useState([null, null, null, null]);
    const [loading, setLoading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        rating: '',
        description: '',
        feature1: '',
        feature2: '',
        feature3: '',
        quantity: '',
        instock: true,
        price: '',
        categories: '',
        files: [null, null, null, null]
    });

    const handleImageChange = (e, index) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newImages = [...images];
                newImages[index] = event.target.result;
                setImages(newImages);
            };
            reader.readAsDataURL(e.target.files[0]);

            const newFiles = [...newProduct.files];
            newFiles[index] = e.target.files[0];
            setNewProduct({ ...newProduct, files: newFiles });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        // Validate at least one image uploaded
        const hasImage = newProduct.files.some(file => file !== null);
        if (!hasImage) {
            toast.error('Please upload at least one product image.');
            return;
        }

        const formData = new FormData();
        for (let key in newProduct) {
            if (key === 'files') {
                newProduct.files.forEach(file => {
                    if (file) formData.append('files', file);
                });
            } else {
                formData.append(key, newProduct[key]);
            }
        }

        const token = localStorage.getItem('token');

        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/product/addproduct`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Product added successfully!');
            setNewProduct({
                name: '',
                rating: '',
                description: '',
                feature1: '',
                feature2: '',
                feature3: '',
                quantity: '',
                instock: true,
                price: '',
                categories: '',
                files: [null, null, null, null]
            });
            setImages([null, null, null, null]);
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="card-admin shadow p-4 product-form">
                <h2 className="mb-4 text-center">Add New Product</h2>
                <form onSubmit={handleCreateProduct} className="row g-2">
                    <div className="col-md-5 mb-3">
                        <label htmlFor="productName" className="form-label">Product Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="productName"
                            name="name"
                            value={newProduct.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-5 mb-3">
                        <label htmlFor="rating" className="form-label">Rating</label>
                        <input
                            type="number"
                            className="form-control"
                            id="rating"
                            name="rating"
                            min="1"
                            max="5"
                            value={newProduct.rating}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            id="description"
                            name="description"
                            rows="1"
                            cols={"100"}
                            value={newProduct.description}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="feature1" className="form-label">Feature 1</label>
                        <input
                            type="text"
                            className="form-control"
                            id="feature1"
                            name="feature1"
                            value={newProduct.feature1}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="feature2" className="form-label">Feature 2</label>
                        <input
                            type="text"
                            className="form-control"
                            id="feature2"
                            name="feature2"
                            value={newProduct.feature2}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="feature3" className="form-label">Feature 3</label>
                        <input
                            type="text"
                            className="form-control"
                            id="feature3"
                            name="feature3"
                            value={newProduct.feature3}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="quantity" className="form-label">Quantity</label>
                        <input
                            type="number"
                            className="form-control"
                            id="quantity"
                            name="quantity"
                            min="0"
                            value={newProduct.quantity}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="price" className="form-label">Price</label>
                        <input
                            type="number"
                            className="form-control"
                            id="price"
                            name="price"
                            min="0"
                            value={newProduct.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label htmlFor="categories" className="form-label">Categories</label>
                        <select
                            className="form-control"
                            id="categories"
                            name="categories"
                            value={newProduct.categories}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="mobile">Mobile</option>
                            <option value="laptop">Laptop</option>
                            <option value="accessories">Accessories</option>
                        </select>
                    </div>
                    <div className="col-md-12 mb-3">
                        <label className="form-label">Upload Images</label>
                        <div className="d-flex align-items-center">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="upload-box me-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, index)}
                                        style={{ display: 'none' }}
                                        id={`upload-button-${index}`}
                                    />
                                    <label htmlFor={`upload-button-${index}`} className="form-label upload-label">
                                        {images[index] ? (
                                            <div className="uploaded-image">
                                                <img src={images[index]} alt={`Uploaded ${index + 1}`} className="img-fluid" />
                                            </div>
                                        ) : (
                                            <div className="upload-icon">
                                                <i className="bi bi-image" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                                                <p className="mt-2">Click to upload image {index + 1}</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-12 text-center">
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'Adding Product...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProducts;
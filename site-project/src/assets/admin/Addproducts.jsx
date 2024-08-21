import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/AddProducts.css'; // Import custom CSS for AddProducts

function AddProducts() {
    const [images, setImages] = useState([null, null, null, null]); // State to store 4 image URLs
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
        files: [null, null, null, null] // State to store 4 file objects
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

    const handleCreateProduct = (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (let key in newProduct) {
            if (key === 'files') {
                newProduct.files.forEach(file => {
                    if (file) {
                        formData.append('files', file);
                    }
                });
            } else {
                formData.append(key, newProduct[key]);
            }
        }

        axios.post('http://localhost:8080/api/product/addproduct', formData)
            .then(response => {
                console.log(response.data);
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
                alert('Product added successfully!');
            }).catch(error => {
                console.error('There was an error adding the product!', error);
                alert('Failed to add product.');
            });
    };

    return (
        <div className="container mt-5">
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
                            value={newProduct.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label htmlFor="categories" className="form-label">Categories</label>
                        <input
                            type="text"
                            className="form-control"
                            id="categories"
                            name="categories"
                            value={newProduct.categories}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="col-md-12 mb-3">
                        <label htmlFor="upload-button" className="form-label">Upload Images</label>
                        <div className="d-flex align-items-center">
                            {/* Four multiple file upload boxes */}
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
                        <button type="submit" className="btn btn-primary btn-lg">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProducts;

import axios from 'axios';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/CreateBanner.css'; 

function CreateBanner() {
    const [image, setImage] = useState(null);
    const [newBanner, setNewBanner] = useState({
        name: '',
        description: '',
        file: null
    });

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
            setNewBanner({ ...newBanner, file: e.target.files[0] });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBanner({ ...newBanner, [name]: value });
    };

    const handleCreateBanner = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newBanner.name);
        formData.append('description', newBanner.description);
        formData.append('file', newBanner.file);

        axios.post('http://localhost:8080/api/banner/upload', formData)
            .then(response => {
                console.log(response.data);
                setNewBanner({
                    name: '',
                    description: '',
                    file: null,
                });
                setImage(null);
                alert('Banner created successfully!');
            }).catch(error => {
                console.error('There was an error creating the banner!', error);
                alert('Failed to create banner.');
            });
    };

    return (
        <div className="container mt-5">
            <div className="card-admin shadow p-4 banner-form">
                <h2 className="mb-4 text-center">Create New Banner</h2>
                <form onSubmit={handleCreateBanner} className="row g-3">
                    <div className="col-md-12 mb-3">
                        <label htmlFor="bannerName" className="form-label">Banner Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="bannerName"
                            name="name"
                            value={newBanner.name}
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
                            rows="3"
                            value={newBanner.description}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>
                    <div className="col-md-12 text-center mb-3">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="upload-button"
                        />
                        <label htmlFor="upload-button" className="form-label upload-box">
                            {image ? (
                                <img src={image} alt="Uploaded" className="uploaded-image" />
                            ) : (
                                <div className="upload-icon">
                                    <i className="bi bi-image" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                                    <p className="mt-2">Click to upload image</p>
                                </div>
                            )}
                        </label>
                    </div>
                    <div className="col-md-12 text-center">
                        <button type="submit" className="btn btn-primary btn-lg">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateBanner;

import React, { useContext, useEffect } from 'react';
import { ProductsContext } from '../components/Productcontext';
import '../css//ViewLikedItems.css'



const ViewLikedItems = () => {
    const { likedItems, removeLike } = useContext(ProductsContext);

    useEffect(() => {
        
    }, []);

    return (
        <div className="container container-liked mt-5">
            <h2 className="mb-4">Liked Items</h2>
            <div className="row">
                {likedItems.map((item) => (
                    <div key={item._id} className="col-lg-3 col-md-6 col-sm-12 mb-4">
                        <div className="card h-100 border-0 shadow-sm">
                            <div className="position-relative">
                                <img
                                    src={item.file}
                                    className="card-img-top"
                                    alt="Product"
                                    style={{ height: '300px', objectFit: 'contain' }}
                                />
                                <div className="position-absolute top-0 end-0 p-2">
                                    <i
                                        className="bi bi-heart-fill text-danger fs-4"
                                        onClick={() => removeLike(item.productId)}
                                    ></i>
                                </div>
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{item.name}</h5>
                                <p className="card-text text-muted">{item.description}</p>
                                <div className="mt-auto d-flex justify-content-between align-items-center">
                                    <h4 className="text-danger mb-0">₹{item.price}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewLikedItems;

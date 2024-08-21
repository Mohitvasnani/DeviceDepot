import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/table.css';
import { Link } from 'react-router-dom';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/product/allproducts');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('Error fetching products');
    }
  };

  const handleDeleteProduct = (productId) => {
    axios.delete(`http://localhost:8080/api/product/dltproduct/${productId}`)
      .then(response => {
        console.log(response.data);
        toast.success('Product deleted successfully');
        fetchProducts(); // Fetch updated products list
      })
      .catch(error => {
        console.error('There was an error deleting the product!', error);
        toast.error('Error deleting product');
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.categories.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="table-wrapper">
      <ToastContainer />
      <h2 className="mb-4">Manage Products</h2>
      <div className="d-flex justify-content-between mb-3">
        <Link to="/admin/addproduct" className="btn btn-success">
          Add New Product
        </Link>
        <input 
          type="text" 
          className="form-control w-50" 
          placeholder="Search Products..." 
          value={searchQuery} 
          onChange={handleSearchChange} 
        />
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Image</th>
            <th scope="col">Name</th>
            <th scope="col">Rating</th>
            <th scope="col">Description</th>
            <th scope="col">Quantity</th>
            <th scope="col">Price</th>
            <th scope="col">Categories</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product._id}>
              <td data-label="Image">
                <img src={product.files[0]} alt="" height={50} width={50} />
              </td>
              <td data-label="Name">{product.name}</td>
              <td data-label="Rating">{product.rating}</td>
              <td data-label="Description">{product.description}</td>
              <td data-label="Quantity">{product.quantity}</td>
              <td data-label="Price">{product.price}</td>
              <td data-label="Categories">{product.categories}</td>
              <td data-label="Actions">
                <button className="btn btn-sm btn-danger btn-rounded" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageProducts;






import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/table.css';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/product/allproducts`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    // Prevent double clicks
    if (deleteId === productId) return;

    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      setDeleteId(productId);
      await axios.delete(`${API_URL}/api/product/dltproduct/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      // Remove from state directly — no need to refetch entire list
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    } finally {
      setDeleteId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.categories.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted">
            {searchQuery ? 'No products match your search.' : 'No products found. Add your first product!'}
          </p>
          <Link to="/admin/addproduct" className="btn btn-primary">
            Add Product
          </Link>
        </div>
      ) : (
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
                  <img
                    src={`${API_URL}/${product.files[0]}`}
                    alt={product.name}
                    height={50}
                    width={50}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=No+Image' }}
                  />
                </td>
                <td data-label="Name">{product.name}</td>
                <td data-label="Rating">⭐ {product.rating}</td>
                <td data-label="Description">
                  {product.description.length > 50
                    ? `${product.description.substring(0, 50)}...`
                    : product.description}
                </td>
                <td data-label="Quantity">
                  <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {product.quantity > 0 ? product.quantity : 'Out of Stock'}
                  </span>
                </td>
                <td data-label="Price">£{product.price}</td>
                <td data-label="Categories">
                  <span className="badge bg-secondary">{product.categories}</span>
                </td>
                <td data-label="Actions">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteProduct(product._id)}
                    disabled={deleteId === product._id}
                  >
                    {deleteId === product._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageProducts;
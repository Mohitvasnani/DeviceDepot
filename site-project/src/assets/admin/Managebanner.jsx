import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function ManageBanners() {
  const [banners, setBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/banner/getbanner`);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!bannerId) return;

    const confirmed = window.confirm('Are you sure you want to delete this banner?');
    if (!confirmed) return;

    try {
      setDeleteId(bannerId);
      await axios.delete(`${API_URL}/api/banner/delete/${bannerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Banner deleted successfully');
      setBanners(prev => prev.filter(b => b._id !== bannerId));
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error deleting banner');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.description.toLowerCase().includes(searchQuery.toLowerCase())
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
      <h2 className="mb-4">Manage Banners</h2>
      <div className="d-flex justify-content-between mb-3">
        <Link to="/admin/addbanner" className="btn btn-success">
          Add New Banner
        </Link>
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search Banners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredBanners.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted">
            {searchQuery ? 'No banners match your search.' : 'No banners yet.'}
          </p>
          <Link to="/admin/addbanner" className="btn btn-primary">
            Add Banner
          </Link>
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Image</th>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.map(banner => (
              <tr key={banner._id}>
                <td data-label="Image">
                  <img
                    src={banner.file}
                    alt={banner.name}
                    height={50}
                    width={50}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=No+Image' }}
                  />
                </td>
                <td data-label="Name">{banner.name}</td>
                <td data-label="Description">{banner.description}</td>
                <td data-label="Actions">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteBanner(banner._id)}
                    disabled={deleteId === banner._id}
                  >
                    {deleteId === banner._id ? 'Deleting...' : 'Delete'}
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

export default ManageBanners;
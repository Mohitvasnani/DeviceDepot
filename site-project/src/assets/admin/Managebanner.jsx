import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

function ManageBanners() {
  const [banners, setBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBanners();
    handleDeleteBanner()
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/banner/getbanner');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setMessage('Error fetching banners');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/banner/delete/${bannerId}`);
      console.log(response.data);
      toast.success('Banner deleted successfully');
      fetchBanners(); // Fetch updated banners list
    } catch (error) {
      console.error('There was an error deleting the banner!', error);
      toast.error('Error deleting banner');
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBanners = banners.filter(banner => 
    banner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.description.toLowerCase().includes(searchQuery.toLowerCase())
    // Add more fields to search if necessary
  );

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
          onChange={handleSearchChange} 
        />
      </div>
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
                <img src={banner.file} alt={banner.name} height={50} width={50} />
              </td>
              <td data-label="Name">{banner.name}</td>
              <td data-label="Description">{banner.description}</td>
              <td data-label="Actions">
                <button className="btn btn-sm btn-danger btn-rounded" onClick={() => handleDeleteBanner(banner._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageBanners;

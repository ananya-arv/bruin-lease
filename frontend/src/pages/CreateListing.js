import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import '../styles/CreateListingPage.css';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    zipCode: '',
    country: 'USA',
    price: '',
    bedrooms: '0',
    distanceFromUCLA: '',
    leaseDuration: '1 year',
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const UCLA_LAT = 34.0689;
  const UCLA_LNG = -118.4452;

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateDistanceFromAddress = async (address) => {
    if (!address.trim()) return;

    setCalculatingDistance(true);
    showInfo('Calculating distance from UCLA...');
    
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'UCLA-Housing-App/1.0 (contact@example.com)'
          }
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const distance = calculateDistance(
          UCLA_LAT,
          UCLA_LNG,
          parseFloat(lat),
          parseFloat(lon)
        );

        setFormData(prev => ({
          ...prev,
          distanceFromUCLA: distance.toFixed(1)
        }));
        
        showSuccess(`Distance calculated: ${distance.toFixed(1)} miles from UCLA`);
      } else {
        showError('Could not calculate distance. Please enter manually.');
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
      showError('Failed to calculate distance. Please enter manually.');
    } finally {
      setCalculatingDistance(false);
    }
  };

  const handleAddressChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: value
    }));
  };

  const handleAddressBlur = () => {
    if (formData.address.trim()) {
      calculateDistanceFromAddress(formData.address);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: [...formData.images, ...files.map(f => f.name)]
    });
    showSuccess(`${files.length} image(s) added`);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      showError('Description is required');
      return false;
    }
    if (!formData.address.trim()) {
      showError('Address is required');
      return false;
    }
    if (!formData.zipCode.trim()) {
      showError('Zip code is required');
      return false;
    }
    if (!formData.country.trim()) {
      showError('Country is required');
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      showError('Valid price is required');
      return false;
    }
    if (!formData.distanceFromUCLA || Number(formData.distanceFromUCLA) < 0) {
      showError('Distance from UCLA is required');
      return false;
    }
    if (!formData.leaseDuration) {
      showError('Lease duration is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const listingData = {
      title: formData.title,
      description: formData.description,
      address: formData.address,
      zipCode: formData.zipCode,
      country: formData.country,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      distanceFromUCLA: Number(formData.distanceFromUCLA),
      leaseDuration: formData.leaseDuration,
      images: formData.images
    };

    try {
      setLoading(true);
      showInfo('Creating your listing...');
      
      await listingAPI.createListing(listingData);
      
      showSuccess('Listing created successfully!');
      setTimeout(() => {
        navigate('/listings');
      }, 1500);
    } catch (err) {
      console.error('Error creating listing:', err);
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       'Failed to create listing';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some(val => val && val.length > 0)) {
      if (window.confirm('Are you sure? Your changes will be lost.')) {
        navigate('/listings');
      }
    } else {
      navigate('/listings');
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-listing-page">
        <div className="create-listing-header">
          <h1>Create New Listing</h1>
          <p>List your housing near UCLA</p>
        </div>

        <form className="create-listing-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Spacious 2BR Apartment near UCLA"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                placeholder="Describe your listing, nearby amenities, transportation, etc."
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                placeholder="e.g., 123 Westwood Blvd, Los Angeles, CA 90024"
                value={formData.address}
                onChange={handleAddressChange}
                onBlur={handleAddressBlur}
                required
              />
              {calculatingDistance && (
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Calculating distance from UCLA...
                </small>
              )}
              
              <label style={{ marginTop: '1rem' }}>Zip Code *</label>
              <input
                type="text"
                name="zipCode"
                placeholder="90024"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
                maxLength="5"
                pattern="[0-9]{5}"
              />

              <label style={{ marginTop: '1rem' }}>Country *</label>
              <input
                type="text"
                name="country"
                placeholder="USA"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Property Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Monthly Rent ($) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="2500"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bedrooms *</label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                >
                  <option value="0">Studio</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div className="form-group">
                <label>Distance from UCLA (mi) *</label>
                <input
                  type="number"
                  name="distanceFromUCLA"
                  placeholder="Auto-calculated or enter manually"
                  value={formData.distanceFromUCLA}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Distance is auto-calculated when you enter an address
                </small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Lease Information</h2>
            
            <div className="form-group">
              <label>Lease Duration *</label>
              <select
                name="leaseDuration"
                value={formData.leaseDuration}
                onChange={handleInputChange}
                required
              >
                <option value="1 month">1 Month</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
                <option value="1 year">1 Year</option>
                <option value="2 years">2 Years</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Images</h2>
            <div className="form-group">
              <label>Upload Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              {formData.images.length > 0 && (
                <div className="uploaded-images">
                  <p>{formData.images.length} image(s) selected</p>
                  <ul>
                    {formData.images.map((img, idx) => (
                      <li key={idx}>{img}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || calculatingDistance}
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateListingPage;
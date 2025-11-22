import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../services/api';
import '../styles/CreateListingPage.css';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    distanceFromUCLA: '',
    availableFrom: '',
    leaseTerm: '',
    amenities: [],
    images: [],
    contactEmail: '',
    contactPhone: ''
  });

  const amenitiesList = [
    'WiFi',
    'Parking',
    'Laundry',
    'Air Conditioning',
    'Heater',
    'Dishwasher',
    'Pet Friendly',
    'Furnished',
    'Gym',
    'Pool',
    'Security',
    'Utilities Included'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAmenityToggle = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity]
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: [...formData.images, ...files.map(f => f.name)]
    });
  };

  const validateForm = () => {
    if (!formData.title || !formData.address || !formData.price) {
      setError('Please fill in all required fields (Title, Address, Price)');
      return false;
    }
    if (formData.price < 0 || formData.bedrooms < 0 || formData.bathrooms < 0) {
      setError('Numeric values cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await listingAPI.createListing(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/listings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/listings');
  };

  if (success) {
    return (
      <div className="create-listing-page">
        <div className="success-message">
          <h2>✓ Listing Created Successfully!</h2>
          <p>Redirecting to listings page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-listing-page">
      <div className="create-listing-header">
        <h1>Create New Listing</h1>
        <p>List your housing near UCLA</p>
      </div>

      <form className="create-listing-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

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
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe your listing, nearby amenities, transportation, etc."
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              placeholder="e.g., 123 Westwood Blvd, Los Angeles, CA 90024"
              value={formData.address}
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
              <label>Bedrooms</label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="0">Studio</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="form-group">
              <label>Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                placeholder="1"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Square Feet</label>
              <input
                type="number"
                name="squareFeet"
                placeholder="800"
                value={formData.squareFeet}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Distance from UCLA (mi)</label>
              <input
                type="number"
                name="distanceFromUCLA"
                placeholder="1.5"
                value={formData.distanceFromUCLA}
                onChange={handleInputChange}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Lease Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Available From</label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Lease Term</label>
              <select
                name="leaseTerm"
                value={formData.leaseTerm}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="month-to-month">Month to Month</option>
                <option value="3-months">3 Months</option>
                <option value="6-months">6 Months</option>
                <option value="1-year">1 Year</option>
                <option value="2-years">2 Years</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
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

        <div className="form-section">
          <h2>Contact Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                placeholder="your-email@example.com"
                value={formData.contactEmail}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                placeholder="(123) 456-7890"
                value={formData.contactPhone}
                onChange={handleInputChange}
              />
            </div>
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
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage;
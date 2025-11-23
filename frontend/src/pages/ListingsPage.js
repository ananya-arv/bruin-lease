import React, { useState, useEffect } from 'react';
import { listingAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';
import '../styles/ListingsPage.css';

const ListingsPage = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    maxDistance: '',
    minRating: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getAllListings();
      setListings(response.data.data);
    } catch (err) {
      showError('Failed to load listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice = 
      (!filters.minPrice || listing.price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || listing.price <= Number(filters.maxPrice));

    const matchesBedrooms = 
      !filters.bedrooms || listing.bedrooms === Number(filters.bedrooms);

    const matchesDistance = 
      !filters.maxDistance || listing.distanceFromUCLA <= Number(filters.maxDistance);

    const matchesRating = 
      !filters.minRating || 
      (listing.averageRating >= Number(filters.minRating) && listing.reviewCount > 0);

    return matchesSearch && matchesPrice && matchesBedrooms && matchesDistance && matchesRating;
  });

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      maxDistance: '',
      minRating: ''
    });
    setSearchTerm('');
    showSuccess('Filters cleared');
  };

  const applyFilters = () => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => value !== '').length;
    const hasSearch = searchTerm.trim() !== '';
    
    if (activeFilters > 0 || hasSearch) {
      showInfo(`Showing ${filteredListings.length} filtered listing(s)`);
    } else {
      showInfo(`Showing all ${listings.length} listing(s)`);
    }
  };

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filters, searchTerm, listings.length]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="listings-page">
          <div className="loading">Loading listings...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="listings-page">
        <div className="listings-header">
          <h1>Available Listings</h1>
          <p>Find your perfect housing near UCLA</p>
        </div>

        <div className="search-filter-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title, address, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                name="minPrice"
                placeholder="$0"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                name="maxPrice"
                placeholder="$5000"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Bedrooms</label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="0">Studio</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Max Distance (mi)</label>
              <input
                type="number"
                name="maxDistance"
                placeholder="5"
                step="0.1"
                value={filters.maxDistance}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Min Rating ⭐</label>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div className="listings-results">
          <p className="results-count">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
          </p>

          {filteredListings.length === 0 ? (
            <div className="no-listings">
              <p>No listings match your criteria</p>
              <button onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="listings-grid">
              {filteredListings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ListingsPage;
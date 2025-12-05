 /*
 * Bookmark Hook
 * 
 * Custom React hook for managing user bookmarks/favorites for housing listings.
 * Provides functionality to add, remove, and check bookmark status of listings.
 * Persists bookmarks to localStorage for client-side storage across sessions.
 * 
 * Features:
 * - Add/remove bookmarks with toggle functionality
 * - Check if a listing is currently bookmarked
 * - Persist bookmarks across browser sessions
 * - Load bookmarks on component mount
 * - Remove individual bookmarks
*/

import { useState, useEffect } from 'react';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  // Load bookmarks from localStorage

  const loadBookmarks = async () => {
    try {
      const storedBookmarks = localStorage.getItem('user-bookmarks');
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      console.log('No bookmarks found:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if a listing is currently bookmarked

  const isBookmarked = (listingId) => {
    return bookmarks.some(b => b.id === listingId);
  };

  // Toggle bookmark status for a listing

  const toggleBookmark = async (listing) => {
    const listingId = listing._id || listing.id;
    const isCurrentlyBookmarked = isBookmarked(listingId);
    let updatedBookmarks;

    if (isCurrentlyBookmarked) {
      // Remove bookmark if it exists
      updatedBookmarks = bookmarks.filter(b => b.id !== listingId);
    } else {
      // Add new bookmark with timestamp
      const bookmarkData = {
        id: listingId,
        title: listing.title,
        price: listing.price,
        address: listing.address,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        distanceFromUCLA: listing.distanceFromUCLA,
        images: listing.images,
        description: listing.description,
        savedAt: new Date().toISOString()
      };
      updatedBookmarks = [...bookmarks, bookmarkData];
    }

    setBookmarks(updatedBookmarks);
    
    try {
      localStorage.setItem('user-bookmarks', JSON.stringify(updatedBookmarks));
      return !isCurrentlyBookmarked;
    } catch (error) {
      console.error('Error saving bookmark:', error);
      setBookmarks(bookmarks);
      return isCurrentlyBookmarked;
    }
  };

  // Remove specific bookmark by listing ID
  const removeBookmark = async (listingId) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== listingId);
    setBookmarks(updatedBookmarks);
    
    try {
      localStorage.setItem('user-bookmarks', JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return {
    bookmarks,
    loading,
    isBookmarked,
    toggleBookmark,
    removeBookmark
  };
};
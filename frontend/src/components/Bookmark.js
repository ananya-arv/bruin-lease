import { useState, useEffect } from 'react';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

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

  const isBookmarked = (listingId) => {
    return bookmarks.some(b => b.id === listingId);
  };

  const toggleBookmark = async (listing) => {
    const listingId = listing._id || listing.id;
    const isCurrentlyBookmarked = isBookmarked(listingId);
    let updatedBookmarks;

    if (isCurrentlyBookmarked) {
      updatedBookmarks = bookmarks.filter(b => b.id !== listingId);
    } else {
      const bookmarkData = {
        id: listingId,
        title: listing.title,
        price: listing.price,
        address: listing.address,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        distanceFromUCLA: listing.distanceFromUCLA,
        images: listing.images,
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
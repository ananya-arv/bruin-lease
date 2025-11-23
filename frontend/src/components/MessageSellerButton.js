import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import '../styles/MessageSellerButton.css';

const MessageSellerButton = ({ listing }) => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const isOwner = user && listing.owner && 
    (listing.owner._id === user.id || listing.owner === user.id);

  const handleMessageClick = () => {
    if (isGuest) {
      alert('Please sign in to message the listing owner');
      navigate('/');
      return;
    }

    if (isOwner) {
      alert('You cannot message yourself');
      return;
    }

    setShowModal(true);
    setMessage(`Hi! I'm interested in your listing: ${listing.title}`);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await messageAPI.sendMessage({
        receiverId: listing.owner._id || listing.owner,
        content: message.trim(),
        listingId: listing._id
      });

      alert('Message sent successfully!');
      setShowModal(false);
      setMessage('');
      
      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (isOwner) {
    return null; // Don't show button for own listings
  }

  return (
    <>
      <button className="message-seller-btn" onClick={handleMessageClick}>
        💬 Message Owner
      </button>

      {showModal && (
        <div className="message-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="message-modal-header">
              <h3>Message Listing Owner</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="message-modal-body">
              <div className="listing-preview">
                <strong>{listing.title}</strong>
                <p>{listing.address}</p>
                <p className="listing-price">${listing.price}/month</p>
              </div>

              <div className="message-form">
                <label>Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows="6"
                  disabled={sending}
                />
                <p className="char-count">
                  {message.length}/1000 characters
                </p>
              </div>
            </div>

            <div className="message-modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowModal(false)}
                disabled={sending}
              >
                Cancel
              </button>
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageSellerButton;
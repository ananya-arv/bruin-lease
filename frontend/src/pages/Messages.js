import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { messageAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversation(selectedConversation.partner._id);
      markConversationAsRead(selectedConversation.partner._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getAllConversations();
      setConversations(response.data.data);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      showError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (userId) => {
    try {
      const response = await messageAPI.getConversation(userId);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      showError('Failed to load messages');
    }
  };

  const markConversationAsRead = async (userId) => {
    try {
      const response = await messageAPI.markAsRead(userId);
      if (response.data.data.modifiedCount > 0) {
        showSuccess(`${response.data.data.modifiedCount} message(s) marked as read`);
      }
      
      setConversations(convs =>
        convs.map(conv =>
          conv.partner._id === userId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      // Silent fail for marking as read
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await messageAPI.sendMessage({
        receiverId: selectedConversation.partner._id,
        content: newMessage.trim(),
        listingId: selectedConversation.lastMessage?.listing?._id
      });

      setMessages([...messages, response.data.data]);
      setNewMessage('');
      
      showSuccess('Message sent successfully!');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      showError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="messages-page">
          <div className="loading">Loading messages...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="messages-page">
        <div className="messages-container">
          {/* Conversations List */}
          <div className="conversations-sidebar">
            <div className="conversations-header">
              <h2>Messages</h2>
              <span className="total-conversations">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No messages yet</p>
                  <span>Start by messaging someone about a listing</span>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.partner._id}
                    className={`conversation-item ${
                      selectedConversation?.partner._id === conv.partner._id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedConversation(conv);
                    }}
                  >
                    <div className="conversation-avatar">
                      {conv.partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header-row">
                        <span className="conversation-name">{conv.partner.name}</span>
                        <span className="conversation-time">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        <span className={conv.unreadCount > 0 ? 'unread' : ''}>
                          {conv.lastMessage.content.substring(0, 50)}
                          {conv.lastMessage.content.length > 50 ? '...' : ''}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-user-info">
                    <div className="chat-avatar">
                      {selectedConversation.partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{selectedConversation.partner.name}</h3>
                      <p className="chat-email">{selectedConversation.partner.email}</p>
                    </div>
                  </div>
                  {selectedConversation.lastMessage?.listing && (
                    <div className="listing-reference">
                      <span>📍 About: {selectedConversation.lastMessage.listing.title}</span>
                    </div>
                  )}
                </div>

                <div className="messages-list">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`message ${
                          message.sender._id === user.id ? 'sent' : 'received'
                        }`}
                      >
                        <div className="message-bubble">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {formatTime(message.createdAt)}
                            {message.sender._id === user.id && message.read && ' • Read'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation-selected">
                <div className="empty-state">
                  <h3>💬 Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
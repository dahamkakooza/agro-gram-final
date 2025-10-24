import React, { useState, useEffect } from 'react';
import { messagingAPI } from '@agro-gram/api';
import { Card, Button, LoadingSpinner, Input, TextArea, Alert } from '@agro-gram/ui';
import { useNavigate } from 'react-router-dom';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await messagingAPI.getConversations();
      if (result.success) {
        setConversations(result.data.conversations || result.data || []);
      } else {
        setError(result.message || 'Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true);
    setError('');
    try {
      const result = await messagingAPI.getMessages(conversationId);
      if (result.success) {
        setMessages(result.data.messages || result.data || []);
        
        // Mark this conversation as selected
        const conversation = conversations.find(conv => conv.id === conversationId);
        setSelectedConversation(conversation);
      } else {
        setError(result.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) {
      setError('Please enter a message');
      return;
    }

    setSendingMessage(true);
    setError('');

    try {
      const result = await messagingAPI.sendReply(selectedConversation.id, {
        message: newMessage
      });

      if (result.success) {
        setNewMessage('');
        // Refresh messages to show the new one
        fetchMessages(selectedConversation.id);
        // Refresh conversations to update last message
        fetchConversations();
        setSuccess('Message sent!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleViewProduct = (productId) => {
    console.log('View Product clicked with ID:', productId);
    
    if (productId && productId !== 'undefined' && productId !== 'null') {
      // Ensure we're navigating to the correct product page
      const productUrl = `/marketplace/product/${productId}`;
      console.log('Navigating to:', productUrl);
      navigate(productUrl);
    } else {
      console.error('Invalid product ID:', productId);
      setError('Product information is not available. The product may have been removed.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays > 1) {
      return date.toLocaleDateString();
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="messages-loading">
        <LoadingSpinner size="large" />
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>Messages</h1>
        <Button variant="outline" onClick={fetchConversations}>
          Refresh
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <div className="messages-container">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <h3>Conversations</h3>
          {conversations.length === 0 ? (
            <Card className="no-conversations">
              <div className="no-conversations-content">
                <h4>No conversations yet</h4>
                <p>When buyers contact you about your products, conversations will appear here.</p>
              </div>
            </Card>
          ) : (
            <div className="conversations-list">
              {conversations.map(conversation => (
                <Card 
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => fetchMessages(conversation.id)}
                >
                  <div className="conversation-header">
                    <div className="conversation-product">
                      <strong>{conversation.product_details?.title || 'Product'}</strong>
                      {conversation.product_details?.id && (
                        <small>ID: {conversation.product_details.id}</small>
                      )}
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge">{conversation.unread_count}</span>
                    )}
                  </div>
                  
                  <div className="conversation-parties">
                    <span className="buyer">Buyer: {conversation.buyer_name || conversation.buyer_email}</span>
                    <span className="seller">Seller: {conversation.seller_name || conversation.seller_email}</span>
                  </div>

                  {conversation.last_message && (
                    <div className="last-message">
                      <p>{conversation.last_message.content}</p>
                      <span className="message-time">
                        {formatDate(conversation.last_message.created_at)}
                      </span>
                    </div>
                  )}

                  <div className="conversation-status">
                    <span className={`status status-${conversation.status?.toLowerCase()}`}>
                      {conversation.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {!selectedConversation ? (
            <Card className="no-conversation-selected">
              <div className="select-conversation-prompt">
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to view and send messages.</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Conversation Header */}
              <Card className="conversation-header-card">
                <div className="conversation-info">
                  <h3>{selectedConversation.product_details?.title || 'Product'}</h3>
                  <div className="conversation-meta">
                    <span>Buyer: {selectedConversation.buyer_name || selectedConversation.buyer_email}</span>
                    <span>Seller: {selectedConversation.seller_name || selectedConversation.seller_email}</span>
                    <span className={`conversation-status status-${selectedConversation.status?.toLowerCase()}`}>
                      {selectedConversation.status}
                    </span>
                    {selectedConversation.product_details?.id && (
                      <span className="product-id">Product ID: {selectedConversation.product_details.id}</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleViewProduct(selectedConversation.product_details?.id)}
                  disabled={!selectedConversation.product_details?.id}
                >
                  {selectedConversation.product_details?.id ? 'View Product' : 'Product Unavailable'}
                </Button>
              </Card>

              {/* Messages List */}
              <Card className="messages-list-card">
                {messagesLoading ? (
                  <div className="messages-loading">
                    <LoadingSpinner size="medium" />
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`message ${message.sender_email === selectedConversation.seller_email ? 'sent' : 'received'}`}
                      >
                        <div className="message-header">
                          <span className="sender-name">
                            {message.sender_name || message.sender_email}
                          </span>
                          <span className="message-time">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                        <div className="message-content">
                          <p>{message.content}</p>
                          {message.message_type !== 'TEXT' && (
                            <span className="message-type">{message.message_type}</span>
                          )}
                          {message.quantity && message.quantity > 1 && (
                            <div className="message-quantity">
                              Quantity: {message.quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Message Input */}
              <Card className="message-input-card">
                <form onSubmit={sendMessage} className="message-form">
                  <div className="message-input-container">
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      disabled={sendingMessage}
                    />
                    <Button 
                      type="submit" 
                      variant="primary"
                      loading={sendingMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
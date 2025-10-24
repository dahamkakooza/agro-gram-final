// src/components/shared/DocumentViewer.jsx
import React, { useState } from 'react';
import './DocumentViewer.css';

const DocumentViewer = ({ 
  document,
  onClose,
  editable = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: 'Current User',
        timestamp: new Date().toLocaleString(),
        page: currentPage
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
      showNotification('success', 'Comment Added', 'Your comment has been added');
    }
  };

  const handleDownload = () => {
    showNotification('info', 'Download', 'Preparing document for download...');
    setTimeout(() => {
      showNotification('success', 'Download Ready', 'Document download started');
      // Simulate download
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      link.click();
    }, 1000);
  };

  const handlePrint = () => {
    showNotification('info', 'Print', 'Opening print dialog...');
    window.print();
  };

  const pageComments = comments.filter(comment => comment.page === currentPage);

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <div className="document-info">
          <h3>{document.name}</h3>
          <span className="document-type">{document.type}</span>
          <span className="document-size">{document.size}</span>
        </div>
        <div className="viewer-controls">
          <button className="control-button" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>
            Zoom Out
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="control-button" onClick={() => setZoom(prev => prev + 0.1)}>
            Zoom In
          </button>
          <button className="control-button" onClick={handleDownload}>
            Download
          </button>
          <button className="control-button" onClick={handlePrint}>
            Print
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="viewer-content">
        <div className="document-pages">
          <div className="page-navigation">
            <button 
              className="nav-button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {document.pages || 1}
            </span>
            <button 
              className="nav-button"
              disabled={currentPage === (document.pages || 1)}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>

          <div className="document-page" style={{ transform: `scale(${zoom})` }}>
            <div className="page-content">
              {/* Mock document content */}
              <div className="page-header">
                <h2>{document.name}</h2>
                <div className="document-meta">
                  <span>Created: {document.createdDate}</span>
                  <span>Author: {document.author}</span>
                </div>
              </div>
              <div className="page-body">
                <p>This is a preview of the document content. In a real application, this would display the actual document pages.</p>
                <p>Current zoom level: {Math.round(zoom * 100)}%</p>
                <p>Page: {currentPage}</p>
                
                {document.content && (
                  <div className="document-text">
                    {document.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="document-sidebar">
          <div className="comments-section">
            <h4>Comments ({pageComments.length})</h4>
            <div className="comments-list">
              {pageComments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.author}</strong>
                    <span className="comment-time">{comment.timestamp}</span>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              ))}
            </div>
            
            {editable && (
              <div className="add-comment">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                />
                <button onClick={handleAddComment}>Add Comment</button>
              </div>
            )}
          </div>

          <div className="document-properties">
            <h4>Properties</h4>
            <div className="property-list">
              <div className="property">
                <span>Type:</span>
                <span>{document.type}</span>
              </div>
              <div className="property">
                <span>Size:</span>
                <span>{document.size}</span>
              </div>
              <div className="property">
                <span>Created:</span>
                <span>{document.createdDate}</span>
              </div>
              <div className="property">
                <span>Modified:</span>
                <span>{document.modifiedDate}</span>
              </div>
              <div className="property">
                <span>Status:</span>
                <span className={`status-${document.status}`}>{document.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
import React, { useState } from 'react';
import './DocumentManager.css';

const DocumentManager = ({ 
  documents = [],
  onGenerateDocument,
  onDocumentUpload,
  onDocumentDelete,
  className = '' 
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.type))];

  const getFileIcon = (fileType) => {
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      csv: '📊',
      image: '🖼️',
      zip: '📦',
      default: '📎'
    };

    if (fileType.includes('pdf')) return iconMap.pdf;
    if (fileType.includes('word') || fileType.includes('doc')) return iconMap.doc;
    if (fileType.includes('excel') || fileType.includes('sheet')) return iconMap.xls;
    if (fileType.includes('image')) return iconMap.image;
    if (fileType.includes('zip')) return iconMap.zip;
    return iconMap.default;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && onDocumentUpload) {
      onDocumentUpload(file);
    }
  };

  return (
    <div className={`document-manager ${className}`}>
      <div className="document-header">
        <h3>Document Manager</h3>
        <div className="document-actions">
          <button 
            className="generate-btn"
            onClick={() => onGenerateDocument && onGenerateDocument()}
          >
            + Generate Document
          </button>
          <label className="upload-btn">
            📤 Upload Document
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="document-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="documents-grid">
        {filteredDocuments.map(document => (
          <div key={document.id} className="document-card">
            <div className="document-icon">
              {getFileIcon(document.type)}
            </div>
            
            <div className="document-info">
              <h4 className="document-name">{document.name}</h4>
              <p className="document-description">{document.description}</p>
              
              <div className="document-meta">
                <span className="document-type">{document.type}</span>
                {document.size && (
                  <span className="document-size">{formatFileSize(document.size)}</span>
                )}
                {document.uploadDate && (
                  <span className="document-date">Uploaded: {document.uploadDate}</span>
                )}
                {document.expiryDate && (
                  <span className="document-expiry">Expires: {document.expiryDate}</span>
                )}
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="document-tags">
                  {document.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="document-actions">
              <button className="action-btn view" title="View Document">
                👁️
              </button>
              <button className="action-btn download" title="Download">
                ⬇️
              </button>
              <button 
                className="action-btn delete" 
                title="Delete"
                onClick={() => onDocumentDelete && onDocumentDelete(document.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="documents-empty">
          <div className="empty-icon">📁</div>
          <h4>No documents found</h4>
          <p>
            {documents.length === 0 
              ? 'Get started by uploading your first document.'
              : 'No documents match your search criteria.'
            }
          </p>
        </div>
      )}

      <div className="document-stats">
        <div className="stat">
          <span className="stat-value">{documents.length}</span>
          <span className="stat-label">Total Documents</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {documents.filter(doc => doc.type === 'certificate').length}
          </span>
          <span className="stat-label">Certificates</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {documents.filter(doc => new Date(doc.expiryDate) > new Date()).length}
          </span>
          <span className="stat-label">Active</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
import React, { useState } from 'react';
import './DocumentViewer.css';

const DocumentViewer = ({ 
  documents = [],
  onDocumentSelect,
  className = '' 
}) => {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleDocumentClick = (doc) => {
    setSelectedDoc(doc);
    onDocumentSelect && onDocumentSelect(doc);
  };

  return (
    <div className={`document-viewer ${className}`}>
      <h3>Documents</h3>
      
      <div className="documents-list">
        {documents.map(doc => (
          <div 
            key={doc.id}
            className={`document-item ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="doc-icon">{doc.type === 'pdf' ? '📄' : '📝'}</div>
            <div className="doc-info">
              <span className="doc-name">{doc.name}</span>
              <span className="doc-date">{doc.date}</span>
            </div>
            <div className="doc-actions">
              <button className="action-btn">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentViewer;
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, SearchInput, FileUpload, Modal } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './LegalDocuments.css';

const LegalDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLegalSpecialistDashboard();
      if (response.success) {
        setDocuments(response.data.legal_documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocuments(filtered);
  };

  const categories = ['all', ...new Set(documents.map(d => d.category))];

  const getDocumentTypeIcon = (type) => {
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      image: '🖼️',
      other: '📎'
    };
    return iconMap[type] || '📎';
  };

  const handleFileUpload = (files) => {
    const newDocuments = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.split('.').pop(),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      category: 'uncategorized',
      uploaded_date: new Date().toISOString().split('T')[0],
      status: 'active'
    }));

    setDocuments(prev => [...newDocuments, ...prev]);
    setShowUploadModal(false);
  };

  return (
    <div className="legal-documents-page">
      <div className="page-header">
        <h1>📂 Legal Documents</h1>
        <Button variant="primary" onClick={() => setShowUploadModal(true)}>
          Upload Document
        </Button>
      </div>

      <div className="documents-controls">
        <div className="search-section">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search documents..."
          />
        </div>
        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="documents-grid">
        <Card className="documents-list">
          <h3>Document Library</h3>
          <div className="documents-count">
            {filteredDocuments.length} documents found
          </div>
          <Table
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'name', label: 'Document Name' },
              { key: 'category', label: 'Category' },
              { key: 'size', label: 'Size' },
              { key: 'uploaded_date', label: 'Uploaded' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={filteredDocuments.map(doc => ({
              ...doc,
              type: <span className="doc-icon">{getDocumentTypeIcon(doc.type)}</span>,
              status: <Badge color={doc.status === 'active' ? 'green' : 'gray'}>{doc.status}</Badge>,
              actions: (
                <div className="action-buttons">
                  <Button size="small">View</Button>
                  <Button size="small" variant="outline">Download</Button>
                </div>
              )
            }))}
          />
        </Card>

        <Card className="recent-documents">
          <h3>Recently Accessed</h3>
          <div className="recent-list">
            {documents.slice(0, 5).map(doc => (
              <div key={doc.id} className="recent-item">
                <div className="doc-icon">{getDocumentTypeIcon(doc.type)}</div>
                <div className="doc-info">
                  <div className="doc-name">{doc.name}</div>
                  <div className="doc-meta">
                    <span>{doc.category}</span>
                    <span>{doc.uploaded_date}</span>
                  </div>
                </div>
                <Button size="small">Open</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="document-stats">
          <h3>Document Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{documents.length}</div>
              <div className="stat-label">Total Documents</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {documents.filter(d => d.category === 'contract').length}
              </div>
              <div className="stat-label">Contracts</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {documents.filter(d => d.category === 'compliance').length}
              </div>
              <div className="stat-label">Compliance Docs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {documents.filter(d => d.category === 'case_file').length}
              </div>
              <div className="stat-label">Case Files</div>
            </div>
          </div>
        </Card>

        <Card className="document-categories">
          <h3>Document Categories</h3>
          <div className="categories-list">
            {categories.filter(cat => cat !== 'all').map(category => (
              <div key={category} className="category-item">
                <div className="category-name">{category}</div>
                <div className="category-count">
                  {documents.filter(d => d.category === category).length} documents
                </div>
                <Button size="small">Browse</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
      >
        <div className="upload-section">
          <FileUpload
            onFilesSelected={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            multiple
          />
          <div className="upload-info">
            <p>Supported formats: PDF, Word, Excel, Images</p>
            <p>Maximum file size: 50MB per file</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LegalDocuments;
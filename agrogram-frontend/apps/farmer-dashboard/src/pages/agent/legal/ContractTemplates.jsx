import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, SearchInput, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './ContractTemplates.css';

const ContractTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getLegalSpecialistDashboard();
      if (response.success) {
        setTemplates(response.data.contract_templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const handleNewTemplate = (templateData) => {
    const newTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      ...templateData,
      usage_count: 0,
      created_date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setShowTemplateForm(false);
  };

  return (
    <div className="contract-templates-page">
      <div className="page-header">
        <h1>📝 Contract Templates</h1>
        <Button variant="primary" onClick={() => setShowTemplateForm(true)}>
          New Template
        </Button>
      </div>

      <div className="templates-controls">
        <div className="search-section">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search templates..."
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

      <div className="templates-grid">
        <Card className="templates-list">
          <h3>Template Library</h3>
          <div className="templates-count">
            {filteredTemplates.length} templates found
          </div>
          <Table
            columns={[
              { key: 'name', label: 'Template Name' },
              { key: 'category', label: 'Category' },
              { key: 'usage_count', label: 'Usage Count' },
              { key: 'last_used', label: 'Last Used' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={filteredTemplates.map(template => ({
              ...template,
              status: <Badge color={template.status === 'active' ? 'green' : 'gray'}>{template.status}</Badge>,
              actions: (
                <div className="action-buttons">
                  <Button 
                    size="small" 
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Use
                  </Button>
                  <Button size="small" variant="outline">
                    Edit
                  </Button>
                </div>
              )
            }))}
          />
        </Card>

        <Card className="popular-templates">
          <h3>Most Used Templates</h3>
          <div className="popular-list">
            {templates
              .sort((a, b) => b.usage_count - a.usage_count)
              .slice(0, 5)
              .map(template => (
                <div key={template.id} className="popular-item">
                  <div className="template-name">{template.name}</div>
                  <div className="template-usage">
                    Used {template.usage_count} times
                  </div>
                  <Button size="small">Use Template</Button>
                </div>
              ))
            }
          </div>
        </Card>

        <Card className="template-categories">
          <h3>Template Categories</h3>
          <div className="categories-grid">
            {categories.filter(cat => cat !== 'all').map(category => (
              <div key={category} className="category-card">
                <div className="category-icon">📄</div>
                <div className="category-name">{category}</div>
                <div className="category-count">
                  {templates.filter(t => t.category === category).length} templates
                </div>
                <Button size="small" variant="outline">Browse</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Button variant="outline" fullWidth>
              📄 Create Custom Contract
            </Button>
            <Button variant="outline" fullWidth>
              🔍 Review Contract
            </Button>
            <Button variant="outline" fullWidth>
              📊 Analyze Contract Terms
            </Button>
            <Button variant="outline" fullWidth>
              💼 Business Partnership Template
            </Button>
            <Button variant="outline" fullWidth>
              🌾 Land Lease Agreement
            </Button>
            <Button variant="outline" fullWidth>
              🚜 Equipment Rental Contract
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={`Use Template: ${selectedTemplate?.name}`}
        size="large"
      >
        {selectedTemplate && (
          <div className="template-usage">
            <div className="template-info">
              <p><strong>Category:</strong> {selectedTemplate.category}</p>
              <p><strong>Usage Count:</strong> {selectedTemplate.usage_count} times</p>
              <p><strong>Description:</strong> {selectedTemplate.description}</p>
            </div>

            <Form
              onSubmit={(data) => {
                console.log('Generated contract:', data);
                // Update usage count
                setTemplates(prev => 
                  prev.map(t => 
                    t.id === selectedTemplate.id 
                      ? { ...t, usage_count: t.usage_count + 1 }
                      : t
                  )
                );
                setSelectedTemplate(null);
              }}
            >
              <Input name="party_one" label="First Party Name" required />
              <Input name="party_two" label="Second Party Name" required />
              <Input name="effective_date" label="Effective Date" type="date" required />
              <Input name="contract_value" label="Contract Value" type="number" />
              <Input name="term_length" label="Contract Term" placeholder="e.g., 12 months" />
              
              <div className="form-actions">
                <Button type="submit" variant="primary">Generate Contract</Button>
                <Button type="button" onClick={() => setSelectedTemplate(null)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showTemplateForm}
        onClose={() => setShowTemplateForm(false)}
        title="Create New Template"
        size="large"
      >
        <Form onSubmit={handleNewTemplate}>
          <Input 
            name="name" 
            label="Template Name" 
            placeholder="Enter template name"
            required 
          />
          <Select 
            name="category" 
            label="Category"
            options={[
              { value: 'land_lease', label: 'Land Lease' },
              { value: 'equipment_rental', label: 'Equipment Rental' },
              { value: 'crop_purchase', label: 'Crop Purchase' },
              { value: 'service_agreement', label: 'Service Agreement' },
              { value: 'partnership', label: 'Partnership' },
              { value: 'employment', label: 'Employment' }
            ]}
            required
          />
          <Input 
            name="description" 
            label="Template Description" 
            type="textarea"
            placeholder="Describe the purpose and use cases for this template"
            required 
          />
          <Input 
            name="template_content" 
            label="Template Content" 
            type="textarea"
            placeholder="Paste the template content here..."
            rows={10}
            required 
          />
          <div className="form-actions">
            <Button type="submit" variant="primary">Create Template</Button>
            <Button type="button" onClick={() => setShowTemplateForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractTemplates;
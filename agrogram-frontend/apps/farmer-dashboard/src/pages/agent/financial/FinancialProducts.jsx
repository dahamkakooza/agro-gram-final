import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './FinancialProducts.css';

const FinancialProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getFinancialAdvisorDashboard();
      if (response.success) {
        setProducts(response.data.financial_products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceRating = (rating) => {
    if (rating >= 4) return { color: 'green', label: 'Excellent' };
    if (rating >= 3) return { color: 'yellow', label: 'Good' };
    if (rating >= 2) return { color: 'orange', label: 'Fair' };
    return { color: 'red', label: 'Poor' };
  };

  const handleNewProduct = (productData) => {
    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      ...productData,
      uptake_rate: 0,
      default_rate: 0,
      performance_rating: 0,
      created_date: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProduct, ...prev]);
    setShowProductForm(false);
  };

  return (
    <div className="financial-products-page">
      <div className="page-header">
        <h1>💳 Financial Products</h1>
        <Button variant="primary" onClick={() => setShowProductForm(true)}>
          New Product
        </Button>
      </div>

      <div className="products-grid">
        <Card className="products-overview">
          <h3>Product Portfolio</h3>
          <div className="overview-stats">
            <div className="stat-item">
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">Total Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {products.filter(p => p.performance_rating >= 4).length}
              </div>
              <div className="stat-label">High Performing</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {products.reduce((sum, product) => sum + product.uptake_rate, 0) / products.length || 0}%
              </div>
              <div className="stat-label">Avg. Uptake Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {products.reduce((sum, product) => sum + product.default_rate, 0) / products.length || 0}%
              </div>
              <div className="stat-label">Avg. Default Rate</div>
            </div>
          </div>
        </Card>

        <Card className="products-list">
          <h3>Product Catalog</h3>
          <Table
            columns={[
              { key: 'name', label: 'Product Name' },
              { key: 'type', label: 'Type' },
              { key: 'uptake_rate', label: 'Uptake Rate' },
              { key: 'default_rate', label: 'Default Rate' },
              { key: 'performance', label: 'Performance' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={products.map(product => {
              const performance = getPerformanceRating(product.performance_rating);
              return {
                ...product,
                uptake_rate: `${product.uptake_rate}%`,
                default_rate: `${product.default_rate}%`,
                performance: <Badge color={performance.color}>{performance.label}</Badge>,
                actions: (
                  <div className="action-buttons">
                    <Button size="small">View</Button>
                    <Button size="small" variant="outline">Edit</Button>
                  </div>
                )
              };
            })}
          />
        </Card>

        <Card className="product-performance">
          <h3>Performance Metrics</h3>
          <div className="performance-metrics">
            {products.map(product => (
              <div key={product.id} className="metric-item">
                <div className="product-name">{product.name}</div>
                <div className="metric-bars">
                  <div className="metric-bar">
                    <div className="metric-label">Uptake</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill uptake"
                        style={{ width: `${product.uptake_rate}%` }}
                      ></div>
                    </div>
                    <div className="metric-value">{product.uptake_rate}%</div>
                  </div>
                  <div className="metric-bar">
                    <div className="metric-label">Default</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill default"
                        style={{ width: `${product.default_rate}%` }}
                      ></div>
                    </div>
                    <div className="metric-value">{product.default_rate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        title="Create New Financial Product"
        size="large"
      >
        <Form onSubmit={handleNewProduct}>
          <Input name="name" label="Product Name" required />
          <Select
            name="type"
            label="Product Type"
            options={[
              { value: 'crop_loan', label: 'Crop Production Loan' },
              { value: 'equipment_loan', label: 'Equipment Financing' },
              { value: 'operating_loan', label: 'Operating Loan' },
              { value: 'term_loan', label: 'Term Loan' },
              { value: 'line_of_credit', label: 'Line of Credit' }
            ]}
            required
          />
          <Input name="interest_rate" label="Interest Rate %" type="number" step="0.1" required />
          <Input name="max_amount" label="Maximum Loan Amount" type="number" required />
          <Input name="term_length" label="Term Length (months)" type="number" required />
          <Input name="eligibility" label="Eligibility Criteria" type="textarea" />
          <div className="form-actions">
            <Button type="submit" variant="primary">Create Product</Button>
            <Button type="button" onClick={() => setShowProductForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FinancialProducts;
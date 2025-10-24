import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './CollateralValuation.css';

const CollateralValuation = () => {
  const [collateralData, setCollateralData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showValuationForm, setShowValuationForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    fetchCollateralData();
  }, []);

  const fetchCollateralData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getFinancialAdvisorDashboard();
      if (response.success) {
        setCollateralData(response.data.collateral_valuations || []);
      }
    } catch (error) {
      console.error('Error fetching collateral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoverageStatus = (coverage) => {
    if (coverage >= 80) return { color: 'green', label: 'Adequate' };
    if (coverage >= 60) return { color: 'yellow', label: 'Moderate' };
    return { color: 'red', label: 'Insufficient' };
  };

  const handleNewValuation = (valuationData) => {
    const newValuation = {
      id: Math.random().toString(36).substr(2, 9),
      ...valuationData,
      valuation_date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setCollateralData(prev => [newValuation, ...prev]);
    setShowValuationForm(false);
  };

  return (
    <div className="collateral-valuation-page">
      <div className="page-header">
        <h1>🏠 Collateral Valuation</h1>
        <Button variant="primary" onClick={() => setShowValuationForm(true)}>
          New Valuation
        </Button>
      </div>

      <div className="valuation-grid">
        <Card className="valuation-summary">
          <h3>Collateral Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">${collateralData.reduce((sum, item) => sum + (item.valuation || 0), 0).toLocaleString()}</div>
              <div className="stat-label">Total Collateral Value</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{collateralData.length}</div>
              <div className="stat-label">Active Assets</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {collateralData.filter(item => getCoverageStatus(item.coverage).color === 'green').length}
              </div>
              <div className="stat-label">Adequate Coverage</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {collateralData.filter(item => getCoverageStatus(item.coverage).color === 'red').length}
              </div>
              <div className="stat-label">Requires Review</div>
            </div>
          </div>
        </Card>

        <Card className="assets-list">
          <h3>Collateral Assets</h3>
          <Table
            columns={[
              { key: 'asset_type', label: 'Asset Type' },
              { key: 'description', label: 'Description' },
              { key: 'valuation', label: 'Current Value' },
              { key: 'coverage', label: 'Loan Coverage' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={collateralData.map(asset => {
              const coverageStatus = getCoverageStatus(asset.coverage);
              return {
                ...asset,
                valuation: `$${asset.valuation?.toLocaleString()}`,
                coverage: `${asset.coverage}%`,
                status: <Badge color={coverageStatus.color}>{coverageStatus.label}</Badge>,
                actions: (
                  <div className="action-buttons">
                    <Button size="small" onClick={() => setSelectedAsset(asset)}>
                      View
                    </Button>
                    <Button size="small" variant="outline">
                      Revalue
                    </Button>
                  </div>
                )
              };
            })}
          />
        </Card>

        <Card className="coverage-analysis">
          <h3>Coverage Analysis</h3>
          <div className="coverage-chart">
            {collateralData.map(asset => (
              <div key={asset.id} className="coverage-item">
                <div className="asset-name">{asset.asset_type}</div>
                <div className="coverage-bar">
                  <div 
                    className="coverage-fill"
                    style={{ width: `${asset.coverage}%` }}
                  ></div>
                </div>
                <div className="coverage-value">{asset.coverage}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showValuationForm}
        onClose={() => setShowValuationForm(false)}
        title="New Collateral Valuation"
      >
        <Form onSubmit={handleNewValuation}>
          <Select
            name="asset_type"
            label="Asset Type"
            options={[
              { value: 'land', label: 'Agricultural Land' },
              { value: 'equipment', label: 'Farm Equipment' },
              { value: 'livestock', label: 'Livestock' },
              { value: 'buildings', label: 'Farm Buildings' },
              { value: 'other', label: 'Other' }
            ]}
            required
          />
          <Input name="description" label="Asset Description" required />
          <Input name="valuation" label="Valuation Amount" type="number" required />
          <Input name="coverage" label="Loan Coverage %" type="number" min="0" max="100" required />
          <div className="form-actions">
            <Button type="submit" variant="primary">Submit Valuation</Button>
            <Button type="button" onClick={() => setShowValuationForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CollateralValuation;
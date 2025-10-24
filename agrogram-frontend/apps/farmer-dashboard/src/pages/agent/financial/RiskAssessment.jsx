import React, { useState, useEffect } from 'react';
import { Card, Button, Table, ProgressBar, Modal } from '@agro-gram/ui';
import { dashboardAPI } from '../../services/services';
import './RiskAssessment.css';

const RiskAssessment = () => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getFinancialAdvisorDashboard();
      if (response.success) {
        setRiskData(response.data);
      }
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'High Risk';
    return 'Very High Risk';
  };

  return (
    <div className="risk-assessment-page">
      <div className="page-header">
        <h1>⚖️ Risk Assessment</h1>
        <Button variant="primary">New Assessment</Button>
      </div>

      <div className="risk-grid">
        <Card className="credit-scoring">
          <h3>Credit Scoring</h3>
          <div className="scoring-list">
            {riskData?.credit_scores?.map(score => (
              <div key={score.farmer_id} className="score-item">
                <div className="farmer-info">
                  <div className="farmer-name">{score.farmer_name}</div>
                  <div className="risk-level">{getRiskLevel(score.score)}</div>
                </div>
                <div className="score-display">
                  <ProgressBar 
                    value={score.score} 
                    max={100}
                    color={getRiskColor(score.score)}
                  />
                  <span className="score-value">{score.score}/100</span>
                </div>
                <Button 
                  size="small"
                  onClick={() => setSelectedAssessment(score)}
                >
                  Details
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="collateral-valuation">
          <h3>Collateral Valuation</h3>
          <Table
            columns={[
              { key: 'asset_type', label: 'Asset Type' },
              { key: 'valuation', label: 'Valuation' },
              { key: 'coverage', label: 'Coverage' },
              { key: 'status', label: 'Status' }
            ]}
            data={riskData?.collateral_valuations?.map(collateral => ({
              ...collateral,
              valuation: `$${collateral.valuation?.toLocaleString()}`,
              coverage: `${collateral.coverage}%`,
              status: (
                <Badge color={collateral.coverage >= 80 ? 'green' : 'yellow'}>
                  {collateral.coverage >= 80 ? 'Adequate' : 'Review'}
                </Badge>
              )
            })) || []}
          />
        </Card>

        <Card className="risk-metrics">
          <h3>Portfolio Risk Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">Default Probability</div>
              <div className="metric-value">2.3%</div>
              <div className="metric-trend positive">↓ 0.5%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Loss Given Default</div>
              <div className="metric-value">45%</div>
              <div className="metric-trend neutral">→</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Concentration Risk</div>
              <div className="metric-value">Medium</div>
              <div className="metric-trend warning">⚠️</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Stress Test Score</div>
              <div className="metric-value">78/100</div>
              <div className="metric-trend positive">↑ 5</div>
            </div>
          </div>
        </Card>

        <Card className="risk-alerts">
          <h3>Risk Alerts</h3>
          <div className="alerts-list">
            <div className="alert-item high">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <div className="alert-title">High Default Risk - Farm A</div>
                <div className="alert-description">
                  Payment delayed for 45 days. Recommend follow-up.
                </div>
              </div>
              <Button size="small">Action</Button>
            </div>
            <div className="alert-item medium">
              <div className="alert-icon">ℹ️</div>
              <div className="alert-content">
                <div className="alert-title">Collateral Value Decline</div>
                <div className="alert-description">
                  Equipment value decreased by 15%. Review coverage.
                </div>
              </div>
              <Button size="small">Review</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Assessment Detail Modal */}
      <Modal
        isOpen={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        title="Risk Assessment Details"
      >
        {selectedAssessment && (
          <div className="assessment-details">
            <div className="detail-section">
              <h4>Farmer Information</h4>
              <p><strong>Name:</strong> {selectedAssessment.farmer_name}</p>
              <p><strong>Credit Score:</strong> {selectedAssessment.score}/100</p>
              <p><strong>Risk Level:</strong> {getRiskLevel(selectedAssessment.score)}</p>
            </div>
            
            <div className="detail-section">
              <h4>Risk Factors</h4>
              <ul>
                <li>Payment History: Excellent</li>
                <li>Debt-to-Income: 35%</li>
                <li>Business Stability: 5 years</li>
                <li>Market Conditions: Stable</li>
              </ul>
            </div>
            
            <div className="recommendations">
              <h4>Recommendations</h4>
              <p>Based on the assessment, this application presents an acceptable level of risk.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RiskAssessment;
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Chart, Badge, Modal } from '@agro-gram/ui';
import { dashboardAPI } from '../../../services/services';
import './CompetitorAnalysis.css';

const CompetitorAnalysis = () => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  useEffect(() => {
    fetchCompetitorData();
  }, []);

  const fetchCompetitorData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMarketAnalystDashboard();
      if (response.success) {
        setCompetitors(response.data.competitor_analysis || []);
      }
    } catch (error) {
      console.error('Error fetching competitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevel = (level) => {
    const threatConfig = {
      high: { color: 'red', label: 'High Threat' },
      medium: { color: 'yellow', label: 'Medium Threat' },
      low: { color: 'green', label: 'Low Threat' }
    };
    return threatConfig[level] || { color: 'gray', label: level };
  };

  return (
    <div className="competitor-analysis-page">
      <div className="page-header">
        <h1>🏢 Competitor Intelligence</h1>
        <Button variant="primary">Update Analysis</Button>
      </div>

      <div className="competitor-grid">
        <Card className="competitor-overview">
          <h3>Competitor Overview</h3>
          <div className="overview-stats">
            <div className="stat-item">
              <div className="stat-value">{competitors.length}</div>
              <div className="stat-label">Active Competitors</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {competitors.filter(c => c.threat_level === 'high').length}
              </div>
              <div className="stat-label">High Threat</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">35%</div>
              <div className="stat-label">Market Share (Top 5)</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">12</div>
              <div className="stat-label">New Entrants (YTD)</div>
            </div>
          </div>
        </Card>

        <Card className="competitor-list">
          <h3>Competitor Analysis</h3>
          <Table
            columns={[
              { key: 'name', label: 'Competitor' },
              { key: 'market_share', label: 'Market Share' },
              { key: 'growth_rate', label: 'Growth Rate' },
              { key: 'strategy', label: 'Strategy' },
              { key: 'threat_level', label: 'Threat Level' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={competitors.map(competitor => ({
              ...competitor,
              market_share: `${competitor.market_share}%`,
              growth_rate: `${competitor.growth_rate}%`,
              threat_level: (
                <Badge color={getThreatLevel(competitor.threat_level).color}>
                  {getThreatLevel(competitor.threat_level).label}
                </Badge>
              ),
              actions: (
                <div className="action-buttons">
                  <Button 
                    size="small" 
                    onClick={() => setSelectedCompetitor(competitor)}
                  >
                    Analyze
                  </Button>
                  <Button size="small" variant="outline">
                    Monitor
                  </Button>
                </div>
              )
            }))}
          />
        </Card>

        <Card className="market-share">
          <h3>Market Share Distribution</h3>
          <div className="share-chart">
            <Chart
              type="doughnut"
              data={{
                labels: competitors.map(c => c.name),
                datasets: [
                  {
                    data: competitors.map(c => c.market_share),
                    backgroundColor: [
                      '#3b82f6',
                      '#10b981',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6',
                      '#06b6d4',
                      '#84cc16'
                    ],
                  }
                ]
              }}
            />
          </div>
        </Card>

        <Card className="competitive-landscape">
          <h3>Competitive Landscape</h3>
          <div className="landscape-matrix">
            <div className="matrix-axis">
              <div className="axis-label">Market Share</div>
              <div className="axis-points">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <div className="matrix-points">
              {competitors.map(competitor => (
                <div
                  key={competitor.id}
                  className={`matrix-point ${competitor.threat_level}`}
                  style={{
                    left: `${competitor.market_share}%`,
                    bottom: `${competitor.growth_rate}%`
                  }}
                  title={competitor.name}
                >
                  <div className="point-label">{competitor.name}</div>
                </div>
              ))}
            </div>
            <div className="matrix-axis vertical">
              <div className="axis-label">Growth Rate</div>
              <div className="axis-points">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="strategy-analysis">
          <h3>Competitor Strategies</h3>
          <div className="strategies-list">
            {competitors.map(competitor => (
              <div key={competitor.id} className="strategy-item">
                <div className="competitor-name">{competitor.name}</div>
                <div className="strategy-type">{competitor.strategy}</div>
                <div className="strategy-details">
                  {competitor.strategy_details}
                </div>
                <div className="recent-moves">
                  <strong>Recent Moves:</strong> {competitor.recent_activities}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="threat-assessment">
          <h3>Threat Assessment</h3>
          <div className="threat-matrix">
            <div className="threat-item high">
              <div className="threat-name">Global Grain Co</div>
              <div className="threat-reason">
                Aggressive pricing and market expansion
              </div>
              <div className="threat-actions">
                <Button size="small">Counter Strategy</Button>
              </div>
            </div>
            <div className="threat-item medium">
              <div className="threat-name">Organic Harvest Inc</div>
              <div className="threat-reason">
                Growing premium market segment
              </div>
              <div className="threat-actions">
                <Button size="small">Monitor</Button>
              </div>
            </div>
            <div className="threat-item low">
              <div className="threat-name">Local Farm Co-op</div>
              <div className="threat-reason">
                Regional focus, limited threat
              </div>
              <div className="threat-actions">
                <Button size="small">Watch</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedCompetitor}
        onClose={() => setSelectedCompetitor(null)}
        title={`Competitor Analysis: ${selectedCompetitor?.name}`}
        size="large"
      >
        {selectedCompetitor && (
          <div className="competitor-details">
            <div className="detail-header">
              <div className="basic-info">
                <p><strong>Market Share:</strong> {selectedCompetitor.market_share}%</p>
                <p><strong>Growth Rate:</strong> {selectedCompetitor.growth_rate}%</p>
                <p><strong>Threat Level:</strong> 
                  <Badge color={getThreatLevel(selectedCompetitor.threat_level).color}>
                    {getThreatLevel(selectedCompetitor.threat_level).label}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="detail-sections">
              <div className="section">
                <h4>Business Strategy</h4>
                <p>{selectedCompetitor.strategy_details}</p>
              </div>

              <div className="section">
                <h4>Recent Activities</h4>
                <ul>
                  {selectedCompetitor.recent_activities?.split(', ').map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>

              <div className="section">
                <h4>Strengths & Weaknesses</h4>
                <div className="swot-grid">
                  <div className="swot-item strengths">
                    <h5>Strengths</h5>
                    <ul>
                      {selectedCompetitor.strengths?.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="swot-item weaknesses">
                    <h5>Weaknesses</h5>
                    <ul>
                      {selectedCompetitor.weaknesses?.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="section">
                <h4>Recommended Actions</h4>
                <div className="recommended-actions">
                  <Button variant="primary">Develop Counter Strategy</Button>
                  <Button variant="outline">Monitor Closely</Button>
                  <Button variant="outline">Market Research</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompetitorAnalysis;
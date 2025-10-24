// src/components/dashboards/consumer/ExportClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Card, Button, LoadingSpinner, DocumentManager, ComplianceTracker } from '@agro-gram/ui';
import { dashboardService, apiService } from '../../services';
import { useDashboardHandlers } from '../../hooks/useDashboardHandlers';
import UserDirectory from '../../common/UserDirectory';
import UserProfileModal from '../../common/UserProfileModal';
import ServiceRequestForm from '../../forms/ServiceRequestForm';
import { fetchMockDashboardData } from '../../data/mockDashboardData';
import './ExportClientDashboard.css';

const ExportClientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try real API first, fallback to mock data
      const response = await fetch('/api/dashboard/consumer/export/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock data for development');
      const mockResponse = await fetchMockDashboardData('EXPORT_CLIENT');
      if (mockResponse.success) {
        // Ensure the mock data has the proper structure for DocumentManager
        const enhancedData = {
          ...mockResponse.data,
          export_documents: mockResponse.data.export_documents?.map(doc => ({
            ...doc,
            name: doc.name || 'Unknown Document',
            type: doc.type || 'document',
            status: doc.status || 'pending',
            required: doc.required !== undefined ? doc.required : true,
            // Add file extension for DocumentManager
            fileName: doc.name ? `${doc.name}.pdf` : 'document.pdf'
          })) || []
        };
        setDashboardData(enhancedData);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      
      // Fallback to mock data on error with enhanced structure
      console.log('Falling back to mock data due to error');
      const mockResponse = await fetchMockDashboardData('EXPORT_CLIENT');
      if (mockResponse.success) {
        const enhancedData = {
          ...mockResponse.data,
          export_documents: mockResponse.data.export_documents?.map(doc => ({
            ...doc,
            name: doc.name || 'Unknown Document',
            type: doc.type || 'document',
            status: doc.status || 'pending',
            required: doc.required !== undefined ? doc.required : true,
            fileName: doc.name ? `${doc.name}.pdf` : 'document.pdf'
          })) || getDefaultExportDocuments()
        };
        setDashboardData(enhancedData);
      } else {
        // Ultimate fallback with complete mock data
        setDashboardData(getCompleteMockData());
      }
    } finally {
      setLoading(false);
    }
  };

  // Default export documents structure
  const getDefaultExportDocuments = () => [
    {
      id: 1,
      name: 'Commercial Invoice',
      type: 'invoice',
      status: 'generated',
      required: true,
      fileName: 'commercial_invoice.pdf'
    },
    {
      id: 2,
      name: 'Packing List',
      type: 'document',
      status: 'generated',
      required: true,
      fileName: 'packing_list.pdf'
    },
    {
      id: 3,
      name: 'Bill of Lading',
      type: 'shipping',
      status: 'pending',
      required: true,
      fileName: 'bill_of_lading.pdf'
    },
    {
      id: 4,
      name: 'Certificate of Origin',
      type: 'certificate',
      status: 'not_started',
      required: false,
      fileName: 'certificate_of_origin.pdf'
    }
  ];

  // Complete mock data as ultimate fallback
  const getCompleteMockData = () => ({
    shipment_stats: {
      in_transit: 3,
      customs_clearance: 2,
      delivered: 12,
      issues: 1
    },
    active_shipments: [
      {
        id: 'EXP-2024-001',
        origin: 'Nairobi, KE',
        destination: 'Rotterdam, NL',
        status: 'in_transit',
        progress: 65,
        eta: '2024-01-25',
        contents: 'Organic Coffee (500kg)'
      },
      {
        id: 'EXP-2024-002',
        origin: 'Mombasa, KE',
        destination: 'Dubai, UAE',
        status: 'customs_clearance',
        progress: 85,
        eta: '2024-01-20',
        contents: 'Fresh Avocados (1000kg)'
      }
    ],
    customs_updates: [
      {
        id: 1,
        type: 'Export License',
        status: 'Approved',
        due_date: '2024-01-15'
      },
      {
        id: 2,
        type: 'Phytosanitary Certificate',
        status: 'Pending',
        due_date: '2024-01-18'
      }
    ],
    logistics_partners: [
      {
        id: 1,
        name: 'Maersk Line',
        service: 'Container Shipping',
        contact: '+254 700 123 456'
      },
      {
        id: 2,
        name: 'DHL Global Forwarding',
        service: 'Air Freight',
        contact: '+254 700 123 457'
      }
    ],
    compliance_regulations: [
      {
        id: 1,
        name: 'EU Organic Regulation',
        status: 'compliant',
        last_checked: '2024-01-10'
      },
      {
        id: 2,
        name: 'FDA Import Requirements',
        status: 'pending_review',
        last_checked: '2024-01-08'
      }
    ],
    export_documents: getDefaultExportDocuments(),
    international_prices: [
      {
        commodity: 'Arabica Coffee',
        price: 8.50,
        market: 'EU',
        trend: 'up'
      },
      {
        commodity: 'Hass Avocados',
        price: 4.25,
        market: 'Middle East',
        trend: 'stable'
      }
    ],
    international_partners: [
      {
        id: 1,
        name: 'European Food Importers Ltd',
        country: 'Netherlands',
        specialty: 'Organic Products',
        rating: 4.8,
        logo: '/partners/european-food.png'
      },
      {
        id: 2,
        name: 'Gulf Fresh Markets',
        country: 'UAE',
        specialty: 'Fresh Produce',
        rating: 4.6,
        logo: '/partners/gulf-fresh.png'
      }
    ],
    network_stats: {
      partners: 15,
      countries: 8
    }
  });

  const { handleNavigate } = useDashboardHandlers(dashboardData, fetchDashboardData, setDashboardData, setLoading);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleMessageUser = (user) => {
    console.log('Message user:', user);
  };

  const handleServiceRequest = (user, serviceType, formType) => {
    setServiceRequest({ user, serviceType, formType });
    setShowServiceForm(true);
    setShowProfileModal(false);
  };

  const handleNewExportOrder = async () => {
    setActionLoading(true);
    try {
      // API call to create new export order
      const response = await apiService.post('/marketplace/export-orders/', {
        type: 'export',
        client_id: user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        console.log('New export order created:', response.data);
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating export order:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setActionLoading(true);
    try {
      const response = await apiService.post('/reports/export-summary/', {
        period: 'current_month',
        format: 'pdf'
      });
      
      if (response.success) {
        console.log('Report generated:', response.data);
        // Trigger download or show report
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplianceUpdate = async (regulation) => {
    try {
      const response = await apiService.post('/compliance/check-update/', {
        regulation_id: regulation?.id,
        check_type: 'manual'
      });
      
      if (response.success) {
        console.log('Compliance check completed:', response.data);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating compliance:', error);
    }
  };

  const handleGenerateDocument = async (document) => {
    try {
      const response = await apiService.post('/documents/generate/', {
        document_type: document?.name,
        export_order_id: selectedShipment?.id
      });
      
      if (response.success) {
        console.log('Document generated:', response.data);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  const handleContactPartner = (partner) => {
    console.log('Contacting partner:', partner);
    // Implement partner contact logic
    if (partner?.contact) {
      window.open(`tel:${partner.contact}`, '_self');
    }
  };

  // Safe data accessors
  const getExportDocuments = () => {
    return dashboardData?.export_documents?.map(doc => ({
      id: doc.id || Math.random(),
      name: doc.name || 'Unknown Document',
      type: doc.type || 'document',
      status: doc.status || 'pending',
      required: doc.required !== undefined ? doc.required : true,
      fileName: doc.fileName || (doc.name ? `${doc.name}.pdf` : 'document.pdf')
    })) || [];
  };

  const getComplianceRegulations = () => {
    return dashboardData?.compliance_regulations || [];
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading export client dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard export-client-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🌍 Export Client Dashboard</h1>
          <p>International trade compliance and logistics management</p>
          {error && (
            <div className="error-banner">
              <span>⚠️ Using demo data - {error}</span>
              <Button size="small" onClick={fetchDashboardData}>Retry</Button>
            </div>
          )}
        </div>
        <div className="header-actions">
          <Button 
            variant="primary" 
            onClick={handleNewExportOrder}
            loading={actionLoading}
          >
            New Export Order
          </Button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Global Trade Overview */}
        <Card className="trade-overview-card full-width">
          <div className="card-header">
            <h3>📦 Global Trade Overview</h3>
            <Button 
              size="small" 
              onClick={handleGenerateReport}
              loading={actionLoading}
            >
              Generate Reports
            </Button>
          </div>
          <div className="shipment-status-grid">
            <div className="status-metric">
              <div className="metric-value">{dashboardData?.shipment_stats?.in_transit || 0}</div>
              <div className="metric-label">In Transit</div>
            </div>
            <div className="status-metric">
              <div className="metric-value">{dashboardData?.shipment_stats?.customs_clearance || 0}</div>
              <div className="metric-label">Customs Clearance</div>
            </div>
            <div className="status-metric">
              <div className="metric-value">{dashboardData?.shipment_stats?.delivered || 0}</div>
              <div className="metric-label">Delivered</div>
            </div>
            <div className="status-metric">
              <div className="metric-value">{dashboardData?.shipment_stats?.issues || 0}</div>
              <div className="metric-label">Issues</div>
            </div>
          </div>
          <div className="active-shipments">
            <h4>Active Shipments</h4>
            {dashboardData?.active_shipments?.map(shipment => (
              <div 
                key={shipment.id} 
                className={`shipment-item ${shipment.status}`}
                onClick={() => setSelectedShipment(shipment)}
              >
                <div className="shipment-id">#{shipment.id}</div>
                <div className="shipment-route">
                  {shipment.origin} → {shipment.destination}
                </div>
                <div className="shipment-status">{shipment.status}</div>
                <div className="shipment-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${shipment.progress}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🌐 Professional Network</h3>
            <Button 
              size="small"
              onClick={() => setShowUserDirectory(true)}
            >
              Find Partners
            </Button>
          </div>
          <div className="network-preview">
            <p>Connect with logistics providers and international partners</p>
            <div className="quick-stats">
              <span>🚚 23+ Logistics</span>
              <span>🌍 15+ Countries</span>
              <span>🤝 45+ Partners</span>
            </div>
          </div>
        </Card>

        {/* Export Management */}
        <Card className="export-management-card">
          <div className="card-header">
            <h3>🛃 Export Management</h3>
          </div>
          <div className="customs-coordination">
            <h4>Customs Coordination</h4>
            {dashboardData?.customs_updates?.map(update => (
              <div key={update.id} className="customs-update">
                <div className="update-type">{update.type}</div>
                <div className={`update-status status-${update.status?.toLowerCase() || 'pending'}`}>
                  {update.status}
                </div>
                <div className="update-date">{update.due_date}</div>
              </div>
            ))}
          </div>
          <div className="international-logistics">
            <h4>International Logistics</h4>
            <div className="logistics-partners">
              {dashboardData?.logistics_partners?.map(partner => (
                <div key={partner.id} className="partner-item">
                  <span className="partner-name">{partner.name}</span>
                  <span className="partner-service">{partner.service}</span>
                  <Button 
                    size="small" 
                    onClick={() => handleContactPartner(partner)}
                  >
                    Contact
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Compliance Hub */}
        <Card className="compliance-card">
          <div className="card-header">
            <h3>📑 Compliance Hub</h3>
            <Button 
              size="small" 
              onClick={() => handleComplianceUpdate(getComplianceRegulations()[0])}
            >
              Check Updates
            </Button>
          </div>
          <ComplianceTracker 
            regulations={getComplianceRegulations()}
            onRegulationUpdate={handleComplianceUpdate}
          />
          <div className="document-management">
            <h4>Required Documents</h4>
            <DocumentManager 
              documents={getExportDocuments()}
              onGenerateDocument={handleGenerateDocument}
            />
          </div>
        </Card>

        {/* Market Intelligence */}
        <Card className="market-intel-card">
          <div className="card-header">
            <h3>📊 Market Intelligence</h3>
          </div>
          <div className="international-pricing">
            <h4>International Pricing</h4>
            {dashboardData?.international_prices?.map(price => (
              <div key={price.commodity} className="price-item">
                <span className="commodity">{price.commodity}</span>
                <span className="price">${price.price}/kg</span>
                <span className={`market trend-${price.trend}`}>{price.market}</span>
              </div>
            ))}
          </div>
          <div className="demand-analysis">
            <h4>Demand Analysis</h4>
            <div className="demand-metrics">
              <div className="demand-metric high">
                <div className="metric-label">European Union</div>
                <div className="metric-value">High Demand</div>
              </div>
              <div className="demand-metric medium">
                <div className="metric-label">Middle East</div>
                <div className="metric-value">Medium Demand</div>
              </div>
              <div className="demand-metric low">
                <div className="metric-label">Asia Pacific</div>
                <div className="metric-value">Low Demand</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Global Network */}
        <Card className="network-card">
          <div className="card-header">
            <h3>🤝 Global Network</h3>
          </div>
          <div className="trusted-partners">
            <h4>Trusted International Partners</h4>
            {dashboardData?.international_partners?.map(partner => (
              <div key={partner.id} className="partner-card">
                <div className="partner-info">
                  <h5>{partner.name}</h5>
                  <p>{partner.country}</p>
                  <p className="partner-specialty">{partner.specialty}</p>
                </div>
                <div className="partner-rating">
                  <span className="rating">⭐ {partner.rating}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="network-stats">
            <div className="network-stat">
              <strong>{dashboardData?.network_stats?.partners || 0}</strong> Trusted Partners
            </div>
            <div className="network-stat">
              <strong>{dashboardData?.network_stats?.countries || 0}</strong> Countries
            </div>
          </div>
        </Card>
      </div>

      {/* User Directory Modal */}
      {showUserDirectory && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <UserDirectory 
              currentUser={user}
              onUserSelect={handleUserSelect}
              onMessageUser={handleMessageUser}
            />
            <button 
              className="close-modal"
              onClick={() => setShowUserDirectory(false)}
            >
              Close Directory
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onMessage={handleMessageUser}
        onRequestService={handleServiceRequest}
      />

      {/* Service Request Form */}
      {showServiceForm && serviceRequest && (
        <ServiceRequestForm
          targetUser={serviceRequest.user}
          serviceType={serviceRequest.serviceType}
          formType={serviceRequest.formType}
          onClose={() => setShowServiceForm(false)}
          onSubmit={(result) => {
            console.log('Service request submitted:', result);
            setShowServiceForm(false);
          }}
        />
      )}

      {/* Selected Shipment Modal */}
      {selectedShipment && (
        <div className="shipment-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Shipment #{selectedShipment.id}</h3>
              <Button 
                variant="text" 
                onClick={() => setSelectedShipment(null)}
              >
                ✕
              </Button>
            </div>
            <div className="shipment-details">
              <div className="detail-item">
                <strong>Route:</strong> {selectedShipment.origin} → {selectedShipment.destination}
              </div>
              <div className="detail-item">
                <strong>Status:</strong> 
                <span className={`status-badge ${selectedShipment.status}`}>
                  {selectedShipment.status?.replace('_', ' ') || 'Unknown'}
                </span>
              </div>
              <div className="detail-item">
                <strong>Progress:</strong> 
                <div className="progress-bar small">
                  <div 
                    className="progress-fill" 
                    style={{width: `${selectedShipment.progress || 0}%`}}
                  ></div>
                </div>
                <span>{selectedShipment.progress || 0}%</span>
              </div>
              <div className="detail-item">
                <strong>Estimated Arrival:</strong> {selectedShipment.eta || 'Unknown'}
              </div>
              <div className="detail-item">
                <strong>Contents:</strong> {selectedShipment.contents || 'Unknown'}
              </div>
            </div>
            <div className="modal-actions">
              <Button variant="primary">Track Shipment</Button>
              <Button variant="secondary">View Documents</Button>
              <Button onClick={() => setSelectedShipment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportClientDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { farmAPI, apiUtils } from '@agro-gram/api';
import { Card, Button, LoadingSpinner, Modal, Input, Select, TextArea } from '@agro-gram/ui';
import './Farms.css';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [plotFormErrors, setPlotFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [plotSubmitLoading, setPlotSubmitLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    total_area: '',
    soil_type: '',
    description: '',
    latitude: '',
    longitude: ''
  });
  const [plotFormData, setPlotFormData] = useState({
    plot_number: '',
    area: '',
    current_crop: '',
    soil_ph: '',
    soil_moisture: '',
    farm: ''
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const soilTypes = [
    { value: 'LOAMY', label: 'Loamy' },
    { value: 'CLAY', label: 'Clay' },
    { value: 'SANDY', label: 'Sandy' },
    { value: 'SILTY', label: 'Silty' },
    { value: 'PEAT', label: 'Peat' },
    { value: 'CHALKY', label: 'Chalky' }
  ];

  useEffect(() => {
    fetchFarms();
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateModal(true);
    } else if (action === 'add-crop') {
      setShowPlotModal(true);
    }
  }, [searchParams]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const result = await farmAPI.getFarms();
      console.log('Farms API Response:', result); // Debug log
      
      // FIXED: Handle the nested response structure properly
      let farmsData = [];
      
      if (result.success) {
        // Handle the nested structure: result.data.data.results
        if (result.data && result.data.data && Array.isArray(result.data.data.results)) {
          farmsData = result.data.data.results;
        } 
        // Handle alternative structure: result.data.results
        else if (result.data && Array.isArray(result.data.results)) {
          farmsData = result.data.results;
        }
        // Handle direct array in data
        else if (result.data && Array.isArray(result.data)) {
          farmsData = result.data;
        }
        // Handle direct array
        else if (Array.isArray(result.data)) {
          farmsData = result.data;
        }
        // Handle array in nested data property
        else if (result.data && result.data.data && Array.isArray(result.data.data)) {
          farmsData = result.data.data;
        }
        else {
          console.warn('Unexpected farms response structure:', result);
          farmsData = [];
        }
      } else {
        setGlobalError(result.message || 'Failed to load farms');
        farmsData = [];
      }
      
      setFarms(farmsData);
    } catch (error) {
      console.error('Error fetching farms:', error);
      setGlobalError('Failed to load farms. Please try again.');
      setFarms([]); // Ensure farms is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormErrors({});
    setGlobalError('');

    try {
      const submitData = {
        ...formData,
        total_area: formData.total_area ? parseFloat(formData.total_area) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      const result = await farmAPI.createFarm(submitData);
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          location: '',
          total_area: '',
          soil_type: '',
          description: '',
          latitude: '',
          longitude: ''
        });
        fetchFarms(); // Refresh the farms list
      } else {
        if (apiUtils.isValidationError(result)) {
          setFormErrors(apiUtils.getFieldErrors(result));
        } else {
          setGlobalError(apiUtils.formatErrorForDisplay(result));
        }
      }
    } catch (error) {
      console.error('Error creating farm:', error);
      setGlobalError('Failed to create farm. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreatePlot = async (e) => {
    e.preventDefault();
    setPlotSubmitLoading(true);
    setPlotFormErrors({});
    setGlobalError('');

    try {
      const submitData = {
        ...plotFormData,
        area: plotFormData.area ? parseFloat(plotFormData.area) : undefined,
        soil_ph: plotFormData.soil_ph ? parseFloat(plotFormData.soil_ph) : undefined,
        soil_moisture: plotFormData.soil_moisture ? parseFloat(plotFormData.soil_moisture) : undefined,
        farm: parseInt(plotFormData.farm),
      };

      const result = await farmAPI.createPlot(submitData);
      
      if (result.success) {
        setShowPlotModal(false);
        setPlotFormData({
          plot_number: '',
          area: '',
          current_crop: '',
          soil_ph: '',
          soil_moisture: '',
          farm: ''
        });
        fetchFarms(); // Refresh the farms list
      } else {
        if (apiUtils.isValidationError(result)) {
          setPlotFormErrors(apiUtils.getFieldErrors(result));
        } else {
          setGlobalError(apiUtils.formatErrorForDisplay(result));
        }
      }
    } catch (error) {
      console.error('Error creating plot:', error);
      setGlobalError('Failed to create plot. Please try again.');
    } finally {
      setPlotSubmitLoading(false);
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      try {
        const result = await farmAPI.deleteFarm(farmId);
        if (result.success) {
          fetchFarms();
        } else {
          setGlobalError(result.message || 'Failed to delete farm');
        }
      } catch (error) {
        console.error('Error deleting farm:', error);
        setGlobalError('Failed to delete farm. Please try again.');
      }
    }
  };

  const handleViewFarm = (farmId) => {
    navigate(`/farms/${farmId}`);
  };

  const handleAddPlot = (farmId) => {
    setSelectedFarm(farmId);
    setPlotFormData(prev => ({ ...prev, farm: farmId.toString() }));
    setPlotFormErrors({});
    setShowPlotModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      location: '',
      total_area: '',
      soil_type: '',
      description: '',
      latitude: '',
      longitude: ''
    });
    setFormErrors({});
  };

  const handleClosePlotModal = () => {
    setShowPlotModal(false);
    setPlotFormData({
      plot_number: '',
      area: '',
      current_crop: '',
      soil_ph: '',
      soil_moisture: '',
      farm: ''
    });
    setPlotFormErrors({});
  };

  const getFieldError = (fieldName, errors) => {
    return errors[fieldName] ? errors[fieldName][0] : '';
  };

  // FIXED: Safe array access for farm plots
  const getFarmPlots = (farm) => {
    if (!farm) return [];
    
    if (Array.isArray(farm.plots)) {
      return farm.plots;
    } else if (Array.isArray(farm.plots_list)) {
      return farm.plots_list;
    } else if (Array.isArray(farm.plot_set)) {
      return farm.plot_set;
    }
    
    return [];
  };

  // FIXED: Safe property access with fallbacks
  const getFarmProperty = (farm, property, fallback = '') => {
    if (!farm) return fallback;
    return farm[property] !== undefined ? farm[property] : fallback;
  };

  if (loading) {
    return (
      <div className="loading">
        <LoadingSpinner size="large" />
        <p>Loading farms...</p>
      </div>
    );
  }

  // FIXED: Ensure farms is always treated as an array
  const farmsArray = Array.isArray(farms) ? farms : [];

  return (
    <div className="farms-page">
      <div className="farms-header">
        <h1>My Farms</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Add New Farm
        </Button>
      </div>

      {globalError && (
        <Card className="alert-error" style={{ marginBottom: '16px', background: '#ffebee', borderColor: '#f44336' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{globalError}</span>
            <Button size="small" variant="text" onClick={() => setGlobalError('')}>×</Button>
          </div>
        </Card>
      )}

      {farmsArray.length === 0 ? (
        <Card className="no-farms-card">
          <div className="no-farms-content">
            <h3>No Farms Yet</h3>
            <p>Start by creating your first farm to manage your agricultural operations.</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Farm
            </Button>
          </div>
        </Card>
      ) : (
        <div className="farms-grid">
          {farmsArray.map(farm => {
            const farmPlots = getFarmPlots(farm);
            const plotsCount = farmPlots.length;
            
            return (
              <Card key={farm.id} className="farm-card">
                <div className="farm-card__header">
                  <h3>{getFarmProperty(farm, 'name', 'Unnamed Farm')}</h3>
                  <div className="farm-actions">
                    <Button size="small" variant="outline" onClick={() => handleViewFarm(farm.id)}>
                      View
                    </Button>
                    <Button size="small" variant="outline" onClick={() => handleAddPlot(farm.id)}>
                      Add Plot
                    </Button>
                    <Button size="small" variant="danger" onClick={() => handleDeleteFarm(farm.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                
                <div className="farm-card__info">
                  <p><strong>Location:</strong> {getFarmProperty(farm, 'location', 'Not specified')}</p>
                  <p><strong>Area:</strong> {getFarmProperty(farm, 'total_area', 0)} acres</p>
                  <p><strong>Soil Type:</strong> {getFarmProperty(farm, 'soil_type_display') || getFarmProperty(farm, 'soil_type', 'Not specified')}</p>
                  <p><strong>Plots:</strong> {plotsCount}</p>
                  <p><strong>Productivity:</strong> 
                    <span className={`productivity-badge productivity-${(getFarmProperty(farm, 'productivity_level', 'medium') || 'medium').toLowerCase()}`}>
                      {getFarmProperty(farm, 'productivity_level', 'Medium')}
                    </span>
                  </p>
                </div>

                {plotsCount > 0 && (
                  <div className="farm-plots">
                    <h4>Plots</h4>
                    {farmPlots.slice(0, 3).map(plot => (
                      <div key={plot.id} className="plot-item">
                        <span>Plot {getFarmProperty(plot, 'plot_number', 'N/A')} - {getFarmProperty(plot, 'area', 0)} acres</span>
                        {plot.current_crop && (
                          <span className="crop-badge">{getFarmProperty(plot, 'current_crop')}</span>
                        )}
                      </div>
                    ))}
                    {plotsCount > 3 && (
                      <p className="more-plots">+{plotsCount - 3} more plots</p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Farm Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Create New Farm"
      >
        <form onSubmit={handleCreateFarm} className="farm-form">
          {globalError && (
            <Card className="alert-error" style={{ marginBottom: '16px', background: '#ffebee', borderColor: '#f44336' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{globalError}</span>
                <Button size="small" variant="text" onClick={() => setGlobalError('')}>×</Button>
              </div>
            </Card>
          )}
          
          <Input
            label="Farm Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={getFieldError('name', formErrors)}
            required
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            error={getFieldError('location', formErrors)}
            required
          />
          <Input
            label="Total Area (acres)"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.total_area}
            onChange={(e) => setFormData(prev => ({ ...prev, total_area: e.target.value }))}
            error={getFieldError('total_area', formErrors)}
            required
          />
          <Select
            label="Soil Type"
            options={soilTypes}
            value={formData.soil_type}
            onChange={(e) => setFormData(prev => ({ ...prev, soil_type: e.target.value }))}
            error={getFieldError('soil_type', formErrors)}
          />
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            error={getFieldError('description', formErrors)}
            rows={3}
          />
          <div className="form-row">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              min="-90"
              max="90"
              value={formData.latitude}
              onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
              error={getFieldError('latitude', formErrors)}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              min="-180"
              max="180"
              value={formData.longitude}
              onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
              error={getFieldError('longitude', formErrors)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={handleCloseCreateModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitLoading}>
              Create Farm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Plot Modal */}
      <Modal
        isOpen={showPlotModal}
        onClose={handleClosePlotModal}
        title="Add New Plot"
      >
        <form onSubmit={handleCreatePlot} className="plot-form">
          {globalError && (
            <Card className="alert-error" style={{ marginBottom: '16px', background: '#ffebee', borderColor: '#f44336' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{globalError}</span>
                <Button size="small" variant="text" onClick={() => setGlobalError('')}>×</Button>
              </div>
            </Card>
          )}
          
          <Input
            label="Plot Number"
            value={plotFormData.plot_number}
            onChange={(e) => setPlotFormData(prev => ({ ...prev, plot_number: e.target.value }))}
            error={getFieldError('plot_number', plotFormErrors)}
            required
          />
          <Input
            label="Area (acres)"
            type="number"
            step="0.01"
            min="0.01"
            value={plotFormData.area}
            onChange={(e) => setPlotFormData(prev => ({ ...prev, area: e.target.value }))}
            error={getFieldError('area', plotFormErrors)}
            required
          />
          <Input
            label="Current Crop"
            value={plotFormData.current_crop}
            onChange={(e) => setPlotFormData(prev => ({ ...prev, current_crop: e.target.value }))}
            error={getFieldError('current_crop', plotFormErrors)}
          />
          <div className="form-row">
            <Input
              label="Soil pH"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={plotFormData.soil_ph}
              onChange={(e) => setPlotFormData(prev => ({ ...prev, soil_ph: e.target.value }))}
              error={getFieldError('soil_ph', plotFormErrors)}
            />
            <Input
              label="Soil Moisture %"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={plotFormData.soil_moisture}
              onChange={(e) => setPlotFormData(prev => ({ ...prev, soil_moisture: e.target.value }))}
              error={getFieldError('soil_moisture', plotFormErrors)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={handleClosePlotModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={plotSubmitLoading}>
              Add Plot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Farms;
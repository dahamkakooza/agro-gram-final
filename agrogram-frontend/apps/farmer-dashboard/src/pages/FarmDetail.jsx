import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmAPI } from '@agro-gram/api';
import { Card, Button, LoadingSpinner, Tabs, Modal, Input, Select, TextArea } from '@agro-gram/ui';
import './FarmDetail.css';

const FarmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [plots, setPlots] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [plotFormData, setPlotFormData] = useState({
    plot_number: '',
    area: '',
    current_crop: '',
    soil_ph: '',
    soil_moisture: '',
    farm: id
  });
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    task_type: '',
    due_date: '',
    estimated_duration: '',
    priority: 'MEDIUM',
    plot: ''
  });
  const [cropFormData, setCropFormData] = useState({
    crop_name: '',
    variety: '',
    planting_date: '',
    expected_harvest_date: '',
    yield_amount: '',
    market_price: '',
    fertilizer_used: {},
    water_usage: '',
    total_cost: ''
  });

  useEffect(() => {
    if (id) {
      fetchFarmData();
    }
  }, [id]);

  const fetchFarmData = async () => {
    try {
      const [farmResponse, plotsResponse, tasksResponse, analyticsResponse] = await Promise.all([
        farmAPI.getFarm(id),
        farmAPI.getPlots(id),
        farmAPI.getFarmTasks(id),
        farmAPI.getFarmAnalytics(id)
      ]);

      setFarm(farmResponse.data);
      setPlots(plotsResponse.data.results || plotsResponse.data || []);
      setTasks(tasksResponse.data.tasks || []);
      setAnalytics(analyticsResponse.data.analytics);
    } catch (error) {
      console.error('Error fetching farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlot = async (e) => {
    e.preventDefault();
    try {
      await farmAPI.createPlot(plotFormData);
      setShowPlotModal(false);
      setPlotFormData({
        plot_number: '',
        area: '',
        current_crop: '',
        soil_ph: '',
        soil_moisture: '',
        farm: id
      });
      fetchFarmData();
    } catch (error) {
      console.error('Error creating plot:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await farmAPI.createTask(taskFormData);
      setShowTaskModal(false);
      setTaskFormData({
        title: '',
        description: '',
        task_type: '',
        due_date: '',
        estimated_duration: '',
        priority: 'MEDIUM',
        plot: ''
      });
      fetchFarmData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      await farmAPI.addCropToPlot(selectedPlot.id, cropFormData);
      setShowCropModal(false);
      setCropFormData({
        crop_name: '',
        variety: '',
        planting_date: '',
        expected_harvest_date: '',
        yield_amount: '',
        market_price: '',
        fertilizer_used: {},
        water_usage: '',
        total_cost: ''
      });
      setSelectedPlot(null);
      fetchFarmData();
    } catch (error) {
      console.error('Error adding crop:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await farmAPI.completeTask(taskId);
      fetchFarmData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      const response = await farmAPI.generateRecommendations(id);
      alert('Recommendations generated successfully!');
      console.log('Recommendations:', response.data);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <LoadingSpinner size="large" />
        <p>Loading farm details...</p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="error-page">
        <h2>Farm not found</h2>
        <Button onClick={() => navigate('/farms')}>Back to Farms</Button>
      </div>
    );
  }

  return (
    <div className="farm-detail">
      <div className="farm-detail__header">
        <div className="farm-detail__info">
          <h1>{farm.name}</h1>
          <p>{farm.location} • {farm.total_area} acres • {farm.soil_type_display || farm.soil_type}</p>
          <div className="farm-stats">
            <span>{plots.length} Plots</span>
            <span>{tasks.filter(t => t.status === 'PENDING').length} Pending Tasks</span>
            <span className={`productivity-badge productivity-${farm.productivity_level?.toLowerCase() || 'medium'}`}>
              {farm.productivity_level || 'Medium'} Productivity
            </span>
          </div>
        </div>
        <div className="farm-detail__actions">
          <Button variant="outline" onClick={() => setShowPlotModal(true)}>
            Add Plot
          </Button>
          <Button variant="outline" onClick={() => setShowTaskModal(true)}>
            Add Task
          </Button>
          <Button variant="primary" onClick={handleGenerateRecommendations}>
            Get AI Recommendations
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'plots', label: 'Plots' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'analytics', label: 'Analytics' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-grid">
            <Card title="Farm Description">
              <p>{farm.description || 'No description provided.'}</p>
            </Card>
            
            <Card title="Quick Stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <h3>{plots.length}</h3>
                  <p>Total Plots</p>
                </div>
                <div className="stat-item">
                  <h3>{plots.filter(p => p.current_crop).length}</h3>
                  <p>Active Crops</p>
                </div>
                <div className="stat-item">
                  <h3>{tasks.filter(t => t.status === 'PENDING').length}</h3>
                  <p>Pending Tasks</p>
                </div>
                <div className="stat-item">
                  <h3>{analytics?.success_rate ? `${(analytics.success_rate * 100).toFixed(1)}%` : 'N/A'}</h3>
                  <p>Success Rate</p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Recent Activity">
            <div className="activity-list">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="activity-item">
                  <div className="activity-icon">📝</div>
                  <div className="activity-content">
                    <p><strong>{task.title}</strong> - Due {new Date(task.due_date).toLocaleDateString()}</p>
                    <small>{task.priority_display} Priority</small>
                  </div>
                  <Button 
                    size="small" 
                    variant="outline"
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'plots' && (
        <div className="tab-content">
          <div className="plots-grid">
            {plots.map(plot => (
              <Card key={plot.id} className="plot-card">
                <div className="plot-card__header">
                  <h3>Plot {plot.plot_number}</h3>
                  <div className="plot-actions">
                    <Button 
                      size="small" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPlot(plot);
                        setShowCropModal(true);
                      }}
                    >
                      Add Crop
                    </Button>
                  </div>
                </div>
                
                <div className="plot-card__info">
                  <p><strong>Area:</strong> {plot.area} acres</p>
                  <p><strong>Current Crop:</strong> {plot.current_crop || 'None'}</p>
                  <p><strong>Soil pH:</strong> {plot.soil_ph || 'Not set'}</p>
                  <p><strong>Status:</strong> {plot.crop_status_display || plot.crop_status}</p>
                  {plot.days_to_harvest && (
                    <p><strong>Days to Harvest:</strong> {plot.days_to_harvest}</p>
                  )}
                </div>

                {plot.ai_recommendations && plot.ai_recommendations.length > 0 && (
                  <div className="plot-recommendations">
                    <h4>AI Recommendations</h4>
                    {plot.ai_recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <span className={`priority-badge priority-${rec.priority}`}>
                          {rec.priority}
                        </span>
                        <p>{rec.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {plots.length === 0 && (
            <Card className="no-plots">
              <div className="no-plots-content">
                <h3>No Plots Yet</h3>
                <p>Add your first plot to start managing crops.</p>
                <Button variant="primary" onClick={() => setShowPlotModal(true)}>
                  Add First Plot
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="tab-content">
          <div className="tasks-list">
            {tasks.map(task => (
              <Card key={task.id} className="task-card">
                <div className="task-card__content">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-meta">
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      <span>Type: {task.task_type}</span>
                      <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                        {task.priority_display || task.priority}
                      </span>
                      <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                        {task.status_display || task.status}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions">
                    {task.status === 'PENDING' && (
                      <Button 
                        variant="primary" 
                        size="small"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {tasks.length === 0 && (
            <Card className="no-tasks">
              <div className="no-tasks-content">
                <h3>No Tasks Yet</h3>
                <p>Create your first task to manage farm operations.</p>
                <Button variant="primary" onClick={() => setShowTaskModal(true)}>
                  Add First Task
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="tab-content">
          {analytics ? (
            <div className="analytics-grid">
              <Card title="Productivity Metrics">
                <div className="metric">
                  <h3>{(analytics.success_rate * 100).toFixed(1)}%</h3>
                  <p>Success Rate</p>
                </div>
                <div className="metric">
                  <h3>{analytics.average_yield?.toFixed(2) || 'N/A'}</h3>
                  <p>Average Yield</p>
                </div>
                <div className="metric">
                  <h3>{(analytics.efficiency_score * 100).toFixed(1)}%</h3>
                  <p>Efficiency Score</p>
                </div>
              </Card>

              <Card title="Financial Overview">
                <div className="metric">
                  <h3>${analytics.total_revenue || 0}</h3>
                  <p>Total Revenue</p>
                </div>
                <div className="metric">
                  <h3>${analytics.total_costs || 0}</h3>
                  <p>Total Costs</p>
                </div>
                <div className="metric">
                  <h3>${analytics.net_profit || 0}</h3>
                  <p>Net Profit</p>
                </div>
              </Card>

              {analytics.improvement_recommendations && analytics.improvement_recommendations.length > 0 && (
                <Card title="Improvement Recommendations">
                  <div className="recommendations-list">
                    {analytics.improvement_recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <h4>{rec.title}</h4>
                        <p>{rec.description}</p>
                        <div className="recommendation-actions">
                          {rec.actions?.map((action, actionIndex) => (
                            <span key={actionIndex} className="action-tag">{action}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <div className="no-analytics">
                <h3>No Analytics Data</h3>
                <p>Analytics data will be available after you start adding crops and tasks.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Plot Modal */}
      <Modal
        isOpen={showPlotModal}
        onClose={() => setShowPlotModal(false)}
        title="Add New Plot"
      >
        <form onSubmit={handleCreatePlot} className="plot-form">
          <Input
            label="Plot Number"
            value={plotFormData.plot_number}
            onChange={(e) => setPlotFormData(prev => ({ ...prev, plot_number: e.target.value }))}
            required
          />
          <Input
            label="Area (acres)"
            type="number"
            step="0.01"
            value={plotFormData.area}
            onChange={(e) => setPlotFormData(prev => ({ ...prev, area: e.target.value }))}
            required
          />
          <Input
            label="Current Crop"
            value={plotFormData.current_crop}
            onChange={(e) => setPlotFormData(prev => ({ ...prev, current_crop: e.target.value }))}
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
            />
            <Input
              label="Soil Moisture %"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={plotFormData.soil_moisture}
              onChange={(e) => setPlotFormData(prev => ({ ...prev, soil_moisture: e.target.value }))}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowPlotModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Plot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add New Task"
      >
        <form onSubmit={handleCreateTask} className="task-form">
          <Input
            label="Task Title"
            value={taskFormData.title}
            onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <TextArea
            label="Description"
            value={taskFormData.description}
            onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <Input
            label="Task Type"
            value={taskFormData.task_type}
            onChange={(e) => setTaskFormData(prev => ({ ...prev, task_type: e.target.value }))}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={taskFormData.due_date}
            onChange={(e) => setTaskFormData(prev => ({ ...prev, due_date: e.target.value }))}
            required
          />
          <Input
            label="Estimated Duration (hours)"
            type="number"
            value={taskFormData.estimated_duration}
            onChange={(e) => setTaskFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
          />
          <Select
            label="Priority"
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' }
            ]}
            value={taskFormData.priority}
            onChange={(e) => setTaskFormData(prev => ({ ...prev, priority: e.target.value }))}
          />
          <Select
            label="Plot (Optional)"
            options={plots.map(plot => ({ value: plot.id, label: `Plot ${plot.plot_number}` }))}
            value={taskFormData.plot}
            onChange={(e) => setTaskFormData(prev => ({ ...prev, plot: e.target.value }))}
          />
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Crop Modal */}
      <Modal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setSelectedPlot(null);
        }}
        title={`Add Crop to Plot ${selectedPlot?.plot_number}`}
      >
        <form onSubmit={handleAddCrop} className="crop-form">
          <Input
            label="Crop Name"
            value={cropFormData.crop_name}
            onChange={(e) => setCropFormData(prev => ({ ...prev, crop_name: e.target.value }))}
            required
          />
          <Input
            label="Variety"
            value={cropFormData.variety}
            onChange={(e) => setCropFormData(prev => ({ ...prev, variety: e.target.value }))}
          />
          <div className="form-row">
            <Input
              label="Planting Date"
              type="date"
              value={cropFormData.planting_date}
              onChange={(e) => setCropFormData(prev => ({ ...prev, planting_date: e.target.value }))}
              required
            />
            <Input
              label="Expected Harvest Date"
              type="date"
              value={cropFormData.expected_harvest_date}
              onChange={(e) => setCropFormData(prev => ({ ...prev, expected_harvest_date: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <Input
              label="Expected Yield"
              type="number"
              step="0.01"
              value={cropFormData.yield_amount}
              onChange={(e) => setCropFormData(prev => ({ ...prev, yield_amount: e.target.value }))}
            />
            <Input
              label="Market Price"
              type="number"
              step="0.01"
              value={cropFormData.market_price}
              onChange={(e) => setCropFormData(prev => ({ ...prev, market_price: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <Input
              label="Water Usage (liters)"
              type="number"
              step="0.01"
              value={cropFormData.water_usage}
              onChange={(e) => setCropFormData(prev => ({ ...prev, water_usage: e.target.value }))}
            />
            <Input
              label="Total Cost"
              type="number"
              step="0.01"
              value={cropFormData.total_cost}
              onChange={(e) => setCropFormData(prev => ({ ...prev, total_cost: e.target.value }))}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => {
              setShowCropModal(false);
              setSelectedPlot(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Crop
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmDetail;
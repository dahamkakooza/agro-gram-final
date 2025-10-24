import React, { useState, useEffect } from 'react';
import { recommendationsAPI, apiUtils } from '@agro-gram/api';
import { Card, Button, Input, Select, TextArea, Tabs, Modal } from '@agro-gram/ui';
import './Recommendations.css';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2">Loading...</span>
  </div>
);

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('crop');
  const [cropRecommendation, setCropRecommendation] = useState(null);
  const [pricePrediction, setPricePrediction] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  
  const [cropForm, setCropForm] = useState({
    soilType: 'Loamy',
    ph: '6.5',
    temperature: '25',
    rainfall: '800',
    location: '',
    season: 'Rainy',
    farmSize: '',
    previousCrops: '',
    nitrogen: '50',
    phosphorus: '50',
    potassium: '50',
    humidity: '60'
  });

  const [priceForm, setPriceForm] = useState({
    cropType: 'Maize',
    region: '',
    predictionPeriod: '1 Month',
    useGlobal: false
  });

  const [chatForm, setChatForm] = useState({
    question: '',
    user_context: {}
  });

  const soilTypes = [
    { value: 'Loamy', label: 'Loamy' },
    { value: 'Clay', label: 'Clay' },
    { value: 'Sandy', label: 'Sandy' },
    { value: 'Silty', label: 'Silty' },
    { value: 'Peat', label: 'Peat' },
    { value: 'Chalky', label: 'Chalky' }
  ];

  const seasons = [
    { value: 'Spring', label: 'Spring' },
    { value: 'Summer', label: 'Summer' },
    { value: 'Autumn', label: 'Autumn' },
    { value: 'Winter', label: 'Winter' },
    { value: 'Rainy', label: 'Rainy' },
    { value: 'Dry', label: 'Dry' }
  ];

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('firebaseToken');
    console.log('🔐 Authentication token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.error('❌ No authentication token - user needs to login');
      setGlobalError('Please log in to use AI features');
      setNetworkStatus({ 
        gemini_available: false,
        error: 'Authentication required'
      });
      return;
    }

    checkNetworkStatus();
    testRecommendationsAPI();
  }, []);

  const testRecommendationsAPI = async () => {
    console.log('🧪 Testing Recommendations API...');
    
    try {
      // Test network status
      const network = await recommendationsAPI.getNetworkStatus();
      console.log('Network status test:', network);
      
      // Test Gemini status
      const gemini = await recommendationsAPI.getGeminiStatus();
      console.log('Gemini status test:', gemini);
      
    } catch (error) {
      console.error('Recommendations API test failed:', error);
    }
  };

  const debugAPI = async () => {
    console.log('🔍 Debugging API calls...');
    
    try {
      console.log('Testing network status endpoint...');
      const result = await recommendationsAPI.getNetworkStatus();
      console.log('Network status result:', result);
      
      console.log('Testing Gemini status endpoint...');
      const geminiResult = await recommendationsAPI.getGeminiStatus();
      console.log('Gemini status result:', geminiResult);
      
    } catch (error) {
      console.error('API debug error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
    }
  };

  const checkNetworkStatus = async () => {
    try {
      console.log('🔄 Checking network status...');
      const result = await recommendationsAPI.getNetworkStatus();
      console.log('Network status response:', result);
      
      if (result && result.success) {
        setNetworkStatus(result.data);
      } else {
        console.warn('Failed to get network status:', result?.message || 'No response');
        // TEMPORARY: Force online for testing if API fails
        setNetworkStatus({ 
          gemini_available: true,
          network_connectivity: true,
          error: result?.message || 'Network status unavailable',
          note: 'Forced online for testing'
        });
      }
    } catch (error) {
      console.error('Error checking network status:', error);
      // TEMPORARY: Force online for testing on error
      setNetworkStatus({ 
        gemini_available: true,
        network_connectivity: true,
        error: error.message,
        note: 'Forced online due to error'
      });
    }
  };

  const validateCropForm = () => {
    const newErrors = {};

    if (!cropForm.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!cropForm.season) {
      newErrors.season = 'Season is required';
    }

    const ph = parseFloat(cropForm.ph);
    if (isNaN(ph) || ph < 0 || ph > 14) {
      newErrors.ph = 'Soil pH must be a number between 0 and 14';
    }

    const temperature = parseFloat(cropForm.temperature);
    if (isNaN(temperature) || temperature < -50 || temperature > 60) {
      newErrors.temperature = 'Temperature must be a number between -50°C and 60°C';
    }

    const rainfall = parseFloat(cropForm.rainfall);
    if (isNaN(rainfall) || rainfall < 0) {
      newErrors.rainfall = 'Rainfall must be a positive number';
    }

    if (cropForm.nitrogen) {
      const nitrogen = parseFloat(cropForm.nitrogen);
      if (isNaN(nitrogen) || nitrogen < 0) {
        newErrors.nitrogen = 'Nitrogen must be a positive number';
      }
    }

    if (cropForm.phosphorus) {
      const phosphorus = parseFloat(cropForm.phosphorus);
      if (isNaN(phosphorus) || phosphorus < 0) {
        newErrors.phosphorus = 'Phosphorus must be a positive number';
      }
    }

    if (cropForm.potassium) {
      const potassium = parseFloat(cropForm.potassium);
      if (isNaN(potassium) || potassium < 0) {
        newErrors.potassium = 'Potassium must be a positive number';
      }
    }

    if (cropForm.humidity) {
      const humidity = parseFloat(cropForm.humidity);
      if (isNaN(humidity) || humidity < 0 || humidity > 100) {
        newErrors.humidity = 'Humidity must be a number between 0 and 100';
      }
    }

    if (cropForm.farmSize) {
      const farmSize = parseFloat(cropForm.farmSize);
      if (isNaN(farmSize) || farmSize < 0) {
        newErrors.farmSize = 'Farm size must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePriceForm = () => {
    const newErrors = {};

    if (!priceForm.region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!priceForm.cropType.trim()) {
      newErrors.cropType = 'Crop type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCropRecommendation = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});

    // Check authentication
    const token = localStorage.getItem('firebaseToken');
    if (!token) {
      setGlobalError('Please log in to use crop recommendations');
      return;
    }

    if (!validateCropForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        soilType: cropForm.soilType,
        ph: parseFloat(cropForm.ph),
        temperature: parseFloat(cropForm.temperature),
        rainfall: parseFloat(cropForm.rainfall),
        location: cropForm.location.trim(),
        season: cropForm.season,
        ...(cropForm.farmSize && { farmSize: parseFloat(cropForm.farmSize) }),
        ...(cropForm.previousCrops && { previousCrops: cropForm.previousCrops.trim() }),
        ...(cropForm.nitrogen && { nitrogen: parseFloat(cropForm.nitrogen) }),
        ...(cropForm.phosphorus && { phosphorus: parseFloat(cropForm.phosphorus) }),
        ...(cropForm.potassium && { potassium: parseFloat(cropForm.potassium) }),
        ...(cropForm.humidity && { humidity: parseFloat(cropForm.humidity) }),
      };

      console.log('🌱 Submitting crop recommendation data:', submitData);

      const response = await recommendationsAPI.getCropRecommendation(submitData);
      
      // FIXED: Proper response handling
      if (response.data && response.data.success) {
        console.log('✅ Crop recommendation success:', response.data);
        setCropRecommendation(response.data);
      } else {
        console.error('❌ Crop recommendation failed:', response);
        setGlobalError(response.data?.message || 'Failed to get crop recommendations');
      }
    } catch (error) {
      console.error('Error getting crop recommendation:', error);
      setGlobalError('Failed to get crop recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePricePrediction = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});

    // Check authentication
    const token = localStorage.getItem('firebaseToken');
    if (!token) {
      setGlobalError('Please log in to use price predictions');
      return;
    }

    if (!validatePriceForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        cropType: priceForm.cropType,
        region: priceForm.region.trim(),
        predictionPeriod: priceForm.predictionPeriod,
        useGlobal: priceForm.useGlobal
      };

      console.log('💰 Submitting price prediction data:', submitData);

      const response = await recommendationsAPI.getPricePrediction(submitData);
      
      // FIXED: Proper response handling
      if (response.data && response.data.success) {
        console.log('✅ Price prediction success:', response.data);
        setPricePrediction(response.data);
      } else {
        console.error('❌ Price prediction failed:', response);
        setGlobalError(response.data?.message || 'Failed to get price prediction');
      }
    } catch (error) {
      console.error('Error getting price prediction:', error);
      setGlobalError('Failed to get price prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    const token = localStorage.getItem('firebaseToken');
    if (!token) {
      setGlobalError('Please log in to use agriculture chat');
      return;
    }

    if (!chatForm.question.trim()) return;

    const userMessage = {
      type: 'user',
      content: chatForm.question,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);
    setGlobalError('');

    try {
      const submitData = {
        question: chatForm.question.trim(),
        user_context: chatForm.user_context
      };

      console.log('💬 Submitting agriculture chat:', { question: chatForm.question.substring(0, 50) + '...' });

      const response = await recommendationsAPI.agricultureChat(submitData);
      
      // FIXED: Proper response handling
      if (response.data && response.data.success) {
        console.log('✅ Agriculture chat success');
        const aiMessage = {
          type: 'ai',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          suggested_follow_ups: response.data.suggested_follow_ups
        };

        setChatHistory(prev => [...prev, aiMessage]);
        setChatForm({ question: '', user_context: {} });
      } else {
        console.error('❌ Agriculture chat failed:', response);
        const errorMessage = {
          type: 'ai',
          content: response.data?.message || "I'm having trouble connecting right now. Please try again later.",
          timestamp: new Date().toISOString(),
          isError: true
        };
        setChatHistory(prev => [...prev, errorMessage]);
        setGlobalError(response.data?.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error in agriculture chat:', error);
      
      if (error.code === 'ECONNABORTED') {
        const timeoutMessage = {
          type: 'ai',
          content: "The request timed out. This might be due to high demand or network issues. Please try a simpler question or try again later.",
          timestamp: new Date().toISOString(),
          isError: true
        };
        setChatHistory(prev => [...prev, timeoutMessage]);
        setGlobalError('Request timed out. Please try again with a simpler question.');
      } else {
        const errorMessage = {
          type: 'ai',
          content: "I'm experiencing technical difficulties. Please try again in a few moments.",
          timestamp: new Date().toISOString(),
          isError: true
        };
        setChatHistory(prev => [...prev, errorMessage]);
        setGlobalError('Failed to get response. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpQuestion = (question) => {
    setChatForm(prev => ({ ...prev, question }));
  };

  const clearErrors = () => {
    setErrors({});
    setGlobalError('');
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? errors[fieldName][0] : '';
  };

  const getDemoCropRecommendation = () => {
    return {
      success: true,
      recommendations: [
        {
          crop: "Maize",
          confidence: 0.85,
          season: cropForm.season || "Rainy",
          soil_type: cropForm.soilType,
          water_requirements: "Moderate",
          yield_potential: "High",
          benefits: [
            "Good for crop rotation",
            "High market demand",
            "Suitable for your soil type"
          ],
          planting_guidelines: "Plant after last frost, maintain soil moisture"
        },
        {
          crop: "Beans",
          confidence: 0.78,
          season: cropForm.season || "Rainy",
          soil_type: cropForm.soilType,
          water_requirements: "Low to Moderate",
          yield_potential: "Medium",
          benefits: [
            "Nitrogen fixing for soil",
            "Quick harvest cycle",
            "Good companion crop"
          ],
          planting_guidelines: "Plant in well-drained soil, provide support for climbing varieties"
        }
      ],
      ai_analysis: "Based on your soil conditions and climate, these crops show good compatibility. Consider crop rotation for soil health.",
      next_steps: {
        immediate_actions: [
          "Test soil nutrients",
          "Prepare planting area",
          "Source quality seeds"
        ],
        short_term_planning: [
          "Schedule planting dates",
          "Plan irrigation",
          "Arrange labor"
        ],
        long_term_considerations: [
          "Crop rotation schedule",
          "Soil improvement plan",
          "Market access planning"
        ]
      },
      is_demo: true
    };
  };

  const getDemoPricePrediction = () => {
    return {
      success: true,
      crop: priceForm.cropType,
      prediction_period: priceForm.predictionPeriod,
      predicted_price: 28.75,
      confidence: 0.82,
      trend: "up",
      predictions: [
        { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), predicted_price: 27.25 },
        { date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), predicted_price: 28.75 },
        { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), predicted_price: 30.50 }
      ],
      is_demo: true
    };
  };

  const runDiagnostics = async () => {
    console.log('🔧 Running diagnostics...');
    await debugAPI();
    await checkNetworkStatus();
  };

  // Determine if we should show online status
  const isAIOnline = networkStatus?.gemini_available && networkStatus?.network_connectivity;
  const showDemoMode = !isAIOnline;

  return (
    <div className="recommendations">
      <div className="recommendations__header">
        <h1>AI Agriculture Assistant</h1>
        <div className="header-actions">
          <Button 
            size="small" 
            variant="outline" 
            onClick={runDiagnostics}
            title="Run Diagnostics"
          >
            🔧
          </Button>
          {networkStatus && (
            <div className="network-status">
              <span className={`status-indicator ${isAIOnline ? 'online' : 'offline'}`}>
                {isAIOnline ? '🟢 AI Online' : '🔴 AI Offline'}
              </span>
              {networkStatus.error && (
                <span className="error-message">({networkStatus.error})</span>
              )}
              {showDemoMode && (
                <span className="demo-mode">(Using Demo Mode)</span>
              )}
              {networkStatus.note && (
                <span className="status-note">({networkStatus.note})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {globalError && (
        <Card className="alert-error" style={{ marginBottom: '16px', background: '#ffebee', borderColor: '#f44336' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{globalError}</span>
            <Button size="small" variant="text" onClick={clearErrors}>×</Button>
          </div>
        </Card>
      )}

      {showDemoMode && !globalError && (
        <Card className="alert-info" style={{ marginBottom: '16px', background: '#e3f2fd', borderColor: '#2196f3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <strong>Demo Mode:</strong> Using sample data. AI features will work with realistic examples.
            </span>
          </div>
        </Card>
      )}

      <Tabs
        tabs={[
          { id: 'crop', label: 'Crop Recommendations' },
          { id: 'price', label: 'Price Predictions' },
          { id: 'chat', label: 'AI Assistant' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="recommendations__content">
        {activeTab === 'crop' && (
          <div className="crop-recommendations">
            <Card title="Get AI-Powered Crop Recommendations">
              <form onSubmit={handleCropRecommendation} className="crop-form">
                <div className="form-grid">
                  <Select
                    label="Soil Type"
                    options={soilTypes}
                    value={cropForm.soilType}
                    onChange={(e) => setCropForm(prev => ({ ...prev, soilType: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Soil pH"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={cropForm.ph}
                    onChange={(e) => setCropForm(prev => ({ ...prev, ph: e.target.value }))}
                    error={getFieldError('ph')}
                    required
                  />
                  
                  <Input
                    label="Temperature (°C)"
                    type="number"
                    step="0.1"
                    min="-50"
                    max="60"
                    value={cropForm.temperature}
                    onChange={(e) => setCropForm(prev => ({ ...prev, temperature: e.target.value }))}
                    error={getFieldError('temperature')}
                    required
                  />
                  
                  <Input
                    label="Rainfall (mm/year)"
                    type="number"
                    step="1"
                    min="0"
                    value={cropForm.rainfall}
                    onChange={(e) => setCropForm(prev => ({ ...prev, rainfall: e.target.value }))}
                    error={getFieldError('rainfall')}
                    required
                  />
                  
                  <Input
                    label="Location/Region"
                    value={cropForm.location}
                    onChange={(e) => setCropForm(prev => ({ ...prev, location: e.target.value }))}
                    error={getFieldError('location')}
                    required
                  />
                  
                  <Select
                    label="Season"
                    options={seasons}
                    value={cropForm.season}
                    onChange={(e) => setCropForm(prev => ({ ...prev, season: e.target.value }))}
                    error={getFieldError('season')}
                    required
                  />
                </div>

                <div className="form-section">
                  <h4>Additional Information (Optional)</h4>
                  <div className="form-grid">
                    <Input
                      label="Farm Size (acres)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={cropForm.farmSize}
                      onChange={(e) => setCropForm(prev => ({ ...prev, farmSize: e.target.value }))}
                      error={getFieldError('farmSize')}
                    />
                    <Input
                      label="Previous Crops"
                      value={cropForm.previousCrops}
                      onChange={(e) => setCropForm(prev => ({ ...prev, previousCrops: e.target.value }))}
                      error={getFieldError('previousCrops')}
                    />
                    <Input
                      label="Nitrogen (mg/kg)"
                      type="number"
                      step="0.1"
                      min="0"
                      value={cropForm.nitrogen}
                      onChange={(e) => setCropForm(prev => ({ ...prev, nitrogen: e.target.value }))}
                      error={getFieldError('nitrogen')}
                    />
                    <Input
                      label="Phosphorus (mg/kg)"
                      type="number"
                      step="0.1"
                      min="0"
                      value={cropForm.phosphorus}
                      onChange={(e) => setCropForm(prev => ({ ...prev, phosphorus: e.target.value }))}
                      error={getFieldError('phosphorus')}
                    />
                    <Input
                      label="Potassium (mg/kg)"
                      type="number"
                      step="0.1"
                      min="0"
                      value={cropForm.potassium}
                      onChange={(e) => setCropForm(prev => ({ ...prev, potassium: e.target.value }))}
                      error={getFieldError('potassium')}
                    />
                    <Input
                      label="Humidity (%)"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={cropForm.humidity}
                      onChange={(e) => setCropForm(prev => ({ ...prev, humidity: e.target.value }))}
                      error={getFieldError('humidity')}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={loading}
                    disabled={!cropForm.location.trim() || !cropForm.season}
                  >
                    {showDemoMode ? 'Try Demo Data' : 'Get Recommendations'}
                  </Button>
                  {showDemoMode && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCropRecommendation(getDemoCropRecommendation())}
                    >
                      Quick Demo
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {cropRecommendation && cropRecommendation.success && (
              <div className="recommendation-results">
                <Card title={`AI Crop Recommendations ${cropRecommendation.is_demo ? '(Demo Data)' : ''}`}>
                  {cropRecommendation.is_demo && (
                    <Card className="alert-info" style={{ marginBottom: '16px', background: '#e3f2fd', borderColor: '#2196f3' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Showing demo data. AI service is currently unavailable.</span>
                      </div>
                    </Card>
                  )}
                  <div className="recommendations-list">
                    {cropRecommendation.recommendations?.map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <div className="crop-header">
                          <h3>{rec.crop}</h3>
                          <span className="confidence-score">
                            {((rec.confidence || 0.8) * 100).toFixed(1)}% match
                          </span>
                        </div>
                        
                        <div className="crop-details">
                          <p><strong>Season:</strong> {rec.season}</p>
                          <p><strong>Soil Type:</strong> {rec.soil_type}</p>
                          <p><strong>Water Needs:</strong> {rec.water_requirements}</p>
                          <p><strong>Yield Potential:</strong> {rec.yield_potential}</p>
                        </div>

                        <div className="crop-benefits">
                          <h4>Benefits:</h4>
                          <ul>
                            {rec.benefits?.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>

                        {rec.planting_guidelines && (
                          <div className="planting-guidelines">
                            <h4>Planting Guidelines:</h4>
                            <p>{rec.planting_guidelines}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {cropRecommendation.ai_analysis && (
                    <div className="ai-analysis">
                      <h4>AI Analysis</h4>
                      <div className="analysis-content">
                        {cropRecommendation.ai_analysis}
                      </div>
                    </div>
                  )}

                  {cropRecommendation.next_steps && (
                    <div className="next-steps">
                      <h4>Recommended Next Steps</h4>
                      <div className="steps-grid">
                        <div className="step-category">
                          <h5>Immediate Actions</h5>
                          <ul>
                            {cropRecommendation.next_steps.immediate_actions?.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="step-category">
                          <h5>Short-term Planning</h5>
                          <ul>
                            {cropRecommendation.next_steps.short_term_planning?.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="step-category">
                          <h5>Long-term Considerations</h5>
                          <ul>
                            {cropRecommendation.next_steps.long_term_considerations?.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'price' && (
          <div className="price-predictions">
            <Card title="AI Price Predictions">
              <form onSubmit={handlePricePrediction} className="price-form">
                <div className="form-grid">
                  <Select
                    label="Crop Type"
                    options={[
                      { value: '', label: 'Select Crop Type' },
                      { value: 'Maize', label: 'Maize' },
                      { value: 'Rice', label: 'Rice' },
                      { value: 'Beans', label: 'Beans' },
                      { value: 'Cassava', label: 'Cassava' },
                      { value: 'Wheat', label: 'Wheat' },
                      { value: 'Tomatoes', label: 'Tomatoes' },
                      { value: 'Potatoes', label: 'Potatoes' }
                    ]}
                    value={priceForm.cropType}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, cropType: e.target.value }))}
                    error={getFieldError('cropType')}
                    required
                  />
                  
                  <Input
                    label="Region/Market"
                    value={priceForm.region}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, region: e.target.value }))}
                    error={getFieldError('region')}
                    required
                  />
                  
                  <Select
                    label="Prediction Period"
                    options={[
                      { value: '1 Week', label: '1 Week' },
                      { value: '1 Month', label: '1 Month' },
                      { value: '3 Months', label: '3 Months' },
                      { value: '6 Months', label: '6 Months' },
                      { value: '1 Year', label: '1 Year' }
                    ]}
                    value={priceForm.predictionPeriod}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, predictionPeriod: e.target.value }))}
                  />
                </div>

                <div className="form-actions">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={loading}
                    disabled={!priceForm.region.trim() || !priceForm.cropType}
                  >
                    {showDemoMode ? 'Try Demo Data' : 'Get Price Prediction'}
                  </Button>
                  {showDemoMode && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setPricePrediction(getDemoPricePrediction())}
                    >
                      Quick Demo
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {pricePrediction && pricePrediction.success && (
              <Card title={`Price Prediction Results ${pricePrediction.is_demo ? '(Demo Data)' : ''}`}>
                {pricePrediction.is_demo && (
                  <Card className="alert-info" style={{ marginBottom: '16px', background: '#e3f2fd', borderColor: '#2196f3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Showing demo data. AI service is currently unavailable.</span>
                    </div>
                  </Card>
                )}
                <div className="prediction-results">
                  <div className="prediction-header">
                    <h3>{pricePrediction.crop}</h3>
                    <span className="prediction-period">{pricePrediction.prediction_period}</span>
                  </div>
                  
                  <div className="prediction-metrics">
                    <div className="metric-card">
                      <div className="metric-value">${pricePrediction.predicted_price}</div>
                      <div className="metric-label">Predicted Price</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{((pricePrediction.confidence || 0.8) * 100).toFixed(1)}%</div>
                      <div className="metric-label">Confidence</div>
                    </div>
                    <div className="metric-card">
                      <div className={`metric-value trend-${pricePrediction.trend}`}>
                        {pricePrediction.trend}
                      </div>
                      <div className="metric-label">Market Trend</div>
                    </div>
                  </div>

                  {pricePrediction.predictions && pricePrediction.predictions.length > 0 && (
                    <div className="future-predictions">
                      <h4>Future Price Projections</h4>
                      <div className="predictions-chart">
                        {pricePrediction.predictions.slice(0, 7).map((pred, index) => (
                          <div key={index} className="prediction-day">
                            <div className="prediction-date">
                              {new Date(pred.date).toLocaleDateString()}
                            </div>
                            <div className="prediction-price">
                              ${pred.predicted_price}
                            </div>
                            <div className="prediction-bar">
                              <div 
                                className="bar-fill"
                                style={{ 
                                  height: `${(pred.predicted_price / pricePrediction.predicted_price) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prediction-insights">
                    <h4>Market Insights</h4>
                    <div className="insights-grid">
                      <div className="insight-item">
                        <span className="insight-label">Best Time to Buy/Sell:</span>
                        <span className="insight-value">Based on current trends</span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-label">Risk Level:</span>
                        <span className="insight-value risk-medium">Medium</span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-label">Recommendation:</span>
                        <span className="insight-value">
                          {pricePrediction.trend === 'up' ? 'Consider selling later' : 'Good time to buy'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="agriculture-chat">
            <Card title="AI Agriculture Assistant" className="chat-card">
              <div className="chat-container">
                <div className="chat-messages">
                  {chatHistory.length === 0 ? (
                    <div className="welcome-message">
                      <h3>Hello! I'm your AI Agriculture Assistant 🌱</h3>
                      <p>Ask me anything about farming, crops, soil management, pest control, or market prices.</p>
                      {showDemoMode && (
                        <div className="demo-notice">
                          <p><strong>Demo Mode:</strong> Using sample responses. Real AI features will be available when online.</p>
                        </div>
                      )}
                      <div className="suggested-questions">
                        <h4>Try asking:</h4>
                        <ul>
                          <li>What's the best fertilizer for tomatoes?</li>
                          <li>How do I control pests organically?</li>
                          <li>When should I plant maize in my region?</li>
                          <li>What are the current market prices for beans?</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((message, index) => (
                      <div key={index} className={`chat-message ${message.type}`}>
                        <div className="message-content">
                          {message.content}
                        </div>
                        {message.suggested_follow_ups && message.suggested_follow_ups.length > 0 && (
                          <div className="suggested-follow-ups">
                            <h5>Suggested follow-ups:</h5>
                            <ul>
                              {message.suggested_follow_ups.map((q, i) => (
                                <li key={i}>
                                  <Button
                                    size="small"
                                    variant="outline"
                                    onClick={() => handleFollowUpQuestion(q)}
                                  >
                                    {q}
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {message.isError && (
                          <div className="error-message" style={{ color: '#f44336', marginTop: '8px' }}>
                            Error
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleChatSubmit} className="chat-input-form">
                  <TextArea
                    placeholder="Type your question..."
                    value={chatForm.question}
                    onChange={e => setChatForm(prev => ({ ...prev, question: e.target.value }))}
                    rows={2}
                    required
                  />
                  <div className="chat-actions">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      disabled={!chatForm.question.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
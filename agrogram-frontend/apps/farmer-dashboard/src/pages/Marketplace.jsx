// Marketplace.jsx
import React, { useState, useEffect } from 'react';
import { marketplaceAPI, tasksAPI, productsAPI, apiUtils, messagingAPI } from '@agro-gram/api';
import { Card, Button, LoadingSpinner, Input, Select, Modal, Tabs, TextArea, Alert } from '@agro-gram/ui';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    price_min: '',
    price_max: '',
    quality: '',
    location: ''
  });
  
  // New states for sell product and tasks
  const [showSellProductModal, setShowSellProductModal] = useState(false);
  const [sellProductLoading, setSellProductLoading] = useState(false);
  const [sellProductForm, setSellProductForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'KG',
    quality_grade: 'STANDARD',
    location: '',
    image: null
  });
  
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: 'OTHER',
    priority: 'MEDIUM',
    due_date: '',
    estimated_hours: 1
  });

  // Existing states
  const [showPricePrediction, setShowPricePrediction] = useState(false);
  const [pricePrediction, setPricePrediction] = useState(null);
  const [predictionForm, setPredictionForm] = useState({
    cropType: '',
    market: '',
    predictionPeriod: '1 Month',
    useGlobal: false
  });
  const [activeTab, setActiveTab] = useState('browse');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [predictionError, setPredictionError] = useState('');
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);

  // New states for product details and contact
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showContactSeller, setShowContactSeller] = useState(false);
  const [contactForm, setContactForm] = useState({
    message: '',
    quantity: 1
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketplaceData();
    fetchCategories();
  }, []);

  // Load tasks when tasks tab is active
  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab]);

  // Load personalized recommendations when tab is activated
  useEffect(() => {
    if (activeTab === 'personalized' && personalizedProducts.length === 0) {
      handleRefreshRecommendations();
    }
  }, [activeTab]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showSellProductModal) {
      // Try to fetch categories when modal opens
      if (categories.length === 0) {
        fetchCategories();
      }
    }
  }, [showSellProductModal]);

  const fetchCategories = async () => {
    try {
      console.log('📋 Fetching categories from API...');
      const result = await marketplaceAPI.getCategories();
      
      if (result.success && result.data) {
        const categoriesData = Array.isArray(result.data) ? result.data : result.data.categories || [];
        
        const categoryOptions = categoriesData.map(cat => ({
          value: cat.id ? cat.id.toString() : cat.value,
          label: cat.name || cat.label
        }));
        
        console.log('✅ Categories loaded:', categoryOptions);
        setCategories(categoryOptions);
      } else {
        console.warn('⚠️ Categories API failed, extracting from products');
        extractCategoriesFromProducts();
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      extractCategoriesFromProducts();
    }
  };

  const extractCategoriesFromProducts = () => {
    try {
      const productData = products || [];
      const categoryMap = new Map();
      
      console.log('Extracting categories from products:', productData.length);
      
      productData.forEach(product => {
        // Handle different category formats
        if (product.category && typeof product.category === 'object') {
          // Category is an object with id and name
          if (product.category.id && product.category.name) {
            categoryMap.set(product.category.id.toString(), product.category.name);
          }
        } else if (product.category_name) {
          // Use category_name as fallback
          const categoryId = product.category_name.toLowerCase().replace(/\s+/g, '_');
          categoryMap.set(categoryId, product.category_name);
        }
      });
      
      // Add some default categories if none found
      if (categoryMap.size === 0) {
        console.log('No categories found in products, adding defaults');
        const defaultCategories = [
          { id: '1', name: 'Grains' },
          { id: '2', name: 'Vegetables' },
          { id: '3', name: 'Fruits' },
          { id: '4', name: 'Livestock' },
          { id: '5', name: 'Dairy' }
        ];
        
        defaultCategories.forEach(cat => {
          categoryMap.set(cat.id, cat.name);
        });
      }
      
      const categoryOptions = Array.from(categoryMap.entries()).map(([id, name]) => ({
        value: id,
        label: name
      }));
      
      console.log('Categories extracted:', categoryOptions);
      setCategories(categoryOptions);
      
    } catch (error) {
      console.error('Error extracting categories:', error);
      // Set default categories as fallback
      const defaultCategories = [
        { value: '1', label: 'Grains' },
        { value: '2', label: 'Vegetables' },
        { value: '3', label: 'Fruits' },
        { value: '4', label: 'Livestock' },
        { value: '5', label: 'Dairy' }
      ];
      setCategories(defaultCategories);
    }
  };

  const fetchMarketplaceData = async () => {
    setLoading(true);
    setError('');
    try {
      // Only fetch products, skip analytics if it's failing
      const productsResult = await marketplaceAPI.getProducts();

      if (productsResult.success) {
        const productData = productsResult.data.results || productsResult.data || [];
        setProducts(productData);
        
        // Extract categories from products if API failed
        if (categories.length === 0) {
          extractCategoriesFromProducts();
        }
      } else {
        setError(productsResult.message || 'Failed to load products');
      }

      // Try to fetch analytics but don't fail if it errors
      try {
        const analyticsResult = await marketplaceAPI.getMarketAnalytics();
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.data.analytics || analyticsResult.data);
        } else {
          console.warn('Analytics API failed, continuing without analytics');
        }
      } catch (analyticsError) {
        console.warn('Analytics unavailable:', analyticsError.message);
        // Continue without analytics - it's not critical
      }

    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      setError('Failed to load marketplace data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks function
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const result = await tasksAPI.getAll();
      if (result.success) {
        setTasks(result.data.tasks || result.data || []);
      } else {
        setError(result.message || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  // Sell Product function - FIXED
  const handleSellProduct = async (e) => {
    e.preventDefault();
    setSellProductLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!sellProductForm.title?.trim() || 
          !sellProductForm.price || 
          !sellProductForm.quantity || 
          !sellProductForm.category) {
        setError('Please fill in all required fields (Title, Price, Quantity, Category)');
        setSellProductLoading(false);
        return;
      }

      // Prepare form data with proper types and validation
      const formData = new FormData();
      
      // Required fields
      formData.append('title', sellProductForm.title.trim());
      formData.append('description', sellProductForm.description?.trim() || 'No description provided');
      formData.append('category', sellProductForm.category); // This should be the category ID
      formData.append('price', parseFloat(sellProductForm.price));
      formData.append('quantity', parseInt(sellProductForm.quantity));
      
      // Optional fields with defaults
      formData.append('unit', sellProductForm.unit || 'KG');
      formData.append('quality_grade', sellProductForm.quality_grade || 'STANDARD');
      
      if (sellProductForm.location?.trim()) {
        formData.append('location', sellProductForm.location.trim());
      }
      
      if (sellProductForm.image) {
        formData.append('image', sellProductForm.image);
      }

      console.log('📦 Creating product with data:');
      console.log('   Title:', sellProductForm.title);
      console.log('   Category:', sellProductForm.category);
      console.log('   Price:', sellProductForm.price);
      console.log('   Quantity:', sellProductForm.quantity);

      // Debug FormData contents
      console.log('🔍 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`   ${key}:`, value);
      }

      const result = await productsAPI.create(formData);
      
      if (result.success) {
        setShowSellProductModal(false);
        setSellProductForm({
          title: '',
          description: '',
          category: '',
          price: '',
          quantity: '',
          unit: 'KG',
          quality_grade: 'STANDARD',
          location: '',
          image: null
        });
        
        // Refresh products list
        fetchMarketplaceData();
        
        // Show success message
        setSuccess('Product listed successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        // Handle validation errors
        if (result.details) {
          const errorMessages = Object.values(result.details).flat().join(', ');
          setError(errorMessages || result.message || 'Failed to list product');
        } else {
          setError(result.message || 'Failed to list product');
        }
      }
    } catch (error) {
      console.error('Error selling product:', error);
      setError('Failed to list product. Please try again.');
    } finally {
      setSellProductLoading(false);
    }
  };

  // Create Task function
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!taskForm.title) {
        setError('Task title is required');
        return;
      }

      const result = await tasksAPI.create(taskForm);
      
      if (result.success) {
        setShowTaskModal(false);
        setTaskForm({
          title: '',
          description: '',
          task_type: 'OTHER',
          priority: 'MEDIUM',
          due_date: '',
          estimated_hours: 1
        });
        
        // Refresh tasks list
        fetchTasks();
        
        setSuccess('Task created successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
  };

  // Complete Task function
  const handleCompleteTask = async (taskId) => {
    try {
      const result = await tasksAPI.complete(taskId);
      if (result.success) {
        // Refresh tasks list
        fetchTasks();
        setSuccess('Task marked as completed!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    }
  };

  // Delete Task function
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const result = await tasksAPI.delete(taskId);
      if (result.success) {
        // Refresh tasks list
        fetchTasks();
        setSuccess('Task deleted successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = apiUtils.validateFile(file);
      if (validation.valid) {
        setSellProductForm(prev => ({ ...prev, image: file }));
      } else {
        setError(validation.errors[0]);
      }
    }
  };

  // Search function
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setError('');

    try {
      const result = await marketplaceAPI.searchProducts(searchQuery, filters);
      
      if (result.success) {
        setProducts(result.data.search_results || result.data || []);
      } else {
        setError(result.message || 'Search failed');
        // Fallback to local filtering
        filterProductsLocally();
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Search failed. Using basic filtering.');
      filterProductsLocally();
    } finally {
      setSearchLoading(false);
    }
  };

  const filterProductsLocally = () => {
    const filtered = products.filter(product => {
      if (filters.category) {
        const productCategory = getProductCategoryName(product);
        if (productCategory !== filters.category) return false;
      }
      if (filters.price_min && product.price < parseFloat(filters.price_min)) return false;
      if (filters.price_max && product.price > parseFloat(filters.price_max)) return false;
      if (filters.quality && product.quality_grade !== filters.quality) return false;
      if (filters.location && !product.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (searchQuery && !product.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    setProducts(filtered);
  };

  // Helper function to get category name from product
  const getProductCategoryName = (product) => {
    if (typeof product.category === 'object' && product.category.name) {
      return product.category.name;
    }
    return product.category_name || '';
  };

  const handleRefreshRecommendations = async () => {
    setRecommendationsLoading(true);
    setError('');

    try {
      const result = await marketplaceAPI.getPersonalizedProducts();
      
      if (result.success) {
        setPersonalizedProducts(result.data.personalized_recommendations || []);
      } else {
        setError(result.message || 'Failed to refresh recommendations');
        // Fallback: use regular products
        setPersonalizedProducts(products.slice(0, 10));
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      setError('Failed to refresh recommendations. Showing general products.');
      setPersonalizedProducts(products.slice(0, 10));
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handlePricePrediction = async (e) => {
    e.preventDefault();
    setPredictionLoading(true);
    setPredictionError('');
    setPricePrediction(null);

    try {
      const result = await marketplaceAPI.getPricePrediction(predictionForm);
      
      if (result.success) {
        setPricePrediction(result.data);
      } else {
        setPredictionError(result.message || 'Failed to get price prediction');
      }
    } catch (error) {
      console.error('Error getting price prediction:', error);
      setPredictionError('Failed to get price prediction. Please try again.');
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      price_min: '',
      price_max: '',
      quality: '',
      location: ''
    });
    setSearchQuery('');
    setError('');
    fetchMarketplaceData();
  };

  const handleClosePricePrediction = () => {
    setShowPricePrediction(false);
    setPricePrediction(null);
    setPredictionError('');
    setPredictionForm({
      cropType: '',
      market: '',
      predictionPeriod: '1 Month',
      useGlobal: false
    });
  };

  // Helper function to check if current user owns the product
  const isCurrentUserProductOwner = (product) => {
    try {
      const auth = window.getAuth ? window.getAuth() : null;
      const currentUser = auth?.currentUser;
      
      // If we can't determine the current user, assume they don't own it
      if (!currentUser || !product.farmer_email) {
        return false;
      }
      
      return currentUser.email === product.farmer_email;
    } catch (error) {
      console.error('Error checking product ownership:', error);
      return false;
    }
  };

  // Authentication check function - IMPROVED
  const checkAuthentication = async () => {
    try {
      // Multiple ways to get auth instance
      let auth = null;
      
      if (typeof window.getAuth === 'function') {
        auth = window.getAuth();
      } else if (window.auth) {
        auth = window.auth;
      } else if (window.firebase && window.firebase.auth) {
        auth = window.firebase.auth();
      }
      
      const user = auth?.currentUser;
      
      if (user) {
        console.log('✅ User is authenticated:', user.email);
        
        // Ensure token is fresh
        try {
          const token = await user.getIdToken(true);
          localStorage.setItem('firebaseToken', token);
          console.log('✅ Token refreshed and stored');
        } catch (tokenError) {
          console.warn('⚠️ Could not refresh token, using existing one');
        }
        
        return true;
      } else {
        console.warn('❌ User is not authenticated');
        
        // Check if we have a stored token as fallback
        const storedToken = localStorage.getItem('firebaseToken');
        if (storedToken) {
          console.log('🔄 Using stored token from localStorage');
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };

  // NEW: Handle View Details
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // NEW: Handle Contact Seller with ownership check
  const handleContactSeller = async (product) => {
    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      setError('Please log in to contact sellers');
      return;
    }

    // Check if current user is the product owner
    if (isCurrentUserProductOwner(product)) {
      setError('You cannot message yourself. This is your own product listing.');
      return;
    }
    
    // If authenticated and not the owner, proceed with contact form
    setSelectedProduct(product);
    setContactForm({
      message: `Hi, I'm interested in your "${product.title}" listed for $${product.price}. Could you provide more details?`,
      quantity: 1
    });
    setShowContactSeller(true);
  };

  // NEW: Send message to seller with real API - FIXED
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!contactForm.message.trim()) {
      setError('Please enter a message');
      return;
    }

    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      setError('Please log in to send messages');
      return;
    }

    // Check if user is trying to message themselves
    if (isCurrentUserProductOwner(selectedProduct)) {
      setError('You cannot message yourself. This is your own product listing.');
      return;
    }

    try {
      // Prepare message data for messaging API
      const messageData = {
        product_id: selectedProduct.id,
        message: contactForm.message,
        quantity: contactForm.quantity,
        message_type: 'INQUIRY'
      };

      console.log('📧 Sending message to seller:', messageData);

      // Send message via messaging API
      const result = await messagingAPI.sendMessage(messageData);
      
      if (result.success) {
        setShowContactSeller(false);
        setSuccess(`Message sent to ${selectedProduct.farmer_email || 'the seller'}!`);
        setTimeout(() => setSuccess(''), 5000);
        
        // Reset form
        setContactForm({
          message: '',
          quantity: 1
        });
      } else {
        setError(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // More specific error messages
      if (error.response?.status === 400 && error.response?.data?.error === 'You cannot message yourself') {
        setError('You cannot message yourself. This is your own product listing.');
      } else if (error.response?.status === 403) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to send message. Please try again.');
      }
    }
  };

  // NEW: Create order for product - FIXED
  const handleCreateOrder = async () => {
    if (!selectedProduct) return;

    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      setError('Please log in to create orders');
      return;
    }

    try {
      const orderData = {
        product: selectedProduct.id,
        quantity: contactForm.quantity,
        total_price: (selectedProduct.price * contactForm.quantity).toFixed(2),
        shipping_address: 'To be provided', // In real app, get from user profile
        contact_number: 'To be provided'    // In real app, get from user profile
      };

      console.log('🛒 Creating order:', orderData);

      const result = await marketplaceAPI.createOrder(orderData);
      
      if (result.success) {
        setShowContactSeller(false);
        setSuccess(`Order created successfully for ${selectedProduct.title}!`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    }
  };

  // Filter products for display
  const filteredProducts = products.filter(product => {
    if (filters.category) {
      const productCategory = getProductCategoryName(product);
      if (productCategory !== filters.category) return false;
    }
    if (filters.price_min && product.price < parseFloat(filters.price_min)) return false;
    if (filters.price_max && product.price > parseFloat(filters.price_max)) return false;
    if (filters.quality && product.quality_grade !== filters.quality) return false;
    if (filters.location && !product.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (searchQuery && !product.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  // Add this state
const [unreadMessages, setUnreadMessages] = useState(0);

// Add this useEffect to check for unread messages
useEffect(() => {
  checkUnreadMessages();
}, []);

const checkUnreadMessages = async () => {
  try {
    const result = await messagingAPI.getNotifications();
    if (result.success) {
      setUnreadMessages(result.data.unread_count || 0);
    }
  } catch (error) {
    console.error('Error checking messages:', error);
  }
};
const [pendingOrders, setPendingOrders] = useState(0);

// Fetch pending orders (for sellers)
useEffect(() => {
  const fetchPendingOrders = async () => {
    try {
      const ordersResult = await marketplaceAPI.getOrders();
      if (ordersResult.success) {
        const orders = ordersResult.data.results || ordersResult.data || [];
        const pending = orders.filter(order => 
          order.seller_type === 'USER' && order.status === 'PENDING'
        ).length;
        setPendingOrders(pending);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  fetchPendingOrders();
}, []);
  // Render product category name safely
  const renderProductCategory = (product) => {
    return getProductCategoryName(product) || 'Unknown Category';
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
        <p>Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="marketplace">
      <div className="marketplace__header">
        <h1>Agricultural Marketplace</h1>
        <div className="marketplace__actions">
          <Button variant="outline" onClick={() => setShowPricePrediction(true)}>
            Price Predictions
          </Button>
          <Button variant="primary" onClick={() => setShowSellProductModal(true)}>
            Sell Product
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Tabs
        tabs={[
          { id: 'browse', label: 'Browse Products' },
          { id: 'analytics', label: 'Market Analytics' },
          { id: 'personalized', label: 'For You' },
          { id: 'tasks', label: 'My Tasks' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Browse Products Tab */}
      {activeTab === 'browse' && (
        <div className="marketplace__content">
          <Card className="search-filters">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-bar">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={searchLoading}
                >
                  Search
                </Button>
              </div>
              
              <div className="filters-grid">
                <Select
                  options={[{ value: '', label: 'All Categories' }, ...categories]}
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.price_min}
                  onChange={(e) => setFilters(prev => ({ ...prev, price_min: e.target.value }))}
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.price_max}
                  onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value }))}
                  min="0"
                  step="0.01"
                />
                <Select
                  options={[
                    { value: '', label: 'All Quality' },
                    { value: 'PREMIUM', label: 'Premium' },
                    { value: 'STANDARD', label: 'Standard' },
                    { value: 'ECONOMY', label: 'Economy' }
                  ]}
                  value={filters.quality}
                  onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </form>
          </Card>

          {searchLoading ? (
            <div className="loading-container">
              <LoadingSpinner size="medium" />
              <p>Searching products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <Card key={product.id} className="product-card">
                  <div className="product-card__image">
                    {product.image ? (
                      <img src={product.image} alt={product.title} />
                    ) : (
                      <div className="product-image-placeholder">🌱</div>
                    )}
                  </div>
                  
                  <div className="product-card__content">
                    <div className="product-header">
                      <h3>{product.title || 'Untitled Product'}</h3>
                      {product.quality_grade && (
                        <span className={`quality-badge quality-${product.quality_grade?.toLowerCase()}`}>
                          {product.quality_grade}
                        </span>
                      )}
                    </div>
                    
                    <div className="product-category">
                      <small>Category: {renderProductCategory(product)}</small>
                    </div>
                    
                    <p className="product-description">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="product-meta">
                      <span className="product-price">${product.price || 'N/A'}</span>
                      <span className="product-quantity">
                        {product.quantity || '0'} {product.unit || 'units'}
                      </span>
                      <span className="product-location">
                        {product.location || 'Location not specified'}
                      </span>
                    </div>

                    <div className="product-seller">
                      <small>By: {product.farmer_email || 'Unknown seller'}</small>
                    </div>

                    {product.market_insights && (
                      <div className="market-insights">
                        {product.demand_level?.level && (
                          <div className={`demand-badge demand-${product.demand_level?.level?.toLowerCase()}`}>
                            {product.demand_level?.level} Demand
                          </div>
                        )}
                      </div>
                    )}

                    <div className="product-actions">
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => handleViewDetails(product)}
                      >
                        View Details
                      </Button>
                      {/* Only show Contact Seller button if user is not the product owner */}
                      {!isCurrentUserProductOwner(product) && (
                        <Button 
                          variant="primary" 
                          size="small"
                          onClick={() => handleContactSeller(product)}
                        >
                          Contact Seller
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !searchLoading && (
            <Card className="no-products">
              <div className="no-products-content">
                <h3>No products found</h3>
                <p>Try adjusting your search criteria or clear filters.</p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="marketplace__content">
          {!analytics ? (
            <Card>
              <div className="no-analytics">
                <h3>Analytics Unavailable</h3>
                <p>Market analytics are currently not available. Please try again later.</p>
                <Button variant="outline" onClick={fetchMarketplaceData}>
                  Retry
                </Button>
              </div>
            </Card>
          ) : (
            <div className="analytics-grid">
              <Card title="Market Overview">
                <div className="stats-row">
                  <div className="stat">
                    <h3>{analytics.total_products || 0}</h3>
                    <p>Total Products</p>
                  </div>
                  <div className="stat">
                    <h3>{analytics.active_products || 0}</h3>
                    <p>Active Listings</p>
                  </div>
                  <div className="stat">
                    <h3>{analytics.total_orders || 0}</h3>
                    <p>Total Orders</p>
                  </div>
                  <div className="stat">
                    <h3>{((analytics.avg_demand_score || 0) * 100).toFixed(1)}%</h3>
                    <p>Avg Demand</p>
                  </div>
                </div>
              </Card>

              <Card title="Price Trends">
                <div className="trends-list">
                  {analytics.price_movements?.length > 0 ? (
                    analytics.price_movements.map((movement, index) => (
                      <div key={index} className="trend-item">
                        <span className="trend-product">{movement.title}</span>
                        <span className={`trend-value ${movement.price_trend > 0 ? 'trend-up' : 'trend-down'}`}>
                          {movement.price_trend > 0 ? '↗' : '↘'} {Math.abs(movement.price_trend)}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No price trend data available</p>
                  )}
                </div>
              </Card>

              <Card title="Popular Categories">
                <div className="categories-list">
                  {analytics.popular_categories?.length > 0 ? (
                    analytics.popular_categories.map((category, index) => (
                      <div key={index} className="category-item">
                        <span className="category-name">{category.category__name}</span>
                        <span className="category-count">{category.product_count} products</span>
                        <span className="category-demand">
                          {((category.avg_demand || 0) * 100).toFixed(1)}% demand
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No category data available</p>
                  )}
                </div>
              </Card>

              <Card title="Regional Insights">
                <div className="regions-list">
                  {analytics.regional_insights?.length > 0 ? (
                    analytics.regional_insights.map((region, index) => (
                      <div key={index} className="region-item">
                        <span className="region-name">{region.location}</span>
                        <span className="region-stats">
                          {region.product_count} products • ${region.avg_price}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No regional data available</p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Personalized Tab */}
      {activeTab === 'personalized' && (
        <div className="marketplace__content">
          <Card>
            <div className="personalized-content">
              <h3>Personalized Recommendations</h3>
              <p>Based on your preferences and browsing history</p>
              <Button 
                variant="primary" 
                onClick={handleRefreshRecommendations}
                loading={recommendationsLoading}
              >
                Refresh Recommendations
              </Button>
            </div>
          </Card>

          {recommendationsLoading ? (
            <div className="loading-container">
              <LoadingSpinner size="medium" />
              <p>Loading personalized recommendations...</p>
            </div>
          ) : (
            <div className="products-grid">
              {personalizedProducts.map(product => (
                <Card key={product.id} className="product-card">
                  <div className="product-card__image">
                    {product.image ? (
                      <img src={product.image} alt={product.title} />
                    ) : (
                      <div className="product-image-placeholder">🌱</div>
                    )}
                  </div>
                  
                  <div className="product-card__content">
                    <div className="product-header">
                      <h3>{product.title || 'Untitled Product'}</h3>
                      {product.quality_grade && (
                        <span className={`quality-badge quality-${product.quality_grade?.toLowerCase()}`}>
                          {product.quality_grade}
                        </span>
                      )}
                    </div>
                    
                    <div className="product-category">
                      <small>Category: {renderProductCategory(product)}</small>
                    </div>
                    
                    <p className="product-description">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="product-meta">
                      <span className="product-price">${product.price || 'N/A'}</span>
                      <span className="product-quantity">
                        {product.quantity || '0'} {product.unit || 'units'}
                      </span>
                      <span className="product-location">
                        {product.location || 'Location not specified'}
                      </span>
                    </div>

                    <div className="product-seller">
                      <small>By: {product.farmer_email || 'Unknown seller'}</small>
                    </div>

                    <div className="recommendation-badge">
                      <span className="badge">Recommended for you</span>
                    </div>

                    <div className="product-actions">
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => handleViewDetails(product)}
                      >
                        View Details
                      </Button>
                      {/* Only show Contact Seller button if user is not the product owner */}
                      {!isCurrentUserProductOwner(product) && (
                        <Button 
                          variant="primary" 
                          size="small"
                          onClick={() => handleContactSeller(product)}
                        >
                          Contact Seller
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {personalizedProducts.length === 0 && !recommendationsLoading && (
            <Card className="no-products">
              <div className="no-products-content">
                <h3>No personalized recommendations yet</h3>
                <p>Refresh recommendations or browse more products to get personalized suggestions.</p>
                <Button variant="outline" onClick={handleRefreshRecommendations}>
                  Refresh Recommendations
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="marketplace__content">
          <Card>
            <div className="tasks-header">
              <h3>My Tasks</h3>
              <Button variant="primary" onClick={() => setShowTaskModal(true)}>
                Add New Task
              </Button>
            </div>
          </Card>

          {tasksLoading ? (
            <div className="loading-container">
              <LoadingSpinner size="medium" />
              <p>Loading tasks...</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <Card key={task.id} className="task-card">
                  <div className="task-content">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    
                    <div className="task-meta">
                      <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                        {task.status}
                      </span>
                      {task.due_date && (
                        <span className="due-date">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.completed_at && (
                        <span className="completed-date">
                          Completed: {new Date(task.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="task-actions">
                      {task.status !== 'COMPLETED' && (
                        <Button 
                          variant="outline" 
                          size="small"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button 
                        variant="text" 
                        size="small"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tasks.length === 0 && !tasksLoading && (
            <Card className="no-tasks">
              <div className="no-tasks-content">
                <h3>No tasks yet</h3>
                <p>Create your first task to get started with managing your agricultural activities.</p>
                <Button variant="primary" onClick={() => setShowTaskModal(true)}>
                  Create Your First Task
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Sell Product Modal */}
      <Modal
        isOpen={showSellProductModal}
        onClose={() => setShowSellProductModal(false)}
        title="Sell Your Product"
        size="large"
      >
        <form onSubmit={handleSellProduct} className="sell-product-form">
          <div className="form-row">
            <Input
              label="Product Title *"
              value={sellProductForm.title}
              onChange={(e) => setSellProductForm(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Select
              label="Category *"
              options={[
                { value: '', label: 'Select Category' },
                ...categories
              ]}
              value={sellProductForm.category}
              onChange={(e) => setSellProductForm(prev => ({ ...prev, category: e.target.value }))}
              required
            />
          </div>

          <TextArea
            label="Description *"
            value={sellProductForm.description}
            onChange={(e) => setSellProductForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            required
          />

          <div className="form-row">
            <Input
              label="Price *"
              type="number"
              step="0.01"
              min="0.01"
              value={sellProductForm.price}
              onChange={(e) => setSellProductForm(prev => ({ ...prev, price: e.target.value }))}
              required
            />
            <Input
              label="Quantity *"
              type="number"
              min="1"
              value={sellProductForm.quantity}
              onChange={(e) => setSellProductForm(prev => ({ ...prev, quantity: e.target.value }))}
              required
            />
            <Select
              label="Unit"
              options={[
                { value: 'KG', label: 'Kilogram' },
                { value: 'LB', label: 'Pound' },
                { value: 'TON', label: 'Ton' },
                { value: 'SACK', label: 'Sack' },
                { value: 'PIECE', label: 'Piece' }
              ]}
              value={sellProductForm.unit}
              onChange={(e) => setSellProductForm(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <Select
              label="Quality Grade"
              options={[
                { value: 'PREMIUM', label: 'Premium' },
                { value: 'STANDARD', label: 'Standard' },
                { value: 'ECONOMY', label: 'Economy' }
              ]}
              value={sellProductForm.quality_grade}
              onChange={(e) => setSellProductForm(prev => ({ ...prev, quality_grade: e.target.value }))}
            />
            <Input
              label="Location"
              value={sellProductForm.location}
              onChange={(e) => setSellProductForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Nairobi, Kenya"
            />
          </div>

          <div className="form-row">
            <Input
              label="Product Image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {sellProductForm.image && (
              <div className="image-preview">
                <img 
                  src={URL.createObjectURL(sellProductForm.image)} 
                  alt="Preview" 
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary" 
              loading={sellProductLoading}
              disabled={!sellProductForm.title?.trim() || !sellProductForm.price || !sellProductForm.quantity || !sellProductForm.category}
            >
              List Product
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSellProductModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Create New Task"
        size="medium"
      >
        <form onSubmit={handleCreateTask} className="create-task-form">
          <Input
            label="Task Title *"
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <TextArea
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="Describe the task details..."
          />

          <div className="form-row">
            <Select
              label="Task Type"
              options={[
                { value: 'PLANTING', label: 'Planting' },
                { value: 'HARVESTING', label: 'Harvesting' },
                { value: 'IRRIGATION', label: 'Irrigation' },
                { value: 'FERTILIZATION', label: 'Fertilization' },
                { value: 'PEST_CONTROL', label: 'Pest Control' },
                { value: 'OTHER', label: 'Other' }
              ]}
              value={taskForm.task_type}
              onChange={(e) => setTaskForm(prev => ({ ...prev, task_type: e.target.value }))}
            />
            <Select
              label="Priority"
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' }
              ]}
              value={taskForm.priority}
              onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <Input
              label="Due Date"
              type="datetime-local"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
            />
            <Input
              label="Estimated Hours"
              type="number"
              min="1"
              max="1000"
              value={taskForm.estimated_hours}
              onChange={(e) => setTaskForm(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary"
              disabled={!taskForm.title}
            >
              Create Task
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowTaskModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Price Prediction Modal */}
      <Modal
        isOpen={showPricePrediction}
        onClose={handleClosePricePrediction}
        title="AI Price Prediction"
        size="large"
      >
        <div className="price-prediction-modal">
          {predictionError && (
            <Alert type="warning" onClose={() => setPredictionError('')}>
              {predictionError}
            </Alert>
          )}

          <form onSubmit={handlePricePrediction} className="prediction-form">
            <div className="form-row">
              <Select
                label="Crop Type *"
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
                value={predictionForm.cropType}
                onChange={(e) => setPredictionForm(prev => ({ ...prev, cropType: e.target.value }))}
                required
              />
              <Input
                label="Region/Market *"
                value={predictionForm.market}
                onChange={(e) => setPredictionForm(prev => ({ ...prev, market: e.target.value }))}
                required
              />
            </div>
            
            <Select
              label="Prediction Period"
              options={[
                { value: '1 Week', label: '1 Week' },
                { value: '1 Month', label: '1 Month' },
                { value: '3 Months', label: '3 Months' },
                { value: '6 Months', label: '6 Months' },
                { value: '1 Year', label: '1 Year' }
              ]}
              value={predictionForm.predictionPeriod}
              onChange={(e) => setPredictionForm(prev => ({ ...prev, predictionPeriod: e.target.value }))}
            />

            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary" 
                loading={predictionLoading}
                disabled={!predictionForm.cropType || !predictionForm.market}
              >
                Get Prediction
              </Button>
            </div>
          </form>

          {pricePrediction && (
            <div className="prediction-results">
              <h4>Price Prediction Results</h4>
              <div className="prediction-card">
                <div className="prediction-header">
                  <h3>{pricePrediction.crop}</h3>
                  <span className="prediction-region">{pricePrediction.region}</span>
                </div>
                
                <div className="prediction-metrics">
                  <div className="metric">
                    <label>Current Price</label>
                    <span className="price">${pricePrediction.current_price}</span>
                  </div>
                  <div className="metric">
                    <label>Predicted Price</label>
                    <span className="price predicted">${pricePrediction.predicted_price}</span>
                  </div>
                  <div className="metric">
                    <label>Confidence</label>
                    <span className="confidence">{((pricePrediction.confidence || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <label>Trend</label>
                    <span className={`trend trend-${pricePrediction.trend}`}>
                      {pricePrediction.trend}
                    </span>
                  </div>
                </div>

                {pricePrediction.price_range && (
                  <div className="price-range">
                    <h5>Price Range</h5>
                    <div className="range-bars">
                      <div className="range-min">${pricePrediction.price_range.min}</div>
                      <div className="range-avg">${pricePrediction.price_range.avg}</div>
                      <div className="range-max">${pricePrediction.price_range.max}</div>
                    </div>
                  </div>
                )}

                {pricePrediction.predictions && pricePrediction.predictions.length > 0 && (
                  <div className="future-predictions">
                    <h5>Future Predictions</h5>
                    <div className="predictions-list">
                      {pricePrediction.predictions.slice(0, 5).map((pred, index) => (
                        <div key={index} className="future-prediction">
                          <span>{pred.date}</span>
                          <span>${pred.predicted_price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* NEW: Product Details Modal */}
      <Modal
        isOpen={showProductDetails}
        onClose={() => setShowProductDetails(false)}
        title="Product Details"
        size="large"
      >
        {selectedProduct && (
          <div className="product-details">
            <div className="product-details__header">
              <div className="product-image">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.title} />
                ) : (
                  <div className="product-image-placeholder large">🌱</div>
                )}
              </div>
              <div className="product-info">
                <h2>{selectedProduct.title}</h2>
                <div className="product-meta">
                  <span className="product-price">${selectedProduct.price}</span>
                  <span className="product-quantity">
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </span>
                  <span className={`quality-badge quality-${selectedProduct.quality_grade?.toLowerCase()}`}>
                    {selectedProduct.quality_grade}
                  </span>
                </div>
                <div className="product-seller">
                  <strong>Seller:</strong> {selectedProduct.farmer_email || 'Unknown seller'}
                </div>
                <div className="product-location">
                  <strong>Location:</strong> {selectedProduct.location || 'Not specified'}
                </div>
                <div className="product-category">
                  <strong>Category:</strong> {renderProductCategory(selectedProduct)}
                </div>
              </div>
            </div>

            <div className="product-details__content">
              <h4>Description</h4>
              <p>{selectedProduct.description || 'No description available.'}</p>

              {selectedProduct.market_insights && (
                <div className="market-insights">
                  <h4>Market Insights</h4>
                  {selectedProduct.demand_level?.level && (
                    <div className="insight-item">
                      <strong>Demand:</strong> 
                      <span className={`demand-badge demand-${selectedProduct.demand_level?.level?.toLowerCase()}`}>
                        {selectedProduct.demand_level?.level}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="product-actions">
                {/* Only show Contact Seller button if user is not the product owner */}
                {!isCurrentUserProductOwner(selectedProduct) && (
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setShowProductDetails(false);
                      handleContactSeller(selectedProduct);
                    }}
                  >
                    Contact Seller
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowProductDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* NEW: Contact Seller Modal */}
      <Modal
        isOpen={showContactSeller}
        onClose={() => setShowContactSeller(false)}
        title={`Contact Seller - ${selectedProduct?.title}`}
        size="medium"
      >
        {selectedProduct && (
          <div className="contact-seller">
            <div className="seller-info">
              <p><strong>Product:</strong> {selectedProduct.title}</p>
              <p><strong>Price:</strong> ${selectedProduct.price} per {selectedProduct.unit}</p>
              <p><strong>Seller:</strong> {selectedProduct.farmer_email || 'Unknown seller'}</p>
            </div>

            <form onSubmit={handleSendMessage} className="contact-form">
              <div className="form-row">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  max={selectedProduct.quantity}
                  value={contactForm.quantity}
                  onChange={(e) => setContactForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
                <div className="total-price">
                  <strong>Total: </strong>
                  ${(selectedProduct.price * contactForm.quantity).toFixed(2)}
                </div>
              </div>

              <TextArea
                label="Message to Seller"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                placeholder="Type your message to the seller..."
                required
              />

              <div className="contact-actions">
                <Button type="submit" variant="primary">
                  Send Message
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCreateOrder}
                >
                  Create Order
                </Button>
                <Button 
                  type="button" 
                  variant="text"
                  onClick={() => setShowContactSeller(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Marketplace;
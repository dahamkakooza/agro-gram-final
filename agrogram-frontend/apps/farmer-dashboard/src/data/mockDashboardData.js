// src/data/mockDashboardData.js

// Mock data for all dashboards - for development and demo purposes

export const mockDashboardData = {
  // Financial Advisor Dashboard
  FINANCIAL_ADVISOR: {
    portfolio_stats: {
      total_loans: 2450000,
      active_loans: 45,
      default_rate: 2.3,
      recovery_rate: 85.7
    },
    loan_applications: [
      {
        id: 1,
        farmer_name: "John Kamau",
        amount: 50000,
        status: "Pending",
        application_date: "2024-01-15"
      },
      {
        id: 2,
        farmer_name: "Mary Wanjiku",
        amount: 75000,
        status: "Under Review",
        application_date: "2024-01-14"
      },
      {
        id: 3,
        farmer_name: "James Ochieng",
        amount: 120000,
        status: "Approved",
        application_date: "2024-01-12"
      }
    ],
    active_loans: [
      {
        id: 1,
        farmer_name: "Sarah Mwangi",
        remaining_balance: 35000,
        next_payment_date: "2024-02-01",
        status: "Current"
      },
      {
        id: 2,
        farmer_name: "David Kimani",
        remaining_balance: 68000,
        next_payment_date: "2024-02-05",
        status: "Current"
      }
    ],
    credit_scores: [
      {
        farmer_id: 1,
        farmer_name: "John Kamau",
        score: 85,
        risk_level: "Low"
      },
      {
        farmer_id: 2,
        farmer_name: "Mary Wanjiku",
        score: 72,
        risk_level: "Medium"
      },
      {
        farmer_id: 3,
        farmer_name: "James Ochieng",
        score: 91,
        risk_level: "Low"
      }
    ],
    collateral_valuations: [
      {
        id: 1,
        asset_type: "Farm Land",
        valuation: 500000,
        coverage: 80
      },
      {
        id: 2,
        asset_type: "Equipment",
        valuation: 150000,
        coverage: 65
      }
    ],
    financial_products: [
      {
        id: 1,
        name: "Seasonal Crop Loan",
        uptake_rate: 78,
        default_rate: 1.5,
        performance_rating: 4.8
      },
      {
        id: 2,
        name: "Equipment Financing",
        uptake_rate: 45,
        default_rate: 3.2,
        performance_rating: 4.2
      }
    ],
    farmer_success: [
      {
        id: 1,
        name: "Peter Maina",
        revenue_growth: 35,
        yield_increase: 28,
        impact_score: 8
      },
      {
        id: 2,
        name: "Grace Atieno",
        revenue_growth: 42,
        yield_increase: 31,
        impact_score: 9
      }
    ]
  },

  // Technical Advisor Dashboard
  TECHNICAL_ADVISOR: {
    active_cases: [
      {
        id: 1,
        farmer_name: "John Kamau",
        issue_type: "Pest Infestation",
        priority: "High",
        status: "In Progress",
        created_date: "2024-01-15"
      },
      {
        id: 2,
        farmer_name: "Mary Wanjiku",
        issue_type: "Soil Quality",
        priority: "Medium",
        status: "Pending",
        created_date: "2024-01-14"
      }
    ],
    case_stats: {
      total_cases: 156,
      high_priority: 12,
      awaiting_response: 8,
      resolved_today: 5
    },
    scheduled_visits: [
      {
        id: 1,
        date: "2024-01-20",
        farmer_name: "James Ochieng",
        purpose: "Crop Health Assessment"
      },
      {
        id: 2,
        date: "2024-01-22",
        farmer_name: "Sarah Mwangi",
        purpose: "Irrigation System Review"
      }
    ],
    knowledge_base: [
      {
        id: 1,
        title: "Tomato Blight Treatment",
        category: "Disease Management",
        effectiveness: 95
      },
      {
        id: 2,
        title: "Soil pH Balancing",
        category: "Soil Health",
        effectiveness: 88
      }
    ],
    recent_solutions: [
      {
        id: 1,
        title: "Maize Borer Control",
        category: "Pest Control",
        effectiveness: 92
      }
    ],
    best_practices: [
      {
        id: 1,
        name: "Crop Rotation",
        adoption_rate: 65
      },
      {
        id: 2,
        name: "Integrated Pest Management",
        adoption_rate: 45
      }
    ],
    yield_improvements: [
      {
        farmer_id: 1,
        farmer_name: "John Kamau",
        crop: "Maize",
        before_yield: 2.5,
        after_yield: 3.8,
        improvement: 52
      }
    ],
    cost_reduction: {
      total_savings: 125000,
      farmers_impacted: 45,
      avg_reduction: 18
    },
    latest_research: [
      {
        id: 1,
        title: "Climate Resilient Crop Varieties",
        source: "Agricultural Research Institute",
        publication_date: "2024-01-10"
      }
    ],
    training_materials: [
      {
        id: 1,
        type: "Video Tutorial",
        title: "Modern Irrigation Techniques",
        duration: "45 min"
      }
    ],
    advisory_performance: {
      success_rate: 92,
      avg_response_time: 2,
      farmer_satisfaction: 94
    }
  },

  // Legal Specialist Dashboard
  LEGAL_SPECIALIST: {
    legal_cases: [
      {
        id: 1,
        case_number: "LC-2024-001",
        client_name: "Green Valley Farms",
        case_type: "Contract Dispute",
        status: "Active",
        priority: "High"
      }
    ],
    case_stats: {
      active_cases: 23,
      urgent_cases: 5,
      success_rate: 85,
      avg_resolution_time: 45
    },
    regulatory_updates: [
      {
        id: 1,
        title: "New Organic Certification Requirements",
        effective_date: "2024-03-01",
        impact_level: "High"
      }
    ],
    audit_checklist: [
      {
        id: 1,
        name: "Compliance Documentation Review",
        completed: true,
        deadline: "2024-02-15"
      }
    ],
    audit_readiness: 75,
    legal_documents: [
      {
        id: 1,
        name: "Supplier Agreement Template",
        type: "Contract",
        last_modified: "2024-01-10"
      }
    ],
    contract_templates: [
      {
        id: 1,
        name: "Standard Farm Lease Agreement",
        usage_count: 45
      }
    ],
    case_documents: [
      {
        id: 1,
        case_name: "Land Boundary Dispute",
        type: "Legal Brief",
        created_date: "2024-01-12"
      }
    ],
    mediation_cases: [
      {
        id: 1,
        party_a: "Farm Co-op A",
        party_b: "Farm Co-op B",
        dispute_type: "Supply Agreement",
        stage: "Initial Mediation"
      }
    ],
    arbitration_cases: [
      {
        id: 1,
        status: "Scheduled",
        next_hearing: "2024-02-20"
      }
    ],
    law_library: [
      {
        id: 1,
        title: "Agricultural Land Rights Act",
        category: "Land Law",
        jurisdiction: "National"
      }
    ],
    legal_precedents: [
      {
        id: 1,
        case_name: "State vs. Agricultural Corp",
        outcome: "Favorable",
        relevance: 85
      }
    ],
    legal_analytics: {
      win_rate: 78,
      settlement_rate: 65,
      recovered_amounts: 450000
    },
    compliance_metrics: {
      regulatory_compliance: 92,
      audit_success_rate: 88,
      dispute_prevention_rate: 75
    }
  },

  // Market Analyst Dashboard
  MARKET_ANALYST: {
    market_stats: {
      tracked_commodities: 25,
      forecast_accuracy: 88,
      price_alerts: 12,
      market_movements: 8
    },
    commodities: ["Maize", "Wheat", "Coffee", "Tea", "Avocado"],
    price_intelligence: [
      {
        commodity: "Maize",
        current_price: 45.50,
        trend: "up",
        change_percentage: 2.5
      }
    ],
    forecasting_models: [
      {
        id: 1,
        name: "Seasonal ARIMA",
        accuracy: 92,
        confidence: "High"
      }
    ],
    market_insights: [
      {
        id: 1,
        title: "Coffee Prices Expected to Rise",
        impact: "High",
        confidence: 85
      }
    ],
    competitor_intelligence: [
      {
        id: 1,
        name: "Global Ag Corp",
        market_share: 25,
        pricing_strategy: "Premium"
      }
    ],
    automated_reports: [
      {
        id: 1,
        name: "Weekly Commodity Report",
        frequency: "Weekly",
        status: "Active"
      }
    ],
    seasonal_forecasts: [
      {
        id: 1,
        season: "Q1 2024",
        outlook: "Bullish",
        confidence: 78
      }
    ],
    price_thresholds: [
      {
        commodity: "Maize",
        type: "Upper Limit",
        value: 50.00,
        breached: false
      }
    ],
    disruption_notifications: [
      {
        id: 1,
        type: "Weather Impact",
        severity: "Medium",
        message: "Drought conditions affecting supply"
      }
    ],
    trend_analysis: {
      bullish_trends: 8,
      bearish_trends: 3,
      volatility_index: 12
    }
  },

  // Business Admin Dashboard
  BUSINESS_ADMIN: {
    revenue_streams: {
      marketplace: 1250000,
      subscriptions: 450000,
      premium_features: 280000,
      consulting: 150000
    },
    platform_growth: {
      active_users: 12500,
      new_registrations: 450,
      transaction_volume: 3400,
      retention_rate: 78
    },
    financial_analytics: {
      monthly_revenue: 2130000,
      growth_rate: 15,
      profit_margin: 32
    },
    cost_breakdown: [
      {
        category: "Infrastructure",
        amount: 150000,
        percentage: 35
      },
      {
        category: "Personnel",
        amount: 200000,
        percentage: 45
      }
    ],
    partner_performance: [
      {
        id: 1,
        name: "Tech Solutions Inc",
        revenue: 450000,
        growth: 18,
        rating: 4.7
      }
    ],
    relationship_tracking: {
      active_partners: 23,
      satisfaction_score: 88,
      renewal_rate: 92
    },
    strategic_insights: [
      {
        id: 1,
        title: "Mobile App Adoption Growth",
        impact: "High",
        urgency: "Medium"
      }
    ],
    market_expansion_opportunities: [
      {
        id: 1,
        market: "East Africa",
        potential: "High",
        investment: 500000
      }
    ],
    feature_pipeline: [
      {
        id: 1,
        name: "AI Crop Advisor",
        stage: "Development",
        priority: "High"
      }
    ],
    stakeholder_updates: [
      {
        id: 1,
        type: "Quarterly Report",
        frequency: "Quarterly",
        status: "Pending"
      }
    ],
    business_health: {
      revenue_health: 85,
      user_health: 92,
      cost_health: 65,
      growth_health: 88
    },
    business_risks: [
      {
        id: 1,
        type: "Market Competition",
        level: "Medium",
        impact: "Revenue Loss"
      }
    ]
  },

  // Export Client Dashboard
  EXPORT_CLIENT: {
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
      }
    ],
    customs_updates: [
      {
        id: 1,
        type: 'Export License',
        status: 'Approved',
        due_date: '2024-01-15'
      }
    ],
    logistics_partners: [
      {
        id: 1,
        name: 'Maersk Line',
        service: 'Container Shipping',
        contact: '+254 700 123 456'
      }
    ],
    compliance_regulations: [
      {
        id: 1,
        name: 'EU Organic Regulation',
        status: 'compliant',
        last_checked: '2024-01-10'
      }
    ],
    export_documents: [
      {
        id: 1,
        name: 'Commercial Invoice',
        status: 'generated',
        required: true
      }
    ],
    international_prices: [
      {
        commodity: 'Arabica Coffee',
        price: 8.50,
        market: 'EU',
        trend: 'up'
      }
    ],
    international_partners: [
      {
        id: 1,
        name: 'European Food Importers Ltd',
        country: 'Netherlands',
        specialty: 'Organic Products',
        rating: 4.8
      }
    ],
    network_stats: {
      partners: 15,
      countries: 8
    }
  },

  // Individual Consumer Dashboard
  INDIVIDUAL_CONSUMER: {
    personalized_recommendations: [
      {
        id: 1,
        name: 'Organic Tomatoes',
        price: 2.50,
        unit: 'kg',
        rating: 4.8
      }
    ],
    frequent_orders: [
      {
        id: 1,
        name: 'Fresh Carrots',
        price: 1.80,
        unit: 'kg',
        image: '/products/carrots.jpg'
      }
    ],
    scheduled_orders: [
      {
        id: 1,
        delivery_date: '2024-01-20',
        items_count: 8
      }
    ],
    active_deliveries: [
      {
        id: 1,
        order_id: 'ORD-001',
        status: 'in_transit',
        estimated_time: '2-3 hours'
      }
    ],
    delivery_preferences: {
      preferred_time: 'Evening (6-9 PM)',
      instructions: 'Leave at door if not home'
    },
    spending_analytics: {
      monthly_spending: 450,
      orders_count: 12,
      savings: 85
    },
    local_farmers: [
      {
        id: 1,
        name: 'Green Valley Farm',
        specialty: 'Organic Vegetables',
        distance: '5 km',
        image: '/farmers/green-valley.jpg'
      }
    ],
    food_events: [
      {
        id: 1,
        date: '2024-02-15',
        title: 'Farmers Market Festival'
      }
    ]
  },

  // Input Supplier Dashboard
  INPUT_SUPPLIER: {
    business_overview: {
      daily_sales: 12500,
      low_stock_items: 3,
      pending_orders: 8,
      customer_requests: 5
    },
    product_categories: [
      {
        id: 1,
        name: 'Seeds',
        stock_level: 450,
        sales_count: 125,
        trend: 'up',
        growth: 12
      }
    ],
    competitive_analysis: [
      {
        id: 1,
        name: 'Agro Supplies Ltd',
        rating: 4,
        market_share: 25
      }
    ],
    growth_opportunities: [
      {
        id: 1,
        title: 'Organic Fertilizer Line',
        potential: 'High'
      }
    ],
    inventory: [
      {
        id: 1,
        name: 'Maize Seeds',
        quantity: 500,
        location: 'Warehouse A',
        reorder_level: 100
      }
    ],
    locations: ['Warehouse A', 'Warehouse B', 'Store Front'],
    sales_analytics: {
      monthly_revenue: 375000,
      growth_rate: 18,
      top_products: ['Seeds', 'Fertilizers']
    },
    sales_trends: [
      {
        period: 'January',
        revenue: 375000,
        growth: 18
      }
    ],
    customer_metrics: {
      total_customers: 345,
      repeat_customers: 278,
      satisfaction_rate: 94
    },
    recent_orders: [
      {
        id: 1,
        customer_name: 'John Kamau',
        product: 'Tomato Seeds',
        quantity: 50,
        total: 2500
      }
    ],
    service_requests: [
      {
        id: 1,
        type: 'Technical Support',
        customer: 'Green Farms Ltd',
        status: 'Open'
      }
    ]
  },

  // Restaurant Business Dashboard
  RESTAURANT_BUSINESS: {
    supply_chain: {
      farmers_count: 23,
      deliveries_today: 8
    },
    order_templates: [
      {
        id: 1,
        name: 'Weekly Produce Order',
        items_count: 15
      }
    ],
    suppliers: [
      {
        id: 1,
        name: 'Fresh Farm Co-op',
        rating: 4.8,
        reliability: 'High',
        last_delivery: '2024-01-15'
      }
    ],
    inventory: [
      {
        id: 1,
        name: 'Tomatoes',
        quantity: 45,
        unit: 'kg',
        reorder_level: 20
      }
    ],
    ingredient_sourcing: [
      {
        id: 1,
        ingredient: 'Organic Beef',
        current_supplier: 'Local Butchery',
        cost: 12.50,
        alternatives: 3
      }
    ],
    supplier_ratings: [
      {
        id: 1,
        supplier: 'Green Valley Farms',
        quality_score: 95,
        delivery_score: 92,
        communication_score: 88,
        overall_rating: 4.5
      }
    ],
    pos_systems: [
      {
        id: 1,
        name: 'Square POS',
        status: 'Connected',
        last_sync: '2024-01-15 14:30'
      }
    ]
  },

  // Organic Specialist Dashboard
  ORGANIC_SPECIALIST: {
    certifications: [
      {
        id: 1,
        type: 'EU Organic',
        status: 'ACTIVE',
        expiry_date: '2024-12-31'
      }
    ],
    quality: {
      soil_last_test: '2024-01-10'
    },
    premium_marketplace: {
      avg_premium: 2.50,
      certified_buyers: 23,
      active_listings: 15
    },
    top_buyers: [
      {
        id: 1,
        name: 'Organic Markets Ltd'
      }
    ],
    compliance_docs: [
      {
        id: 1,
        name: 'Soil Test Report',
        type: 'Certification',
        upload_date: '2024-01-10'
      }
    ],
    next_audit_date: '2024-06-15',
    audit_preparedness: 75,
    community_events: [
      {
        id: 1,
        date: '2024-02-20',
        title: 'Organic Farming Workshop'
      }
    ],
    network_stats: {
      farmers: 156,
      buyers: 45
    }
  },

  // Institutional Buyer Dashboard
  INSTITUTIONAL_BUYER: {
    contract_stats: {
      active: 12,
      pending: 3,
      expiring: 2
    },
    active_tenders: [
      {
        id: 1,
        title: 'Quarterly Grain Supply',
        deadline: '2024-02-01'
      }
    ],
    budgets: [
      {
        id: 1,
        category: 'Produce',
        allocated: 500000,
        spent: 350000,
        remaining: 150000
      }
    ],
    budget_alerts: [
      {
        id: 1,
        message: 'Produce budget 70% utilized',
        amount: '350,000/500,000',
        severity: 'warning'
      }
    ],
    quality_metrics: {
      compliance_rate: 95,
      inspections_passed: 45
    },
    supplier_performance: [
      {
        id: 1,
        name: 'Farm Fresh Co-op',
        overall_score: 92
      }
    ]
  },

  // Livestock Farmer Dashboard
  LIVESTOCK_FARMER: {
    livestock_health: [
      {
        id: 1,
        animal_id: 'COW-001',
        health_status: 'Healthy',
        last_check: '2024-01-15'
      }
    ],
    health_stats: {
      healthy: 45,
      sick: 2,
      pregnant: 8
    },
    production_stats: {
      births_today: 2,
      milk_production: 125,
      eggs_collected: 340
    },
    feed_inventory: [
      {
        id: 1,
        type: 'Dairy Meal',
        quantity: 500,
        status: 'Adequate'
      }
    ],
    nutrition_plan: {
      current_diet: 'High-Protein Mix',
      next_feeding: '14:00'
    },
    market_prices: [
      {
        product: 'Beef',
        price: 8.75,
        trend: 'stable'
      }
    ],
    sales_opportunities: [
      {
        id: 1,
        buyer: 'Local Butchery',
        product: 'Beef',
        quantity: 100
      }
    ]
  },

  // Logistics Provider Dashboard
  LOGISTICS_PROVIDER: {
    fleet: [
      {
        id: 1,
        vehicle_id: 'TRK-001',
        type: 'Refrigerated Truck',
        status: 'In Transit',
        location: 'Nairobi'
      }
    ],
    fleet_stats: {
      active: 8,
      in_transit: 5,
      available: 2,
      maintenance: 1
    },
    priority_deliveries: [
      {
        id: 1,
        from: 'Nairobi',
        to: 'Mombasa',
        eta: '6 hours'
      }
    ],
    scheduled_deliveries: [
      {
        id: 1,
        scheduled_time: '14:00',
        status: 'Scheduled'
      }
    ],
    routes: [
      {
        id: 1,
        name: 'Nairobi-Mombasa',
        distance: 485,
        estimated_time: '8 hours'
      }
    ],
    maintenance_schedule: [
      {
        id: 1,
        vehicle_id: 'TRK-001',
        type: 'Oil Change',
        due_date: '2024-02-01'
      }
    ],
    costs: {
      fuel: 45000,
      maintenance: 15000,
      total: 85000
    },
    performance: {
      on_time_rate: 94,
      customer_rating: 4.7,
      utilization_rate: 85
    }
  },

  // Service Provider Dashboard
  SERVICE_PROVIDER: {
    service_operations: [
      {
        id: 1,
        service_type: 'Equipment Repair',
        customer: 'Green Farms',
        status: 'In Progress'
      }
    ],
    operations_stats: {
      active_services: 12,
      completed_today: 8,
      scheduled: 15,
      urgent: 3
    },
    todays_schedule: [
      {
        id: 1,
        time: '09:00',
        service_type: 'Irrigation System Check',
        customer_name: 'John Kamau',
        location: 'Kiambu',
        status: 'Scheduled'
      }
    ],
    capacity_planning: {
      utilization: 75,
      available_slots: 8,
      peak_hours: '09:00-12:00'
    },
    mobile_workforce: [
      {
        id: 1,
        name: 'James Technician',
        specialization: 'Irrigation Systems',
        status: 'Available'
      }
    ],
    technician_allocations: [
      {
        technician_id: 1,
        technician_name: 'James Technician',
        assigned_services: 3,
        location: 'Nairobi'
      }
    ],
    travel_optimization: {
      avg_travel_time: 45,
      fuel_savings: 12,
      route_efficiency: 88
    },
    service_history: [
      {
        id: 1,
        customer_name: 'Mary Wanjiku',
        service_type: 'Tractor Repair',
        service_date: '2024-01-14',
        rating: 5
      }
    ],
    customer_feedback: [
      {
        id: 1,
        comment: 'Excellent service, very professional',
        rating: 5,
        date: '2024-01-14'
      }
    ],
    profitability: {
      monthly_revenue: 125000,
      profit_margin: 35,
      customer_retention: 88
    },
    expansion_opportunities: [
      {
        id: 1,
        area: 'Western Region',
        potential: 'High',
        investment: 200000
      }
    ],
    service_analytics: {
      avg_response_time: 30,
      first_time_fix_rate: 92,
      customer_satisfaction: 94
    }
  },

  // Smallholder Farmer Dashboard
  SMALLHOLDER_FARMER: {
    dashboard_type: "smallholder_farmer",
    welcome_message: "Welcome back to your farm management dashboard!",
    today_priorities: [
      { time: 'Morning', description: 'Check soil moisture in maize field', priority: 'High' },
      { time: 'Afternoon', description: 'Apply organic fertilizer to tomatoes', priority: 'Medium' },
      { time: 'Evening', description: 'Record today\'s harvest data', priority: 'Low' }
    ],
    active_crops: [
      { icon: '🌽', name: 'Maize', progress: 65, status: 'growing', area: '2 acres' },
      { icon: '🍅', name: 'Tomatoes', progress: 30, status: 'flowering', area: '0.5 acres' },
      { icon: '🥬', name: 'Kale', progress: 95, status: 'ready', area: '0.25 acres' },
      { icon: '🥕', name: 'Carrots', progress: 45, status: 'growing', area: '0.3 acres' }
    ],
    market_prices: [
      { crop: 'Maize', price: 45.50, unit: 'kg', trend: 'up', change: '+2.5%' },
      { crop: 'Tomatoes', price: 68.20, unit: 'kg', trend: 'stable', change: '0%' },
      { crop: 'Kale', price: 35.75, unit: 'kg', trend: 'up', change: '+1.2%' },
      { crop: 'Carrots', price: 42.30, unit: 'kg', trend: 'down', change: '-0.8%' }
    ],
    immediate_alerts: [
      { type: 'warning', title: 'Weather Alert', message: 'Heavy rain expected tomorrow' },
      { type: 'info', title: 'Market Opportunity', message: 'High demand for kale this week' }
    ],
    stats: {
      total_farms: 1,
      active_crops_count: 4,
      pending_tasks: 3,
      revenue_this_month: 1250.50,
      expenses_this_month: 450.75,
      net_profit: 799.75
    },
    quick_actions: [
      { title: "Record Harvest", icon: "🌾", url: "/farms/harvest" },
      { title: "Check Prices", icon: "💰", url: "/marketplace/prices" },
      { title: "Get Advice", icon: "🤝", url: "/advisory" },
      { title: "Order Supplies", icon: "🛒", url: "/marketplace/supplies" },
      { title: "Weather Forecast", icon: "🌦️", url: "/weather" },
      { title: "Financial Report", icon: "📊", url: "/reports/financial" }
    ],
    recent_activities: [
      { action: 'Harvest recorded', crop: 'Kale', quantity: '25kg', time: '2 hours ago' },
      { action: 'Fertilizer applied', crop: 'Tomatoes', product: 'Organic Mix', time: '1 day ago' },
      { action: 'Soil test completed', field: 'Maize Field', result: 'Optimal', time: '2 days ago' }
    ],
    weather_forecast: {
      today: { condition: 'Partly Cloudy', high: 28, low: 18, precipitation: 10 },
      tomorrow: { condition: 'Rain', high: 25, low: 17, precipitation: 80 }
    }
  },
  
  //Service Provider Dashboard
  SERVICE_PROVIDER: {
  service_operations: [
    {
      id: 1,
      service_type: 'Equipment Repair',
      customer: 'Green Farms',
      status: 'In Progress',
      priority: 'High'
    },
    {
      id: 2,
      service_type: 'Irrigation System Installation',
      customer: 'Fresh Produce Co',
      status: 'Scheduled',
      priority: 'Medium'
    }
  ],
  operations_stats: {
    active_services: 12,
    completed_today: 8,
    scheduled: 15,
    urgent: 3
  },
  todays_schedule: [
    {
      id: 1,
      time: '09:00',
      service_type: 'Irrigation System Check',
      customer_name: 'John Kamau',
      location: 'Kiambu',
      status: 'Scheduled'
    },
    {
      id: 2,
      time: '11:30',
      service_type: 'Tractor Maintenance',
      customer_name: 'Large Scale Farms',
      location: 'Nakuru',
      status: 'Confirmed'
    }
  ],
  capacity_planning: {
    utilization: 75,
    available_slots: 8,
    peak_hours: '09:00-12:00'
  },
  mobile_workforce: [
    {
      id: 1,
      name: 'James Technician',
      specialization: 'Irrigation Systems',
      status: 'Available',
      current_location: 'Nairobi'
    },
    {
      id: 2,
      name: 'Sarah Engineer',
      specialization: 'Heavy Equipment',
      status: 'On Site',
      current_location: 'Kiambu'
    }
  ],
  technician_allocations: [
    {
      technician_id: 1,
      technician_name: 'James Technician',
      assigned_services: 3,
      location: 'Nairobi',
      today_capacity: 6
    }
  ],
  travel_optimization: {
    avg_travel_time: 45,
    fuel_savings: 12,
    route_efficiency: 88
  },
  service_history: [
    {
      id: 1,
      customer_name: 'Mary Wanjiku',
      service_type: 'Tractor Repair',
      service_date: '2024-01-14',
      rating: 5,
      duration: '2 hours'
    }
  ],
  customer_feedback: [
    {
      id: 1,
      comment: 'Excellent service, very professional',
      rating: 5,
      date: '2024-01-14',
      customer: 'Mary Wanjiku'
    }
  ],
  profitability: {
    monthly_revenue: 125000,
    profit_margin: 35,
    customer_retention: 88
  },
  expansion_opportunities: [
    {
      id: 1,
      area: 'Western Region',
      potential: 'High',
      investment: 200000,
      expected_roi: '45%'
    }
  ],
  service_analytics: {
    avg_response_time: 30,
    first_time_fix_rate: 92,
    customer_satisfaction: 94
  }
},

  // Smallholder Farmer Dashboard (if you have this)
SMALLHOLDER_FARMER: {
  dashboard_type: "smallholder_farmer",
  welcome_message: "Welcome back to your farm management dashboard!",
  today_priorities: [
    { time: 'Morning', description: 'Check soil moisture in maize field', priority: 'High' },
    { time: 'Afternoon', description: 'Apply organic fertilizer to tomatoes', priority: 'Medium' },
    { time: 'Evening', description: 'Record today\'s harvest data', priority: 'Low' }
  ],
  active_crops: [
    { icon: '🌽', name: 'Maize', progress: 65, status: 'growing', area: '2 acres' },
    { icon: '🍅', name: 'Tomatoes', progress: 30, status: 'flowering', area: '0.5 acres' },
    { icon: '🥬', name: 'Kale', progress: 95, status: 'ready', area: '0.25 acres' },
    { icon: '🥕', name: 'Carrots', progress: 45, status: 'growing', area: '0.3 acres' }
  ],
  market_prices: [
    { crop: 'Maize', price: 45.50, unit: 'kg', trend: 'up', change: '+2.5%' },
    { crop: 'Tomatoes', price: 68.20, unit: 'kg', trend: 'stable', change: '0%' },
    { crop: 'Kale', price: 35.75, unit: 'kg', trend: 'up', change: '+1.2%' },
    { crop: 'Carrots', price: 42.30, unit: 'kg', trend: 'down', change: '-0.8%' }
  ],
  immediate_alerts: [
    { type: 'warning', title: 'Weather Alert', message: 'Heavy rain expected tomorrow' },
    { type: 'info', title: 'Market Opportunity', message: 'High demand for kale this week' }
  ],
  stats: {
    total_farms: 1,
    active_crops_count: 4,
    pending_tasks: 3,
    revenue_this_month: 1250.50,
    expenses_this_month: 450.75,
    net_profit: 799.75
  },
  quick_actions: [
    { title: "Record Harvest", icon: "🌾", url: "/farms/harvest" },
    { title: "Check Prices", icon: "💰", url: "/marketplace/prices" },
    { title: "Get Advice", icon: "🤝", url: "/advisory" },
    { title: "Order Supplies", icon: "🛒", url: "/marketplace/supplies" },
    { title: "Weather Forecast", icon: "🌦️", url: "/weather" },
    { title: "Financial Report", icon: "📊", url: "/reports/financial" }
  ],
  recent_activities: [
    { action: 'Harvest recorded', crop: 'Kale', quantity: '25kg', time: '2 hours ago' },
    { action: 'Fertilizer applied', crop: 'Tomatoes', product: 'Organic Mix', time: '1 day ago' },
    { action: 'Soil test completed', field: 'Maize Field', result: 'Optimal', time: '2 days ago' }
  ],
  weather_forecast: {
    today: { condition: 'Partly Cloudy', high: 28, low: 18, precipitation: 10 },
    tomorrow: { condition: 'Rain', high: 25, low: 17, precipitation: 80 }
  }
},
  // Machinery Provider Dashboard
  MACHINERY_PROVIDER: {
    equipment_fleet: [
      {
        id: 1,
        name: 'Tractor Model X',
        type: 'Tractor',
        status: 'Available',
        location: 'Main Depot'
      }
    ],
    fleet_stats: {
      total_equipment: 25,
      rented: 18,
      available: 5,
      maintenance: 2
    },
    active_bookings: [
      {
        id: 1,
        customer: 'Green Farms Ltd',
        start_date: '2024-01-20',
        end_date: '2024-01-25',
        status: 'Active'
      }
    ],
    contract_stats: {
      active: 18,
      expiring: 3,
      renewal_rate: 85
    },
    maintenance_schedule: [
      {
        id: 1,
        equipment_name: 'Tractor Model X',
        type: 'Service',
        due_date: '2024-02-15'
      }
    ],
    maintenance_alerts: [
      {
        id: 1,
        equipment_name: 'Harvester Model Y',
        message: 'Engine maintenance due',
        due_date: '2024-02-01',
        priority: 'High'
      }
    ],
    revenue_metrics: {
      monthly_revenue: 125000,
      utilization_rate: 72,
      avg_daily_rate: 450
    },
    pricing_recommendations: [
      {
        equipment_type: 'Tractor',
        current_price: 450,
        recommended_price: 480
      }
    ],
    customer_insights: [
      {
        id: 1,
        name: 'Large Scale Farms Co',
        total_rentals: 12,
        total_value: 54000,
        rating: 4.8
      }
    ],
    training_records: [
      {
        id: 1,
        customer_name: 'John Kamau',
        equipment: 'Tractor Model X',
        training_date: '2024-01-10',
        status: 'Completed'
      }
    ],
    performance_metrics: {
      uptime: 92,
      maintenance_cost: 25,
      revenue_per_hour: 65
    },
    equipment_health: [
      {
        id: 1,
        name: 'Tractor Model X',
        health_score: 88
      }
    ]
  },
  // Commercial Farmer Dashboard
  COMMERCIAL_FARMER: {
  dashboard_type: "commercial_farmer",
  welcome_message: `Welcome, Commercial Farmer!`,
  enterprise_overview: {
    total_operations: 5,
    active_contracts: 3,
    production_volume: 15000
  },
  supply_chain: {
    suppliers: 8,
    distribution_channels: 3,
    logistics_partners: 2
  },
  business_intel: {
    market_share: "15%",
    growth_rate: "12%",
    customer_satisfaction: "94%"
  },
  stats: {
    total_farms: 3,
    total_employees: 45,
    monthly_revenue: 125000,
    profit_margin: 25.5
  },
  farms: [
    { id: 1, name: 'Main Farm' },
    { id: 2, name: 'North Fields' },
    { id: 3, name: 'South Estate' }
  ],
  operations: {
    active_harvests: 2,
    labor_count: 45,
    equipment_utilization: '78%',
    yield_per_hectare: '4.2t'
  },
  market_opportunities: [
    { id: 1, opportunity: 'Export to EU Market', potential_revenue: '$50,000', risk_level: 'Medium' },
    { id: 2, opportunity: 'Organic Certification', potential_revenue: '$25,000', risk_level: 'Low' },
    { id: 3, opportunity: 'New Crop Variety', potential_revenue: '$35,000', risk_level: 'High' }
  ],
  farm_performance: [
    { farm_name: 'Main Farm', crop_type: 'Corn', yield: '5.2', revenue: '$65,000', profitability: 'High', status: 'Active' },
    { farm_name: 'North Fields', crop_type: 'Soybeans', yield: '3.8', revenue: '$42,000', profitability: 'Medium', status: 'Active' },
    { farm_name: 'South Estate', crop_type: 'Wheat', yield: '4.1', revenue: '$38,000', profitability: 'Medium', status: 'Harvesting' }
  ]
},
  // Platform Admin Dashboard
  PLATFORM_ADMIN: {
    system_health: [
      {
        id: 1,
        name: 'API Gateway',
        status: 'Healthy',
        response_time: 120
      }
    ],
    health_metrics: {
      uptime: 99.8,
      response_time: 150,
      active_issues: 2,
      system_load: 65
    },
    user_activity: {
      active_users: 234,
      new_today: 45,
      sessions_today: 567
    },
    activity_by_role: [
      {
        role: 'Farmer',
        active_users: 156,
        percentage: 45
      }
    ],
    users: [
      {
        id: 1,
        name: 'John Kamau',
        role: 'Farmer',
        status: 'Active',
        join_date: '2024-01-01'
      }
    ],
    user_growth: {
      total_users: 12345,
      growth_rate: 15,
      retention_rate: 78
    },
    role_distribution: [
      {
        role: 'Farmer',
        count: 8456,
        percentage: 68
      }
    ],
    performance_metrics: {
      cpu_usage: 45,
      memory_usage: 62,
      database_load: 38,
      api_response_time: 150
    },
    error_tracking: {
      total_errors: 23,
      critical_errors: 2,
      resolved_errors: 18
    },
    recent_errors: [
      {
        id: 1,
        type: 'Database Connection',
        message: 'Connection timeout',
        timestamp: '2024-01-15 14:30'
      }
    ],
    feature_deployments: [
      {
        id: 1,
        feature_name: 'AI Crop Advisor',
        status: 'Live',
        deployment_date: '2024-01-10',
        adoption_rate: 25
      }
    ],
    feature_usage: [
      {
        id: 1,
        name: 'Marketplace',
        active_users: 8456,
        usage_rate: 78,
        trend: 'up',
        growth: 12
      }
    ],
    support_operations: {
      open_tickets: 15,
      avg_response_time: '2 hours',
      resolution_rate: 85,
      satisfaction_rate: 92
    },
    recent_support_cases: [
      {
        id: 1,
        subject: 'Login Issues',
        priority: 'High',
        status: 'In Progress'
      }
    ]
  }
};

// Helper function to get mock data for specific dashboard
export const getMockDashboardData = (dashboardType) => {
  return mockDashboardData[dashboardType] || {};
};

// Helper function to get all mock data
export const getAllMockData = () => {
  return mockDashboardData;
};

// Function to simulate API delay
export const simulateApiDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Function to fetch mock data with simulated API call
export const fetchMockDashboardData = async (dashboardType) => {
  await simulateApiDelay(800); // Simulate network delay
  
  const data = getMockDashboardData(dashboardType);
  
  if (Object.keys(data).length === 0) {
    throw new Error(`No mock data found for dashboard type: ${dashboardType}`);
  }
  
  return {
    success: true,
    data: data,
    timestamp: new Date().toISOString(),
    source: 'mock'
  };
};

export default mockDashboardData;
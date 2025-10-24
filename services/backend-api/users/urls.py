# users/urls.py - COMPLETE FIXED VERSION
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    UserDirectoryView,
    FinancialAdvisorLoanApplicationsView,  # Legacy compatibility views
    LegacySmallholderFarmerDashboardView, LegacyCommercialFarmerDashboardView,
    LegacyOrganicSpecialistDashboardView, LegacyLivestockFarmerDashboardView,
    LegacyIndividualConsumerDashboardView, LegacyRestaurantBusinessDashboardView,
    LegacyExportClientDashboardView, LegacyInstitutionalBuyerDashboardView,
    LegacyLogisticsProviderDashboardView, LegacyInputSupplierDashboardView,
    LegacyMachineryProviderDashboardView, LegacyServiceProviderDashboardView,
    LegacyFinancialAdvisorDashboardView, LegacyFinancialAdvisorLoanApplicationsView,
    LegacyTechnicalAdvisorDashboardView, LegacyLegalSpecialistDashboardView,
    LegacyMarketAnalystDashboardView, LegacyPlatformAdminDashboardView,
    LegacyBusinessAdminDashboardView, LegacyFarmerDashboardView,
    LegacyConsumerDashboardView, LegacySupplierDashboardView,
    LegacyAgentDashboardView, LegacyAdminDashboardView,
    LegacySubRoleFeaturesView,
)

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'users', views.UserProfileViewSet, basename='userprofile')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'admin/users', views.UserAdminViewSet, basename='admin-user')

urlpatterns = [
    
    # Health check
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
    
    # FIXED: User Directory endpoint - CORRECT PATH
    path('directory/', UserDirectoryView.as_view(), name='user-directory'),
    
    # Authentication endpoints
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.UserLogoutView.as_view(), name='user-logout'),
    
    # Authentication Testing
    path('protected-test/', views.ProtectedExampleView.as_view(), name='protected-test'),
    
    # Public User Information
    path('public/<int:user_id>/', views.PublicUserView.as_view(), name='public-user'),
    
    # User Profile Management
    path('me/', views.UserProfileViewSet.as_view({'get': 'me'}), name='user-me'),
    path('me/update/', views.UserProfileViewSet.as_view({'put': 'update_me', 'patch': 'update_me'}), name='user-update-me'),
    path('me/stats/', views.UserProfileViewSet.as_view({'get': 'stats'}), name='user-me-stats'),
    path('me/activities/', views.UserProfileViewSet.as_view({'get': 'activities'}), name='user-me-activities'),
    
    # ✅ FIXED: Simple API endpoints (CORRECT PATHS - removed "user" prefix)
    path('profile/', views.user_profile_api, name='user-profile-api'),
    path('activities/', views.user_activities_api, name='user-activities-api'),
    path('stats/', views.user_stats_api, name='user-stats-api'),
    path('preferences/', views.user_preferences_api, name='user-preferences-api'),
    path('profile/create/', views.create_profile_api, name='user-profile-create-api'),
    
    # Notification Management
    path('notifications/', views.NotificationViewSet.as_view({'get': 'list'}), name='notifications-list'),
    path('notifications/unread/', views.NotificationViewSet.as_view({'get': 'unread'}), name='notifications-unread'),
    path('notifications/mark-all-read/', views.NotificationViewSet.as_view({'post': 'mark_all_read'}), name='notifications-mark-all-read'),
    path('notifications/<int:pk>/mark-read/', views.NotificationViewSet.as_view({'post': 'mark_read'}), name='notification-mark-read'),
    
    path('financial/loan-applications/', FinancialAdvisorLoanApplicationsView.as_view(), name='financial-loan-applications'),
    path('financial/loan-applications/<int:pk>/', FinancialAdvisorLoanApplicationsView.as_view(), name='financial-loan-application-detail'),
    # Admin Management Endpoints
    path('admin/dashboard-stats/', views.UserAdminViewSet.as_view({'get': 'dashboard_stats'}), name='admin-dashboard-stats'),
    path('admin/users/<int:pk>/deactivate/', views.UserAdminViewSet.as_view({'post': 'deactivate'}), name='admin-user-deactivate'),
    path('admin/users/<int:pk>/activate/', views.UserAdminViewSet.as_view({'post': 'activate'}), name='admin-user-activate'),

    # NEW: COMPLETE SUB-ROLE DASHBOARD ENDPOINTS - BOTH PATHS FOR COMPATIBILITY
    # Farmer Dashboards
    path('dashboard/farmer/smallholder/', views.SmallholderFarmerDashboardView.as_view(), name='smallholder-farmer-dashboard-legacy'),
    path('dashboards/farmer/smallholder/', views.SmallholderFarmerDashboardView.as_view(), name='smallholder-farmer-dashboard'),
    
    path('dashboard/farmer/commercial/', views.CommercialFarmerDashboardView.as_view(), name='commercial-farmer-dashboard-legacy'),
    path('dashboards/farmer/commercial/', views.CommercialFarmerDashboardView.as_view(), name='commercial-farmer-dashboard'),
    
    path('dashboard/farmer/organic/', views.OrganicSpecialistDashboardView.as_view(), name='organic-specialist-dashboard-legacy'),
    path('dashboards/farmer/organic/', views.OrganicSpecialistDashboardView.as_view(), name='organic-specialist-dashboard'),
    
    path('dashboard/farmer/livestock/', views.LivestockFarmerDashboardView.as_view(), name='livestock-farmer-dashboard-legacy'),
    path('dashboards/farmer/livestock/', views.LivestockFarmerDashboardView.as_view(), name='livestock-farmer-dashboard'),
    
    # Consumer Dashboards
    path('dashboard/consumer/individual/', views.IndividualConsumerDashboardView.as_view(), name='individual-consumer-dashboard-legacy'),
    path('dashboards/consumer/individual/', views.IndividualConsumerDashboardView.as_view(), name='individual-consumer-dashboard'),
    
    path('dashboard/consumer/restaurant/', views.RestaurantBusinessDashboardView.as_view(), name='restaurant-business-dashboard-legacy'),
    path('dashboards/consumer/restaurant/', views.RestaurantBusinessDashboardView.as_view(), name='restaurant-business-dashboard'),
    
    path('dashboard/consumer/export/', views.ExportClientDashboardView.as_view(), name='export-client-dashboard-legacy'),
    path('dashboards/consumer/export/', views.ExportClientDashboardView.as_view(), name='export-client-dashboard'),
    
    path('dashboard/consumer/institutional/', views.InstitutionalBuyerDashboardView.as_view(), name='institutional-buyer-dashboard-legacy'),
    path('dashboards/consumer/institutional/', views.InstitutionalBuyerDashboardView.as_view(), name='institutional-buyer-dashboard'),
    
    # Supplier Dashboards
    path('dashboard/supplier/logistics/', views.LogisticsProviderDashboardView.as_view(), name='logistics-provider-dashboard-legacy'),
    path('dashboards/supplier/logistics/', views.LogisticsProviderDashboardView.as_view(), name='logistics-provider-dashboard'),
    
    path('dashboard/supplier/input/', views.InputSupplierDashboardView.as_view(), name='input-supplier-dashboard-legacy'),
    path('dashboards/supplier/input/', views.InputSupplierDashboardView.as_view(), name='input-supplier-dashboard'),
    
    path('dashboard/supplier/machinery/', views.MachineryProviderDashboardView.as_view(), name='machinery-provider-dashboard-legacy'),
    path('dashboards/supplier/machinery/', views.MachineryProviderDashboardView.as_view(), name='machinery-provider-dashboard'),
    
    path('dashboard/supplier/service/', views.ServiceProviderDashboardView.as_view(), name='service-provider-dashboard-legacy'),
    path('dashboards/supplier/service/', views.ServiceProviderDashboardView.as_view(), name='service-provider-dashboard'),
    
    # Agent Dashboards
    path('dashboard/agent/financial/', views.FinancialAdvisorDashboardView.as_view(), name='financial-advisor-dashboard-legacy'),
    path('dashboards/agent/financial/', views.FinancialAdvisorDashboardView.as_view(), name='financial-advisor-dashboard'),
    
    path('dashboard/agent/technical/', views.TechnicalAdvisorDashboardView.as_view(), name='technical-advisor-dashboard-legacy'),
    path('dashboards/agent/technical/', views.TechnicalAdvisorDashboardView.as_view(), name='technical-advisor-dashboard'),
    
    path('dashboard/agent/legal/', views.LegalSpecialistDashboardView.as_view(), name='legal-specialist-dashboard-legacy'),
    path('dashboards/agent/legal/', views.LegalSpecialistDashboardView.as_view(), name='legal-specialist-dashboard'),
    
    path('dashboard/agent/market/', views.MarketAnalystDashboardView.as_view(), name='market-analyst-dashboard-legacy'),
    path('dashboards/agent/market/', views.MarketAnalystDashboardView.as_view(), name='market-analyst-dashboard'),
    
    # Admin Dashboards
    path('dashboard/admin/platform/', views.PlatformAdminDashboardView.as_view(), name='platform-admin-dashboard-legacy'),
    path('dashboards/admin/platform/', views.PlatformAdminDashboardView.as_view(), name='platform-admin-dashboard'),
    
    path('dashboard/admin/business/', views.BusinessAdminDashboardView.as_view(), name='business-admin-dashboard-legacy'),
    path('dashboards/admin/business/', views.BusinessAdminDashboardView.as_view(), name='business-admin-dashboard'),

    
    
    # Role-specific stats
    path('stats/farmer/', views.FarmerStatsView.as_view(), name='farmer-stats'),
    path('stats/consumer/', views.ConsumerStatsView.as_view(), name='consumer-stats'),
    path('stats/supplier/', views.SupplierStatsView.as_view(), name='supplier-stats'),
]

# Marketplace URLs
urlpatterns += [
    # Role-specific marketplace views
    path('marketplace/consumer/', views.ConsumerMarketplaceView.as_view(), name='consumer-marketplace'),
    path('marketplace/supplier/', views.SupplierMarketplaceView.as_view(), name='supplier-marketplace'),
    path('products/create/', views.ProductListingCreateView.as_view(), name='product-create-restricted'),
    path('consumer/cart/', views.ConsumerCartView.as_view(), name='consumer-cart'),

    # Legacy dashboard endpoints (temporary during migration)
    path('dashboard/farmer/smallholder/', LegacySmallholderFarmerDashboardView.as_view(), name='legacy-smallholder-dashboard'),
    path('dashboard/farmer/commercial/', LegacyCommercialFarmerDashboardView.as_view(), name='legacy-commercial-dashboard'),
    path('dashboard/farmer/organic/', LegacyOrganicSpecialistDashboardView.as_view(), name='legacy-organic-dashboard'),
    path('dashboard/farmer/livestock/', LegacyLivestockFarmerDashboardView.as_view(), name='legacy-livestock-dashboard'),
    path('dashboard/consumer/individual/', LegacyIndividualConsumerDashboardView.as_view(), name='legacy-individual-consumer-dashboard'),
    path('dashboard/consumer/restaurant/', LegacyRestaurantBusinessDashboardView.as_view(), name='legacy-restaurant-dashboard'),
    path('dashboard/consumer/export/', LegacyExportClientDashboardView.as_view(), name='legacy-export-dashboard'),
    path('dashboard/consumer/institutional/', LegacyInstitutionalBuyerDashboardView.as_view(), name='legacy-institutional-dashboard'),
    path('dashboard/supplier/logistics/', LegacyLogisticsProviderDashboardView.as_view(), name='legacy-logistics-dashboard'),
    path('dashboard/supplier/input/', LegacyInputSupplierDashboardView.as_view(), name='legacy-input-supplier-dashboard'),
    path('dashboard/supplier/machinery/', LegacyMachineryProviderDashboardView.as_view(), name='legacy-machinery-dashboard'),
    path('dashboard/supplier/service/', LegacyServiceProviderDashboardView.as_view(), name='legacy-service-dashboard'),
    path('dashboard/agent/financial/', LegacyFinancialAdvisorDashboardView.as_view(), name='legacy-financial-dashboard'),
    path('dashboard/agent/financial/loans/', LegacyFinancialAdvisorLoanApplicationsView.as_view(), name='legacy-financial-loans'),
    path('dashboard/agent/technical/', LegacyTechnicalAdvisorDashboardView.as_view(), name='legacy-technical-dashboard'),
    path('dashboard/agent/legal/', LegacyLegalSpecialistDashboardView.as_view(), name='legacy-legal-dashboard'),
    path('dashboard/agent/market/', LegacyMarketAnalystDashboardView.as_view(), name='legacy-market-dashboard'),
    path('dashboard/admin/platform/', LegacyPlatformAdminDashboardView.as_view(), name='legacy-platform-admin-dashboard'),
    path('dashboard/admin/business/', LegacyBusinessAdminDashboardView.as_view(), name='legacy-business-admin-dashboard'),
    
    # Legacy role-based dashboards
    path('dashboard/farmer/', LegacyFarmerDashboardView.as_view(), name='legacy-farmer-dashboard'),
    path('dashboard/consumer/', LegacyConsumerDashboardView.as_view(), name='legacy-consumer-dashboard'),
    path('dashboard/supplier/', LegacySupplierDashboardView.as_view(), name='legacy-supplier-dashboard'),
    path('dashboard/agent/', LegacyAgentDashboardView.as_view(), name='legacy-agent-dashboard'),
    path('dashboard/admin/', LegacyAdminDashboardView.as_view(), name='legacy-admin-dashboard'),
    
    # Legacy sub-role features
    path('sub-role-features/<str:sub_role>/', LegacySubRoleFeaturesView.as_view(), name='legacy-sub-role-features'),
]



# NEW: Sub-role features and management
urlpatterns += [
    path('sub-roles/<str:sub_role>/features/', views.SubRoleFeaturesView.as_view(), name='sub-role-features'),
]

# Include router URLs (keep this at the end to avoid conflicts)
urlpatterns += [
    path('', include(router.urls)),
]
# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from django.http import JsonResponse
# from rest_framework import permissions
# from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
# from django.utils import timezone

# # Import views for cart endpoints
# from users import views as users_views



# # Simple health check view
# def health_check(request):
#     return JsonResponse({
#         "status": "healthy",
#         "service": "Agro-Gram API",
#         "version": "1.0.0",
#         "debug": settings.DEBUG,
#         "timestamp": timezone.now().isoformat()
#     })

# # Simple home view
# def home(request):
#     return JsonResponse({
#         "message": "🌱 Agro-Gram API is running!",
#         "version": "1.0.0",
#         "description": "AI-Powered Agricultural Platform",
#         "endpoints": {
#             "admin": "/admin/",
#             "health": "/health/",
#             "api_docs": "/api/schema/",
#             "swagger_docs": "/api/docs/",
#             "users": "/api/v1/users/",
#             "farms": "/api/v1/farms/",
#             "marketplace": "/api/v1/marketplace/",
#             "recommendations": "/api/v1/recommendations/",
#             "cart": "/api/v1/cart/",
#             "orders": "/api/v1/orders/",
#             "dashboards": "/api/v1/dashboard/"
#         },
#         "authentication": "Firebase JWT Tokens",
#         "support": "support@agrogram.com"
#     })

# urlpatterns = [
#     # Django Admin
#     path('admin/', admin.site.urls),
    
    
#     # Messaging
#     path('api/v1/messaging/', include('messaging.urls')),
    
#     # Simple routes
#     path('', home, name='home'),
#     path('health/', health_check, name='health-check'),

#     # API Documentation
#     path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
#     path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

#     # API Routes with proper api/v1 prefix
#     path('api/v1/', include([
#         # Users & Authentication
#         path('users/', include('users.urls')),
        
#         # Farm Management
#         path('farms/', include('farms.urls')),
        
#         # Marketplace
#         path('marketplace/', include('marketplace.urls')),
        
#         # AI Recommendations
#         path('recommendations/', include('recommendations.urls')),
        
#         # Dashboard endpoints
#         path('dashboard/farmer/smallholder/', users_views.SmallholderFarmerDashboardView.as_view(), name='smallholder-farmer-dashboard'),
#         path('dashboard/farmer/commercial/', users_views.CommercialFarmerDashboardView.as_view(), name='commercial-farmer-dashboard'),
#         path('dashboard/farmer/organic/', users_views.OrganicSpecialistDashboardView.as_view(), name='organic-specialist-dashboard'),
#         path('dashboard/farmer/livestock/', users_views.LivestockFarmerDashboardView.as_view(), name='livestock-farmer-dashboard'),
        
#         path('dashboard/consumer/individual/', users_views.IndividualConsumerDashboardView.as_view(), name='individual-consumer-dashboard'),
#         path('dashboard/consumer/restaurant/', users_views.RestaurantBusinessDashboardView.as_view(), name='restaurant-business-dashboard'),
#         path('dashboard/consumer/export/', users_views.ExportClientDashboardView.as_view(), name='export-client-dashboard'),
#         path('dashboard/consumer/institutional/', users_views.InstitutionalBuyerDashboardView.as_view(), name='institutional-buyer-dashboard'),
        
#         path('dashboard/supplier/logistics/', users_views.LogisticsProviderDashboardView.as_view(), name='logistics-provider-dashboard'),
#         path('dashboard/supplier/input/', users_views.InputSupplierDashboardView.as_view(), name='input-supplier-dashboard'),
#         path('dashboard/supplier/machinery/', users_views.MachineryProviderDashboardView.as_view(), name='machinery-provider-dashboard'),
#         path('dashboard/supplier/service/', users_views.ServiceProviderDashboardView.as_view(), name='service-provider-dashboard'),
        
#         path('dashboard/agent/financial/', users_views.FinancialAdvisorDashboardView.as_view(), name='financial-advisor-dashboard'),
#         path('dashboard/agent/technical/', users_views.TechnicalAdvisorDashboardView.as_view(), name='technical-advisor-dashboard'),
#         path('dashboard/agent/legal/', users_views.LegalSpecialistDashboardView.as_view(), name='legal-specialist-dashboard'),
#         path('dashboard/agent/market/', users_views.MarketAnalystDashboardView.as_view(), name='market-analyst-dashboard'),
        
#         path('dashboard/admin/platform/', users_views.PlatformAdminDashboardView.as_view(), name='platform-admin-dashboard'),
#         path('dashboard/admin/business/', users_views.BusinessAdminDashboardView.as_view(), name='business-admin-dashboard'),
        
#         # Cart and Orders endpoints
#         path('cart/', users_views.CartView.as_view(), name='cart-detail'),
#         path('cart/items/', users_views.CartItemListCreateView.as_view(), name='cart-items'),
#         path('cart/items/<int:item_id>/', users_views.CartItemDetailView.as_view(), name='cart-item-detail'),
#         path('cart/clear/', users_views.ClearCartView.as_view(), name='clear-cart'),
#         path('orders/', users_views.OrderListCreateView.as_view(), name='order-list'),
#         path('orders/<int:order_id>/', users_views.OrderDetailView.as_view(), name='order-detail'),
#         path('orders/<int:order_id>/cancel/', users_views.CancelOrderView.as_view(), name='cancel-order'),
#     ])),
# ]

# # Serve media files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

#     # Debug toolbar
#     if 'debug_toolbar' in settings.INSTALLED_APPS:
#         import debug_toolbar
#         urlpatterns += [
#             path('__debug__/', include(debug_toolbar.urls)),
#         ]

# # Custom error handlers
# def handler404(request, exception):
#     return JsonResponse({
#         "error": "Endpoint not found",
#         "message": "The requested API endpoint does not exist",
#         "status": 404
#     }, status=404)

# def handler500(request):
#     return JsonResponse({
#         "error": "Internal server error", 
#         "message": "An unexpected error occurred on the server",
#         "status": 500
#     }, status=500)

# agrogram_api/urls.py (main urls.py)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework import permissions
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.utils import timezone

# Import views for cart endpoints
from users import views as users_views

# Import all the new views from view_helpers
# from users.view_helpers import (
#     # Financial Advisor Views
#     FinancialAdvisorLoanApplicationsView,
#     FinancialAdvisorRiskAssessmentsView,
#     FinancialAdvisorCollateralValuationsView,
    
#     # Technical Advisor Views
#     TechnicalAdvisorCasesView,
#     TechnicalAdvisorKnowledgeBaseView,
#     TechnicalAdvisorFieldVisitsView,
    
#     # Legal Specialist Views
#     LegalSpecialistCasesView,
#     LegalComplianceUpdatesView,
#     LegalDocumentsView,
#     LegalContractTemplatesView,
    
#     # Market Analyst Views
#     MarketIntelligenceView,
#     PriceAnalysisView,
#     CompetitorAnalysisView,
#     MarketReportsView,
#     ScheduledReportsView,
#     MarketAlertsView
# )

# Simple health check view
def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "Agro-Gram API",
        "version": "1.0.0",
        "debug": settings.DEBUG,
        "timestamp": timezone.now().isoformat()
    })

# Simple home view
def home(request):
    return JsonResponse({
        "message": "🌱 Agro-Gram API is running!",
        "version": "1.0.0",
        "description": "AI-Powered Agricultural Platform",
        "endpoints": {
            "admin": "/admin/",
            "health": "/health/",
            "api_docs": "/api/schema/",
            "swagger_docs": "/api/docs/",
            "users": "/api/v1/users/",
            "farms": "/api/v1/farms/",
            "marketplace": "/api/v1/marketplace/",
            "recommendations": "/api/v1/recommendations/",
            "cart": "/api/v1/cart/",
            "orders": "/api/v1/orders/",
            "dashboards": "/api/v1/dashboard/",
            "financial": "/api/v1/financial/",
            "technical": "/api/v1/technical/",
            "legal": "/api/v1/legal/",
            "market": "/api/v1/market/"
        },
        "authentication": "Firebase JWT Tokens",
        "support": "support@agrogram.com"
    })

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # Messaging
    path('api/v1/messaging/', include('messaging.urls')),
    
    # Simple routes
    path('', home, name='home'),
    path('health/', health_check, name='health-check'),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API Routes with proper api/v1 prefix
    path('api/v1/', include([
        # Users & Authentication
        path('users/', include('users.urls')),
        
        # Farm Management
        path('farms/', include('farms.urls')),
        
        # Marketplace
        path('marketplace/', include('marketplace.urls')),
        
        # AI Recommendations
        path('recommendations/', include('recommendations.urls')),
        
        # ============================================================================
        # DASHBOARD ENDPOINTS
        # ============================================================================
        path('dashboard/farmer/smallholder/', users_views.SmallholderFarmerDashboardView.as_view(), name='smallholder-farmer-dashboard'),
        path('dashboard/farmer/commercial/', users_views.CommercialFarmerDashboardView.as_view(), name='commercial-farmer-dashboard'),
        path('dashboard/farmer/organic/', users_views.OrganicSpecialistDashboardView.as_view(), name='organic-specialist-dashboard'),
        path('dashboard/farmer/livestock/', users_views.LivestockFarmerDashboardView.as_view(), name='livestock-farmer-dashboard'),
        
        path('dashboard/consumer/individual/', users_views.IndividualConsumerDashboardView.as_view(), name='individual-consumer-dashboard'),
        path('dashboard/consumer/restaurant/', users_views.RestaurantBusinessDashboardView.as_view(), name='restaurant-business-dashboard'),
        path('dashboard/consumer/export/', users_views.ExportClientDashboardView.as_view(), name='export-client-dashboard'),
        path('dashboard/consumer/institutional/', users_views.InstitutionalBuyerDashboardView.as_view(), name='institutional-buyer-dashboard'),
        
        path('dashboard/supplier/logistics/', users_views.LogisticsProviderDashboardView.as_view(), name='logistics-provider-dashboard'),
        path('dashboard/supplier/input/', users_views.InputSupplierDashboardView.as_view(), name='input-supplier-dashboard'),
        path('dashboard/supplier/machinery/', users_views.MachineryProviderDashboardView.as_view(), name='machinery-provider-dashboard'),
        path('dashboard/supplier/service/', users_views.ServiceProviderDashboardView.as_view(), name='service-provider-dashboard'),
        
        path('dashboard/agent/financial/', users_views.FinancialAdvisorDashboardView.as_view(), name='financial-advisor-dashboard'),
        path('dashboard/agent/technical/', users_views.TechnicalAdvisorDashboardView.as_view(), name='technical-advisor-dashboard'),
        path('dashboard/agent/legal/', users_views.LegalSpecialistDashboardView.as_view(), name='legal-specialist-dashboard'),
        path('dashboard/agent/market/', users_views.MarketAnalystDashboardView.as_view(), name='market-analyst-dashboard'),
         # New dashboard endpoints
        path('api/v1/dashboard/farmer/', include('dashboard_farmer.urls')),
        # Legacy compatibility (temporary)
        path('api/v1/dashboard/farmer/smallholder/', include('dashboard_farmer.urls')),
    # ... other legacy endpoints
        
        path('dashboard/admin/platform/', users_views.PlatformAdminDashboardView.as_view(), name='platform-admin-dashboard'),
        path('dashboard/admin/business/', users_views.BusinessAdminDashboardView.as_view(), name='business-admin-dashboard'),
    ])),
]
        
#         # ============================================================================
#         # FINANCIAL ADVISOR ENDPOINTS
#         # ============================================================================
#         path('financial/loan-applications/', FinancialAdvisorLoanApplicationsView.as_view(), name='financial-loan-applications'),
#         path('financial/loan-applications/<int:pk>/', FinancialAdvisorLoanApplicationsView.as_view(), name='financial-loan-application-detail'),
#         path('financial/risk-assessments/', FinancialAdvisorRiskAssessmentsView.as_view(), name='financial-risk-assessments'),
#         path('financial/collateral-valuations/', FinancialAdvisorCollateralValuationsView.as_view(), name='financial-collateral-valuations'),
        
#         # ============================================================================
#         # TECHNICAL ADVISOR ENDPOINTS
#         # ============================================================================
#         path('technical/cases/', TechnicalAdvisorCasesView.as_view(), name='technical-cases'),
#         path('technical/cases/<int:pk>/', TechnicalAdvisorCasesView.as_view(), name='technical-case-detail'),
#         path('technical/knowledge-base/', TechnicalAdvisorKnowledgeBaseView.as_view(), name='technical-knowledge-base'),
#         path('technical/field-visits/', TechnicalAdvisorFieldVisitsView.as_view(), name='technical-field-visits'),
        
#         # ============================================================================
#         # LEGAL SPECIALIST ENDPOINTS
#         # ============================================================================
#         path('legal/cases/', LegalSpecialistCasesView.as_view(), name='legal-cases'),
#         path('legal/compliance-updates/', LegalComplianceUpdatesView.as_view(), name='legal-compliance-updates'),
#         path('legal/documents/', LegalDocumentsView.as_view(), name='legal-documents'),
#         path('legal/contract-templates/', LegalContractTemplatesView.as_view(), name='legal-contract-templates'),
        
#         # ============================================================================
#         # MARKET ANALYST ENDPOINTS
#         # ============================================================================
#         path('market/intelligence/', MarketIntelligenceView.as_view(), name='market-intelligence'),
#         path('market/prices/<str:commodity>/', PriceAnalysisView.as_view(), name='market-price-analysis'),
#         path('market/competitors/', CompetitorAnalysisView.as_view(), name='market-competitors'),
#         path('market/reports/', MarketReportsView.as_view(), name='market-reports'),
#         path('market/scheduled-reports/', ScheduledReportsView.as_view(), name='market-scheduled-reports'),
#         path('market/alerts/', MarketAlertsView.as_view(), name='market-alerts'),
        
#         # ============================================================================
#         # CART & ORDERS ENDPOINTS
#         # ============================================================================
#         path('cart/', users_views.CartView.as_view(), name='cart-detail'),
#         path('cart/items/', users_views.CartItemListCreateView.as_view(), name='cart-items'),
#         path('cart/items/<int:item_id>/', users_views.CartItemDetailView.as_view(), name='cart-item-detail'),
#         path('cart/clear/', users_views.ClearCartView.as_view(), name='clear-cart'),
#         path('orders/', users_views.OrderListCreateView.as_view(), name='order-list'),
#         path('orders/<int:order_id>/', users_views.OrderDetailView.as_view(), name='order-detail'),
#         path('orders/<int:order_id>/cancel/', users_views.CancelOrderView.as_view(), name='cancel-order'),
#     ])),
# ]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]

# Custom error handlers
def handler404(request, exception):
    return JsonResponse({
        "error": "Endpoint not found",
        "message": "The requested API endpoint does not exist",
        "status": 404
    }, status=404)

def handler500(request):
    return JsonResponse({
        "error": "Internal server error", 
        "message": "An unexpected error occurred on the server",
        "status": 500
    }, status=500)
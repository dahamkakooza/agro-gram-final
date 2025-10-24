# marketplace/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductListingViewSet, basename='product')
router.register(r'orders', views.OrderViewSet, basename='order')
# Add to router
router.register(r'cart', views.CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    
    # Cart endpoints
    path('cart/my-cart/', views.CartViewSet.as_view({'get': 'my_cart'}), name='my-cart'),
    path('cart/add-item/', views.CartViewSet.as_view({'post': 'add_item'}), name='add-to-cart'),
    path('cart/update-item/<int:item_id>/', views.CartViewSet.as_view({'post': 'update_item'}), name='update-cart-item'),
    path('cart/remove-item/<int:item_id>/', views.CartViewSet.as_view({'delete': 'remove_item'}), name='remove-cart-item'),
    path('cart/clear/', views.CartViewSet.as_view({'post': 'clear'}), name='clear-cart'),
    path('cart/checkout/', views.CartViewSet.as_view({'post': 'checkout'}), name='checkout'),

    # Product listing endpoints
    path('products/', views.ProductListingViewSet.as_view({
        'get': 'list', 
        'post': 'create'
    }), name='product-list'),
    
    # Search and recommendations
    path('search/', views.ProductSearchView.as_view(), name='product-search'),
    path('personalized/', views.ProductListingViewSet.as_view({
        'get': 'personalized'
    }), name='personalized-products'),
    path('market-insights/', views.ProductListingViewSet.as_view({
        'get': 'market_insights'
    }), name='market-insights'),
    path('similar-products/<int:pk>/', views.ProductListingViewSet.as_view({
        'get': 'similar_products'
    }), name='similar-products'),
    path('price-history/<int:pk>/', views.ProductListingViewSet.as_view({
        'get': 'price_history'
    }), name='price-history'),
    
    # Price predictions
    path('price-prediction/', views.PricePredictionView.as_view(), name='price-prediction'),
    path('price-prediction/bulk/', views.BulkPricePredictionView.as_view(), name='bulk-price-prediction'),
    
    # User preferences
    path('preferences/', views.UserPreferenceView.as_view(), name='user-preferences'),
    
    # Analytics
    path('analytics/', views.MarketplaceAnalyticsView.as_view(), name='marketplace-analytics'),
    
    # Search suggestions
    path('search-suggestions/', views.SearchSuggestionsView.as_view(), name='search-suggestions'),
    
    # Category insights
    path('category-insights/', views.CategoryInsightsView.as_view(), name='category-insights'),
    
    # Categories endpoint - ADD THIS
    path('categories/', views.ProductCategoriesView.as_view(), name='product-categories'),
    
    # Simple marketplace
    path('overview/', views.SimpleMarketplaceView.as_view(), name='simple-marketplace'),
    
    # Tasks endpoints
    path('tasks/', views.TaskListView.as_view(), name='task-list'),
    path('tasks/create/', views.TaskCreateView.as_view(), name='task-create'),
    path('tasks/<int:pk>/update/', views.TaskUpdateView.as_view(), name='task-update'),
    path('tasks/<int:pk>/complete/', views.TaskCompleteView.as_view(), name='task-complete'),
    path('tasks/<int:pk>/delete/', views.TaskDeleteView.as_view(), name='task-delete'),
    
    # Orders endpoints
    path('orders/create/', views.OrderCreateView.as_view(), name='order-create'),
]
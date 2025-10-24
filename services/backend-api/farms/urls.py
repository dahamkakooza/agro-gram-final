from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet, PlotViewSet, FarmTaskViewSet, FarmDashboardView

router = DefaultRouter()
router.register(r'farms', FarmViewSet, basename='farm')
router.register(r'plots', PlotViewSet, basename='plot')
router.register(r'tasks', FarmTaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard & Analytics
    path('dashboard/', FarmDashboardView.as_view(), name='farm-dashboard'),
    
    # Farm-specific endpoints
    path('farms/<int:pk>/analytics/', FarmViewSet.as_view({'get': 'analytics'}), name='farm-analytics'),
    path('farms/<int:pk>/tasks/', FarmViewSet.as_view({'get': 'tasks'}), name='farm-tasks'),
    path('farms/<int:pk>/recommendations/', FarmViewSet.as_view({'post': 'generate_recommendations'}), name='farm-recommendations'),
    
    # Plot-specific endpoints
    path('plots/<int:pk>/crop-history/', PlotViewSet.as_view({'get': 'crop_history'}), name='plot-crop-history'),
    path('plots/<int:pk>/add-crop/', PlotViewSet.as_view({'post': 'add_crop'}), name='plot-add-crop'),
    
    # Task management
    path('tasks/<int:pk>/complete/', FarmTaskViewSet.as_view({'post': 'mark_completed'}), name='task-complete'),
    
    # Additional farm management endpoints
    path('farms/<int:pk>/plots/', FarmViewSet.as_view({'get': 'list'}), name='farm-plots-list'),
    path('farms/<int:pk>/tasks/overview/', FarmViewSet.as_view({'get': 'tasks'}), name='farm-tasks-overview'),
]

# REMOVE THIS - No double versioning needed
# urlpatterns = [
#     path('api/v1/farms/', include(urlpatterns)),
# ]

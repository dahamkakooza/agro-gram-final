# In your recommendations/urls.py or wherever you define URLs
from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CropRecommendationView,
    PricePredictionView,  # Add this 
    AgricultureChatView, 
    FeedbackView, 
    ModelRetrainingView, 
    RecommendationRootView,
    NetworkStatusView,  # Add this
    GeminiStatusView,   # Add this
    GeminiTestView,      # Add this
    SystemDiagnosticView,  # Add this
    NetworkDiagnosticView  # Add this
)

router = DefaultRouter()
router.register(r'', RecommendationRootView, basename='recommendations')

urlpatterns = [
    path('', include(router.urls)),
    
    # Core AI Recommendations
    path('crop-recommendation/', CropRecommendationView.as_view(), name='crop-recommendation'),
    
    
    path('agriculture-chat/', AgricultureChatView.as_view(), name='agriculture-chat'),
    path('price-prediction/', views.PricePredictionView.as_view(), name='price-prediction'),  # Add this line
    # Feedback & Model Improvement
    path('feedback/', FeedbackView.as_view(), name='recommendation-feedback'),
    path('retrain-model/', ModelRetrainingView.as_view(), name='model-retraining'),
    path('network-status/', views.NetworkStatusView.as_view(), name='network-status'),  # Add this line
    path('gemini-test/', views.GeminiTestView.as_view(), name='gemini-test'),  # Add this line
    path('gemini-status/', views.GeminiStatusView.as_view(), name='gemini-status'),  # Add this line

    # Advanced AI Features
    path('crop-recommendation/advanced/', CropRecommendationView.as_view(), name='advanced-crop-recommendation'),
    path('agriculture-chat/contextual/', AgricultureChatView.as_view(), name='contextual-agriculture-chat'),
    #path('gemini-status/', views.GeminiStatusView.as_view(), name='gemini-status'),
    #path('gemini-debug/', views.GeminiDebugView.as_view(), name='gemini-debug'),
    # Batch Processing
    path('batch-recommendations/', CropRecommendationView.as_view(), name='batch-recommendations'),
    path('system-diagnostic/', SystemDiagnosticView.as_view(), name='system-diagnostic'),
    path('network-diagnostic/', NetworkDiagnosticView.as_view(), name='network-diagnostic'),
]
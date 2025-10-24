# marketplace/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework import viewsets
from django.db.models import Count, Avg, Q, F, ExpressionWrapper, FloatField
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, JSONParser

from .models import (
    ProductListing, ProductCategory, Order, UserPreference, 
    PricePrediction, SearchQueryLog, Task, MarketplaceAnalytics,
    SearchSuggestion, ProductViewHistory, ShoppingCart, CartItem
)
from .serializers import (
    ProductListingSerializer, ProductCategorySerializer, OrderSerializer,
    UserPreferenceSerializer, PricePredictionSerializer, MarketplaceAnalyticsSerializer,
    SearchSuggestionSerializer, TaskSerializer, PricePredictionRequestSerializer,
    BulkPricePredictionSerializer, PricePredictionResponseSerializer, ShoppingCartSerializer, CartItemSerializer, AddToCartSerializer,  # ADD THESE
    UpdateCartItemSerializer, CheckoutSerializer  # ADD THESE
)
from users.authentication import FirebaseAuthentication, DebugModeAuthentication
from users.permissions import IsAuthenticatedCustom
from django.conf import settings
import logging
import asyncio

# Import the enhanced price predictor with fallback
try:
    from recommendations.ml_models.kaggle_enhanced_predictor import KaggleEnhancedPredictor
    price_predictor = KaggleEnhancedPredictor()
    logger = logging.getLogger(__name__)
    logger.info("✅ Kaggle Enhanced Predictor loaded successfully")
except ImportError as e:
    from recommendations.ml_models.price_predictor import PricePredictor
    price_predictor = PricePredictor()
    logger = logging.getLogger(__name__)
    logger.info("✅ Standard Price Predictor loaded (Kaggle not available)")

# Smart authentication selector
def get_authentication_classes():
    if settings.DEBUG:
        return [FirebaseAuthentication, DebugModeAuthentication]
    else:
        return [FirebaseAuthentication]

# ViewSets
class ProductListingViewSet(viewsets.ModelViewSet):
    queryset = ProductListing.objects.filter(status='AVAILABLE')
    serializer_class = ProductListingSerializer
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    parser_classes = [MultiPartParser, JSONParser]

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Handle sorting safely without complex annotations
        sort_by = self.request.query_params.get('sort', 'relevance')

        if sort_by == 'demand':
            queryset = queryset.order_by('-demand_score', '-created_at')
        elif sort_by == 'price_trend':
            queryset = queryset.order_by('-price_trend', '-created_at')
        elif sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        else:  # relevance or default
            queryset = queryset.order_by('-created_at')

        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new product listing with image upload support"""
        try:
            logger.info(f"📥 Product creation request from user: {request.user.email}")
            logger.info(f"📥 Request data: {request.data}")
            logger.info(f"📥 Files: {request.FILES}")
            
            # Prepare data - don't include farmer as it's read-only
            data = request.data.copy()
            
            serializer = self.get_serializer(data=data)
            
            if not serializer.is_valid():
                logger.error(f"❌ Serializer validation errors: {serializer.errors}")
                return Response({
                    "success": False,
                    "error": "Validation failed",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            logger.info(f"✅ Product created successfully: {serializer.data.get('title')}")
            
            headers = self.get_success_headers(serializer.data)
            return Response({
                "success": True,
                "message": "Product listed successfully!",
                "product": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            logger.error(f"❌ Product creation error: {str(e)}", exc_info=True)
            return Response({
                "success": False,
                "error": "Failed to create product listing",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        """Set the farmer from the authenticated user"""
        # FIXED: request.user is already the UserProfile
        serializer.save(farmer=self.request.user)

    @action(detail=False, methods=['get'])
    def personalized(self, request):
        """Get personalized recommendations for the user"""
        try:
            # FIXED: request.user is already the UserProfile
            preferences, created = UserPreference.objects.get_or_create(user=request.user)

            queryset = self.get_queryset()

            # Apply basic filters based on preferences
            if preferences.preferred_categories.exists():
                queryset = queryset.filter(
                    category__in=preferences.preferred_categories.all()
                )

            if preferences.quality_preference:
                queryset = queryset.filter(quality_grade=preferences.quality_preference)

            if preferences.price_range_min and preferences.price_range_max:
                queryset = queryset.filter(
                    price__gte=preferences.price_range_min,
                    price__lte=preferences.price_range_max
                )

            # Apply location preferences if available
            if preferences.preferred_location:
                queryset = queryset.filter(location__icontains=preferences.preferred_location)

            # Order by demand score and recency
            queryset = queryset.order_by('-demand_score', '-created_at')[:20]

            serializer = self.get_serializer(queryset, many=True)
            return Response({
                "success": True,
                "personalized_recommendations": serializer.data,
                "total_recommendations": queryset.count(),
                "preferences_used": {
                    'categories': [cat.name for cat in preferences.preferred_categories.all()],
                    'quality': preferences.quality_preference,
                    'price_range': {
                        'min': preferences.price_range_min,
                        'max': preferences.price_range_max
                    } if preferences.price_range_min and preferences.price_range_max else None,
                    'location': preferences.preferred_location
                }
            })

        except Exception as e:
            logger.error(f"Personalized recommendations error: {e}")
            return Response(
                {"error": "Failed to get personalized recommendations"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def market_insights(self, request):
        try:
            insights = {
                "trending_crops": self._get_trending_crops(),
                "price_movements": self._get_price_movements(),
                "supply_demand": self._get_supply_demand_balance(),
                "regional_insights": self._get_regional_insights(),
                "quality_distribution": self._get_quality_distribution()
            }

            return Response({
                "success": True,
                "market_insights": insights
            })

        except Exception as e:
            logger.error(f"Market insights error: {e}")
            return Response(
                {"error": "Failed to get market insights"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def similar_products(self, request, pk=None):
        try:
            product = self.get_object()

            similar_products = ProductListing.objects.filter(
                category=product.category,
                status='AVAILABLE'
            ).exclude(id=product.id).order_by('-demand_score')[:6]

            serializer = self.get_serializer(similar_products, many=True)
            return Response({
                "success": True,
                "similar_products": serializer.data
            })

        except Exception as e:
            logger.error(f"Similar products error: {e}")
            return Response(
                {"error": "Failed to find similar products"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def price_history(self, request, pk=None):
        try:
            product = self.get_object()

            price_history = self._generate_price_history(product)

            # Use real AI model for price prediction
            crop_name = product.title.split()[0] if product.title else "Crop"
            try:
                # ✅ FIXED: Use the new API method
                api_request = {
                    'cropType': crop_name,
                    'market': 'General Market',
                    'prediction_days': 30
                }
                
                result = price_predictor.predict_price_api(api_request)
                
                if result.get('success'):
                    prediction = {
                        "crop_type": crop_name,
                        "predicted_price": result.get('predicted_price', float(product.price)),
                        "confidence": result.get('confidence', 0.8),
                        "trend": result.get('trend', 'stable'),
                        "price_change_percentage": 0  # Simplified for now
                    }
                else:
                    prediction = {
                        "crop_type": crop_name,
                        "predicted_price": float(product.price),
                        "confidence": 0.6,
                        "trend": "stable",
                        "price_change_percentage": 0
                    }
            except Exception as e:
                logger.error(f"Price prediction in history failed: {e}")
                prediction = {
                    "crop_type": crop_name,
                    "predicted_price": float(product.price),
                    "confidence": 0.6,
                    "trend": "stable",
                    "price_change_percentage": 0
                }

            return Response({
                "success": True,
                "product_id": product.id,
                "product_title": product.title,
                "current_price": float(product.price),
                "price_history": price_history,
                "price_prediction": prediction
            })

        except Exception as e:
            logger.error(f"Price history error: {e}")
            return Response(
                {"error": "Failed to fetch price history"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_trending_crops(self):
        return list(ProductListing.objects.values('category__name').annotate(
            total_demand=Avg('demand_score'),
            listing_count=Count('id'),
            avg_price=Avg('price')
        ).order_by('-total_demand')[:5])

    def _get_price_movements(self):
        return list(ProductListing.objects.filter(
            price_trend__isnull=False
        ).values('title', 'price_trend', 'category__name').order_by('-price_trend')[:5])

    def _get_supply_demand_balance(self):
        return {
            "high_demand_low_supply": ProductListing.objects.filter(
                demand_score__gt=0.7, quantity__lt=50
            ).count(),
            "balanced_market": ProductListing.objects.filter(
                demand_score__gte=0.3, demand_score__lte=0.7, quantity__gte=20
            ).count(),
            "low_demand_high_supply": ProductListing.objects.filter(
                demand_score__lt=0.3, quantity__gt=100
            ).count()
        }

    def _get_regional_insights(self):
        return list(ProductListing.objects.exclude(location='').values('location').annotate(
            avg_price=Avg('price'),
            total_listings=Count('id'),
            avg_demand=Avg('demand_score')
        ).order_by('-total_listings')[:5])

    def _get_quality_distribution(self):
        return list(ProductListing.objects.values('quality_grade').annotate(
            count=Count('id'),
            avg_price=Avg('price')
        ).order_by('-count'))

    def _generate_price_history(self, product):
        base_price = float(product.price)
        history = []

        for i in range(6, 0, -1):
            month_date = timezone.now() - timedelta(days=30 * i)
            fluctuation = (i % 3 - 1) * 0.1
            historical_price = base_price * (1 + fluctuation)

            history.append({
                'date': month_date.strftime('%Y-%m-%d'),
                'price': round(historical_price, 2),
                'volume': max(10, 50 - i * 8)
            })

        history.append({
            'date': timezone.now().strftime('%Y-%m-%d'),
            'price': float(product.price),
            'volume': product.quantity,
            'current': True
        })

        return history

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        # FIXED: request.user is already the UserProfile
        user_profile = self.request.user
        return Order.objects.filter(customer=user_profile).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        try:
            # FIXED: request.user is already the UserProfile
            user_profile = request.user
            data = request.data.copy()
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response({
                "success": True,
                "message": "Order created successfully!",
                "order": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            return Response({
                "success": False,
                "error": "Failed to create order",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        """Set the customer from the authenticated user"""
        serializer.save(customer=self.request.user)

# API Views
# marketplace/views.py - Fix the ProductSearchView
class ProductSearchView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        """GET endpoint for product search with query parameters"""
        try:
            query = request.GET.get('q', '').strip()
            category = request.GET.get('category', '')
            price_min = request.GET.get('price_min', '')
            price_max = request.GET.get('price_max', '')
            quality = request.GET.get('quality', '')
            location = request.GET.get('location', '')
            limit = int(request.GET.get('limit', 20))

            # Start with all available products
            products = ProductListing.objects.filter(status='AVAILABLE')

            # Apply search query
            if query:
                products = products.filter(
                    Q(title__icontains=query) |
                    Q(description__icontains=query) |
                    Q(category__name__icontains=query)
                )

            # Apply filters
            if category:
                # Handle both category ID and category name
                try:
                    # Try to parse as integer (category ID)
                    category_id = int(category)
                    products = products.filter(category_id=category_id)
                except (ValueError, TypeError):
                    # If not an integer, treat as category name
                    products = products.filter(category__name=category)
            
            if price_min:
                try:
                    products = products.filter(price__gte=float(price_min))
                except (ValueError, TypeError):
                    pass  # Ignore invalid price_min
            
            if price_max:
                try:
                    products = products.filter(price__lte=float(price_max))
                except (ValueError, TypeError):
                    pass  # Ignore invalid price_max
            
            if quality:
                products = products.filter(quality_grade=quality)
            
            if location:
                products = products.filter(location__icontains=location)

            # Apply ordering and limit
            products = products.order_by('-created_at')[:limit]

            # Log the search query
            if query or any([category, price_min, price_max, quality, location]):
                SearchQueryLog.objects.create(
                    user=request.user,
                    query=query or '',
                    results_count=products.count(),
                    filters_applied={
                        'category': category,
                        'price_min': price_min,
                        'price_max': price_max,
                        'quality': quality,
                        'location': location
                    }
                )

            serializer = ProductListingSerializer(products, many=True, context={'request': request})

            return Response({
                "success": True,
                "search_results": serializer.data,
                "total_results": products.count(),
                "query": query,
                "filters_applied": {
                    'category': category,
                    'price_min': price_min,
                    'price_max': price_max,
                    'quality': quality,
                    'location': location
                }
            })

        except Exception as e:
            logger.error(f"Search error: {e}", exc_info=True)
            return Response(
                {"error": "Search failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """POST endpoint for product search (backward compatibility)"""
        try:
            query = request.data.get('query', '').strip()
            filters = request.data.get('filters', {})
            limit = request.data.get('limit', 20)

            # Basic search implementation
            products = ProductListing.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query),
                status='AVAILABLE'
            )

            # Apply additional filters from POST data
            category = filters.get('category')
            price_min = filters.get('price_min')
            price_max = filters.get('price_max')
            quality = filters.get('quality')
            location = filters.get('location')

            if category:
                try:
                    category_id = int(category)
                    products = products.filter(category_id=category_id)
                except (ValueError, TypeError):
                    products = products.filter(category__name=category)
            
            if price_min:
                try:
                    products = products.filter(price__gte=float(price_min))
                except (ValueError, TypeError):
                    pass
            
            if price_max:
                try:
                    products = products.filter(price__lte=float(price_max))
                except (ValueError, TypeError):
                    pass
            
            if quality:
                products = products.filter(quality_grade=quality)
            
            if location:
                products = products.filter(location__icontains=location)

            products = products.order_by('-created_at')[:limit]

            serializer = ProductListingSerializer(products, many=True, context={'request': request})

            # Log the search query
            SearchQueryLog.objects.create(
                user=request.user,
                query=query,
                results_count=products.count(),
                filters_applied=filters
            )

            return Response({
                "success": True,
                "search_results": serializer.data,
                "total_results": products.count()
            })

        except Exception as e:
            logger.error(f"Search error: {e}", exc_info=True)
            return Response(
                {"error": "Search failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """POST endpoint for product search (backward compatibility)"""
        try:
            query = request.data.get('query', '').strip()
            filters = request.data.get('filters', {})
            limit = request.data.get('limit', 20)

            if not query:
                return Response(
                    {"error": "Search query is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Basic search implementation
            products = ProductListing.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query),
                status='AVAILABLE'
            )[:limit]

            # Apply additional filters from POST data
            category = filters.get('category')
            price_min = filters.get('price_min')
            price_max = filters.get('price_max')
            quality = filters.get('quality')
            location = filters.get('location')

            if category:
                products = products.filter(category__name=category)
            if price_min:
                products = products.filter(price__gte=float(price_min))
            if price_max:
                products = products.filter(price__lte=float(price_max))
            if quality:
                products = products.filter(quality_grade=quality)
            if location:
                products = products.filter(location__icontains=location)

            serializer = ProductListingSerializer(products, many=True)

            # Log the search query
            SearchQueryLog.objects.create(
                user=request.user,
                query=query,
                results_count=products.count(),
                filters_applied=filters
            )

            return Response({
                "success": True,
                "search_results": serializer.data
            })

        except Exception as e:
            logger.error(f"Search error: {e}")
            return Response(
                {"error": "Search failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PricePredictionView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        try:
            # Validate request data
            serializer = PricePredictionRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    "success": False,
                    "error": "Invalid request data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            crop_type = validated_data['cropType']
            region = validated_data.get('market', '')
            prediction_period = validated_data.get('predictionPeriod', '1 Month')
            use_global = validated_data.get('useGlobal', False)
            country = validated_data.get('country', 'global')
            days_ahead = validated_data.get('prediction_days', 30)
            
            logger.info(f"💰 Price prediction request: cropType={crop_type}, market={region}, predictionPeriod={prediction_period}")

            # Try global prediction if requested and available
            if use_global and hasattr(price_predictor, 'predict_global_price'):
                try:
                    logger.info(f"🌍 Attempting global prediction for {crop_type} in {country}")
                    
                    # Run async global prediction
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    global_result = loop.run_until_complete(
                        price_predictor.predict_global_price(crop_type, country, days_ahead)
                    )
                    loop.close()
                    
                    if global_result.get('success'):
                        # Convert to frontend format
                        price_points = [p['predicted_price'] for p in global_result.get('predictions', [])]
                        min_price = min(price_points) * 100 if price_points else 0
                        max_price = max(price_points) * 100 if price_points else 0
                        
                        response_data = {
                            "success": True,
                            "crop": crop_type,
                            "region": country,
                            "prediction_period": prediction_period,
                            "predicted_price": global_result.get('average_predicted_price', 0) * 100,
                            "confidence": global_result.get('overall_confidence', 0.8),
                            "trend": global_result.get('price_trend', 'stable'),
                            "predictions": global_result.get('predictions', []),
                            "price_range": {
                                'min': round(min_price, 2),
                                'max': round(max_price, 2),
                                'avg': round(global_result.get('average_predicted_price', 0) * 100, 2)
                            },
                            "current_price": global_result.get('average_predicted_price', 0) * 100,
                            "timestamp": timezone.now().isoformat(),
                            "prediction_type": "global",
                            "data_sources": global_result.get('data_sources', ['global_model']),
                            "message": f"Global price prediction for {crop_type} in {country}"
                        }
                        
                        # Add Kaggle insights if available
                        if hasattr(price_predictor, 'get_kaggle_status'):
                            kaggle_status = price_predictor.get_kaggle_status()
                            response_data['kaggle_status'] = kaggle_status
                        
                        logger.info(f"🌍 Global prediction successful for {crop_type}")
                        return Response(response_data)
                    else:
                        logger.warning("🌍 Global prediction failed, falling back to standard")
                except Exception as e:
                    logger.error(f"🌍 Global prediction error: {e}")
                    # Fall back to standard prediction
            
            # ✅ STANDARD PREDICTION: Use the predict_price_api method
            prediction_request = {
                'cropType': crop_type,
                'market': region,
                'prediction_days': days_ahead,
                'country': country
            }
            
            logger.info(f"💰 Calling predict_price_api with: {prediction_request}")
            result = price_predictor.predict_price_api(prediction_request)
            
            logger.info(f"💰 Price prediction API result - Success: {result.get('success')}")
            
            if result.get('success'):
                # Format the response for frontend
                response_data = {
                    "success": True,
                    "crop": crop_type,
                    "region": region,
                    "prediction_period": prediction_period,
                    "predicted_price": result.get('predicted_price', 0),
                    "confidence": result.get('confidence', 0.8),
                    "trend": result.get('trend', 'stable'),
                    "predictions": result.get('predictions', []),
                    "price_range": result.get('price_range', {}),
                    "current_price": result.get('predicted_price', 0),
                    "timestamp": timezone.now().isoformat(),
                    "prediction_type": "standard",
                    "message": f"Price prediction generated for {crop_type}"
                }
                
                # Add Kaggle enhancement info if available
                if result.get('kaggle_enhanced'):
                    response_data['kaggle_enhanced'] = True
                    response_data['kaggle_insights'] = result.get('kaggle_insights', {})
                    response_data['data_sources'] = result.get('data_sources', []) + ['kaggle']
                else:
                    response_data['kaggle_enhanced'] = False
                    response_data['data_sources'] = result.get('data_sources', ['standard_model'])
                
                logger.info(f"💰 Price prediction successful for {crop_type}")
                return Response(response_data)
            else:
                # If API method fails, try fallback
                logger.warning(f"💰 API method fails, using fallback: {result.get('error')}")
                return self._get_fallback_prediction(crop_type, region, days_ahead)
            
        except Exception as e:
            logger.error(f"❌ Price prediction error: {str(e)}", exc_info=True)
            return Response({
                "success": False,
                "error": "Failed to generate price prediction",
                "message": "Our price prediction service is temporarily unavailable."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_fallback_prediction(self, crop_type, region, days_ahead):
        """Fallback price prediction when main method fails"""
        try:
            base_prices = {
                'Maize': 48.50, 'Rice': 55.25, 'Beans': 65.80, 
                'Cassava': 32.60, 'Wheat': 42.75, 'Tomatoes': 18.90, 'Potatoes': 22.45
            }
            
            base_price = base_prices.get(crop_type, 40.00)
            
            # Simple seasonal adjustment
            month = timezone.now().month
            if month in [12, 1, 2]:  # High season
                price = base_price * 1.2
            elif month in [6, 7, 8]:  # Low season
                price = base_price * 0.8
            else:  # Normal season
                price = base_price
            
            # Add some random variation
            import random
            variation = random.uniform(-0.1, 0.1)
            final_price = price * (1 + variation)
            
            # Generate some sample predictions
            predictions = []
            for i in range(min(7, days_ahead)):
                date = timezone.now() + timedelta(days=i)
                predictions.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'predicted_price': round(final_price * (1 + random.uniform(-0.05, 0.05)), 2),
                    'crop': crop_type,
                    'confidence': 'medium'
                })
            
            return Response({
                "success": True,
                "crop": crop_type,
                "region": region,
                "prediction_period": f"{days_ahead} days",
                "predicted_price": round(final_price, 2),
                "confidence": 0.7,
                "trend": "stable",
                "predictions": predictions,
                "price_range": {
                    'min': round(final_price * 0.85, 2),
                    'max': round(final_price * 1.15, 2),
                    'avg': round(final_price, 2)
                },
                "current_price": round(final_price, 2),
                "timestamp": timezone.now().isoformat(),
                "prediction_type": "fallback",
                "data_sources": ["fallback_model"],
                "message": f"Price prediction generated for {crop_type} (fallback mode)"
            })
            
        except Exception as e:
            logger.error(f"Fallback prediction also failed: {e}")
            return Response({
                "success": False,
                "error": "All prediction methods failed",
                "message": "Please try again later."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BulkPricePredictionView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        try:
            # Validate request data
            serializer = BulkPricePredictionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    "success": False,
                    "error": "Invalid request data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            predictions_data = validated_data['predictions']
            use_global = validated_data.get('useGlobal', False)
            
            results = []

            for prediction_request in predictions_data:
                crop_type = prediction_request.get('cropType', '').capitalize()
                region = prediction_request.get('region', '')
                country = prediction_request.get('country', 'global')
                days_ahead = prediction_request.get('days_ahead', 30)

                if crop_type:
                    try:
                        # Try enhanced prediction first
                        api_request = {
                            'cropType': crop_type,
                            'market': region,
                            'prediction_days': days_ahead,
                            'country': country
                        }
                        
                        result = price_predictor.predict_price_api(api_request)
                        
                        if result.get('success'):
                            prediction_result = {
                                "crop_type": crop_type,
                                "region": region,
                                "country": country,
                                "predicted_price": result.get('predicted_price', 0),
                                "confidence": result.get('confidence', 0.8),
                                "trend": result.get('trend', 'stable'),
                                "predictions": result.get('predictions', []),
                                "current_price": result.get('predicted_price', 0),
                                "prediction_type": "enhanced",
                                "kaggle_enhanced": result.get('kaggle_enhanced', False)
                            }
                        else:
                            # Fallback for individual failed predictions
                            prediction_result = self._create_fallback_prediction(crop_type, region, country, days_ahead)
                        
                    except Exception as e:
                        logger.error(f"Prediction failed for {crop_type}: {e}")
                        prediction_result = self._create_fallback_prediction(crop_type, region, country, days_ahead)
                    
                    results.append(prediction_result)

            return Response({
                "success": True,
                "predictions": results,
                "total_predicted": len([r for r in results if r.get('predicted_price', 0) > 0]),
                "enhanced_predictions": len([r for r in results if r.get('kaggle_enhanced', False)]),
                "use_global": use_global
            })

        except Exception as e:
            logger.error(f"Bulk price prediction error: {e}")
            return Response(
                {"error": "Failed to generate bulk predictions"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _create_fallback_prediction(self, crop_type, region, country, days_ahead):
        """Create fallback prediction for bulk requests"""
        base_prices = {
            'Maize': 48.50, 'Rice': 55.25, 'Beans': 65.80, 
            'Cassava': 32.60, 'Wheat': 42.75, 'Tomatoes': 18.90, 'Potatoes': 22.45
        }
        
        base_price = base_prices.get(crop_type, 40.00)
        
        import random
        final_price = base_price * (1 + random.uniform(-0.1, 0.1))
        
        return {
            "crop_type": crop_type,
            "region": region,
            "country": country,
            "predicted_price": round(final_price, 2),
            "confidence": 0.6,
            "trend": "stable",
            "predictions": [],
            "current_price": round(final_price, 2),
            "prediction_type": "fallback",
            "kaggle_enhanced": False
        }

class UserPreferenceView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get_serializer_context(self):
        """Add request to serializer context"""
        return {'request': self.request}

    def get(self, request):
        try:
            preferences, created = UserPreference.objects.get_or_create(user=request.user)
            serializer = UserPreferenceSerializer(preferences, context=self.get_serializer_context())
            return Response({
                "success": True,
                "preferences": serializer.data
            })
        except Exception as e:
            logger.error(f"Get preferences error: {e}")
            return Response(
                {"error": "Failed to get preferences"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            preferences, created = UserPreference.objects.get_or_create(user=request.user)
            serializer = UserPreferenceSerializer(preferences, data=request.data, partial=True, context=self.get_serializer_context())

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "success": True,
                    "message": "Preferences updated successfully",
                    "preferences": serializer.data
                })
            else:
                return Response({
                    "success": False,
                    "error": "Invalid preference data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Update preferences error: {e}")
            return Response(
                {"error": "Failed to update preferences"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MarketplaceAnalyticsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            start_date = timezone.now() - timedelta(days=days)

            # Get recent searches for the user
            recent_searches = SearchQueryLog.objects.filter(
                user=request.user,
                created_at__gte=start_date
            ).order_by('-created_at').values('query', 'created_at')[:10]
            # Aggregate marketplace analytics
            analytics_data = {
                'date': timezone.now().date(),  # Add required date field
                'total_products': ProductListing.objects.filter(status='AVAILABLE').count(),
                'active_products': ProductListing.objects.filter(
                    status='AVAILABLE',
                    updated_at__gte=start_date
                ).count(),
                'total_orders': Order.objects.filter(created_at__gte=start_date).count(),
                'pending_orders': Order.objects.filter(status='PENDING').count(),
                'avg_demand_score': ProductListing.objects.aggregate(
                    avg_demand=Avg('demand_score')
                )['avg_demand'] or 0,
                'revenue_trend': self._calculate_revenue_trend(days),
                'popular_categories': self._get_popular_categories(days),
                'price_movements': self._get_significant_price_movements(),
                'regional_insights': self._get_regional_insights(),
                'recent_searches': list(recent_searches),
                'user_activity': self._get_user_activity(request.user, days),
                # Add other required fields with defaults
                'new_products_today': 0,
                'products_sold_today': 0,
                'completed_orders': 0,
                'cancelled_orders': 0,
                'daily_revenue': 0,
                'total_revenue': 0,
                'average_order_value': 0,
                'active_users': UserProfile.objects.count(),
                'new_users_today': 0,
                'total_searches': 0,
                'successful_searches': 0,
                'category_distribution': {},
                'average_product_price': 0,
                'price_trend_data': {},
                'demand_insights': {},
                'market_trends': {},
            }
            
            

            serializer = MarketplaceAnalyticsSerializer(analytics_data)
            return Response({
                "success": True,
                "analytics": serializer.data
            })

        except Exception as e:
            logger.error(f"Analytics error: {e}")
            return Response(
                {"error": "Failed to fetch analytics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _calculate_revenue_trend(self, days):
        try:
            recent_orders = Order.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=days),
                status__in=['CONFIRMED', 'DELIVERED']
            )
            total_revenue = sum(float(order.total_price) for order in recent_orders)

            previous_period = Order.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=days*2),
                created_at__lt=timezone.now() - timedelta(days=days),
                status__in=['CONFIRMED', 'DELIVERED']
            )
            previous_revenue = sum(float(order.total_price) for order in previous_period)

            if previous_revenue > 0:
                return ((total_revenue - previous_revenue) / previous_revenue) * 100
            return 0
        except Exception as e:
            logger.error(f"Revenue trend calculation error: {e}")
            return 0

    def _get_popular_categories(self, days):
        return list(ProductListing.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=days)
        ).values('category__name').annotate(
            product_count=Count('id'),
            avg_demand=Avg('demand_score')
        ).order_by('-product_count')[:10])

    def _get_significant_price_movements(self):
        return list(ProductListing.objects.filter(
            price_trend__isnull=False
        ).values('title', 'price_trend', 'category__name').order_by('-price_trend')[:5])

    def _get_regional_insights(self):
        return list(ProductListing.objects.exclude(location='').values('location').annotate(
            product_count=Count('id'),
            avg_price=Avg('price')
        ).order_by('-product_count')[:5])

    def _get_user_activity(self, user, days):
        """Get user-specific activity metrics"""
        return {
            'searches_count': SearchQueryLog.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(days=days)
            ).count(),
            'orders_count': Order.objects.filter(
                # FIXED: user is already the UserProfile
                customer=user,
                created_at__gte=timezone.now() - timedelta(days=days)
            ).count(),
            'last_active': user.last_login.isoformat() if user.last_login else None
        }

class SearchSuggestionsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        try:
            query = request.query_params.get('q', '').strip()
            limit = int(request.query_params.get('limit', 5))

            if not query:
                return Response({
                    "success": True,
                    "suggestions": self._get_trending_searches(limit)
                })

            suggestions = self._generate_suggestions(query, limit)

            serializer = SearchSuggestionSerializer(suggestions, many=True)
            return Response({
                "success": True,
                "query": query,
                "suggestions": serializer.data
            })

        except Exception as e:
            logger.error(f"Search suggestions error: {e}")
            return Response(
                {"error": "Failed to generate suggestions"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _generate_suggestions(self, query, limit):
        suggestions = []

        category_suggestions = ProductCategory.objects.filter(
            Q(name__icontains=query)
        )[:3]

        for category in category_suggestions:
            suggestions.append({
                'query': f"{query} {category.name}",
                'type': 'category',
                'relevance_score': 0.8
            })

        product_suggestions = ProductListing.objects.filter(
            Q(title__icontains=query)
        ).values('title').distinct()[:3]

        for product in product_suggestions:
            suggestions.append({
                'query': product['title'],
                'type': 'product',
                'relevance_score': 0.7
            })

        return suggestions[:limit]

    def _get_trending_searches(self, limit):
        trending = SearchQueryLog.objects.values('query').annotate(
            search_count=Count('id')
        ).order_by('-search_count')[:limit]

        return [{
            'query': item['query'],
            'type': 'trending',
            'relevance_score': 0.9
        } for item in trending]

class CategoryInsightsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        try:
            category_id = request.query_params.get('category_id')

            if category_id:
                insights = self._get_category_insights(category_id)
            else:
                insights = self._get_all_categories_insights()

            return Response({
                "success": True,
                "insights": insights
            })

        except Exception as e:
            logger.error(f"Category insights error: {e}")
            return Response(
                {"error": "Failed to fetch category insights"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_category_insights(self, category_id):
        try:
            category = ProductCategory.objects.get(id=category_id)
            products = ProductListing.objects.filter(category=category, status='AVAILABLE')

            return {
                'category': {
                    'id': category.id,
                    'name': category.name
                },
                'total_products': products.count(),
                'price_range': {
                    'min': products.aggregate(min_price=Avg('price'))['min_price'],
                    'max': products.aggregate(max_price=Avg('price'))['max_price'],
                    'average': products.aggregate(avg_price=Avg('price'))['avg_price']
                },
                'demand_metrics': {
                    'average_demand': products.aggregate(avg_demand=Avg('demand_score'))['avg_demand'],
                    'high_demand_products': products.filter(demand_score__gt=0.7).count()
                }
            }
        except ProductCategory.DoesNotExist:
            return {"error": "Category not found"}

    def _get_all_categories_insights(self):
        categories = ProductCategory.objects.all()

        insights = []
        for category in categories:
            products = ProductListing.objects.filter(category=category, status='AVAILABLE')

            if products.exists():
                insights.append({
                    'category_id': category.id,
                    'category_name': category.name,
                    'product_count': products.count(),
                    'avg_price': products.aggregate(avg_price=Avg('price'))['avg_price'],
                    'avg_demand': products.aggregate(avg_demand=Avg('demand_score'))['avg_demand']
                })

        return insights


# Add to marketplace/views.py - Cart Views

class CartViewSet(viewsets.ModelViewSet):
    """Shopping cart management"""
    serializer_class = ShoppingCartSerializer
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get_queryset(self):
        return ShoppingCart.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Get or create cart for user"""
        cart, created = ShoppingCart.objects.get_or_create(user=self.request.user)
        return cart
    
    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """Get current user's cart"""
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response({
            "success": True,
            "cart": serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": "Invalid data",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = ProductListing.objects.get(
                id=serializer.validated_data['product_id'],
                status='AVAILABLE'
            )
        except ProductListing.DoesNotExist:
            return Response({
                "success": False,
                "error": "Product not available"
            }, status=status.HTTP_404_NOT_FOUND)
        
        cart = self.get_object()
        quantity = serializer.validated_data['quantity']
        
        # Check if product already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Update quantity if item already exists
            cart_item.quantity += quantity
            cart_item.save()
        
        # Validate availability
        if cart_item.quantity > product.quantity:
            return Response({
                "success": False,
                "error": f"Only {product.quantity} units available"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart_serializer = self.get_serializer(cart)
        return Response({
            "success": True,
            "message": "Item added to cart",
            "cart": cart_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def update_item(self, request, item_id=None):
        """Update cart item quantity"""
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response({
                "success": False,
                "error": "Cart item not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UpdateCartItemSerializer(cart_item, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": "Invalid data",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate quantity against product availability
        new_quantity = serializer.validated_data.get('quantity', cart_item.quantity)
        if new_quantity > cart_item.product.quantity:
            return Response({
                "success": False,
                "error": f"Only {cart_item.product.quantity} units available"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        cart = self.get_object()
        cart_serializer = self.get_serializer(cart)
        return Response({
            "success": True,
            "message": "Cart updated",
            "cart": cart_serializer.data
        })
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request, item_id=None):
        """Remove item from cart"""
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response({
                "success": False,
                "error": "Cart item not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        cart_item.delete()
        
        cart = self.get_object()
        cart_serializer = self.get_serializer(cart)
        return Response({
            "success": True,
            "message": "Item removed from cart",
            "cart": cart_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from cart"""
        cart = self.get_object()
        cart.items.all().delete()
        
        cart_serializer = self.get_serializer(cart)
        return Response({
            "success": True,
            "message": "Cart cleared",
            "cart": cart_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Convert cart to order"""
        cart = self.get_object()
        
        if cart.is_empty:
            return Response({
                "success": False,
                "error": "Cart is empty"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate all items are available
        unavailable_items = []
        for item in cart.items.all():
            if not item.is_available:
                unavailable_items.append(item.product.title)
        
        if unavailable_items:
            return Response({
                "success": False,
                "error": "Some items are no longer available",
                "unavailable_items": unavailable_items
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": "Invalid checkout data",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                orders = []
                
                # Group items by seller
                items_by_seller = {}
                for item in cart.items.all():
                    seller = item.product.farmer
                    if seller not in items_by_seller:
                        items_by_seller[seller] = []
                    items_by_seller[seller].append(item)
                
                # Create separate order for each seller
                for seller, items in items_by_seller.items():
                    # Calculate order total
                    order_total = sum(item.total_price for item in items)
                    
                    # Create order
                    order = Order.objects.create(
                        customer=request.user,
                        product=items[0].product,  # For now, we'll use first product
                        quantity=sum(item.quantity for item in items),
                        total_price=order_total,
                        shipping_address=serializer.validated_data['shipping_address'],
                        contact_number=serializer.validated_data['contact_number'],
                        payment_method=serializer.validated_data['payment_method'],
                        shipping_notes=serializer.validated_data.get('notes', '')
                    )
                    orders.append(order)
                    
                    # Update product quantities
                    for item in items:
                        item.product.quantity -= item.quantity
                        item.product.save()
                
                # Clear cart after successful checkout
                cart.items.all().delete()
                
                return Response({
                    "success": True,
                    "message": "Order created successfully",
                    "orders": OrderSerializer(orders, many=True, context={'request': request}).data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Checkout error: {e}")
            return Response({
                "success": False,
                "error": "Checkout failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SimpleMarketplaceView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        """Simple marketplace overview"""
        try:
            products = ProductListing.objects.filter(status='AVAILABLE')[:20]
            serializer = ProductListingSerializer(products, many=True)
            
            return Response({
                "success": True,
                "products": serializer.data,
                "total_products": products.count(),
                "message": "Marketplace data loaded successfully"
            })
        except Exception as e:
            logger.error(f"Marketplace overview error: {e}")
            return Response({
                "success": True,
                "products": [],
                "total_products": 0,
                "message": "Marketplace is ready - no products listed yet"
            })

# marketplace/views.py - Add this view
class ProductCategoriesView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        try:
            categories = ProductCategory.objects.all()
            serializer = ProductCategorySerializer(categories, many=True)
            
            return Response({
                "success": True,
                "categories": serializer.data
            })
        except Exception as e:
            logger.error(f"Error fetching categories: {e}")
            return Response({
                "success": False,
                "error": "Failed to fetch categories"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# TASK MANAGEMENT VIEWS
class TaskListView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get_serializer_context(self):
        """Add request to serializer context"""
        return {'request': self.request}

    def get(self, request):
        try:
            # FIXED: request.user is already the UserProfile
            user_profile = request.user
            tasks = Task.objects.filter(user=user_profile).order_by('-created_at')
            
            # Filter by status if provided
            status_filter = request.query_params.get('status')
            if status_filter:
                tasks = tasks.filter(status=status_filter)
            
            # Filter by priority if provided
            priority_filter = request.query_params.get('priority')
            if priority_filter:
                tasks = tasks.filter(priority=priority_filter)
            
            serializer = TaskSerializer(tasks, many=True, context=self.get_serializer_context())
            
            return Response({
                "success": True,
                "tasks": serializer.data,
                "total_tasks": tasks.count(),
                "pending_tasks": tasks.filter(status='PENDING').count(),
                "completed_tasks": tasks.filter(status='COMPLETED').count()
            })
            
        except Exception as e:
            logger.error(f"Error fetching tasks: {e}")
            return Response({
                "success": False,
                "error": "Failed to fetch tasks"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaskCreateView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get_serializer_context(self):
        """Add request to serializer context"""
        return {'request': self.request}

    def post(self, request):
        try:
            # FIXED: request.user is already the UserProfile
            user_profile = request.user
            task_data = request.data.copy()
            
            serializer = TaskSerializer(data=task_data, context=self.get_serializer_context())
            
            if serializer.is_valid():
                task = serializer.save()
                
                return Response({
                    "success": True,
                    "message": "Task created successfully!",
                    "task": TaskSerializer(task, context=self.get_serializer_context()).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "success": False,
                    "error": "Validation failed",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            return Response({
                "success": False,
                "error": "Failed to create task"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaskUpdateView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get_serializer_context(self):
        """Add request to serializer context"""
        return {'request': self.request}

    def patch(self, request, pk):
        try:
            # FIXED: request.user is already the UserProfile
            user_profile = request.user
            task = get_object_or_404(Task, id=pk, user=user_profile)
            
            serializer = TaskSerializer(task, data=request.data, partial=True, context=self.get_serializer_context())
            
            if serializer.is_valid():
                task = serializer.save()
                
                return Response({
                    "success": True,
                    "message": "Task updated successfully!",
                    "task": TaskSerializer(task, context=self.get_serializer_context()).data
                })
            else:
                return Response({
                    "success": False,
                    "error": "Validation failed",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error updating task: {e}")
            return Response({
                "success": False,
                "error": "Failed to update task"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaskCompleteView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        try:
            # FIXED: request.user is already the UserProfile
            user_profile = request.user
            task = get_object_or_404(Task, id=pk, user=user_profile)
            
            task.status = 'COMPLETED'
            task.completed_at = timezone.now()
            task.save()
            
            return Response({
                "success": True,
                "message": "Task marked as completed!",
                "task": TaskSerializer(task).data
            })
            
        except Exception as e:
            logger.error(f"Error completing task: {e}")
            return Response({
                "success": False,
                "error": "Failed to complete task"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaskDeleteView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def delete(self, request, pk):
        try:
            # FIXED: request.user is already the UserProfile
            user_profile = request.user
            task = get_object_or_404(Task, id=pk, user=user_profile)
            
            task.delete()
            
            return Response({
                "success": True,
                "message": "Task deleted successfully!"
            })
            
        except Exception as e:
            logger.error(f"Error deleting task: {e}")
            return Response({
                "success": False,
                "error": "Failed to delete task"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderCreateView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get_serializer_context(self):
        """Add request to serializer context"""
        return {'request': self.request}

    def post(self, request):
        try:
            # FIXED: request.user is already the UserProfile
            user_profile = request.user
            data = request.data.copy()
            
            serializer = OrderSerializer(data=data, context=self.get_serializer_context())
            
            if serializer.is_valid():
                order = serializer.save()
                
                return Response({
                    "success": True,
                    "message": "Order created successfully!",
                    "order": OrderSerializer(order, context=self.get_serializer_context()).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "success": False,
                    "error": "Validation failed",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            return Response({
                "success": False,
                "error": "Failed to create order"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
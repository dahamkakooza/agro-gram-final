# marketplace/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import (
    ProductCategory, ProductListing, Order, Task,
    UserPreference, PricePrediction, SearchQueryLog,
    MarketplaceAnalytics, SearchSuggestion, ProductViewHistory
)

class ProductCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductCategory
        fields = [
            'id', 'name', 'description', 'product_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_product_count(self, obj):
        return obj.productlisting_set.count()

# marketplace/serializers.py - Update ProductListingSerializer

class ProductListingSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source='farmer.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    market_insights = serializers.SerializerMethodField()
    price_prediction = serializers.SerializerMethodField()
    demand_level = serializers.SerializerMethodField()
    is_available = serializers.BooleanField(read_only=True)
    total_value = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ProductListing
        fields = [
            'id', 'farmer', 'farmer_email', 'category', 'category_name', 
            'title', 'description', 'price', 'quantity', 'unit', 
            'image', 'status', 'quality_grade', 'location',
            'demand_score', 'price_trend', 'market_insights', 'price_prediction',
            'demand_level', 'is_available', 'total_value', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'farmer', 'created_at', 'updated_at', 'demand_score', 
            'price_trend', 'market_insights', 'price_prediction', 'demand_level',
            'is_available', 'total_value'
        ]
    
    def create(self, validated_data):
        """Override create to set farmer from request context"""
        # Get the user profile from context (set by view)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['farmer'] = request.user
        return super().create(validated_data)
    
    def validate_category(self, value):
        """Validate category exists"""
        if not value:
            raise serializers.ValidationError("Category is required")
        
        # Check if category exists
        if not ProductCategory.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Selected category does not exist")
        
        return value
    
    def validate_price(self, value):
        """Validate price is reasonable"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        if value > 1000000:  # $1 million max
            raise serializers.ValidationError("Price is too high")
        return value
    
    def validate_quantity(self, value):
        """Validate quantity is reasonable"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero")
        if value > 1000000:  # 1 million units max
            raise serializers.ValidationError("Quantity is too high")
        return value

    # ... rest of your existing methods ...
    
    def get_market_insights(self, obj):
        """Get AI-generated market insights for the product"""
        return {
            'demand_level': self._get_demand_level(obj.demand_score),
            'price_stability': self._get_price_stability(obj.price_trend),
            'best_time_to_buy': self._get_best_time_to_buy(obj),
            'supply_outlook': self._get_supply_outlook(obj)
        }
    
    def get_price_prediction(self, obj):
        """Get price prediction for the product"""
        current_price = float(obj.price) if obj.price else 0
        trend = float(obj.price_trend) if obj.price_trend else 0
        
        predicted_price = current_price * (1 + (trend / 100))
        
        return {
            'current_price': current_price,
            'predicted_price': round(predicted_price, 2),
            'trend_direction': 'up' if trend > 0 else 'down',
            'trend_percentage': abs(trend),
            'confidence': min(0.8 + (abs(trend) / 100), 0.95)
        }
    
    def get_demand_level(self, obj):
        return self._get_demand_level(obj.demand_score)
    
    def _get_demand_level(self, demand_score):
        if demand_score is None:
            return {'level': 'UNKNOWN', 'color': 'default', 'description': 'Demand data not available'}
        if demand_score > 0.7:
            return {'level': 'HIGH', 'color': 'success', 'description': 'High demand'}
        elif demand_score > 0.4:
            return {'level': 'MEDIUM', 'color': 'warning', 'description': 'Moderate demand'}
        else:
            return {'level': 'LOW', 'color': 'error', 'description': 'Low demand'}
    
    def _get_price_stability(self, price_trend):
        if price_trend is None:
            return {'stability': 'UNKNOWN', 'description': 'Price trend data not available'}
        volatility = abs(price_trend)
        if volatility < 2:
            return {'stability': 'STABLE', 'description': 'Prices are stable'}
        elif volatility < 5:
            return {'stability': 'MODERATE', 'description': 'Moderate price fluctuations'}
        else:
            return {'stability': 'VOLATILE', 'description': 'High price volatility'}
    
    def _get_best_time_to_buy(self, obj):
        if obj.demand_score is None or obj.price_trend is None:
            return {'timing': 'UNKNOWN', 'reason': 'Insufficient market data'}
        if obj.demand_score > 0.7 and obj.price_trend > 0:
            return {'timing': 'SOON', 'reason': 'Prices expected to rise due to high demand'}
        elif obj.demand_score < 0.3 and obj.price_trend < 0:
            return {'timing': 'NOW', 'reason': 'Good prices with low demand'}
        else:
            return {'timing': 'FLEXIBLE', 'reason': 'Stable market conditions'}
    
    def _get_supply_outlook(self, obj):
        if obj.quantity is None:
            return {'outlook': 'UNKNOWN', 'description': 'Supply data not available'}
        if obj.quantity > 100:
            return {'outlook': 'HIGH', 'description': 'Good supply available'}
        elif obj.quantity > 20:
            return {'outlook': 'MODERATE', 'description': 'Limited supply'}
        else:
            return {'outlook': 'LOW', 'description': 'Limited stock available'}
    
    def validate_price(self, value):
        """Validate price is reasonable"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        if value > 1000000:  # $1 million max
            raise serializers.ValidationError("Price is too high")
        return value
    
    def validate_quantity(self, value):
        """Validate quantity is reasonable"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero")
        if value > 1000000:  # 1 million units max
            raise serializers.ValidationError("Quantity is too high")
        return value

class OrderSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    farmer_email = serializers.EmailField(source='product.farmer.email', read_only=True)
    can_be_cancelled = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_email', 'product', 'product_title', 
            'product_price', 'farmer_email', 'quantity', 'total_price', 
            'status', 'shipping_address', 'contact_number', 'can_be_cancelled',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'customer', 'total_price', 'created_at', 'updated_at', 
            'farmer_email', 'can_be_cancelled'
        ]
    
    def create(self, validated_data):
        """Override create to set customer from request context"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['customer'] = request.user
        return super().create(validated_data)
    
    def validate_quantity(self, value):
        """Validate order quantity against available stock"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero")
        return value

class TaskSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'user', 'user_email', 'title', 'description', 'task_type',
            'status', 'priority', 'due_date', 'completed_at', 'estimated_hours',
            'actual_hours', 'is_overdue', 'days_until_due', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Override create to set user from request context"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)
    
    def validate_due_date(self, value):
        """Validate due date is not in the past"""
        if value and value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value
    
    def validate_estimated_hours(self, value):
        """Validate estimated hours is reasonable"""
        if value <= 0:
            raise serializers.ValidationError("Estimated hours must be greater than zero")
        if value > 1000:  # 1000 hours max
            raise serializers.ValidationError("Estimated hours is too high")
        return value

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_categories_details = ProductCategorySerializer(
        source='preferred_categories', many=True, read_only=True
    )
    
    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'preferred_categories', 'preferred_categories_details',
            'quality_preference', 'price_range_min', 'price_range_max',
            'preferred_location', 'email_notifications', 'price_alert_notifications',
            'task_reminder_notifications', 'search_history_enabled',
            'personalized_recommendations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Override create to set user from request context"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)
    
    def validate_price_range_min(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Minimum price cannot be negative")
        return value
    
    def validate_price_range_max(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Maximum price cannot be negative")
        return value
    
    def validate(self, data):
        """Validate that min price is less than max price"""
        price_range_min = data.get('price_range_min')
        price_range_max = data.get('price_range_max')
        
        if price_range_min and price_range_max and price_range_min > price_range_max:
            raise serializers.ValidationError({
                'price_range_min': 'Minimum price cannot be greater than maximum price'
            })
        
        return data

class PricePredictionSerializer(serializers.ModelSerializer):
    price_difference = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    confidence_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = PricePrediction
        fields = [
            'id', 'crop_type', 'region', 'predicted_price', 'current_price',
            'confidence', 'confidence_display', 'prediction_period', 'trend',
            'price_change_percentage', 'min_predicted_price', 'max_predicted_price',
            'price_difference', 'data_sources', 'algorithm_version', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'price_difference', 'confidence_display']
    
    def get_confidence_display(self, obj):
        if obj.confidence is None:
            return "Unknown"
        if obj.confidence > 0.8:
            return "High"
        elif obj.confidence > 0.6:
            return "Medium"
        else:
            return "Low"

class SearchQueryLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True, allow_null=True)
    
    class Meta:
        model = SearchQueryLog
        fields = [
            'id', 'user', 'user_email', 'query', 'results_count', 
            'filters_applied', 'search_duration', 'is_successful', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        """Override create to set user from request context"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)

class MarketplaceAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceAnalytics
        fields = [
            'id', 'date', 'total_products', 'active_products', 'new_products_today',
            'products_sold_today', 'total_orders', 'pending_orders', 'completed_orders',
            'cancelled_orders', 'daily_revenue', 'total_revenue', 'average_order_value',
            'active_users', 'new_users_today', 'total_searches', 'successful_searches',
            'category_distribution', 'average_product_price', 'price_trend_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class SearchSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchSuggestion
        fields = [
            'id', 'query', 'suggestion_type', 'relevance_score', 'search_count',
            'click_count', 'is_active', 'category', 'related_products_count',
            'last_searched', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_searched']

class ProductViewHistorySerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    
    class Meta:
        model = ProductViewHistory
        fields = [
            'id', 'user', 'user_email', 'product', 'product_title', 'view_count',
            'last_viewed', 'first_viewed'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'last_viewed', 'first_viewed']
    
    def create(self, validated_data):
        """Override create to set user from request context"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)

# Analytics and Response Serializers
class RecentSearchSerializer(serializers.Serializer):
    query = serializers.CharField()
    created_at = serializers.DateTimeField()

class UserActivitySerializer(serializers.Serializer):
    searches_count = serializers.IntegerField()
    orders_count = serializers.IntegerField()
    last_active = serializers.DateTimeField(allow_null=True)

class PriceMovementSerializer(serializers.Serializer):
    title = serializers.CharField()
    price_trend = serializers.FloatField()
    category_name = serializers.CharField()

class RegionalInsightSerializer(serializers.Serializer):
    location = serializers.CharField()
    product_count = serializers.IntegerField()
    avg_price = serializers.FloatField()

class PopularCategorySerializer(serializers.Serializer):
    category__name = serializers.CharField(source='name')
    product_count = serializers.IntegerField()
    avg_demand = serializers.FloatField()

class MarketplaceAnalyticsResponseSerializer(serializers.Serializer):
    """Serializer for marketplace analytics API responses"""
    total_products = serializers.IntegerField(default=0)
    active_products = serializers.IntegerField(default=0)
    total_orders = serializers.IntegerField(default=0)
    pending_orders = serializers.IntegerField(default=0)
    avg_demand_score = serializers.FloatField(default=0.0)
    revenue_trend = serializers.FloatField(default=0.0)
    popular_categories = serializers.ListField(child=serializers.DictField(), default=list)
    price_movements = serializers.ListField(child=serializers.DictField(), default=list)
    regional_insights = serializers.ListField(child=serializers.DictField(), default=list)
    recent_searches = serializers.ListField(child=serializers.DictField(), default=list)
    user_activity = serializers.DictField(default=dict)
    
    class Meta:
        fields = [
            'total_products', 'active_products', 'total_orders', 'pending_orders',
            'avg_demand_score', 'revenue_trend', 'popular_categories', 
            'price_movements', 'regional_insights', 'recent_searches', 'user_activity'
        ]

class SearchSuggestionResponseSerializer(serializers.Serializer):
    """Serializer for search suggestion API responses"""
    query = serializers.CharField()
    type = serializers.ChoiceField(choices=['category', 'product', 'trending', 'popular', 'recent'])
    relevance_score = serializers.FloatField()
    
    class Meta:
        fields = ['query', 'type', 'relevance_score']

# Request Serializers for API endpoints
class PricePredictionRequestSerializer(serializers.Serializer):
    """Serializer for price prediction API requests"""
    cropType = serializers.CharField(required=True, help_text="Crop type for prediction")
    market = serializers.CharField(required=False, default="General Market", help_text="Market/region")
    predictionPeriod = serializers.CharField(required=False, default="1 Month", help_text="Prediction period")
    useGlobal = serializers.BooleanField(default=False, help_text="Use global prediction model")
    country = serializers.CharField(required=False, default="global", help_text="Country code")
    prediction_days = serializers.IntegerField(required=False, default=30, help_text="Days to predict ahead")
    
    def validate_cropType(self, value):
        """Validate crop type"""
        if not value:
            raise serializers.ValidationError("Crop type is required")
        
        crop_type = value.capitalize()
        valid_crops = ['Maize', 'Rice', 'Beans', 'Cassava', 'Wheat', 'Tomatoes', 'Potatoes']
        
        if crop_type not in valid_crops:
            raise serializers.ValidationError(
                f"Invalid crop type. Must be one of: {', '.join(valid_crops)}"
            )
        
        return crop_type
    
    def validate_predictionPeriod(self, value):
        """Validate prediction period"""
        valid_periods = ['1 Week', '1 Month', '3 Months', '6 Months', '1 Year']
        if value not in valid_periods:
            raise serializers.ValidationError(
                f"Invalid prediction period. Must be one of: {', '.join(valid_periods)}"
            )
        return value
    
    def validate_prediction_days(self, value):
        """Validate prediction days"""
        if value <= 0:
            raise serializers.ValidationError("Prediction days must be positive")
        if value > 365:
            raise serializers.ValidationError("Prediction cannot exceed 1 year")
        return value

class BulkPricePredictionSerializer(serializers.Serializer):
    """Serializer for bulk price prediction requests"""
    predictions = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of prediction requests"
    )
    useGlobal = serializers.BooleanField(default=False)
    
    def validate_predictions(self, value):
        """Validate each prediction in the bulk request"""
        if not value:
            raise serializers.ValidationError("Predictions list cannot be empty")
        
        for prediction in value:
            if not prediction.get('cropType'):
                raise serializers.ValidationError("Each prediction must have a cropType")
            
            crop_type = prediction.get('cropType', '').capitalize()
            valid_crops = ['Maize', 'Rice', 'Beans', 'Cassava', 'Wheat', 'Tomatoes', 'Potatoes']
            if crop_type not in valid_crops:
                raise serializers.ValidationError(
                    f"Invalid crop type: {crop_type}. Must be one of {valid_crops}"
                )
        
        return value

class PricePredictionResponseSerializer(serializers.Serializer):
    """Serializer for price prediction API responses"""
    success = serializers.BooleanField()
    crop = serializers.CharField()
    region = serializers.CharField()
    prediction_period = serializers.CharField()
    predicted_price = serializers.FloatField()
    confidence = serializers.FloatField()
    trend = serializers.CharField()
    predictions = serializers.ListField(child=serializers.DictField())
    price_range = serializers.DictField()
    current_price = serializers.FloatField()
    timestamp = serializers.DateTimeField()
    prediction_type = serializers.CharField()
    data_sources = serializers.ListField(child=serializers.CharField())
    message = serializers.CharField()
    
    # Optional fields
    kaggle_enhanced = serializers.BooleanField(required=False, default=False)
    kaggle_insights = serializers.DictField(required=False, default=dict)
    kaggle_status = serializers.DictField(required=False, default=dict)
    
    class Meta:
        fields = [
            'success', 'crop', 'region', 'prediction_period', 'predicted_price',
            'confidence', 'trend', 'predictions', 'price_range', 'current_price',
            'timestamp', 'prediction_type', 'data_sources', 'message',
            'kaggle_enhanced', 'kaggle_insights', 'kaggle_status'
        ]

class ProductSearchRequestSerializer(serializers.Serializer):
    """Serializer for product search requests"""
    query = serializers.CharField(required=False, allow_blank=True)
    filters = serializers.DictField(required=False, default=dict)
    limit = serializers.IntegerField(default=20, min_value=1, max_value=100)
    
    def validate_limit(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Limit must be between 1 and 100")
        return value

class TaskCreateRequestSerializer(serializers.Serializer):
    """Serializer for task creation requests"""
    title = serializers.CharField(required=True, max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    task_type = serializers.ChoiceField(choices=Task.TASK_TYPE_CHOICES, default='OTHER')
    priority = serializers.ChoiceField(choices=Task.PRIORITY_CHOICES, default='MEDIUM')
    due_date = serializers.DateTimeField(required=False, allow_null=True)
    estimated_hours = serializers.IntegerField(default=1, min_value=1, max_value=1000)
    
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()

class ProductCreateRequestSerializer(serializers.Serializer):
    """Serializer for product creation requests"""
    title = serializers.CharField(required=True, max_length=200)
    description = serializers.CharField(required=True)
    category = serializers.PrimaryKeyRelatedField(queryset=ProductCategory.objects.all())
    price = serializers.DecimalField(required=True, max_digits=10, decimal_places=2, min_value=0.01)
    quantity = serializers.IntegerField(required=True, min_value=1)
    unit = serializers.ChoiceField(choices=ProductListing.UNIT_CHOICES, default='KG')
    image = serializers.ImageField(required=False, allow_null=True)
    quality_grade = serializers.ChoiceField(choices=ProductListing.QUALITY_CHOICES, default='STANDARD')
    location = serializers.CharField(required=False, allow_blank=True, max_length=200)
    
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()
    
    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty")
        return value.strip()

# Response Serializers for consistent API responses
class SuccessResponseSerializer(serializers.Serializer):
    """Base success response serializer"""
    success = serializers.BooleanField(default=True)
    message = serializers.CharField(required=False)
    timestamp = serializers.DateTimeField(default=timezone.now)

class ErrorResponseSerializer(serializers.Serializer):
    """Base error response serializer"""
    success = serializers.BooleanField(default=False)
    error = serializers.CharField()
    message = serializers.CharField(required=False)
    details = serializers.DictField(required=False, allow_null=True)
    timestamp = serializers.DateTimeField(default=timezone.now)

class PaginatedResponseSerializer(serializers.Serializer):
    """Base paginated response serializer"""
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = serializers.ListField()

class TaskListResponseSerializer(SuccessResponseSerializer):
    """Serializer for task list API responses"""
    tasks = TaskSerializer(many=True)
    total_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()

class ProductListResponseSerializer(SuccessResponseSerializer):
    """Serializer for product list API responses"""
    products = ProductListingSerializer(many=True)
    total_products = serializers.IntegerField()
    filters_applied = serializers.DictField(required=False)

class SearchResponseSerializer(SuccessResponseSerializer):
    """Serializer for search API responses"""
    search_results = ProductListingSerializer(many=True)
    total_results = serializers.IntegerField()
    query = serializers.CharField(required=False)
    filters_applied = serializers.DictField(required=False)

class PersonalizedRecommendationsResponseSerializer(SuccessResponseSerializer):
    """Serializer for personalized recommendations API responses"""
    personalized_recommendations = ProductListingSerializer(many=True)
    total_recommendations = serializers.IntegerField()
    preferences_used = serializers.DictField()

class MarketInsightsResponseSerializer(SuccessResponseSerializer):
    """Serializer for market insights API responses"""
    market_insights = serializers.DictField()

class PriceHistoryResponseSerializer(SuccessResponseSerializer):
    """Serializer for price history API responses"""
    product_id = serializers.IntegerField()
    product_title = serializers.CharField()
    current_price = serializers.FloatField()
    price_history = serializers.ListField(child=serializers.DictField())
    price_prediction = serializers.DictField()

class SimilarProductsResponseSerializer(SuccessResponseSerializer):
    """Serializer for similar products API responses"""
    similar_products = ProductListingSerializer(many=True)

class CategoryInsightsResponseSerializer(SuccessResponseSerializer):
    """Serializer for category insights API responses"""
    insights = serializers.ListField(child=serializers.DictField())

# Import cart models only after all other serializers are defined
from .models import ShoppingCart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    product_seller = serializers.EmailField(source='product.farmer.email', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_title', 'product_price', 'product_image',
            'product_seller', 'quantity', 'total_price', 'is_available',
            'added_at', 'updated_at'
        ]
        read_only_fields = ['id', 'added_at', 'updated_at']

class ShoppingCartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_empty = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ShoppingCart
        fields = [
            'id', 'user', 'items', 'total_items', 'subtotal', 'is_empty',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding items to cart"""
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(default=1, min_value=1)

class UpdateCartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['quantity']

class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout process"""
    shipping_address = serializers.CharField(required=True, max_length=500)
    contact_number = serializers.CharField(required=True, max_length=20)
    payment_method = serializers.CharField(default='Cash on Delivery', max_length=50)
    notes = serializers.CharField(required=False, allow_blank=True)
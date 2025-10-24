# marketplace/models.py
from django.db import models
from django.contrib.auth.models import User
from users.models import UserProfile
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
# Add these imports at the top if not already there
from django.core.exceptions import ValidationError
from django.db import transaction
class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # SEO and search optimization
    keywords = models.JSONField(default=list, blank=True, help_text="Search keywords for this category")
    
    # AI Integration
    ai_prompt_templates = models.JSONField(
        default=dict,
        blank=True,
        help_text="AI prompt templates for this category"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Product Category'
        verbose_name_plural = 'Product Categories'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]

class ProductListing(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('SOLD', 'Sold'),
        ('EXPIRED', 'Expired'),
        ('PENDING', 'Pending Review'),
    )
    
    UNIT_CHOICES = (
        ('KG', 'Kilogram'),
        ('LB', 'Pound'),
        ('TON', 'Ton'),
        ('SACK', 'Sack'),
        ('PIECE', 'Piece'),
        ('BUNCH', 'Bunch'),
        ('CRATE', 'Crate'),
        ('BAG', 'Bag'),
    )
    
    QUALITY_CHOICES = (
        ('PREMIUM', 'Premium'),
        ('STANDARD', 'Standard'),
        ('ECONOMY', 'Economy'),
        ('ORGANIC', 'Organic'),
    )
    
    # Basic Information
    farmer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='product_listings')
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Pricing and Inventory
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='KG')
    
    # Media
    image = models.ImageField(
        upload_to='products/%Y/%m/%d/', 
        blank=True, 
        null=True,
        help_text="Product image"
    )
    
    # Status and Quality
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    quality_grade = models.CharField(max_length=20, choices=QUALITY_CHOICES, default='STANDARD')
    
    # Location
    location = models.CharField(max_length=200, blank=True, null=True)
    latitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        blank=True, 
        null=True,
        help_text="Geographic latitude"
    )
    longitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        blank=True, 
        null=True,
        help_text="Geographic longitude"
    )
    
    # Analytics and AI Fields
    demand_score = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="AI-calculated demand score (0.0 to 1.0)"
    )
    price_trend = models.FloatField(
        default=0.0,
        help_text="Price trend percentage (positive=up, negative=down)"
    )
    
    # Search and SEO
    search_keywords = models.JSONField(
        default=list, 
        blank=True,
        help_text="Auto-generated search keywords"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(
        blank=True, 
        null=True,
        help_text="When the listing automatically expires"
    )
    
    def __str__(self):
        return f"{self.title} - {self.farmer.email}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product Listing'
        verbose_name_plural = 'Product Listings'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['price']),
            models.Index(fields=['demand_score']),
            models.Index(fields=['location']),
        ]
    
    @property
    def is_available(self):
        """Check if product is available for purchase"""
        return self.status == 'AVAILABLE' and self.quantity > 0
    
    @property
    def total_value(self):
        """Calculate total inventory value"""
        return self.price * self.quantity
    
    @property
    def is_expired(self):
        """Check if listing has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    def save(self, *args, **kwargs):
        """Override save to handle auto-expiry and search keywords"""
        if not self.expires_at:
            # Auto-set expiry to 30 days from creation
            self.expires_at = timezone.now() + timezone.timedelta(days=30)
        
        # Auto-generate search keywords if not set
        if not self.search_keywords:
            self.search_keywords = self._generate_search_keywords()
        
        super().save(*args, **kwargs)
    
    def _generate_search_keywords(self):
        """Generate search keywords from product data"""
        keywords = set()
        
        # Add words from title and description
        text_content = f"{self.title} {self.description} {self.category.name}"
        words = text_content.lower().split()
        keywords.update(words)
        
        # Add quality and unit
        keywords.add(self.quality_grade.lower())
        keywords.add(self.unit.lower())
        
        # Add location if available
        if self.location:
            location_words = self.location.lower().split()
            keywords.update(location_words)
        
        return list(keywords)[:50]  # Limit to 50 keywords
# Add Shopping Cart models AFTER ProductListing
class ShoppingCart(models.Model):
    """Shopping cart for users"""
    user = models.OneToOneField(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='shopping_cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart - {self.user.email}"
    
    class Meta:
        verbose_name = 'Shopping Cart'
        verbose_name_plural = 'Shopping Carts'
    
    @property
    def total_items(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0
    
    @property
    def subtotal(self):
        return sum(item.total_price for item in self.items.all())
    
    @property
    def is_empty(self):
        return self.items.count() == 0

class CartItem(models.Model):
    """Individual items in shopping cart"""
    cart = models.ForeignKey(
        ShoppingCart, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        'ProductListing',  # Use string reference to avoid circular import
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.title} in {self.cart.user.email}'s cart"
    
    class Meta:
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        unique_together = ['cart', 'product']
        ordering = ['-added_at']
    
    @property
    def total_price(self):
        return self.product.price * self.quantity
    
    @property
    def is_available(self):
        return self.product.is_available and self.product.quantity >= self.quantity

    def clean(self):
        """Validate cart item"""
        if self.quantity > self.product.quantity:
            raise ValidationError(
                f"Only {self.product.quantity} units available for {self.product.title}"
            )
    
    def save(self, *args, **kwargs):
        """Validate before saving"""
        self.clean()
        super().save(*args, **kwargs)
class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'REFUNDED'),
    )
    
    # Order Relationships
    customer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey(ProductListing, on_delete=models.PROTECT, related_name='orders')
    
    # Order Details
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Shipping Information
    shipping_address = models.TextField()
    contact_number = models.CharField(
        max_length=20, 
        default='Unknown',
        help_text="Customer contact number"
    )
    shipping_notes = models.TextField(blank=True, null=True)
    
    # Payment Information
    payment_method = models.CharField(max_length=50, default='Cash on Delivery')
    payment_status = models.CharField(
        max_length=20,
        choices=(
            ('PENDING', 'Pending'),
            ('PAID', 'Paid'),
            ('FAILED', 'Failed'),
            ('REFUNDED', 'Refunded'),
        ),
        default='PENDING'
    )
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.customer.email}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        indexes = [
            models.Index(fields=['customer', 'created_at']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['payment_status']),
        ]
    
    @property
    def can_be_cancelled(self):
        """Check if order can be cancelled"""
        return self.status in ['PENDING', 'CONFIRMED']
    
    @property
    def is_completed(self):
        """Check if order is completed"""
        return self.status in ['DELIVERED', 'REFUNDED']
    
    def save(self, *args, **kwargs):
        """Override save to auto-calculate total price and update timestamps"""
        # Auto-calculate total price if not set
        if not self.total_price and self.product and self.quantity:
            self.total_price = self.product.price * self.quantity
        
        # Update status timestamps
        if self.status == 'CONFIRMED' and not self.confirmed_at:
            self.confirmed_at = timezone.now()
        elif self.status == 'SHIPPED' and not self.shipped_at:
            self.shipped_at = timezone.now()
        elif self.status == 'DELIVERED' and not self.delivered_at:
            self.delivered_at = timezone.now()
        
        super().save(*args, **kwargs)

class Task(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('ON_HOLD', 'On Hold'),
    )
    
    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )
    
    TASK_TYPE_CHOICES = (
        ('PLANTING', 'Planting'),
        ('HARVESTING', 'Harvesting'),
        ('IRRIGATION', 'Irrigation'),
        ('FERTILIZATION', 'Fertilization'),
        ('PEST_CONTROL', 'Pest Control'),
        ('WEEDING', 'Weeding'),
        ('PRUNING', 'Pruning'),
        ('MAINTENANCE', 'Maintenance'),
        ('MARKETING', 'Marketing'),
        ('INVENTORY', 'Inventory Management'),
        ('EQUIPMENT', 'Equipment Maintenance'),
        ('OTHER', 'Other'),
    )
    
    # Task Relationships
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='tasks')
    
    # Task Details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    task_type = models.CharField(max_length=20, choices=TASK_TYPE_CHOICES, default='OTHER')
    
    # Status and Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    
    # Timing
    due_date = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Effort Tracking
    estimated_hours = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
        help_text="Estimated hours to complete"
    )
    actual_hours = models.PositiveIntegerField(
        blank=True, 
        null=True,
        help_text="Actual hours spent"
    )
    
    # Task Dependencies and Relationships
    parent_task = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='subtasks'
    )
    related_product = models.ForeignKey(
        ProductListing,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='related_tasks'
    )
    
    # Notes and Attachments
    notes = models.TextField(blank=True, null=True)
    attachment = models.FileField(
        upload_to='task_attachments/%Y/%m/%d/',
        blank=True,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['due_date', 'priority']),
            models.Index(fields=['task_type', 'status']),
        ]
    
    @property
    def is_overdue(self):
        """Check if task is overdue"""
        if self.due_date and self.status != 'COMPLETED':
            return timezone.now() > self.due_date
        return False
    
    @property
    def days_until_due(self):
        """Calculate days until due date"""
        if self.due_date:
            delta = self.due_date - timezone.now()
            return delta.days
        return None
    
    @property
    def completion_percentage(self):
        """Calculate completion percentage based on subtasks"""
        if self.subtasks.exists():
            completed = self.subtasks.filter(status='COMPLETED').count()
            total = self.subtasks.count()
            return (completed / total) * 100 if total > 0 else 0
        return 100 if self.status == 'COMPLETED' else 0

class UserPreference(models.Model):
    """User preferences for personalized experience"""
    
    # User Relationship
    user = models.OneToOneField(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='preferences'
    )
    
    # Category Preferences
    preferred_categories = models.ManyToManyField(
        ProductCategory, 
        blank=True,
        related_name='preferred_by_users'
    )
    
    # Quality Preference
    quality_preference = models.CharField(
        max_length=20, 
        choices=ProductListing.QUALITY_CHOICES, 
        blank=True, 
        null=True
    )
    
    # Price Range Preferences
    price_range_min = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        validators=[MinValueValidator(0)]
    )
    price_range_max = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        validators=[MinValueValidator(0)]
    )
    
    # Location Preferences
    preferred_location = models.CharField(
        max_length=200, 
        default='',
        blank=True,
        help_text="Primary preferred location"
    )
    preferred_locations = models.JSONField(
        default=list,
        blank=True,
        help_text="List of preferred locations"
    )
    
    # Search History
    search_history = models.JSONField(
        default=list,
        blank=True,
        null=True,
        help_text="User's search history for personalization"
    )
    
    # Notification Preferences
    email_notifications = models.BooleanField(default=True)
    price_alert_notifications = models.BooleanField(default=True)
    task_reminder_notifications = models.BooleanField(default=True)
    market_insight_notifications = models.BooleanField(default=True)
    
    # Search and Privacy Preferences
    search_history_enabled = models.BooleanField(default=True)
    personalized_recommendations = models.BooleanField(default=True)
    data_sharing_enabled = models.BooleanField(default=False)
    
    # UI Preferences
    preferred_theme = models.CharField(
        max_length=20,
        choices=(
            ('LIGHT', 'Light'),
            ('DARK', 'Dark'),
            ('AUTO', 'Auto'),
        ),
        default='AUTO'
    )
    language_preference = models.CharField(max_length=10, default='en')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences - {self.user.email}"
    
    class Meta:
        verbose_name = 'User Preference'
        verbose_name_plural = 'User Preferences'
        indexes = [
            models.Index(fields=['user']),
        ]
    
    @property
    def has_price_preference(self):
        return self.price_range_min is not None and self.price_range_max is not None

class PricePrediction(models.Model):
    """AI-powered price predictions for agricultural products"""
    
    PERIOD_CHOICES = (
        ('1_WEEK', '1 Week'),
        ('1_MONTH', '1 Month'),
        ('3_MONTHS', '3 Months'),
        ('6_MONTHS', '6 Months'),
        ('1_YEAR', '1 Year'),
    )
    
    TREND_CHOICES = (
        ('UP', 'Up'),
        ('DOWN', 'Down'),
        ('STABLE', 'Stable'),
        ('VOLATILE', 'Volatile'),
    )
    
    # Prediction Details
    crop_type = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    
    # Price Information
    predicted_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True
    )
    
    # Prediction Metrics
    confidence = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Prediction confidence score (0.0 to 1.0)"
    )
    prediction_period = models.CharField(
        max_length=20, 
        choices=PERIOD_CHOICES, 
        default='1_MONTH'
    )
    trend = models.CharField(max_length=20, choices=TREND_CHOICES, default='STABLE')
    
    # Price Range
    price_change_percentage = models.FloatField(default=0.0)
    min_predicted_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True
    )
    max_predicted_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True
    )
    
    # Data and Metadata
    data_sources = models.JSONField(default=list, blank=True)
    algorithm_version = models.CharField(max_length=50, default='1.0')
    is_active = models.BooleanField(default=True)
    
    # Market Factors (for explainability)
    market_factors = models.JSONField(
        default=dict,
        blank=True,
        help_text="Factors influencing the prediction"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.crop_type} - {self.region} - ${self.predicted_price}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Price Prediction'
        verbose_name_plural = 'Price Predictions'
        indexes = [
            models.Index(fields=['crop_type', 'region']),
            models.Index(fields=['created_at']),
            models.Index(fields=['confidence']),
        ]
        unique_together = ['crop_type', 'region', 'prediction_period', 'created_at']
    
    @property
    def price_difference(self):
        """Calculate price difference from current price"""
        if self.current_price:
            return self.predicted_price - self.current_price
        return 0
    
    @property
    def is_accurate(self):
        """Check if prediction is considered accurate (high confidence)"""
        return self.confidence > 0.7

class SearchQueryLog(models.Model):
    """Log user search queries for analytics and improvements"""
    
    user = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='search_queries',
        blank=True,
        null=True
    )
    query = models.CharField(max_length=255)
    
    # Search Results
    results_count = models.PositiveIntegerField(default=0)
    filters_applied = models.JSONField(default=dict, blank=True, help_text="Filters applied during search")
    
    # Performance Metrics
    search_duration = models.FloatField(
        default=0.0, 
        help_text="Search duration in seconds"
    )
    is_successful = models.BooleanField(default=True)
    click_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times results from this search were clicked"
    )
    
    # Session Information
    session_id = models.CharField(max_length=100, blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        user_email = self.user.email if self.user else 'Anonymous'
        return f"{user_email} - {self.query}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Search Query Log'
        verbose_name_plural = 'Search Query Logs'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['query']),
            models.Index(fields=['created_at']),
        ]

class MarketplaceAnalytics(models.Model):
    """Aggregated marketplace analytics data"""
    
    date = models.DateField(unique=True)
    
    # Product Metrics
    total_products = models.PositiveIntegerField(default=0)
    active_products = models.PositiveIntegerField(default=0)
    new_products_today = models.PositiveIntegerField(default=0)
    products_sold_today = models.PositiveIntegerField(default=0)
    
    # Order Metrics
    total_orders = models.PositiveIntegerField(default=0)
    pending_orders = models.PositiveIntegerField(default=0)
    completed_orders = models.PositiveIntegerField(default=0)
    cancelled_orders = models.PositiveIntegerField(default=0)
    
    # Revenue Metrics
    daily_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # User Metrics
    active_users = models.PositiveIntegerField(default=0)
    new_users_today = models.PositiveIntegerField(default=0)
    
    # Search Metrics
    total_searches = models.PositiveIntegerField(default=0)
    successful_searches = models.PositiveIntegerField(default=0)
    
    # Category Distribution (stored as JSON)
    category_distribution = models.JSONField(default=dict, blank=True)
    
    # Price Trends
    average_product_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_trend_data = models.JSONField(default=dict, blank=True)
    
    # AI Insights
    demand_insights = models.JSONField(default=dict, blank=True)
    market_trends = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Marketplace Analytics - {self.date}"
    
    class Meta:
        ordering = ['-date']
        verbose_name = 'Marketplace Analytics'
        verbose_name_plural = 'Marketplace Analytics'
        indexes = [
            models.Index(fields=['date']),
        ]

class SearchSuggestion(models.Model):
    """AI-generated search suggestions"""
    
    SUGGESTION_TYPES = (
        ('CATEGORY', 'Category'),
        ('PRODUCT', 'Product'),
        ('TRENDING', 'Trending'),
        ('POPULAR', 'Popular'),
        ('RECENT', 'Recent'),
        ('RELATED', 'Related'),
    )
    
    query = models.CharField(max_length=255)
    suggestion_type = models.CharField(max_length=20, choices=SUGGESTION_TYPES, default='POPULAR')
    
    # Relevance and Performance
    relevance_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    search_count = models.PositiveIntegerField(default=0)
    click_count = models.PositiveIntegerField(default=0)
    conversion_rate = models.FloatField(default=0.0)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    category = models.ForeignKey(
        ProductCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    related_products_count = models.PositiveIntegerField(default=0)
    
    # AI Generation Info
    generated_by_ai = models.BooleanField(default=True)
    ai_model_version = models.CharField(max_length=50, default='1.0')
    
    last_searched = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.query} ({self.suggestion_type})"
    
    class Meta:
        ordering = ['-relevance_score', '-search_count']
        verbose_name = 'Search Suggestion'
        verbose_name_plural = 'Search Suggestions'
        indexes = [
            models.Index(fields=['query', 'suggestion_type']),
            models.Index(fields=['relevance_score']),
            models.Index(fields=['search_count']),
        ]
        unique_together = ['query', 'suggestion_type']

class ProductViewHistory(models.Model):
    """Track user product views for personalization"""
    
    user = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='view_history'
    )
    product = models.ForeignKey(
        ProductListing, 
        on_delete=models.CASCADE,
        related_name='view_history'
    )
    
    view_count = models.PositiveIntegerField(default=1)
    last_viewed = models.DateTimeField(auto_now=True)
    first_viewed = models.DateTimeField(auto_now_add=True)
    
    # Engagement Metrics
    time_spent = models.FloatField(
        default=0.0,
        help_text="Time spent viewing product in seconds"
    )
    engagement_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Calculated engagement score"
    )
    
    def __str__(self):
        return f"{self.user.email} viewed {self.product.title}"
    
    class Meta:
        ordering = ['-last_viewed']
        verbose_name = 'Product View History'
        verbose_name_plural = 'Product View Histories'
        unique_together = ['user', 'product']
        indexes = [
            models.Index(fields=['user', 'last_viewed']),
            models.Index(fields=['product', 'view_count']),
        ]

class TaskReminder(models.Model):
    """Task reminder system"""
    
    task = models.OneToOneField(
        Task, 
        on_delete=models.CASCADE, 
        related_name='reminder'
    )
    reminder_time = models.DateTimeField()
    
    # Reminder Settings
    is_sent = models.BooleanField(default=False)
    reminder_type = models.CharField(
        max_length=20,
        choices=(
            ('EMAIL', 'Email'),
            ('PUSH', 'Push Notification'),
            ('BOTH', 'Both'),
        ),
        default='EMAIL'
    )
    reminder_frequency = models.CharField(
        max_length=20,
        choices=(
            ('ONCE', 'Once'),
            ('DAILY', 'Daily'),
            ('WEEKLY', 'Weekly'),
        ),
        default='ONCE'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Reminder for {self.task.title}"
    
    class Meta:
        verbose_name = 'Task Reminder'
        verbose_name_plural = 'Task Reminders'
        ordering = ['reminder_time']
        indexes = [
            models.Index(fields=['reminder_time', 'is_sent']),
        ]

class UserActivityLog(models.Model):
    """Comprehensive user activity logging"""
    
    ACTIVITY_TYPES = (
        ('SEARCH', 'Search'),
        ('VIEW_PRODUCT', 'View Product'),
        ('CREATE_PRODUCT', 'Create Product'),
        ('UPDATE_PRODUCT', 'Update Product'),
        ('CREATE_ORDER', 'Create Order'),
        ('UPDATE_ORDER', 'Update Order'),
        ('CREATE_TASK', 'Create Task'),
        ('COMPLETE_TASK', 'Complete Task'),
        ('PRICE_PREDICTION', 'Price Prediction'),
        ('UPDATE_PREFERENCES', 'Update Preferences'),
    )
    
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    
    # Activity Details
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    # Session Information
    session_id = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.created_at}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['activity_type', 'created_at']),
        ]

# Signal imports for automatic functionality
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=UserProfile)
def create_user_preferences(sender, instance, created, **kwargs):
    """Automatically create user preferences when a new user profile is created"""
    if created:
        UserPreference.objects.create(
            user=instance,
            preferred_location=f"{instance.first_name}'s Location",
            preferred_locations=[]
        )

# Add this to the signals section at the bottom of models.py

@receiver(post_save, sender=UserProfile)
def create_user_cart(sender, instance, created, **kwargs):
    """Automatically create shopping cart when a new user profile is created"""
    if created:
        ShoppingCart.objects.create(user=instance)
@receiver(post_save, sender=ProductListing)
def update_product_analytics(sender, instance, created, **kwargs):
    """Update analytics when products are created or updated"""
    if created:
        # Update marketplace analytics for new products
        today = timezone.now().date()
        analytics, _ = MarketplaceAnalytics.objects.get_or_create(date=today)
        analytics.new_products_today += 1
        analytics.save()
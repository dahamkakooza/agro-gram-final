# marketplace/admin.py
from django.contrib import admin
from django.contrib.postgres.search import SearchVector
from django.db.models import Count, Avg, F
from django.utils.html import format_html
from django.utils import timezone
from .models import (
    ProductCategory, ProductListing, Order, Task,
    UserPreference, PricePrediction, SearchQueryLog,
    MarketplaceAnalytics, SearchSuggestion, ProductViewHistory,
    TaskReminder, UserActivityLog
)

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'product_count', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'

@admin.register(ProductListing)
class ProductListingAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'farmer_email', 'category', 'price_display', 
        'quantity', 'demand_score_display', 'status_display', 
        'location', 'created_at'
    ]
    list_filter = ['status', 'category', 'quality_grade', 'created_at', 'location']
    search_fields = ['title', 'description', 'farmer__email', 'location']
    readonly_fields = ['created_at', 'updated_at', 'demand_score', 'price_trend']
    list_per_page = 20
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('farmer', 'category', 'title', 'description', 'image')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'quantity', 'unit', 'quality_grade')
        }),
        ('Location & Status', {
            'fields': ('location', 'latitude', 'longitude', 'status')
        }),
        ('Analytics & AI', {
            'fields': ('demand_score', 'price_trend', 'search_keywords'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'expires_at'),
            'classes': ('collapse',)
        })
    )
    
    def farmer_email(self, obj):
        return obj.farmer.email
    farmer_email.short_description = 'Farmer'
    
    def price_display(self, obj):
        return f"${obj.price}"
    price_display.short_description = 'Price'
    
    def demand_score_display(self, obj):
        color = 'green' if obj.demand_score > 0.7 else 'orange' if obj.demand_score > 0.4 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1%}</span>',
            color, obj.demand_score
        )
    demand_score_display.short_description = 'Demand'
    
    def status_display(self, obj):
        status_colors = {
            'AVAILABLE': 'green',
            'SOLD': 'blue',
            'EXPIRED': 'orange',
            'PENDING': 'yellow'
        }
        color = status_colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Status'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'customer_email', 'product_title', 'quantity', 
        'total_price_display', 'status_display', 'payment_status_display',
        'created_at'
    ]
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['customer__email', 'product__title', 'tracking_number']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20
    
    def customer_email(self, obj):
        return obj.customer.email
    customer_email.short_description = 'Customer'
    
    def product_title(self, obj):
        return obj.product.title
    product_title.short_description = 'Product'
    
    def total_price_display(self, obj):
        return f"${obj.total_price}"
    total_price_display.short_description = 'Total'
    
    def status_display(self, obj):
        status_colors = {
            'PENDING': 'orange',
            'CONFIRMED': 'blue',
            'PROCESSING': 'purple',
            'SHIPPED': 'teal',
            'DELIVERED': 'green',
            'CANCELLED': 'red',
            'REFUNDED': 'gray'
        }
        color = status_colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def payment_status_display(self, obj):
        colors = {
            'PENDING': 'orange',
            'PAID': 'green',
            'FAILED': 'red',
            'REFUNDED': 'gray'
        }
        color = colors.get(obj.payment_status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_payment_status_display()
        )
    payment_status_display.short_description = 'Payment'

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'user_email', 'task_type_display', 'status_display', 
        'priority_display', 'due_date', 'is_overdue_display', 'created_at'
    ]
    list_filter = ['status', 'priority', 'task_type', 'created_at']
    search_fields = ['title', 'description', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def task_type_display(self, obj):
        return obj.get_task_type_display()
    task_type_display.short_description = 'Task Type'
    
    def status_display(self, obj):
        status_colors = {
            'PENDING': 'orange',
            'IN_PROGRESS': 'blue',
            'COMPLETED': 'green',
            'CANCELLED': 'red',
            'ON_HOLD': 'gray'
        }
        color = status_colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def priority_display(self, obj):
        priority_colors = {
            'LOW': 'green',
            'MEDIUM': 'orange',
            'HIGH': 'red',
            'URGENT': 'purple'
        }
        color = priority_colors.get(obj.priority, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_display.short_description = 'Priority'
    
    def is_overdue_display(self, obj):
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">OVERDUE</span>'
            )
        elif obj.status == 'COMPLETED':
            return format_html('<span style="color: green;">Completed</span>')
        else:
            return format_html('<span style="color: green;">On Time</span>')
    is_overdue_display.short_description = 'Due Status'

@admin.register(PricePrediction)
class PricePredictionAdmin(admin.ModelAdmin):
    list_display = [
        'crop_type', 'region', 'predicted_price_display', 
        'current_price_display', 'confidence_percentage', 
        'prediction_period_display', 'trend_display', 'created_at'
    ]
    list_filter = ['crop_type', 'region', 'prediction_period', 'trend', 'created_at']
    search_fields = ['crop_type', 'region']
    readonly_fields = ['created_at', 'updated_at']
    
    def predicted_price_display(self, obj):
        return f"${obj.predicted_price}"
    predicted_price_display.short_description = 'Predicted'
    
    def current_price_display(self, obj):
        if obj.current_price:
            return f"${obj.current_price}"
        return "N/A"
    current_price_display.short_description = 'Current'
    
    def confidence_percentage(self, obj):
        color = 'green' if obj.confidence > 0.7 else 'orange' if obj.confidence > 0.5 else 'red'
        percentage_value = obj.confidence * 100
        percentage_text = f"{percentage_value:.1f}%"
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, percentage_text
        )
    confidence_percentage.short_description = 'Confidence'
    
    def prediction_period_display(self, obj):
        return obj.get_prediction_period_display()
    prediction_period_display.short_description = 'Period'
    
    def trend_display(self, obj):
        colors = {
            'UP': 'green',
            'DOWN': 'red',
            'STABLE': 'blue',
            'VOLATILE': 'orange'
        }
        color = colors.get(obj.trend, 'black')
        arrow = {
            'UP': '↗',
            'DOWN': '↘',
            'STABLE': '→',
            'VOLATILE': '↕'
        }.get(obj.trend, '')
        return format_html(
            '<span style="color: {};">{} {}</span>',
            color, arrow, obj.get_trend_display()
        )
    trend_display.short_description = 'Trend'

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user_email', 'preferred_categories_count', 'quality_preference',
        'price_range_display', 'email_notifications', 'created_at'
    ]
    list_filter = ['quality_preference', 'email_notifications', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def preferred_categories_count(self, obj):
        return obj.preferred_categories.count()
    preferred_categories_count.short_description = 'Categories'
    
    def price_range_display(self, obj):
        if obj.price_range_min and obj.price_range_max:
            return f"${obj.price_range_min} - ${obj.price_range_max}"
        return "Not set"
    price_range_display.short_description = 'Price Range'

@admin.register(SearchQueryLog)
class SearchQueryLogAdmin(admin.ModelAdmin):
    list_display = [
        'query_preview', 'user_email', 'results_count', 
        'search_duration_display', 'is_successful_display', 'created_at'
    ]
    list_filter = ['is_successful', 'created_at']
    search_fields = ['query', 'user__email']
    readonly_fields = ['created_at']
    list_per_page = 50
    
    def query_preview(self, obj):
        return obj.query[:50] + '...' if len(obj.query) > 50 else obj.query
    query_preview.short_description = 'Query'
    
    def user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'
    user_email.short_description = 'User'
    
    def search_duration_display(self, obj):
        return f"{obj.search_duration:.2f}s"
    search_duration_display.short_description = 'Duration'
    
    def is_successful_display(self, obj):
        color = 'green' if obj.is_successful else 'red'
        text = 'Yes' if obj.is_successful else 'No'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    is_successful_display.short_description = 'Successful'

@admin.register(MarketplaceAnalytics)
class MarketplaceAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'total_products', 'active_products', 'total_orders',
        'daily_revenue_display', 'active_users', 'created_at'
    ]
    list_filter = ['date']
    readonly_fields = ['created_at', 'updated_at']
    
    def daily_revenue_display(self, obj):
        return f"${obj.daily_revenue}"
    daily_revenue_display.short_description = 'Daily Revenue'

@admin.register(SearchSuggestion)
class SearchSuggestionAdmin(admin.ModelAdmin):
    list_display = [
        'query', 'suggestion_type_display', 'relevance_score_display',
        'search_count', 'click_count', 'is_active_display', 'last_searched'
    ]
    list_filter = ['suggestion_type', 'is_active', 'last_searched']
    search_fields = ['query']
    
    def suggestion_type_display(self, obj):
        return obj.get_suggestion_type_display()
    suggestion_type_display.short_description = 'Type'
    
    def relevance_score_display(self, obj):
        color = 'green' if obj.relevance_score > 0.7 else 'orange' if obj.relevance_score > 0.4 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1%}</span>',
            color, obj.relevance_score
        )
    relevance_score_display.short_description = 'Relevance'
    
    def is_active_display(self, obj):
        color = 'green' if obj.is_active else 'red'
        text = 'Active' if obj.is_active else 'Inactive'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    is_active_display.short_description = 'Status'

@admin.register(ProductViewHistory)
class ProductViewHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'user_email', 'product_title', 'view_count', 
        'time_spent_display', 'last_viewed'
    ]
    list_filter = ['last_viewed']
    search_fields = ['user__email', 'product__title']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def product_title(self, obj):
        return obj.product.title
    product_title.short_description = 'Product'
    
    def time_spent_display(self, obj):
        return f"{obj.time_spent:.1f}s"
    time_spent_display.short_description = 'Time Spent'

@admin.register(TaskReminder)
class TaskReminderAdmin(admin.ModelAdmin):
    list_display = [
        'task_title', 'reminder_time', 'reminder_type_display',
        'is_sent_display', 'created_at'
    ]
    list_filter = ['reminder_type', 'is_sent', 'reminder_time']
    
    def task_title(self, obj):
        return obj.task.title
    task_title.short_description = 'Task'
    
    def reminder_type_display(self, obj):
        return obj.get_reminder_type_display()
    reminder_type_display.short_description = 'Type'
    
    def is_sent_display(self, obj):
        color = 'green' if obj.is_sent else 'orange'
        text = 'Sent' if obj.is_sent else 'Pending'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    is_sent_display.short_description = 'Status'

@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = [
        'user_email', 'activity_type_display', 'description_preview',
        'created_at'
    ]
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'description']
    readonly_fields = ['created_at']
    list_per_page = 50
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def activity_type_display(self, obj):
        return obj.get_activity_type_display()
    activity_type_display.short_description = 'Activity Type'
    
    def description_preview(self, obj):
        return obj.description[:100] + '...' if len(obj.description) > 100 else obj.description
    description_preview.short_description = 'Description'

# Custom admin site header
admin.site.site_header = "AgroGram Marketplace Administration"
admin.site.site_title = "AgroGram Marketplace Admin"
admin.site.index_title = "Welcome to AgroGram Marketplace Administration"
# farms/serializers.py
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Farm, Plot, CropHistory, FarmTask, FarmAnalytics

class CropHistorySerializer(serializers.ModelSerializer):
    duration_days = serializers.SerializerMethodField()
    revenue = serializers.SerializerMethodField()
    profitability = serializers.SerializerMethodField()
    
    class Meta:
        model = CropHistory
        fields = [
            'id', 'plot', 'crop_name', 'variety', 'planting_date', 'harvest_date',
            'yield_amount', 'quality_grade', 'market_price', 'fertilizer_used',
            'water_usage', 'total_cost', 'success_score', 'lessons_learned',
            'duration_days', 'revenue', 'profitability', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_planting_date(self, value):
        if value and value > timezone.now().date():
            raise serializers.ValidationError("Planting date cannot be in the future")
        return value
    
    def validate_harvest_date(self, value):
        planting_date = self.initial_data.get('planting_date')
        if value and planting_date and value < planting_date:
            raise serializers.ValidationError("Harvest date cannot be before planting date")
        if value and value > timezone.now().date():
            raise serializers.ValidationError("Harvest date cannot be in the future")
        return value
    
    def validate_yield_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Yield amount cannot be negative")
        return value
    
    def validate_market_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Market price cannot be negative")
        return value
    
    def validate_total_cost(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Total cost cannot be negative")
        return value
    
    def validate_success_score(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Success score must be between 0 and 100")
        return value
    
    def get_duration_days(self, obj):
        if obj.planting_date and obj.harvest_date:
            return (obj.harvest_date - obj.planting_date).days
        return None
    
    def get_revenue(self, obj):
        if obj.yield_amount and obj.market_price:
            return float(obj.yield_amount * obj.market_price)
        return 0
    
    def get_profitability(self, obj):
        revenue = self.get_revenue(obj)
        cost = float(obj.total_cost) if obj.total_cost else 0
        if cost > 0:
            return ((revenue - cost) / cost) * 100  # ROI percentage
        return 0

class PlotSerializer(serializers.ModelSerializer):
    crop_status_display = serializers.CharField(source='get_crop_status_display', read_only=True)
    days_to_harvest = serializers.SerializerMethodField()
    crop_history_count = serializers.SerializerMethodField()
    ai_recommendations = serializers.SerializerMethodField()
    
    class Meta:
        model = Plot
        fields = [
            'id', 'farm', 'plot_number', 'area', 'current_crop', 'planting_date',
            'expected_harvest_date', 'crop_status', 'crop_status_display', 'soil_ph',
            'soil_moisture', 'nutrient_level', 'recommended_crops', 'yield_prediction',
            'days_to_harvest', 'crop_history_count', 'ai_recommendations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_area(self, value):
        if value <= 0:
            raise serializers.ValidationError("Plot area must be greater than zero")
        if value > 10000:  # 10,000 acres max per plot
            raise serializers.ValidationError("Plot area is too large")
        return value
    
    def validate_soil_ph(self, value):
        if value is not None and not (0 <= value <= 14):
            raise serializers.ValidationError("Soil pH must be between 0 and 14")
        return value
    
    def validate_soil_moisture(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Soil moisture must be between 0 and 100")
        return value
    
    def validate_nutrient_level(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Nutrient level must be between 0 and 100")
        return value
    
    def validate_planting_date(self, value):
        if value and value > timezone.now().date():
            raise serializers.ValidationError("Planting date cannot be in the future")
        return value
    
    def validate_expected_harvest_date(self, value):
        planting_date = self.initial_data.get('planting_date')
        if value and planting_date and value < planting_date:
            raise serializers.ValidationError("Expected harvest date cannot be before planting date")
        return value
    
    def get_days_to_harvest(self, obj):
        if obj.expected_harvest_date:
            today = timezone.now().date()
            return (obj.expected_harvest_date - today).days
        return None
    
    def get_crop_history_count(self, obj):
        return obj.crop_history.count()
    
    def get_ai_recommendations(self, obj):
        """Generate AI recommendations for the plot"""
        recommendations = []
        
        # Soil condition recommendations
        if obj.soil_ph:
            if obj.soil_ph < 5.5:
                recommendations.append({
                    'type': 'soil_adjustment',
                    'priority': 'high',
                    'message': 'Soil is too acidic. Consider adding lime.',
                    'action': 'Adjust soil pH to 6.0-7.0'
                })
            elif obj.soil_ph > 7.5:
                recommendations.append({
                    'type': 'soil_adjustment',
                    'priority': 'high',
                    'message': 'Soil is too alkaline. Consider adding sulfur.',
                    'action': 'Adjust soil pH to 6.0-7.0'
                })
        
        # Crop rotation recommendations
        if obj.crop_history.exists():
            last_crop = obj.crop_history.first().crop_name
            recommendations.append({
                'type': 'crop_rotation',
                'priority': 'medium',
                'message': f'Consider rotating crops after {last_crop}',
                'action': 'Plant legume crops to restore nitrogen'
            })
        
        return recommendations

class FarmTaskSerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_until_due = serializers.SerializerMethodField()
    plot_display = serializers.CharField(source='plot.plot_number', read_only=True, allow_null=True)
    
    class Meta:
        model = FarmTask
        fields = [
            'id', 'farm', 'plot', 'plot_display', 'title', 'description', 'task_type',
            'due_date', 'estimated_duration', 'priority', 'priority_display', 'status',
            'status_display', 'ai_recommendations', 'weather_considerations',
            'days_until_due', 'completed_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Title is required")
        if len(value) > 200:
            raise serializers.ValidationError("Title is too long")
        return value.strip()
    
    def validate_due_date(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value
    
    def validate_estimated_duration(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Estimated duration must be greater than zero")
        return value
    
    def get_days_until_due(self, obj):
        if obj.due_date:
            today = timezone.now().date()
            return (obj.due_date - today).days
        return None

class FarmAnalyticsSerializer(serializers.ModelSerializer):
    net_profit = serializers.SerializerMethodField()
    efficiency_score = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmAnalytics
        fields = [
            'id', 'farm', 'average_yield', 'success_rate', 'resource_efficiency',
            'total_revenue', 'total_costs', 'net_profit', 'profitability_score',
            'efficiency_score', 'improvement_recommendations', 'risk_alerts',
            'seasonal_planning', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']
    
    def validate_success_rate(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Success rate must be between 0 and 100")
        return value
    
    def validate_resource_efficiency(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Resource efficiency must be between 0 and 100")
        return value
    
    def validate_profitability_score(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Profitability score must be between 0 and 100")
        return value
    
    def get_net_profit(self, obj):
        return float(obj.total_revenue - obj.total_costs)
    
    def get_efficiency_score(self, obj):
        # Calculate overall efficiency score
        scores = [
            obj.success_rate * 0.4,
            obj.resource_efficiency * 0.3,
            min(obj.profitability_score / 100, 1.0) * 0.3
        ]
        return sum(scores)

class FarmSerializer(serializers.ModelSerializer):
    soil_type_display = serializers.CharField(source='get_soil_type_display', read_only=True)
    plots_count = serializers.SerializerMethodField()
    active_crops_count = serializers.SerializerMethodField()
    pending_tasks_count = serializers.SerializerMethodField()
    productivity_level = serializers.SerializerMethodField()
    
    # Nested serializers
    plots = PlotSerializer(many=True, read_only=True)
    analytics = FarmAnalyticsSerializer(read_only=True)
    
    class Meta:
        model = Farm
        fields = [
            'id', 'owner', 'name', 'location', 'total_area', 'soil_type', 'soil_type_display',
            'description', 'latitude', 'longitude', 'productivity_score', 'risk_assessment',
            'plots_count', 'active_crops_count', 'pending_tasks_count', 'productivity_level',
            'plots', 'analytics', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_plots_count(self, obj):
        return obj.plots.count()
    
    def get_active_crops_count(self, obj):
        return obj.plots.filter(crop_status__in=['PLANTED', 'GROWING', 'READY']).count()
    
    def get_pending_tasks_count(self, obj):
        return obj.tasks.filter(status='PENDING').count()
    
    def get_productivity_level(self, obj):
        if obj.productivity_score >= 0.8:
            return 'High'
        elif obj.productivity_score >= 0.6:
            return 'Medium'
        elif obj.productivity_score >= 0.4:
            return 'Low'
        else:
            return 'Very Low'

class FarmCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ['name', 'location', 'total_area', 'soil_type', 'description', 'latitude', 'longitude']
    
    def validate_name(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Farm name is required")
        if len(value) > 100:
            raise serializers.ValidationError("Farm name is too long")
        return value.strip()
    
    def validate_location(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Location is required")
        if len(value) > 200:
            raise serializers.ValidationError("Location is too long")
        return value.strip()
    
    def validate_total_area(self, value):
        if value <= 0:
            raise serializers.ValidationError("Farm area must be greater than zero")
        if value > 100000:  # 100,000 acres max
            raise serializers.ValidationError("Farm area is too large")
        return value
    
    def validate_soil_type(self, value):
        valid_soil_types = [choice[0] for choice in Farm.SOIL_TYPE_CHOICES]
        if value and value not in valid_soil_types:
            raise serializers.ValidationError(f"Invalid soil type. Must be one of: {', '.join(valid_soil_types)}")
        return value
    
    def validate_latitude(self, value):
        if value is not None and not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90")
        return value
    
    def validate_longitude(self, value):
        if value is not None and not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180")
        return value
    
    def validate_description(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Description is too long")
        return value
# farms/models.py
from django.db import models
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from users.models import UserProfile
import uuid

class Farm(models.Model):
    SOIL_TYPE_CHOICES = (
        ('LOAMY', 'Loamy'),
        ('CLAY', 'Clay'),
        ('SANDY', 'Sandy'),
        ('SILTY', 'Silty'),
        ('PEAT', 'Peat'),
        ('CHALKY', 'Chalky'),
    )
    
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    total_area = models.DecimalField(max_digits=10, decimal_places=2, help_text="Area in acres")
    soil_type = models.CharField(max_length=100, choices=SOIL_TYPE_CHOICES, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Location coordinates for mapping and weather integration
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # AI and analytics fields
    productivity_score = models.FloatField(default=0.5, help_text="Overall farm productivity score (0-1)")
    risk_assessment = models.JSONField(default=dict, blank=True, help_text="AI-generated risk assessment")
    search_vector = SearchVectorField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']  # ← ADD THIS LINE
        indexes = [
            GinIndex(fields=['search_vector']),
            models.Index(fields=['owner', 'soil_type']),
            models.Index(fields=['productivity_score']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.owner.email}"

class Plot(models.Model):
    CROP_STATUS_CHOICES = (
        ('PLANNED', 'Planned'),
        ('PLANTED', 'Planted'),
        ('GROWING', 'Growing'),
        ('READY', 'Ready for Harvest'),
        ('HARVESTED', 'Harvested'),
        ('FALLOW', 'Fallow'),
    )
    
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='plots')
    plot_number = models.CharField(max_length=50)
    area = models.DecimalField(max_digits=10, decimal_places=2, help_text="Area in acres")
    current_crop = models.CharField(max_length=100, blank=True, null=True)
    
    # Crop management
    planting_date = models.DateField(blank=True, null=True)
    expected_harvest_date = models.DateField(blank=True, null=True)
    crop_status = models.CharField(max_length=20, choices=CROP_STATUS_CHOICES, default='FALLOW')
    
    # Soil and conditions
    soil_ph = models.FloatField(null=True, blank=True, help_text="Soil pH level")
    soil_moisture = models.FloatField(null=True, blank=True, help_text="Soil moisture percentage")
    nutrient_level = models.JSONField(default=dict, blank=True, help_text="N-P-K levels")
    
    # AI recommendations
    recommended_crops = models.JSONField(default=list, blank=True, help_text="AI-recommended crops for this plot")
    yield_prediction = models.FloatField(null=True, blank=True, help_text="Predicted yield in tons")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['farm', 'plot_number']
        ordering = ['plot_number']
    
    def __str__(self):
        return f"Plot {self.plot_number} - {self.farm.name}"

class CropHistory(models.Model):
    plot = models.ForeignKey(Plot, on_delete=models.CASCADE, related_name='crop_history')
    crop_name = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, blank=True, null=True)
    
    # Growth cycle
    planting_date = models.DateField()
    harvest_date = models.DateField(blank=True, null=True)
    
    # Yield and quality
    yield_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Yield in tons")
    quality_grade = models.CharField(max_length=50, blank=True, null=True)
    market_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Price per unit at harvest")
    
    # Inputs and costs
    fertilizer_used = models.JSONField(default=dict, blank=True, help_text="Fertilizers and quantities")
    water_usage = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Water usage in liters")
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # AI analysis
    success_score = models.FloatField(null=True, blank=True, help_text="Crop success rating (0-1)")
    lessons_learned = models.TextField(blank=True, null=True, help_text="AI-generated insights")
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Crop history"
        ordering = ['-planting_date']
    
    def __str__(self):
        return f"{self.crop_name} - {self.plot}"

class FarmTask(models.Model):
    TASK_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    TASK_PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )
    
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='tasks')
    plot = models.ForeignKey(Plot, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    task_type = models.CharField(max_length=100, help_text="e.g., Planting, Irrigation, Harvesting")
    
    # Scheduling
    due_date = models.DateField()
    estimated_duration = models.IntegerField(help_text="Estimated duration in hours", default=1)
    priority = models.CharField(max_length=20, choices=TASK_PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=TASK_STATUS_CHOICES, default='PENDING')
    
    # AI assistance
    ai_recommendations = models.JSONField(default=dict, blank=True, help_text="AI-generated task recommendations")
    weather_considerations = models.JSONField(default=dict, blank=True, help_text="Weather-related advice")
    
    completed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_date', 'priority']
    
    def __str__(self):
        return f"{self.title} - {self.farm.name}"

class FarmAnalytics(models.Model):
    """Store farm analytics and AI insights"""
    farm = models.OneToOneField(Farm, on_delete=models.CASCADE, related_name='analytics')
    
    # Productivity metrics
    average_yield = models.FloatField(default=0, help_text="Average yield across all crops")
    success_rate = models.FloatField(default=0, help_text="Crop success rate (0-1)")
    resource_efficiency = models.FloatField(default=0, help_text="Resource utilization efficiency")
    
    # Financial metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_costs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    profitability_score = models.FloatField(default=0)
    
    # AI insights
    improvement_recommendations = models.JSONField(default=list, blank=True)
    risk_alerts = models.JSONField(default=list, blank=True)
    seasonal_planning = models.JSONField(default=dict, blank=True)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.farm.name}"

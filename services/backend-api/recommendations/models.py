import uuid
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

# Import UserProfile from users app
from users.models import UserProfile

class CropRecommendation(models.Model):
    """Store crop recommendations for analytics and retraining"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='crop_recommendations', null=True, blank=True)
    
    # Input parameters
    input_parameters = models.JSONField(
        default=dict,
        help_text="Soil and weather parameters used for recommendation"
    )
    
    # AI recommendations
    recommendations = models.JSONField(
        default=list,
        help_text="List of recommended crops with confidence scores"
    )
    
    # User selection and feedback
    selected_crop = models.CharField(max_length=100, null=True, blank=True)
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Confidence score of the top recommendation"
    )
    
    # Location and context
    location = models.CharField(max_length=100, null=True, blank=True)
    season = models.CharField(max_length=50, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crop_recommendations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_profile', 'created_at']),
            models.Index(fields=['confidence_score']),
            models.Index(fields=['selected_crop']),
        ]
        verbose_name = "Crop Recommendation"
        verbose_name_plural = "Crop Recommendations"
    
    def __str__(self):
        user_email = self.user_profile.email if self.user_profile else "Unknown"
        return f"{user_email} - {self.created_at.date()} - {self.selected_crop or 'No selection'}"
    
    @property
    def top_recommendation(self):
        """Get the top recommended crop"""
        if self.recommendations:
            return self.recommendations[0]
        return None
    
    @property
    def recommendation_count(self):
        """Get number of recommendations"""
        return len(self.recommendations) if self.recommendations else 0
    
    def mark_as_implemented(self, crop_name: str):
        """Mark a specific crop as implemented"""
        self.selected_crop = crop_name
        self.save()


class UserFeedback(models.Model):
    """Store user feedback for model improvement"""
    
    YIELD_RATINGS = [
        (1, 'Very Poor (＜25% of expected)'),
        (2, 'Poor (25-50% of expected)'),
        (3, 'Fair (50-75% of expected)'),
        (4, 'Good (75-100% of expected)'),
        (5, 'Excellent (＞100% of expected)')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recommendation = models.ForeignKey(
        CropRecommendation, 
        on_delete=models.CASCADE, 
        related_name='feedbacks'
    )
    
    user_profile = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='feedbacks',
        null=True,
        blank=True
    )
    
    # Feedback details
    actual_crop_planted = models.CharField(max_length=100)
    yield_rating = models.IntegerField(choices=YIELD_RATINGS)
    actual_yield = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Actual yield in kg/hectare"
    )
    success_notes = models.TextField(blank=True, help_text="What worked well")
    challenges_faced = models.TextField(blank=True, help_text="Challenges encountered")
    improvements_suggested = models.TextField(blank=True, help_text="Suggestions for better recommendations")
    
    # Weather and conditions during growth
    actual_rainfall = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Actual rainfall during growing season (mm)"
    )
    pest_problems = models.BooleanField(default=False)
    disease_issues = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_feedback'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recommendation', 'created_at']),
            models.Index(fields=['yield_rating']),
            models.Index(fields=['actual_crop_planted']),
        ]
        verbose_name = "User Feedback"
        verbose_name_plural = "User Feedback"
    
    def __str__(self):
        return f"Feedback for {self.recommendation} - Rating: {self.yield_rating}"
    
    @property
    def yield_rating_display(self):
        """Get human-readable yield rating"""
        return dict(self.YIELD_RATINGS).get(self.yield_rating, 'Unknown')
    
    @property
    def is_positive_feedback(self):
        """Check if feedback is positive (rating 4 or 5)"""
        return self.yield_rating >= 4

    def save(self, *args, **kwargs):
        """Ensure user_profile is set from recommendation if not provided"""
        if not self.user_profile and self.recommendation:
            self.user_profile = self.recommendation.user_profile
        super().save(*args, **kwargs)


class ModelPerformance(models.Model):
    """Track model performance and retraining history"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_type = models.CharField(max_length=50, choices=[
        ('crop_recommendation', 'Crop Recommendation'),
        ('price_prediction', 'Price Prediction'),
        ('disease_detection', 'Disease Detection')
    ])
    
    # Performance metrics
    accuracy = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    precision = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    recall = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    f1_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True, blank=True
    )
    
    # Training information
    training_data_size = models.IntegerField(default=0)
    training_duration_seconds = models.IntegerField(default=0)
    feature_importance = models.JSONField(default=dict, blank=True)
    
    # Version and metadata
    model_version = models.CharField(max_length=20, default='1.0.0')
    is_production = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'model_performance'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model_type', 'created_at']),
            models.Index(fields=['is_production']),
        ]
        verbose_name = "Model Performance"
        verbose_name_plural = "Model Performance"
    
    def __str__(self):
        return f"{self.model_type} v{self.model_version} - {self.created_at.date()}"
    
    @property
    def performance_summary(self):
        """Get performance summary"""
        if self.accuracy:
            return f"Accuracy: {self.accuracy:.3f}"
        return "No metrics available"
    
    @classmethod
    def get_latest_production_model(cls, model_type: str):
        """Get the latest production model for a given type"""
        return cls.objects.filter(
            model_type=model_type, 
            is_production=True
        ).order_by('-created_at').first()
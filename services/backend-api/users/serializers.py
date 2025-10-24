# users/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import UserProfile, UserActivityLog, Notification
import json

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model (read operations)
    """
    full_name = serializers.SerializerMethodField()
    preferences = serializers.SerializerMethodField()
    notification_settings = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'firebase_uid', 'email', 'role', 'sub_role', 'first_name', 'last_name', 'full_name',
            'phone_number', 'profile_picture', 'location', 'latitude', 'longitude',
            'farm_size', 'farm_types', 'business_name', 'business_description',
            'business_license', 'tax_id', 'is_verified', 'verification_date',
            'is_active', 'is_staff', 'preferences', 'notification_settings', 
            'last_login_ip', 'login_count', 'total_orders', 'total_revenue', 
            'created_at', 'updated_at', 'last_activity'
        ]
        read_only_fields = [
            'id', 'firebase_uid', 'email', 'is_verified', 'verification_date',
            'is_active', 'is_staff', 'last_login_ip', 'login_count',
            'total_orders', 'total_revenue', 'created_at', 'updated_at', 'last_activity'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_preferences(self, obj):
        return obj.get_preferences()
    
    def get_notification_settings(self, obj):
        return obj.get_notification_settings()

# class UserProfileCreateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for creating UserProfile (write operations)
#     """
#     class Meta:
#         model = UserProfile
#         fields = [
#             'email', 'firebase_uid', 'role', 'sub_role', 'first_name', 'last_name', 'phone_number', 
#             'location', 'farm_size', 'farm_types', 'business_name', 'business_description'
#         ]
#         extra_kwargs = {
#             'firebase_uid': {'required': True}
#         }
    
#     def validate_email(self, value):
#         """
#         Ensure email is unique
#         """
#         if UserProfile.objects.filter(email=value).exists():
#             raise serializers.ValidationError("A user with this email already exists.")
#         return value
    
#     def validate_firebase_uid(self, value):
#         """
#         Ensure firebase_uid is unique
#         """
#         if UserProfile.objects.filter(firebase_uid=value).exists():
#             raise serializers.ValidationError("A user with this Firebase UID already exists.")
#         return value
    
#     def create(self, validated_data):
#         """
#         Create user profile
#         """
#         user = UserProfile.objects.create_user(**validated_data)
#         return user

# users/serializers.py - Update UserProfileCreateSerializer
class UserProfileCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating UserProfile (write operations)
    """
    class Meta:
        model = UserProfile
        fields = [
            'email', 'firebase_uid', 'role', 'sub_role', 'first_name', 'last_name', 'phone_number', 
            'location', 'farm_size', 'farm_types', 'business_name', 'business_description'
        ]
        extra_kwargs = {
            'firebase_uid': {'required': True},
            'sub_role': {'required': False}  # Make sub_role optional
        }
    
    def validate(self, data):
        """
        Validate that sub_role matches the role
        """
        role = data.get('role')
        sub_role = data.get('sub_role')
        
        valid_sub_roles = {
            'FARMER': ['SMALLHOLDER_FARMER', 'COMMERCIAL_FARMER', 'ORGANIC_SPECIALIST', 'LIVESTOCK_FARMER'],
            'CONSUMER': ['INDIVIDUAL_CONSUMER', 'RESTAURANT_BUSINESS', 'EXPORT_CLIENT', 'INSTITUTIONAL_BUYER'],
            'SUPPLIER': ['LOGISTICS_PROVIDER', 'INPUT_SUPPLIER', 'MACHINERY_PROVIDER', 'SERVICE_PROVIDER'],
            'AGENT': ['FINANCIAL_ADVISOR', 'TECHNICAL_ADVISOR', 'LEGAL_SPECIALIST', 'MARKET_ANALYST'],
            'ADMIN': ['PLATFORM_ADMIN', 'BUSINESS_ADMIN']
        }
        
        if sub_role and sub_role not in valid_sub_roles.get(role, []):
            raise serializers.ValidationError({
                'sub_role': f"Invalid sub_role '{sub_role}' for role '{role}'"
            })
        
        # Set default sub_role if not provided
        if not sub_role:
            default_sub_roles = {
                'FARMER': 'SMALLHOLDER_FARMER',
                'CONSUMER': 'INDIVIDUAL_CONSUMER',
                'SUPPLIER': 'INPUT_SUPPLIER', 
                'AGENT': 'FINANCIAL_ADVISOR',
                'ADMIN': 'PLATFORM_ADMIN'
            }
            data['sub_role'] = default_sub_roles.get(role, 'SMALLHOLDER_FARMER')
        
        return data

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    FIXED: Serializer for updating UserProfile with proper instance validation
    """
    preferences = serializers.JSONField(required=False, write_only=True)
    notification_settings = serializers.JSONField(required=False, write_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'first_name', 'last_name', 'phone_number', 'profile_picture',
            'location', 'latitude', 'longitude', 'farm_size', 'farm_types',
            'business_name', 'business_description', 'business_license', 'tax_id',
            'preferences', 'notification_settings','sub_role'
        ]
    
    def validate(self, data):
        """
        FIXED: Additional validation to ensure we have a proper instance
        """
        instance = self.instance
        if not instance or not hasattr(instance, '_meta') or not isinstance(instance, UserProfile):
            raise serializers.ValidationError("Invalid user instance for update")
        return data
    
    def update(self, instance, validated_data):
        """
        FIXED: Update method with comprehensive instance validation
        """
        # Validate instance before proceeding
        if not instance or not hasattr(instance, '_meta') or not isinstance(instance, UserProfile):
            raise serializers.ValidationError({
                "error": "Invalid user instance",
                "message": "Cannot update profile for invalid user"
            })
            
        # Handle preferences and notification_settings separately
        preferences = validated_data.pop('preferences', None)
        notification_settings = validated_data.pop('notification_settings', None)
        
        try:
            # Update the instance with remaining fields
            instance = super().update(instance, validated_data)
            
            # Update preferences if provided
            if preferences is not None:
                instance.set_preferences(preferences)
            
            # Update notification settings if provided
            if notification_settings is not None:
                instance.set_notification_settings(notification_settings)
            
            # Save the instance if preferences or notification settings were updated
            if preferences is not None or notification_settings is not None:
                instance.save()
            
            # Log the profile update activity
            UserActivityLog.objects.create(
                user=instance,
                activity_type='PROFILE_UPDATE',
                description='User updated their profile',
                metadata={'updated_fields': list(validated_data.keys())}
            )
            
            return instance
            
        except Exception as e:
            # Log the error and re-raise
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating user profile: {str(e)}")
            raise serializers.ValidationError({
                "error": "Profile update failed",
                "message": str(e)
            })

class UserActivityLogSerializer(serializers.ModelSerializer):
    """
    Serializer for UserActivityLog model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    metadata = serializers.SerializerMethodField()
    
    class Meta:
        model = UserActivityLog
        fields = [
            'id', 'user', 'user_email', 'activity_type', 'description', 
            'ip_address', 'user_agent', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_metadata(self, obj):
        try:
            return json.loads(obj.metadata) if obj.metadata else {}
        except:
            return {}

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message',
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class UserStatsSerializer(serializers.Serializer):
    """
    Serializer for user statistics
    """
    total_farms = serializers.IntegerField(default=0)
    total_plots = serializers.IntegerField(default=0)
    total_orders = serializers.IntegerField(default=0)
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)
    active_crops = serializers.IntegerField(default=0)
    pending_tasks = serializers.IntegerField(default=0)
    profile_completion = serializers.FloatField(default=0)
    last_activity = serializers.DateTimeField()

class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords don't match")
        return data
#users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import json
from django.contrib.auth.models import Group, Permission

class UserManager(BaseUserManager):
    def create_user(self, email, firebase_uid, role='FARMER', **extra_fields):
        """
        Create and return a regular user with an email and firebase_uid.
        """
        if not email:
            raise ValueError('Users must have an email address')
        if not firebase_uid:
            raise ValueError('Users must have a Firebase UID')
        
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            firebase_uid=firebase_uid,
            role=role,
            **extra_fields
        )
        user.set_unusable_password()  # Since we're using Firebase auth
        user.save(using=self._db)
        return user

    def create_superuser(self, email, firebase_uid, **extra_fields):
        """
        Create and return a superuser with an email and firebase_uid.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, firebase_uid, **extra_fields)

class UserProfile(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('FARMER', 'Farmer'),
        ('CONSUMER', 'Consumer'), 
        ('SUPPLIER', 'Supplier'),
        ('ADMIN', 'Admin'),
        ('AGENT', 'Agricultural Agent'),
    )
    
    SUB_ROLE_CHOICES = (
        # Farmer sub-roles
        ('SMALLHOLDER_FARMER', 'Smallholder Farmer'),
        ('COMMERCIAL_FARMER', 'Commercial Farmer'),
        ('ORGANIC_SPECIALIST', 'Organic Specialist'),
        ('LIVESTOCK_FARMER', 'Livestock Farmer'),
        # Consumer sub-roles
        ('INDIVIDUAL_CONSUMER', 'Individual Consumer'),
        ('RESTAURANT_BUSINESS', 'Restaurant/Business'),
        ('EXPORT_CLIENT', 'Export Client'),
        ('INSTITUTIONAL_BUYER', 'Institutional Buyer'),
        # Supplier sub-roles
        ('LOGISTICS_PROVIDER', 'Logistics Provider'),
        ('INPUT_SUPPLIER', 'Input Supplier'),
        ('MACHINERY_PROVIDER', 'Machinery Provider'),
        ('SERVICE_PROVIDER', 'Service Provider'),
        # Agent sub-roles
        ('FINANCIAL_ADVISOR', 'Financial Advisor'),
        ('TECHNICAL_ADVISOR', 'Technical Advisor'),
        ('LEGAL_SPECIALIST', 'Legal Specialist'),
        ('MARKET_ANALYST', 'Market Analyst'),
        # Admin sub-roles
        ('PLATFORM_ADMIN', 'Platform Admin'),
        ('BUSINESS_ADMIN', 'Business Admin'),
    )
    # Core authentication fields
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='FARMER')
    sub_role = models.CharField(max_length=50, choices=SUB_ROLE_CHOICES, default='SMALLHOLDER_FARMER')  # ADD THIS LINE
    
    # Personal information
    first_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    profile_picture = models.URLField(blank=True, default='')
    
    # Location and farm details
    location = models.CharField(max_length=255, blank=True, default='')
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    farm_size = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    farm_types = models.JSONField(default=list, blank=True)
    
    # Business information
    business_name = models.CharField(max_length=255, blank=True, default='')
    business_description = models.TextField(blank=True, default='')
    business_license = models.CharField(max_length=100, blank=True, default='')
    tax_id = models.CharField(max_length=50, blank=True, default='')
    
    # Verification and status
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Preferences and settings - RENAMED to avoid clash
    user_preferences = models.TextField(default='{}', blank=True)  # CHANGED: preferences -> user_preferences
    notification_settings = models.TextField(default='{}', blank=True)
    
    # Analytics and engagement
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    login_count = models.IntegerField(default=0)
    total_orders = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firebase_uid']

    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='userprofile_groups',  # CUSTOM RELATED NAME
        related_query_name='userprofile',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='userprofile_permissions',  # CUSTOM RELATED NAME
        related_query_name='userprofile',
    )

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.email} ({self.role})"

    def get_full_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]

    def get_preferences(self):
        """Get preferences as dict"""
        try:
            return json.loads(self.user_preferences)  # CHANGED: preferences -> user_preferences
        except:
            return {}

    def set_preferences(self, preferences_dict):
        """Set preferences from dict"""
        self.user_preferences = json.dumps(preferences_dict)  # CHANGED: preferences -> user_preferences

    def get_notification_settings(self):
        """Get notification settings as dict"""
        try:
            return json.loads(self.notification_settings)
        except:
            return {}

    def set_notification_settings(self, settings_dict):
        """Set notification settings from dict"""
        self.notification_settings = json.dumps(settings_dict)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def update_activity(self, ip_address=None):
        self.last_activity = timezone.now()
        if ip_address:
            self.last_login_ip = ip_address
        self.login_count += 1
        self.save(update_fields=['last_activity', 'last_login_ip', 'login_count'])

# Rest of your models remain the same...
class UserActivityLog(models.Model):
    ACTIVITY_TYPES = (
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('PROFILE_UPDATE', 'Profile Update'),
        ('PASSWORD_CHANGE', 'Password Change'),
    )
    
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, default='')
    metadata = models.TextField(default='{}', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_activity_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.activity_type}"

class UserSession(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=128, unique=True)
    firebase_token = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    device_info = models.TextField(default='{}', blank=True)
    
    is_active = models.BooleanField(default=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.session_key}"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('SYSTEM', 'System Notification'),
        ('ORDER', 'Order Update'),
        ('PRICE', 'Price Alert'),
        ('WEATHER', 'Weather Alert'),
    )
    
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"
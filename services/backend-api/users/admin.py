# users/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django import forms
from .models import UserProfile, UserActivityLog, Notification, UserSession

class UserProfileCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required fields."""
    class Meta:
        model = UserProfile
        fields = ('email', 'firebase_uid', 'role', 'sub_role')

class UserProfileChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on the user."""
    class Meta:
        model = UserProfile
        fields = '__all__'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # Use custom forms
    add_form = UserProfileCreationForm
    form = UserProfileChangeForm
    
    # Fields to display in the list view
    list_display = [
        'email', 'firebase_uid_short', 'role', 'sub_role_display', 'full_name', 'location', 
        'is_verified_display', 'is_active_display', 'login_count', 
        'created_at'
    ]
    list_filter = ['role', 'sub_role', 'is_verified', 'is_active', 'created_at']
    search_fields = ['email', 'firebase_uid', 'first_name', 'last_name', 'location', 'business_name']
    readonly_fields = [
        'firebase_uid', 'created_at', 'updated_at', 'last_activity', 
        'login_count', 'last_login_ip', 'total_orders', 'total_revenue'
    ]
    ordering = ['-created_at']
    
    # Fieldsets for the edit form
    fieldsets = (
        ('Authentication', {
            'fields': ('firebase_uid', 'email', 'role', 'sub_role')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'phone_number', 'profile_picture')
        }),
        ('Business Information', {
            'fields': ('business_name', 'business_description', 'business_license', 'tax_id')
        }),
        ('Location & Farm', {
            'fields': ('location', 'latitude', 'longitude', 'farm_size', 'farm_types')
        }),
        ('Preferences', {
            'fields': ('user_preferences', 'notification_settings'),
            'classes': ('collapse',)
        }),
        ('Status & Analytics', {
            'fields': ('is_verified', 'verification_date', 'is_active', 'is_staff', 'is_superuser',
                      'login_count', 'total_orders', 'total_revenue', 'last_login_ip'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_activity'),
            'classes': ('collapse',)
        }),
    )
    
    # Fieldsets for the add form (without password fields)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'firebase_uid', 'role', 'sub_role'),
        }),
    )
    
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)
    
    def get_form(self, request, obj=None, **kwargs):
        """
        Use special form during user creation
        """
        defaults = {}
        if obj is None:
            defaults['form'] = self.add_form
        defaults.update(kwargs)
        return super().get_form(request, obj, **defaults)
    
    # Custom methods
    def firebase_uid_short(self, obj):
        return obj.firebase_uid[:8] + '...' if obj.firebase_uid and len(obj.firebase_uid) > 8 else obj.firebase_uid
    firebase_uid_short.short_description = 'Firebase UID'
    
    def full_name(self, obj):
        return obj.get_full_name()
    full_name.short_description = 'Full Name'
    
    def sub_role_display(self, obj):
        return obj.get_sub_role_display()
    sub_role_display.short_description = 'Sub Role'
    
    def is_verified_display(self, obj):
        color = 'green' if obj.is_verified else 'red'
        text = 'Yes' if obj.is_verified else 'No'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    is_verified_display.short_description = 'Verified'
    
    def is_active_display(self, obj):
        color = 'green' if obj.is_active else 'red'
        text = 'Active' if obj.is_active else 'Inactive'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    is_active_display.short_description = 'Status'
    
    # Actions
    actions = ['make_verified', 'make_unverified', 'activate_users', 'deactivate_users']
    
    def make_verified(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} users were marked as verified.')
    make_verified.short_description = "Mark selected users as verified"
    
    def make_unverified(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} users were marked as unverified.')
    make_unverified.short_description = "Mark selected users as unverified"
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users were activated.')
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users were deactivated.')
    deactivate_users.short_description = "Deactivate selected users"

@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'activity_type_display', 'description_short', 'ip_address', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'description', 'ip_address']
    readonly_fields = ['created_at', 'user', 'activity_type', 'description', 'ip_address', 'user_agent', 'metadata_display']
    date_hierarchy = 'created_at'
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def activity_type_display(self, obj):
        activity_colors = {
            'LOGIN': 'green',
            'LOGOUT': 'blue',
            'PROFILE_UPDATE': 'orange',
            'PASSWORD_CHANGE': 'red',
            'SECURITY': 'purple',
        }
        color = activity_colors.get(obj.activity_type, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_activity_type_display()
        )
    activity_type_display.short_description = 'Activity Type'
    
    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = 'Description'
    
    def metadata_display(self, obj):
        try:
            import json
            metadata = json.loads(obj.metadata) if obj.metadata else {}
            return format_html('<pre>{}</pre>', json.dumps(metadata, indent=2))
        except:
            return obj.metadata
    metadata_display.short_description = 'Metadata'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    # FIXED: Added 'is_read' to list_display since it's in list_editable
    list_display = ['title_short', 'user_email', 'notification_type_display', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'user__email', 'message']
    readonly_fields = ['created_at']
    # FIXED: Now 'is_read' is in both list_display and list_editable
    list_editable = ['is_read']
    date_hierarchy = 'created_at'
    actions = ['mark_as_read', 'mark_as_unread']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def title_short(self, obj):
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    title_short.short_description = 'Title'
    
    def notification_type_display(self, obj):
        type_colors = {
            'SYSTEM': 'blue',
            'ORDER': 'green',
            'PRICE': 'orange',
            'WEATHER': 'purple'
        }
        color = type_colors.get(obj.notification_type, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_notification_type_display()
        )
    notification_type_display.short_description = 'Type'
    
    def is_read_display(self, obj):
        color = 'green' if obj.is_read else 'orange'
        text = '✓ Read' if obj.is_read else '✗ Unread'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    is_read_display.short_description = 'Status'
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = "Mark selected notifications as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = "Mark selected notifications as unread"

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'session_key_short', 'is_active_display', 'last_activity', 'expires_at', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__email', 'session_key', 'ip_address']
    readonly_fields = ['created_at', 'last_activity', 'session_key', 'firebase_token', 'device_info_display']
    date_hierarchy = 'created_at'
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def session_key_short(self, obj):
        return obj.session_key[:10] + '...' if obj.session_key and len(obj.session_key) > 10 else obj.session_key
    session_key_short.short_description = 'Session Key'
    
    def is_active_display(self, obj):
        color = 'green' if obj.is_active else 'red'
        text = 'Active' if obj.is_active else 'Expired'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    is_active_display.short_description = 'Status'
    
    def device_info_display(self, obj):
        try:
            import json
            device_info = json.loads(obj.device_info) if obj.device_info else {}
            return format_html('<pre>{}</pre>', json.dumps(device_info, indent=2))
        except:
            return obj.device_info
    device_info_display.short_description = 'Device Info'
    
    def has_add_permission(self, request):
        return False

# Custom admin site header and title
admin.site.site_header = "Agro-Gram Administration"
admin.site.site_title = "Agro-Gram Admin Portal"
admin.site.index_title = "Welcome to Agro-Gram Administration"
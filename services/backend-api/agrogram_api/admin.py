from django.contrib import admin
from .models import Conversation, Message, Notification

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'buyer', 'seller', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['product__title', 'buyer__email', 'seller__email']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['content', 'sender__email']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__email', 'title', 'message']
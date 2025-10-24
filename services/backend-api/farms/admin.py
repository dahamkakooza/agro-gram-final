# farms/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Farm, Plot, CropHistory, FarmTask, FarmAnalytics

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner_email', 'location', 'total_area', 'soil_type_display', 'productivity_score_display', 'plots_count']
    list_filter = ['soil_type', 'created_at']
    search_fields = ['name', 'owner__email', 'location']
    readonly_fields = ['created_at', 'updated_at', 'productivity_score']
    
    def owner_email(self, obj):
        return obj.owner.email
    owner_email.short_description = 'Owner'
    
    def soil_type_display(self, obj):
        return obj.get_soil_type_display()
    soil_type_display.short_description = 'Soil Type'
    
    def productivity_score_display(self, obj):
        color = 'green' if obj.productivity_score > 0.7 else 'orange' if obj.productivity_score > 0.4 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1%}</span>',
            color, obj.productivity_score
        )
    productivity_score_display.short_description = 'Productivity'
    
    def plots_count(self, obj):
        return obj.plots.count()
    plots_count.short_description = 'Plots'

@admin.register(Plot)
class PlotAdmin(admin.ModelAdmin):
    list_display = ['plot_number', 'farm_name', 'area', 'current_crop', 'crop_status_display', 'days_to_harvest']
    list_filter = ['crop_status', 'farm']
    search_fields = ['plot_number', 'farm__name', 'current_crop']
    
    def farm_name(self, obj):
        return obj.farm.name
    farm_name.short_description = 'Farm'
    
    def crop_status_display(self, obj):
        status_colors = {
            'PLANNED': 'blue',
            'PLANTED': 'green',
            'GROWING': 'orange',
            'READY': 'red',
            'HARVESTED': 'purple',
            'FALLOW': 'gray'
        }
        color = status_colors.get(obj.crop_status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_crop_status_display()
        )
    crop_status_display.short_description = 'Status'
    
    def days_to_harvest(self, obj):
        if obj.expected_harvest_date:
            from django.utils import timezone
            today = timezone.now().date()
            days = (obj.expected_harvest_date - today).days
            color = 'red' if days <= 7 else 'orange' if days <= 30 else 'green'
            return format_html(
                '<span style="color: {};">{} days</span>',
                color, days
            )
        return '-'

@admin.register(CropHistory)
class CropHistoryAdmin(admin.ModelAdmin):
    list_display = ['crop_name', 'plot_display', 'planting_date', 'harvest_date', 'yield_amount', 'success_score_display']
    list_filter = ['crop_name', 'planting_date']
    search_fields = ['crop_name', 'plot__plot_number']
    
    def plot_display(self, obj):
        return f"{obj.plot.plot_number} - {obj.plot.farm.name}"
    plot_display.short_description = 'Plot'
    
    def success_score_display(self, obj):
        if obj.success_score:
            color = 'green' if obj.success_score > 0.7 else 'orange' if obj.success_score > 0.4 else 'red'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1%}</span>',
                color, obj.success_score
            )
        return '-'
    success_score_display.short_description = 'Success'

@admin.register(FarmTask)
class FarmTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'farm', 'due_date', 'priority_display', 'status_display', 'days_until_due']
    list_filter = ['status', 'priority', 'due_date']
    search_fields = ['title', 'farm__name']
    
    def priority_display(self, obj):
        priority_colors = {
            'LOW': 'green',
            'MEDIUM': 'blue',
            'HIGH': 'orange',
            'URGENT': 'red'
        }
        color = priority_colors.get(obj.priority, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_display.short_description = 'Priority'
    
    def status_display(self, obj):
        status_colors = {
            'PENDING': 'orange',
            'IN_PROGRESS': 'blue',
            'COMPLETED': 'green',
            'CANCELLED': 'red'
        }
        color = status_colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def days_until_due(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        days = (obj.due_date - today).days
        if days < 0:
            return format_html('<span style="color: red;">Overdue ({})</span>', abs(days))
        elif days == 0:
            return format_html('<span style="color: orange;">Today</span>')
        elif days <= 7:
            return format_html('<span style="color: orange;">{} days</span>', days)
        else:
            return format_html('<span style="color: green;">{} days</span>', days)

@admin.register(FarmAnalytics)
class FarmAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['farm', 'average_yield', 'success_rate_display', 'profitability_score_display', 'last_updated']
    readonly_fields = ['last_updated']
    
    def success_rate_display(self, obj):
        color = 'green' if obj.success_rate > 0.7 else 'orange' if obj.success_rate > 0.4 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1%}</span>',
            color, obj.success_rate
        )
    success_rate_display.short_description = 'Success Rate'
    
    def profitability_score_display(self, obj):
        color = 'green' if obj.profitability_score > 20 else 'orange' if obj.profitability_score > 0 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, obj.profitability_score
        )
    profitability_score_display.short_description = 'Profitability'

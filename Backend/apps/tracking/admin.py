"""
Admin configuration for Tracking app
"""
from django.contrib import admin
from .models import Activity, DailySummary, ActivityGoal


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'activity_type', 'description',
        'co2_impact', 'points_earned', 'timestamp'
    )
    list_filter = ('activity_type', 'timestamp', 'transport_mode', 'meal_type')
    search_fields = ('user__username', 'description', 'notes')
    readonly_fields = ('co2_impact', 'points_earned', 'timestamp')
    date_hierarchy = 'timestamp'
    ordering = ('-timestamp',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'activity_type', 'description', 'location', 'notes')
        }),
        ('Transport Details', {
            'fields': ('transport_mode', 'distance_km'),
            'classes': ('collapse',)
        }),
        ('Food Details', {
            'fields': ('meal_type', 'servings'),
            'classes': ('collapse',)
        }),
        ('Energy Details', {
            'fields': ('energy_type', 'energy_saved_kwh', 'hours'),
            'classes': ('collapse',)
        }),
        ('Waste Details', {
            'fields': ('waste_type', 'weight_kg'),
            'classes': ('collapse',)
        }),
        ('Impact & Rewards', {
            'fields': ('co2_impact', 'points_earned', 'timestamp')
        }),
    )


@admin.register(DailySummary)
class DailySummaryAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'date', 'activities_count',
        'total_co2_saved', 'total_points'
    )
    list_filter = ('date',)
    search_fields = ('user__username',)
    date_hierarchy = 'date'
    ordering = ('-date',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'date')
        }),
        ('Summary Statistics', {
            'fields': (
                'total_co2_saved', 'total_co2_emitted', 'net_co2_impact',
                'total_points', 'activities_count'
            )
        }),
        ('Category Breakdown - CO2', {
            'fields': ('transport_co2', 'food_co2', 'energy_co2', 'waste_co2')
        }),
        ('Category Breakdown - Count', {
            'fields': ('transport_count', 'food_count', 'energy_count', 'waste_count')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ActivityGoal)
class ActivityGoalAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'goal_type', 'target_value',
        'current_value', 'progress_percentage', 'is_active'
    )
    list_filter = ('goal_type', 'is_active', 'start_date')
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'updated_at', 'progress_percentage')
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage:.1f}%"
    progress_percentage.short_description = 'Progress'
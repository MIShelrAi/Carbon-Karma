"""
Admin configuration for Gamification app
"""
from django.contrib import admin
from .models import Badge, UserBadge, Achievement, UserAchievement, Notification, DailyStreak

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'rarity', 'requirement_type', 'requirement_value', 'points_reward', 'is_active')
    list_filter = ('category', 'rarity', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('rarity', 'requirement_value')

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'earned_at', 'is_showcased')
    list_filter = ('badge__category', 'badge__rarity', 'is_showcased', 'earned_at')
    search_fields = ('user__username', 'badge__name')
    date_hierarchy = 'earned_at'
    ordering = ('-earned_at',)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('title', 'trigger_type', 'trigger_value', 'points_reward', 'is_active')
    list_filter = ('trigger_type', 'is_active')
    search_fields = ('title', 'description')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'progress', 'progress_percentage', 'is_completed', 'completed_at')
    list_filter = ('is_completed', 'completed_at')
    search_fields = ('user__username', 'achievement__title')
    date_hierarchy = 'completed_at'
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage:.1f}%"

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'streak_day', 'activities_count', 'co2_saved')
    list_filter = ('date',)
    search_fields = ('user__username',)
    date_hierarchy = 'date'
    ordering = ('-date',)
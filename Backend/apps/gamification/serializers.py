"""
Serializers for Gamification app
"""
from rest_framework import serializers
from .models import Badge, UserBadge, Achievement, UserAchievement, Notification, DailyStreak

class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model"""
    rarity_display = serializers.CharField(source='get_rarity_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Badge
        fields = (
            'id', 'name', 'description', 'category', 'category_display',
            'rarity', 'rarity_display', 'requirement_type', 'requirement_value',
            'points_reward', 'icon', 'color', 'is_active', 'created_at'
        )

class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge (earned badges)"""
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ('id', 'user', 'badge', 'earned_at', 'is_showcased')
        read_only_fields = ('user', 'earned_at')

class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for Achievement model"""
    badge_info = BadgeSerializer(source='badge', read_only=True)
    
    class Meta:
        model = Achievement
        fields = (
            'id', 'title', 'description', 'icon',
            'trigger_type', 'trigger_value', 'points_reward',
            'badge', 'badge_info', 'is_active', 'created_at'
        )

class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for UserAchievement (user progress)"""
    achievement = AchievementSerializer(read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = UserAchievement
        fields = (
            'id', 'user', 'achievement', 'progress',
            'progress_percentage', 'is_completed', 'completed_at'
        )
        read_only_fields = ('user', 'completed_at')

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    
    class Meta:
        model = Notification
        fields = (
            'id', 'user', 'notification_type', 'notification_type_display',
            'title', 'message', 'related_id', 'is_read', 'created_at'
        )
        read_only_fields = ('user', 'created_at')

class DailyStreakSerializer(serializers.ModelSerializer):
    """Serializer for DailyStreak model"""
    
    class Meta:
        model = DailyStreak
        fields = (
            'id', 'user', 'date', 'activities_count',
            'co2_saved', 'streak_day'
        )
        read_only_fields = ('user',)
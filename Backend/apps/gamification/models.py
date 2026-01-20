"""
Gamification models for Carbon Karma
"""
from django.db import models
from django.conf import settings
from django.utils import timezone

class Badge(models.Model):
    """Achievement badges that users can earn"""
    
    BADGE_CATEGORIES = [
        ('streak', 'Streak Master'),
        ('co2', 'CO2 Saver'),
        ('activity', 'Activity Champion'),
        ('social', 'Social Butterfly'),
        ('special', 'Special Achievement'),
    ]
    
    RARITY_LEVELS = [
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=BADGE_CATEGORIES)
    rarity = models.CharField(max_length=20, choices=RARITY_LEVELS, default='common')
    
    # Requirements
    requirement_type = models.CharField(max_length=50)  # 'streak', 'co2_saved', 'activities_count'
    requirement_value = models.FloatField()
    
    # Rewards
    points_reward = models.IntegerField(default=0)
    
    # Badge image (URL or emoji)
    icon = models.CharField(max_length=200, default='🏆')
    color = models.CharField(max_length=7, default='#FFD700')  # Hex color
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['rarity', 'requirement_value']
        
    def __str__(self):
        return f"{self.name} ({self.get_rarity_display()})"
    
    def check_earned(self, user):
        """Check if user has earned this badge"""
        if self.requirement_type == 'streak':
            return user.longest_streak >= self.requirement_value
        elif self.requirement_type == 'co2_saved':
            return user.total_co2_saved >= self.requirement_value
        elif self.requirement_type == 'activities_count':
            return user.total_activities >= self.requirement_value
        elif self.requirement_type == 'level':
            return user.level >= self.requirement_value
        elif self.requirement_type == 'points':
            return user.carbon_points >= self.requirement_value
        return False

class UserBadge(models.Model):
    """Junction table for user-earned badges"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='earned_badges'
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    is_showcased = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"

class Achievement(models.Model):
    """Milestone achievements"""
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=200, default='🎯')
    
    # Trigger conditions
    trigger_type = models.CharField(max_length=50)
    trigger_value = models.FloatField()
    
    # Rewards
    points_reward = models.IntegerField(default=100)
    badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class UserAchievement(models.Model):
    """Track user achievements"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    progress = models.FloatField(default=0.0)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-completed_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.achievement.title}"
    
    @property
    def progress_percentage(self):
        """Calculate progress as percentage"""
        if self.achievement.trigger_value == 0:
            return 0
        return min((self.progress / self.achievement.trigger_value) * 100, 100)

class Notification(models.Model):
    """User notifications for achievements, badges, etc."""
    
    NOTIFICATION_TYPES = [
        ('badge', 'Badge Earned'),
        ('achievement', 'Achievement Unlocked'),
        ('level_up', 'Level Up'),
        ('challenge', 'Challenge Update'),
        ('streak', 'Streak Milestone'),
        ('reward', 'Reward Available'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    
    # Optional reference to related object
    related_id = models.IntegerField(null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class DailyStreak(models.Model):
    """Track daily streak details"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='streak_history'
    )
    date = models.DateField()
    activities_count = models.IntegerField(default=0)
    co2_saved = models.FloatField(default=0.0)
    streak_day = models.IntegerField(default=1)  # Which day of the streak
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        
    def __str__(self):
        return f"{self.user.username} - Day {self.streak_day} ({self.date})"
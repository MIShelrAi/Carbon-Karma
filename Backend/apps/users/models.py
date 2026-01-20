# Create your models here.
"""
User models for Carbon Karma
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    """Extended User model with Carbon Karma specific fields"""
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
    ]
    
# Profile Infos
    phone = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=100, default='Kathmandu')
    preferred_language = models.CharField(
        max_length=5, 
        default='en'
    )
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Gamification Stats
    carbon_points = models.IntegerField(default=0)
    total_co2_saved = models.FloatField(default=0.0)  # in kg
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Progress Tracking
    level = models.IntegerField(default=1)
    total_activities = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    def add_points(self, points):
        """Add points to user and update level"""
        self.carbon_points += points
        
        # Level up logic: every 1000 points = 1 level
        new_level = (self.carbon_points // 1000) + 1
        if new_level > self.level:
            self.level = new_level
        
        self.save(update_fields=['carbon_points', 'level'])
    
    def update_co2_saved(self, co2_amount):
        """Update total CO2 saved"""
        self.total_co2_saved += co2_amount
        self.save(update_fields=['total_co2_saved'])
    
    def update_streak(self, activity_date=None):
        """Update user's activity streak"""
        if activity_date is None:
            activity_date = timezone.now().date()
        
        if self.last_activity_date:
            days_diff = (activity_date - self.last_activity_date).days
            
            if days_diff == 1:
                # Consecutive day - increment streak
                self.current_streak += 1
            elif days_diff > 1:
                # Streak broken - reset to 1
                self.current_streak = 1
            # If days_diff == 0, same day - don't change streak
        else:
            # First activity ever
            self.current_streak = 1
        
        # Update longest streak if needed
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.last_activity_date = activity_date
        self.save(update_fields=['current_streak', 'longest_streak', 'last_activity_date'])
    
    def increment_activities(self):
        """Increment total activities count"""
        self.total_activities += 1
        self.save(update_fields=['total_activities'])
    
    @property
    def points_to_next_level(self):
        """Calculate points needed for next level"""
        next_level_threshold = self.level * 1000
        return next_level_threshold - self.carbon_points
    
    @property
    def level_progress(self):
        """Calculate progress percentage to next level"""
        current_level_base = (self.level - 1) * 1000
        points_in_current_level = self.carbon_points - current_level_base
        return (points_in_current_level / 1000) * 100
"""
Leaderboard models for Carbon Karma
"""
from django.db import models
from django.conf import settings

class Team(models.Model):
    """Model for team competitions"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_teams'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='teams'
    )
    
    total_points = models.IntegerField(default=0)
    total_co2_saved = models.FloatField(default=0.0)
    
    avatar = models.CharField(max_length=500, blank=True)
    is_public = models.BooleanField(default=True)
    max_members = models.IntegerField(default=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_points']
    
    def __str__(self):
        return self.name
    
    def update_stats(self):
        """Recalculate team stats from all members"""
        members = self.members.all()
        self.total_points = sum(m.carbon_points for m in members)
        self.total_co2_saved = sum(m.total_co2_saved for m in members)
        self.save(update_fields=['total_points', 'total_co2_saved', 'updated_at'])
    
    @property
    def member_count(self):
        """Get number of team members"""
        return self.members.count()
    
    @property
    def is_full(self):
        """Check if team is at max capacity"""
        return self.member_count >= self.max_members
    
    @property
    def average_points_per_member(self):
        """Calculate average points per team member"""
        count = self.member_count
        if count == 0:
            return 0
        return round(self.total_points / count, 2)
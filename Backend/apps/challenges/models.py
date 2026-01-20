"""
Challenge models for Carbon Karma
"""
from django.db import models
from django.conf import settings
from django.utils import timezone

class Challenge(models.Model):
    """Model for challenges that users can participate in"""
    
    CHALLENGE_TYPES = [
        ('individual', 'Individual'),
        ('team', 'Team'),
    ]
    
    DIFFICULTY_LEVELS = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    challenge_type = models.CharField(max_length=20, choices=CHALLENGE_TYPES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='medium')
    
    # Criteria
    target_type = models.CharField(max_length=50)  # 'co2_saved', 'activities_count', 'streak'
    target_value = models.FloatField()
    
    # Rewards
    reward_points = models.IntegerField()
    badge_name = models.CharField(max_length=50, blank=True)
    
    # Timing
    start_date = models.DateField()
    end_date = models.DateField()
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return self.name
    
    @property
    def is_ongoing(self):
        """Check if challenge is currently active"""
        today = timezone.now().date()
        return self.start_date <= today <= self.end_date
    
    @property
    def participants_count(self):
        """Get number of participants"""
        return self.challengeparticipation_set.count()
    
    @property
    def completion_rate(self):
        """Calculate percentage of participants who completed"""
        total = self.participants_count
        if total == 0:
            return 0
        completed = self.challengeparticipation_set.filter(is_completed=True).count()
        return round((completed / total) * 100, 1)

class ChallengeParticipation(models.Model):
    """Track user participation in challenges"""
    
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_participations')
    
    progress = models.FloatField(default=0.0)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['challenge', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.challenge.name}"
    
    def update_progress(self):
        """Calculate and update progress based on challenge criteria"""
        from apps.tracking.models import Activity
        
        challenge = self.challenge
        user = self.user
        
        if challenge.target_type == 'co2_saved':
            # Calculate CO2 saved during challenge period
            activities = Activity.objects.filter(
                user=user,
                timestamp__date__gte=challenge.start_date,
                timestamp__date__lte=challenge.end_date,
                co2_impact__gt=0
            )
            total_saved = sum(a.co2_impact for a in activities)
            self.progress = min((total_saved / challenge.target_value) * 100, 100)
        
        elif challenge.target_type == 'activities_count':
            count = Activity.objects.filter(
                user=user,
                timestamp__date__gte=challenge.start_date,
                timestamp__date__lte=challenge.end_date
            ).count()
            self.progress = min((count / challenge.target_value) * 100, 100)
        
        elif challenge.target_type == 'streak':
            self.progress = min((user.current_streak / challenge.target_value) * 100, 100)
        
        # Check if completed
        if self.progress >= 100 and not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
            
            # Award points
            user.add_points(challenge.reward_points)
            
            # Create notification
            from apps.gamification.models import Notification
            Notification.objects.create(
                user=user,
                notification_type='challenge',
                title=f'Challenge Completed: {challenge.name}',
                message=f'Congratulations! You completed the {challenge.name} challenge and earned {challenge.reward_points} points!',
                related_id=challenge.id
            )
        
        self.save()
    
    @property
    def progress_percentage(self):
        """Get progress as percentage"""
        return round(self.progress, 1)
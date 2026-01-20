"""
Tracking models for Carbon Karma
"""
from django.db import models
from django.conf import settings
from django.utils import timezone

class Activity(models.Model):
    """Model for tracking individual carbon activities"""
    
    ACTIVITY_TYPES = [
        ('transport', 'Transportation'),
        ('food', 'Food'),
        ('energy', 'Energy'),
        ('waste', 'Waste'),
    ]
    
    TRANSPORT_MODES = [
        ('walk', 'Walking'),
        ('bicycle', 'Bicycle'),
        ('ebike', 'E-Bike'),
        ('microbus', 'Microbus'),
        ('safa_tempo', 'Safa Tempo (Electric)'),
        ('motorcycle', 'Motorcycle'),
        ('car', 'Private Car'),
        ('bus', 'Bus'),
        ('taxi', 'Taxi'),
        ('rickshaw', 'Rickshaw'),
    ]
    
    FOOD_TYPES = [
        ('vegan', 'Vegan Meal'),
        ('vegetarian', 'Vegetarian Meal'),
        ('dal_bhat', 'Dal Bhat'),
        ('vegetable_curry', 'Vegetable Curry'),
        ('chicken', 'Chicken'),
        ('buff', 'Buff (Buffalo)'),
        ('pork', 'Pork'),
        ('fish', 'Fish'),
        ('egg', 'Egg'),
        ('dairy', 'Dairy Product'),
    ]
    
    ENERGY_TYPES = [
        ('solar_used', 'Used Solar Power'),
        ('lights_off', 'Turned Off Lights'),
        ('ac_off', 'Avoided AC Use'),
        ('unplugged', 'Unplugged Devices'),
        ('energy_efficient', 'Used Energy Efficient Appliance'),
    ]
    
    WASTE_TYPES = [
        ('recycled', 'Recycled Waste'),
        ('composted', 'Composted Organic Waste'),
        ('reused', 'Reused Item'),
        ('avoided_plastic', 'Avoided Single-Use Plastic'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    
    # Transport specific fields
    transport_mode = models.CharField(
        max_length=20,
        choices=TRANSPORT_MODES,
        blank=True,
        null=True
    )
    distance_km = models.FloatField(null=True, blank=True)
    
    # Food specific fields
    meal_type = models.CharField(
        max_length=50,
        choices=FOOD_TYPES,
        blank=True,
        null=True
    )
    servings = models.IntegerField(default=1, null=True, blank=True)
    
    # Energy specific fields
    energy_type = models.CharField(
        max_length=50,
        choices=ENERGY_TYPES,
        blank=True,
        null=True
    )
    energy_saved_kwh = models.FloatField(null=True, blank=True)
    hours = models.FloatField(null=True, blank=True)  # For duration-based activities
    
    # Waste specific fields
    waste_type = models.CharField(
        max_length=50,
        choices=WASTE_TYPES,
        blank=True,
        null=True
    )
    weight_kg = models.FloatField(null=True, blank=True)
    
    # Common fields
    description = models.CharField(max_length=200)
    co2_impact = models.FloatField()  # in kg (positive = saved, negative = emitted)
    points_earned = models.IntegerField(default=0)
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Activities'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['activity_type', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.description} ({self.timestamp.date()})"
    
    def save(self, *args, **kwargs):
        # Calculate CO2 impact if not set
        if not self.co2_impact:
            from .carbon_calculator import calculate_co2_impact
            self.co2_impact = calculate_co2_impact(self)
        
        # Calculate points (10 points per kg CO2 saved)
        if self.co2_impact > 0:
            self.points_earned = int(self.co2_impact * 10)
        
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update user stats if new activity
        if is_new:
            self.user.add_points(self.points_earned)
            self.user.update_co2_saved(self.co2_impact if self.co2_impact > 0 else 0)
            self.user.update_streak(self.timestamp.date())
            self.user.increment_activities()

class DailySummary(models.Model):
    """Daily aggregated summary of user activities"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_summaries'
    )
    date = models.DateField()
    
    # Totals
    total_co2_saved = models.FloatField(default=0.0)
    total_co2_emitted = models.FloatField(default=0.0)
    net_co2_impact = models.FloatField(default=0.0)
    total_points = models.IntegerField(default=0)
    activities_count = models.IntegerField(default=0)
    
    # Breakdown by type
    transport_co2 = models.FloatField(default=0.0)
    food_co2 = models.FloatField(default=0.0)
    energy_co2 = models.FloatField(default=0.0)
    waste_co2 = models.FloatField(default=0.0)
    
    # Activity counts by type
    transport_count = models.IntegerField(default=0)
    food_count = models.IntegerField(default=0)
    energy_count = models.IntegerField(default=0)
    waste_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        verbose_name_plural = 'Daily Summaries'
        indexes = [
            models.Index(fields=['user', '-date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"
    
    @classmethod
    def update_for_date(cls, user, date):
        """Update or create daily summary for a specific date"""
        activities = Activity.objects.filter(
            user=user,
            timestamp__date=date
        )
        
        summary, created = cls.objects.get_or_create(
            user=user,
            date=date
        )
        
        # Calculate totals
        summary.activities_count = activities.count()
        summary.total_points = sum(a.points_earned for a in activities)
        
        co2_values = [a.co2_impact for a in activities]
        summary.total_co2_saved = sum(v for v in co2_values if v > 0)
        summary.total_co2_emitted = abs(sum(v for v in co2_values if v < 0))
        summary.net_co2_impact = sum(co2_values)
        
        # Breakdown by type
        for activity_type in ['transport', 'food', 'energy', 'waste']:
            type_activities = activities.filter(activity_type=activity_type)
            co2_sum = sum(a.co2_impact for a in type_activities)
            setattr(summary, f'{activity_type}_co2', co2_sum)
            setattr(summary, f'{activity_type}_count', type_activities.count())
        
        summary.save()
        return summary

class ActivityGoal(models.Model):
    """User-defined goals for carbon reduction"""
    
    GOAL_TYPES = [
        ('daily_co2', 'Daily CO2 Saved'),
        ('weekly_co2', 'Weekly CO2 Saved'),
        ('monthly_co2', 'Monthly CO2 Saved'),
        ('daily_activities', 'Daily Activities'),
        ('weekly_activities', 'Weekly Activities'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_goals'
    )
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    target_value = models.FloatField()
    current_value = models.FloatField(default=0.0)
    
    is_active = models.BooleanField(default=True)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_goal_type_display()}: {self.target_value}"
    
    @property
    def progress_percentage(self):
        """Calculate goal progress as percentage"""
        if self.target_value == 0:
            return 0
        return min((self.current_value / self.target_value) * 100, 100)
    
    @property
    def is_completed(self):
        """Check if goal is completed"""
        return self.current_value >= self.target_value
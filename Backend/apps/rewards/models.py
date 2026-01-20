"""
Rewards models for Carbon Karma
"""
from django.db import models
from django.conf import settings
import uuid

class Reward(models.Model):
    """Rewards that users can redeem with points"""
    
    CATEGORY_CHOICES = [
        ('discount', 'Discount Voucher'),
        ('voucher', 'Gift Voucher'),
        ('tree_planting', 'Tree Planting'),
        ('merchandise', 'Merchandise'),
        ('donation', 'Charity Donation'),
        ('experience', 'Experience'),
    ]
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    points_required = models.IntegerField()
    partner_name = models.CharField(max_length=100)
    partner_logo = models.CharField(max_length=500, blank=True)
    
    image = models.CharField(max_length=500, blank=True)
    terms = models.TextField(blank=True, help_text="Terms and conditions")
    
    is_active = models.BooleanField(default=True)
    stock = models.IntegerField(default=-1, help_text="-1 means unlimited stock")
    
    # Nepal specific
    available_in_nepal = models.BooleanField(default=True)
    delivery_available = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['points_required']
    
    def __str__(self):
        return f"{self.title} ({self.points_required} points)"
    
    @property
    def is_available(self):
        """Check if reward is available for redemption"""
        return self.is_active and (self.stock == -1 or self.stock > 0)
    
    @property
    def redemption_count(self):
        """Get number of times this reward has been redeemed"""
        return self.redemption_set.count()

class Redemption(models.Model):
    """Track user reward redemptions"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('processing', 'Processing'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='redemptions'
    )
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    
    points_spent = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Unique redemption code
    redemption_code = models.CharField(max_length=20, unique=True, blank=True)
    
    # Delivery information (if applicable)
    delivery_address = models.TextField(blank=True)
    delivery_phone = models.CharField(max_length=15, blank=True)
    
    # Status timestamps
    approved_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.reward.title} ({self.status})"
    
    def save(self, *args, **kwargs):
        # Generate redemption code if not exists
        if not self.redemption_code:
            self.redemption_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
    
    def can_cancel(self):
        """Check if redemption can be cancelled"""
        return self.status in ['pending', 'approved']
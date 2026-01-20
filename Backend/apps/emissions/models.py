"""
Emissions data models for Carbon Karma
"""
from django.db import models

class EmissionFactor(models.Model):
    """Store emission factors for different activities"""
    
    ACTIVITY_CATEGORIES = [
        ('transport', 'Transportation'),
        ('food', 'Food'),
        ('energy', 'Energy'),
        ('waste', 'Waste'),
    ]
    
    category = models.CharField(max_length=20, choices=ACTIVITY_CATEGORIES)
    subcategory = models.CharField(max_length=100)  # e.g., 'car', 'bus', 'chicken'
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Emission factor value
    co2_per_unit = models.FloatField(help_text="CO2 kg per unit")
    unit = models.CharField(max_length=50, help_text="km, kg, kWh, etc.")
    
    # Nepal specific
    nepal_specific = models.BooleanField(default=False)
    source = models.CharField(max_length=200, blank=True, help_text="Data source")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'subcategory']
        unique_together = ['category', 'subcategory']
    
    def __str__(self):
        return f"{self.name} ({self.co2_per_unit} kg CO2/{self.unit})"
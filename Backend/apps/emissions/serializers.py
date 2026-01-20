
"""
Serializers for Emissions app
"""
from rest_framework import serializers
from .models import EmissionFactor

class EmissionFactorSerializer(serializers.ModelSerializer):
    """Serializer for EmissionFactor model"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = EmissionFactor
        fields = (
            'id', 'category', 'category_display', 'subcategory',
            'name', 'description', 'co2_per_unit', 'unit',
            'nepal_specific', 'source', 'is_active'
        )
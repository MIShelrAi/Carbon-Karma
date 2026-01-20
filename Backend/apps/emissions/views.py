"""
Views for Emissions app
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import EmissionFactor
from .serializers import EmissionFactorSerializer

class EmissionFactorListView(generics.ListAPIView):
    """
    GET /api/emissions/factors/
    List all emission factors
    """
    serializer_class = EmissionFactorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = EmissionFactor.objects.filter(is_active=True)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter Nepal-specific data
        nepal_only = self.request.query_params.get('nepal_only')
        if nepal_only == 'true':
            queryset = queryset.filter(nepal_specific=True)
        
        return queryset
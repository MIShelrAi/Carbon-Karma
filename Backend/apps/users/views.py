"""
Views for User app
"""
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UserStatsSerializer,
    ChangePasswordSerializer
)
from backend.apps.users import models

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    """
    Register a new user
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully!'
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveAPIView):
    """
    Get current user's profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UserProfileUpdateView(generics.UpdateAPIView):
    """
    Update current user's profile
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        profile_serializer = UserProfileSerializer(instance)
        return Response(profile_serializer.data)

class UserStatsView(generics.RetrieveAPIView):
    """
    Get current user's stats summary
    """
    serializer_class = UserStatsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    """
    Change user password
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully!'
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for the user
    """
    user = request.user
    
    # Get recent activities count
    from apps.tracking.models import Activity
    from django.utils import timezone
    from datetime import timedelta
    
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    weekly_activities = Activity.objects.filter(
        user=user,
        timestamp__date__gte=week_ago
    ).count()
    
    weekly_co2_saved = Activity.objects.filter(
        user=user,
        timestamp__date__gte=week_ago,
        co2_impact__gt=0
    ).aggregate(
        total=models.Sum('co2_impact')
    )['total'] or 0
    
    # Get active challenges count
    from apps.challenges.models import ChallengeParticipation
    active_challenges = ChallengeParticipation.objects.filter(
        user=user,
        is_completed=False,
        challenge__is_active=True
    ).count()
    
    return Response({
        'user': UserProfileSerializer(user).data,
        'weekly_stats': {
            'activities_count': weekly_activities,
            'co2_saved': round(weekly_co2_saved, 2)
        },
        'active_challenges_count': active_challenges,
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Delete user account (requires password confirmation)
    """
    password = request.data.get('password')
    
    if not password:
        return Response(
            {'error': 'Password is required to delete account.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    
    if not user.check_password(password):
        return Response(
            {'error': 'Incorrect password.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.delete()
    
    return Response(
        {'message': 'Account deleted successfully.'},
        status=status.HTTP_200_OK
    )
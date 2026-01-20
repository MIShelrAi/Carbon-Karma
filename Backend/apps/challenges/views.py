"""
Views for Challenges app
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import Challenge, ChallengeParticipation
from .serializers import (
    ChallengeSerializer,
    ChallengeParticipationSerializer,
    ChallengeLeaderboardSerializer
)

class ChallengeListView(generics.ListAPIView):
    """
    GET /api/challenges/
    List all active challenges
    """
    serializer_class = ChallengeSerializer
    permission_classes = []  # Allow public access
    
    def get_queryset(self):
        queryset = Challenge.objects.filter(is_active=True)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'ongoing':
            today = timezone.now().date()
            queryset = queryset.filter(start_date__lte=today, end_date__gte=today)
        elif status_filter == 'upcoming':
            today = timezone.now().date()
            queryset = queryset.filter(start_date__gt=today)
        elif status_filter == 'completed':
            today = timezone.now().date()
            queryset = queryset.filter(end_date__lt=today)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by type
        challenge_type = self.request.query_params.get('type')
        if challenge_type:
            queryset = queryset.filter(challenge_type=challenge_type)
        
        return queryset

class ChallengeDetailView(generics.RetrieveAPIView):
    """
    GET /api/challenges/<id>/
    Get challenge details
    """
    queryset = Challenge.objects.filter(is_active=True)
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]

class MyChallengesView(generics.ListAPIView):
    """
    GET /api/challenges/my-challenges/
    Get challenges the user is participating in
    """
    serializer_class = ChallengeParticipationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChallengeParticipation.objects.filter(
            user=self.request.user
        ).select_related('challenge')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_challenge(request, challenge_id):
    """
    POST /api/challenges/<id>/join/
    Join a challenge
    """
    try:
        challenge = Challenge.objects.get(id=challenge_id, is_active=True)
    except Challenge.DoesNotExist:
        return Response(
            {'error': 'Challenge not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if challenge is ongoing or upcoming
    if not challenge.is_ongoing and challenge.start_date > timezone.now().date():
        # Can join upcoming challenges
        pass
    elif challenge.end_date < timezone.now().date():
        return Response(
            {'error': 'This challenge has already ended'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if already participating
    if ChallengeParticipation.objects.filter(
        challenge=challenge,
        user=request.user
    ).exists():
        return Response(
            {'error': 'You are already participating in this challenge'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create participation
    participation = ChallengeParticipation.objects.create(
        challenge=challenge,
        user=request.user
    )
    
    # If challenge has started, calculate initial progress
    if challenge.is_ongoing:
        participation.update_progress()
    
    return Response({
        'message': f'Successfully joined {challenge.name}!',
        'participation': ChallengeParticipationSerializer(participation).data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_challenge(request, challenge_id):
    """
    POST /api/challenges/<id>/leave/
    Leave a challenge
    """
    try:
        participation = ChallengeParticipation.objects.get(
            challenge_id=challenge_id,
            user=request.user
        )
        
        # Don't allow leaving completed challenges
        if participation.is_completed:
            return Response(
                {'error': 'Cannot leave a completed challenge'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        challenge_name = participation.challenge.name
        participation.delete()
        
        return Response({
            'message': f'You have left {challenge_name}'
        })
    except ChallengeParticipation.DoesNotExist:
        return Response(
            {'error': 'You are not participating in this challenge'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_challenge_progress(request, challenge_id):
    """
    POST /api/challenges/<id>/update-progress/
    Manually update progress for a challenge
    """
    try:
        participation = ChallengeParticipation.objects.get(
            challenge_id=challenge_id,
            user=request.user
        )
        
        participation.update_progress()
        
        return Response({
            'message': 'Progress updated',
            'participation': ChallengeParticipationSerializer(participation).data
        })
    except ChallengeParticipation.DoesNotExist:
        return Response(
            {'error': 'You are not participating in this challenge'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def challenge_leaderboard(request, challenge_id):
    """
    GET /api/challenges/<id>/leaderboard/
    Get leaderboard for a specific challenge
    """
    try:
        challenge = Challenge.objects.get(id=challenge_id, is_active=True)
    except Challenge.DoesNotExist:
        return Response(
            {'error': 'Challenge not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get all participants ordered by progress
    participants = ChallengeParticipation.objects.filter(
        challenge=challenge
    ).select_related('user').order_by('-progress', 'joined_at')
    
    leaderboard_data = []
    for rank, participation in enumerate(participants, start=1):
        leaderboard_data.append({
            'user_id': participation.user.id,
            'username': participation.user.username,
            'avatar': participation.user.avatar,
            'progress': participation.progress,
            'is_completed': participation.is_completed,
            'rank': rank
        })
    
    return Response({
        'challenge': ChallengeSerializer(challenge, context={'request': request}).data,
        'leaderboard': leaderboard_data,
        'total_participants': len(leaderboard_data)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def challenge_stats(request):
    """
    GET /api/challenges/stats/
    Get user's challenge statistics
    """
    user = request.user
    
    total_joined = ChallengeParticipation.objects.filter(user=user).count()
    total_completed = ChallengeParticipation.objects.filter(
        user=user,
        is_completed=True
    ).count()
    
    active_challenges = ChallengeParticipation.objects.filter(
        user=user,
        is_completed=False,
        challenge__is_active=True,
        challenge__end_date__gte=timezone.now().date()
    ).count()
    
    total_points_earned = sum(
        p.challenge.reward_points
        for p in ChallengeParticipation.objects.filter(
            user=user,
            is_completed=True
        )
    )
    
    return Response({
        'total_joined': total_joined,
        'total_completed': total_completed,
        'active_challenges': active_challenges,
        'completion_rate': round((total_completed / total_joined * 100) if total_joined > 0 else 0, 1),
        'total_points_earned': total_points_earned
    })
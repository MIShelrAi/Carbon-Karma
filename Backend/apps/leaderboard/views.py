"""
Views for Leaderboard app
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from datetime import timedelta
from django.utils import timezone

from .models import Team
from .serializers import (
    TeamSerializer,
    TeamDetailSerializer,
    LeaderboardEntrySerializer
)

User = get_user_model()

class TeamListCreateView(generics.ListCreateAPIView):
    """
    GET /api/leaderboard/teams/
    POST /api/leaderboard/teams/
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TeamSerializer
        return TeamSerializer
    
    def get_queryset(self):
        queryset = Team.objects.all()
        
        # Filter by public/private
        if self.request.query_params.get('public_only') == 'true':
            queryset = queryset.filter(is_public=True)
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset

class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/leaderboard/teams/<id>/
    """
    queryset = Team.objects.all()
    serializer_class = TeamDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_update(self, serializer):
        """Only team creator can update"""
        if serializer.instance.created_by != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only team creator can update team details")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only team creator can delete"""
        if instance.created_by != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only team creator can delete team")
        instance.delete()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_team(request, team_id):
    """
    POST /api/leaderboard/teams/<id>/join/
    Join a team
    """
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(
            {'error': 'Team not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if team is full
    if team.is_full:
        return Response(
            {'error': 'Team is full'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if already a member
    if team.members.filter(id=request.user.id).exists():
        return Response(
            {'error': 'You are already a member of this team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Add user to team
    team.members.add(request.user)
    team.update_stats()
    
    return Response({
        'message': f'Successfully joined {team.name}!',
        'team': TeamSerializer(team, context={'request': request}).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_team(request, team_id):
    """
    POST /api/leaderboard/teams/<id>/leave/
    Leave a team
    """
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(
            {'error': 'Team not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if member
    if not team.members.filter(id=request.user.id).exists():
        return Response(
            {'error': 'You are not a member of this team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Don't allow creator to leave
    if team.created_by == request.user:
        return Response(
            {'error': 'Team creator cannot leave. Delete the team instead.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Remove user from team
    team.members.remove(request.user)
    team.update_stats()
    
    return Response({
        'message': f'You have left {team.name}'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_leaderboard(request):
    """
    GET /api/leaderboard/global/
    Get global leaderboard
    """
    # Get filter parameters
    timeframe = request.query_params.get('timeframe', 'all_time')  # all_time, weekly, monthly
    metric = request.query_params.get('metric', 'points')  # points, co2_saved, streak
    limit = int(request.query_params.get('limit', 100))
    
    # Base queryset
    users = User.objects.all()
    
    # Apply timeframe filter if needed
    if timeframe == 'weekly':
        week_ago = timezone.now() - timedelta(days=7)
        # For weekly, we'd need to aggregate from activities
        # Simplified: use all-time data
        pass
    elif timeframe == 'monthly':
        month_ago = timezone.now() - timedelta(days=30)
        # Similar to weekly
        pass
    
    # Order by metric
    if metric == 'points':
        users = users.order_by('-carbon_points')
    elif metric == 'co2_saved':
        users = users.order_by('-total_co2_saved')
    elif metric == 'streak':
        users = users.order_by('-current_streak')
    else:
        users = users.order_by('-carbon_points')
    
    # Limit results
    users = users[:limit]
    
    # Build leaderboard data
    leaderboard_data = []
    for rank, user in enumerate(users, start=1):
        leaderboard_data.append({
            'rank': rank,
            'user_id': user.id,
            'username': user.username,
            'avatar': user.avatar,
            'location': user.location,
            'carbon_points': user.carbon_points,
            'total_co2_saved': round(user.total_co2_saved, 2),
            'level': user.level,
            'current_streak': user.current_streak
        })
    
    # Find current user's rank
    user_rank = None
    for entry in leaderboard_data:
        if entry['user_id'] == request.user.id:
            user_rank = entry['rank']
            break
    
    if user_rank is None:
        # User not in top limit, calculate their rank
        if metric == 'points':
            user_rank = User.objects.filter(carbon_points__gt=request.user.carbon_points).count() + 1
        elif metric == 'co2_saved':
            user_rank = User.objects.filter(total_co2_saved__gt=request.user.total_co2_saved).count() + 1
        elif metric == 'streak':
            user_rank = User.objects.filter(current_streak__gt=request.user.current_streak).count() + 1
    
    return Response({
        'leaderboard': leaderboard_data,
        'your_rank': user_rank,
        'total_users': User.objects.count(),
        'timeframe': timeframe,
        'metric': metric
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_leaderboard(request):
    """
    GET /api/leaderboard/teams-ranking/
    Get team leaderboard
    """
    limit = int(request.query_params.get('limit', 50))
    
    teams = Team.objects.all().order_by('-total_points')[:limit]
    
    leaderboard_data = []
    for rank, team in enumerate(teams, start=1):
        leaderboard_data.append({
            'rank': rank,
            'team_id': team.id,
            'team_name': team.name,
            'avatar': team.avatar,
            'total_points': team.total_points,
            'total_co2_saved': round(team.total_co2_saved, 2),
            'member_count': team.member_count,
            'average_points': team.average_points_per_member
        })
    
    return Response({
        'leaderboard': leaderboard_data,
        'total_teams': Team.objects.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_teams(request):
    """
    GET /api/leaderboard/my-teams/
    Get teams the user is a member of
    """
    teams = Team.objects.filter(members=request.user)
    serializer = TeamSerializer(teams, many=True, context={'request': request})
    return Response(serializer.data)
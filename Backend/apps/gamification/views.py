"""
Views for Gamification app
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Badge, UserBadge, Achievement, UserAchievement, Notification, DailyStreak
from .serializers import (
    BadgeSerializer, UserBadgeSerializer, AchievementSerializer,
    UserAchievementSerializer, NotificationSerializer, DailyStreakSerializer
)

class BadgeListView(generics.ListAPIView):
    """
    GET /api/gamification/badges/
    List all available badges
    """
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]

class UserBadgesView(generics.ListAPIView):
    """
    GET /api/gamification/my-badges/
    Get current user's earned badges
    """
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related('badge')

class AchievementListView(generics.ListAPIView):
    """
    GET /api/gamification/achievements/
    List all achievements
    """
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

class UserAchievementsView(generics.ListAPIView):
    """
    GET /api/gamification/my-achievements/
    Get current user's achievements and progress
    """
    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserAchievement.objects.filter(
            user=self.request.user
        ).select_related('achievement')

class NotificationListView(generics.ListAPIView):
    """
    GET /api/gamification/notifications/
    Get user's notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    POST /api/gamification/notifications/<id>/read/
    Mark a notification as read
    """
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    POST /api/gamification/notifications/read-all/
    Mark all notifications as read
    """
    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({
        'message': f'{count} notifications marked as read'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_new_badges(request):
    """
    GET /api/gamification/check-badges/
    Check if user has earned any new badges
    """
    user = request.user
    all_badges = Badge.objects.filter(is_active=True)
    earned_badge_ids = UserBadge.objects.filter(user=user).values_list('badge_id', flat=True)
    
    newly_earned = []
    
    for badge in all_badges:
        if badge.id not in earned_badge_ids and badge.check_earned(user):
            # Award badge
            user_badge = UserBadge.objects.create(user=user, badge=badge)
            
            # Award points
            user.add_points(badge.points_reward)
            
            # Create notification
            Notification.objects.create(
                user=user,
                notification_type='badge',
                title=f'Badge Unlocked: {badge.name}',
                message=f'Congratulations! You earned the {badge.name} badge!',
                related_id=badge.id
            )
            
            newly_earned.append(BadgeSerializer(badge).data)
    
    return Response({
        'newly_earned': newly_earned,
        'count': len(newly_earned)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def streak_history(request):
    """
    GET /api/gamification/streak-history/
    Get user's streak history
    """
    user = request.user
    history = DailyStreak.objects.filter(user=user).order_by('-date')[:30]
    
    return Response({
        'current_streak': user.current_streak,
        'longest_streak': user.longest_streak,
        'history': DailyStreakSerializer(history, many=True).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gamification_summary(request):
    """
    GET /api/gamification/summary/
    Get comprehensive gamification summary
    """
    user = request.user
    
    # Get badges
    total_badges = Badge.objects.filter(is_active=True).count()
    earned_badges = UserBadge.objects.filter(user=user).count()
    
    # Get achievements
    total_achievements = Achievement.objects.filter(is_active=True).count()
    completed_achievements = UserAchievement.objects.filter(
        user=user,
        is_completed=True
    ).count()
    
    # Get unread notifications
    unread_notifications = Notification.objects.filter(
        user=user,
        is_read=False
    ).count()
    
    # Recent badges (last 5)
    recent_badges = UserBadge.objects.filter(user=user).order_by('-earned_at')[:5]
    
    return Response({
        'level': user.level,
        'points': user.carbon_points,
        'points_to_next_level': user.points_to_next_level,
        'level_progress': user.level_progress,
        'badges': {
            'total': total_badges,
            'earned': earned_badges,
            'percentage': round((earned_badges / total_badges * 100) if total_badges > 0 else 0, 1),
            'recent': UserBadgeSerializer(recent_badges, many=True).data
        },
        'achievements': {
            'total': total_achievements,
            'completed': completed_achievements,
            'percentage': round((completed_achievements / total_achievements * 100) if total_achievements > 0 else 0, 1)
        },
        'streak': {
            'current': user.current_streak,
            'longest': user.longest_streak
        },
        'unread_notifications': unread_notifications
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_showcase_badge(request, badge_id):
    """
    POST /api/gamification/badges/<id>/showcase/
    Toggle badge showcase status
    """
    try:
        user_badge = UserBadge.objects.get(
            user=request.user,
            badge_id=badge_id
        )
        user_badge.is_showcased = not user_badge.is_showcased
        user_badge.save()
        
        return Response({
            'message': 'Badge showcase toggled',
            'is_showcased': user_badge.is_showcased
        })
    except UserBadge.DoesNotExist:
        return Response(
            {'error': 'Badge not found or not earned'},
            status=status.HTTP_404_NOT_FOUND
        )
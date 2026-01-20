"""
URL configuration for Gamification app
"""
from django.urls import path
from . import views

app_name = 'gamification'

urlpatterns = [
    # Badges
    path('badges/', views.BadgeListView.as_view(), name='badge-list'),
    path('my-badges/', views.UserBadgesView.as_view(), name='my-badges'),
    path('badges/<int:badge_id>/showcase/', views.toggle_showcase_badge, name='toggle-showcase'),
    path('check-badges/', views.check_new_badges, name='check-badges'),
    
    # Achievements
    path('achievements/', views.AchievementListView.as_view(), name='achievement-list'),
    path('my-achievements/', views.UserAchievementsView.as_view(), name='my-achievements'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark-read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark-all-read'),
    
    # Streaks
    path('streak-history/', views.streak_history, name='streak-history'),
    
    # Summary
    path('summary/', views.gamification_summary, name='summary'),
]
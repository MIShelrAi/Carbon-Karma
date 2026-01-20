"""
URL configuration for Challenges app
"""
from django.urls import path
from . import views

app_name = 'challenges'

urlpatterns = [
    # Challenge list and details
    path('', views.ChallengeListView.as_view(), name='challenge-list'),
    path('<int:pk>/', views.ChallengeDetailView.as_view(), name='challenge-detail'),
    path('my-challenges/', views.MyChallengesView.as_view(), name='my-challenges'),
    
    # Challenge actions
    path('<int:challenge_id>/join/', views.join_challenge, name='join-challenge'),
    path('<int:challenge_id>/leave/', views.leave_challenge, name='leave-challenge'),
    path('<int:challenge_id>/update-progress/', views.update_challenge_progress, name='update-progress'),
    
    # Leaderboard and stats
    path('<int:challenge_id>/leaderboard/', views.challenge_leaderboard, name='challenge-leaderboard'),
    path('stats/', views.challenge_stats, name='challenge-stats'),
]
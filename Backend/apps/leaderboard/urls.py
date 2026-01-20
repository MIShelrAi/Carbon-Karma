"""
URL configuration for Leaderboard app
"""
from django.urls import path
from . import views

app_name = 'leaderboard'

urlpatterns = [
    # Teams
    path('teams/', views.TeamListCreateView.as_view(), name='team-list'),
    path('teams/<int:pk>/', views.TeamDetailView.as_view(), name='team-detail'),
    path('teams/<int:team_id>/join/', views.join_team, name='join-team'),
    path('teams/<int:team_id>/leave/', views.leave_team, name='leave-team'),
    path('my-teams/', views.my_teams, name='my-teams'),
    
    # Leaderboards
    path('global/', views.global_leaderboard, name='global-leaderboard'),
    path('teams-ranking/', views.team_leaderboard, name='team-leaderboard'),
]
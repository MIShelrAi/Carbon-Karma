"""
URL configuration for Tracking app
"""
from django.urls import path
from . import views

app_name = 'tracking'

urlpatterns = [
    # Activities
    path('activities/', views.ActivityListCreateView.as_view(), name='activity-list'),
    path('activities/<int:pk>/', views.ActivityDetailView.as_view(), name='activity-detail'),
    
    # Daily Summaries
    path('daily-summary/', views.DailySummaryListView.as_view(), name='daily-summary'),
    
    # Goals
    path('goals/', views.ActivityGoalListCreateView.as_view(), name='goal-list'),
    path('goals/<int:pk>/', views.ActivityGoalDetailView.as_view(), name='goal-detail'),
    
    # Summary endpoints
    path('weekly-summary/', views.weekly_summary, name='weekly-summary'),
    path('monthly-summary/', views.monthly_summary, name='monthly-summary'),
    path('stats/', views.activity_stats, name='stats'),
    
    # Quick actions
    path('quick-log/', views.quick_log, name='quick-log'),
]
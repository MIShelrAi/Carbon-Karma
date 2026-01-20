from django.urls import path
from . import views
    

app_name = 'users'

"""
URL configuration for Users app
"""
from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    
    # Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='profile-update'),
    path('stats/', views.UserStatsView.as_view(), name='stats'),
    path('dashboard-stats/', views.user_dashboard_stats, name='dashboard-stats'),
    
    # Account Management
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('delete-account/', views.delete_account, name='delete-account'),

    #api url
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.UserProfileView.as_view(), name='user-profile'),

]
"""
URL configuration for Rewards app
"""
from django.urls import path
from . import views

app_name = 'rewards'

urlpatterns = [
    # Rewards
    path('', views.RewardListView.as_view(), name='reward-list'),
    path('<int:pk>/', views.RewardDetailView.as_view(), name='reward-detail'),
    path('categories/', views.reward_categories, name='categories'),
    
    # Redemptions
    path('redeem/', views.redeem_reward, name='redeem'),
    path('my-redemptions/', views.MyRedemptionsView.as_view(), name='my-redemptions'),
    path('redemptions/<int:pk>/', views.RedemptionDetailView.as_view(), name='redemption-detail'),
    path('redemptions/<int:redemption_id>/cancel/', views.cancel_redemption, name='cancel-redemption'),
    
    # Stats
    path('stats/', views.redemption_stats, name='stats'),
]
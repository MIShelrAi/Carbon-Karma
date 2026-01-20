"""
URL configuration for Emissions app
"""
from django.urls import path
from . import views

app_name = 'emissions'

urlpatterns = [
    path('factors/', views.EmissionFactorListView.as_view(), name='emission-factors'),
]
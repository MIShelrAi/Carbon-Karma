"""
Views for Tracking app
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from django_filters.rest_framework import DjangoFilterBackend

from .models import Activity, DailySummary, ActivityGoal
from .serializers import (
    ActivitySerializer,
    ActivityListSerializer,
    DailySummarySerializer,
    ActivityGoalSerializer,
    WeeklySummarySerializer,
    MonthlySummarySerializer
)
from . import carbon_calculator


class ActivityListCreateView(generics.ListCreateAPIView):
    """
    GET /api/tracking/activities/
    POST /api/tracking/activities/
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['activity_type', 'timestamp']
    search_fields = ['description', 'notes']
    ordering_fields = ['timestamp', 'co2_impact', 'points_earned']
    ordering = ['-timestamp']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivitySerializer
        return ActivityListSerializer
    
    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        activity = serializer.save(user=self.request.user)
        
        # Update daily summary
        DailySummary.update_for_date(
            self.request.user,
            activity.timestamp.date()
        )


class ActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/tracking/activities/<id>/
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)


class DailySummaryListView(generics.ListAPIView):
    """
    GET /api/tracking/daily-summary/
    """
    serializer_class = DailySummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date']
    ordering = ['-date']
    
    def get_queryset(self):
        return DailySummary.objects.filter(user=self.request.user)


class ActivityGoalListCreateView(generics.ListCreateAPIView):
    """
    GET/POST /api/tracking/goals/
    """
    serializer_class = ActivityGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ActivityGoal.objects.filter(user=self.request.user)


class ActivityGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/tracking/goals/<id>/
    """
    serializer_class = ActivityGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ActivityGoal.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_summary(request):
    """
    GET /api/tracking/weekly-summary/
    Get summary for the current week
    """
    user = request.user
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    activities = Activity.objects.filter(
        user=user,
        timestamp__date__gte=week_start,
        timestamp__date__lte=week_end
    )
    
    # Calculate totals
    total_co2_saved = sum(a.co2_impact for a in activities if a.co2_impact > 0)
    total_points = sum(a.points_earned for a in activities)
    total_activities = activities.count()
    
    # Daily breakdown
    daily_breakdown = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_activities = activities.filter(timestamp__date=day)
        day_co2 = sum(a.co2_impact for a in day_activities if a.co2_impact > 0)
        daily_breakdown.append({
            'date': day,
            'co2_saved': round(day_co2, 2),
            'activities_count': day_activities.count()
        })
    
    # Category breakdown
    category_breakdown = {}
    for activity_type in ['transport', 'food', 'energy', 'waste']:
        type_activities = activities.filter(activity_type=activity_type)
        type_co2 = sum(a.co2_impact for a in type_activities if a.co2_impact > 0)
        category_breakdown[activity_type] = {
            'co2_saved': round(type_co2, 2),
            'count': type_activities.count()
        }
    
    data = {
        'week_start': week_start,
        'week_end': week_end,
        'total_co2_saved': round(total_co2_saved, 2),
        'total_points': total_points,
        'total_activities': total_activities,
        'daily_breakdown': daily_breakdown,
        'category_breakdown': category_breakdown
    }
    
    serializer = WeeklySummarySerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
    """
    GET /api/tracking/monthly-summary/?month=1&year=2026
    Get summary for a specific month
    """
    user = request.user
    
    # Get month and year from query params or use current
    month = int(request.GET.get('month', timezone.now().month))
    year = int(request.GET.get('year', timezone.now().year))
    
    # Get first and last day of month
    first_day = datetime(year, month, 1).date()
    if month == 12:
        last_day = datetime(year + 1, 1, 1).date() - timedelta(days=1)
    else:
        last_day = datetime(year, month + 1, 1).date() - timedelta(days=1)
    
    activities = Activity.objects.filter(
        user=user,
        timestamp__date__gte=first_day,
        timestamp__date__lte=last_day
    )
    
    # Calculate totals
    total_co2_saved = sum(a.co2_impact for a in activities if a.co2_impact > 0)
    total_points = sum(a.points_earned for a in activities)
    total_activities = activities.count()
    
    # Daily breakdown
    daily_breakdown = []
    current_day = first_day
    best_day = {'date': None, 'co2_saved': 0}
    
    while current_day <= last_day:
        day_activities = activities.filter(timestamp__date=current_day)
        day_co2 = sum(a.co2_impact for a in day_activities if a.co2_impact > 0)
        
        daily_breakdown.append({
            'date': current_day,
            'co2_saved': round(day_co2, 2),
            'activities_count': day_activities.count()
        })
        
        if day_co2 > best_day['co2_saved']:
            best_day = {
                'date': current_day,
                'co2_saved': round(day_co2, 2),
                'activities_count': day_activities.count()
            }
        
        current_day += timedelta(days=1)
    
    # Category breakdown
    category_breakdown = {}
    for activity_type in ['transport', 'food', 'energy', 'waste']:
        type_activities = activities.filter(activity_type=activity_type)
        type_co2 = sum(a.co2_impact for a in type_activities if a.co2_impact > 0)
        category_breakdown[activity_type] = {
            'co2_saved': round(type_co2, 2),
            'count': type_activities.count()
        }
    
    data = {
        'month': month,
        'year': year,
        'total_co2_saved': round(total_co2_saved, 2),
        'total_points': total_points,
        'total_activities': total_activities,
        'daily_breakdown': daily_breakdown,
        'category_breakdown': category_breakdown,
        'best_day': best_day,
        'streak_info': {
            'current_streak': user.current_streak,
            'longest_streak': user.longest_streak
        }
    }
    
    serializer = MonthlySummarySerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_stats(request):
    """
    GET /api/tracking/stats/
    Get comprehensive activity statistics
    """
    user = request.user
    
    # All-time stats
    all_activities = Activity.objects.filter(user=user)
    
    stats = {
        'all_time': {
            'total_co2_saved': round(user.total_co2_saved, 2),
            'total_points': user.carbon_points,
            'total_activities': user.total_activities,
            'trees_equivalent': carbon_calculator.co2_to_trees(user.total_co2_saved),
            'car_miles_saved': carbon_calculator.co2_to_car_miles(user.total_co2_saved),
        },
        'by_category': {},
        'favorite_activities': []
    }
    
    # Category stats
    for activity_type in ['transport', 'food', 'energy', 'waste']:
        type_activities = all_activities.filter(activity_type=activity_type)
        type_co2 = sum(a.co2_impact for a in type_activities if a.co2_impact > 0)
        stats['by_category'][activity_type] = {
            'count': type_activities.count(),
            'co2_saved': round(type_co2, 2),
            'points': sum(a.points_earned for a in type_activities)
        }
    
    # Most common activities
    from django.db.models import Count
    favorite = all_activities.values('activity_type', 'description').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    stats['favorite_activities'] = list(favorite)
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_log(request):
    """
    POST /api/tracking/quick-log/
    Quick log common activities with predefined templates
    """
    template = request.data.get('template')
    
    templates = {
        'walked_to_work': {
            'activity_type': 'transport',
            'transport_mode': 'walk',
            'distance_km': 2.0,
            'description': 'Walked to work'
        },
        'cycled_to_work': {
            'activity_type': 'transport',
            'transport_mode': 'bicycle',
            'distance_km': 3.0,
            'description': 'Cycled to work'
        },
        'vegetarian_lunch': {
            'activity_type': 'food',
            'meal_type': 'vegetarian',
            'servings': 1,
            'description': 'Vegetarian lunch'
        },
        'lights_off_hour': {
            'activity_type': 'energy',
            'energy_type': 'lights_off',
            'hours': 1,
            'description': 'Turned off lights for 1 hour'
        },
        'recycled_waste': {
            'activity_type': 'waste',
            'waste_type': 'recycled',
            'weight_kg': 0.5,
            'description': 'Recycled waste'
        }
    }
    
    if template not in templates:
        return Response(
            {'error': 'Invalid template'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    activity_data = templates[template]
    activity_data['user'] = request.user.id
    
    serializer = ActivitySerializer(data=activity_data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  
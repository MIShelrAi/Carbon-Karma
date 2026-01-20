"""
Serializers for Tracking app
"""
from rest_framework import serializers
from .models import Activity, DailySummary, ActivityGoal
from apps.users.serializers import UserStatsSerializer


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity model"""
    user_info = UserStatsSerializer(source='user', read_only=True)
    activity_type_display = serializers.CharField(
        source='get_activity_type_display',
        read_only=True
    )
    
    class Meta:
        model = Activity
        fields = (
            'id', 'user', 'user_info', 'activity_type', 'activity_type_display',
            'transport_mode', 'distance_km',
            'meal_type', 'servings',
            'energy_type', 'energy_saved_kwh', 'hours',
            'waste_type', 'weight_kg',
            'description', 'co2_impact', 'points_earned',
            'timestamp', 'location', 'notes'
        )
        read_only_fields = ('user', 'co2_impact', 'points_earned', 'timestamp')
    
    def validate(self, data):
        """Validate activity data based on type"""
        activity_type = data.get('activity_type')
        
        if activity_type == 'transport':
            if not data.get('transport_mode'):
                raise serializers.ValidationError(
                    "Transport mode is required for transport activities"
                )
            if not data.get('distance_km') or data.get('distance_km') <= 0:
                raise serializers.ValidationError(
                    "Valid distance is required for transport activities"
                )
        
        elif activity_type == 'food':
            if not data.get('meal_type'):
                raise serializers.ValidationError(
                    "Meal type is required for food activities"
                )
            if not data.get('servings') or data.get('servings') <= 0:
                data['servings'] = 1
        
        elif activity_type == 'energy':
            if not data.get('energy_type'):
                raise serializers.ValidationError(
                    "Energy type is required for energy activities"
                )
        
        elif activity_type == 'waste':
            if not data.get('waste_type'):
                raise serializers.ValidationError(
                    "Waste type is required for waste activities"
                )
        
        return data
    
    def create(self, validated_data):
        """Create activity with current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ActivityListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for activity lists"""
    activity_type_display = serializers.CharField(
        source='get_activity_type_display',
        read_only=True
    )
    
    class Meta:
        model = Activity
        fields = (
            'id', 'activity_type', 'activity_type_display',
            'description', 'co2_impact', 'points_earned', 'timestamp'
        )


class DailySummarySerializer(serializers.ModelSerializer):
    """Serializer for Daily Summary"""
    
    class Meta:
        model = DailySummary
        fields = (
            'id', 'user', 'date',
            'total_co2_saved', 'total_co2_emitted', 'net_co2_impact',
            'total_points', 'activities_count',
            'transport_co2', 'food_co2', 'energy_co2', 'waste_co2',
            'transport_count', 'food_count', 'energy_count', 'waste_count',
            'created_at', 'updated_at'
        )
        read_only_fields = ('user',)


class ActivityGoalSerializer(serializers.ModelSerializer):
    """Serializer for Activity Goals"""
    goal_type_display = serializers.CharField(
        source='get_goal_type_display',
        read_only=True
    )
    progress_percentage = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = ActivityGoal
        fields = (
            'id', 'user', 'goal_type', 'goal_type_display',
            'target_value', 'current_value', 'progress_percentage',
            'is_completed', 'is_active',
            'start_date', 'end_date', 'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'current_value')
    
    def create(self, validated_data):
        """Create goal with current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class WeeklySummarySerializer(serializers.Serializer):
    """Serializer for weekly summary data"""
    week_start = serializers.DateField()
    week_end = serializers.DateField()
    total_co2_saved = serializers.FloatField()
    total_points = serializers.IntegerField()
    total_activities = serializers.IntegerField()
    daily_breakdown = serializers.ListField()
    category_breakdown = serializers.DictField()


class MonthlySummarySerializer(serializers.Serializer):
    """Serializer for monthly summary data"""
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    total_co2_saved = serializers.FloatField()
    total_points = serializers.IntegerField()
    total_activities = serializers.IntegerField()
    daily_breakdown = serializers.ListField()
    category_breakdown = serializers.DictField()
    best_day = serializers.DictField()
    streak_info = serializers.DictField()
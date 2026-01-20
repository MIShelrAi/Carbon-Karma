"""
Serializers for Leaderboard app
"""
from rest_framework import serializers
from .models import Team
from apps.users.serializers import UserStatsSerializer

class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""
    created_by_info = UserStatsSerializer(source='created_by', read_only=True)
    member_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    average_points_per_member = serializers.ReadOnlyField()
    is_member = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = (
            'id', 'name', 'description', 'created_by', 'created_by_info',
            'total_points', 'total_co2_saved', 'avatar', 'is_public',
            'max_members', 'member_count', 'is_full',
            'average_points_per_member', 'is_member',
            'created_at', 'updated_at'
        )
        read_only_fields = ('created_by', 'total_points', 'total_co2_saved')
    
    def get_is_member(self, obj):
        """Check if current user is a member"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False
    
    def create(self, validated_data):
        """Create team and add creator as first member"""
        user = self.context['request'].user
        team = Team.objects.create(created_by=user, **validated_data)
        team.members.add(user)
        return team

class TeamDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Team with member list"""
    created_by_info = UserStatsSerializer(source='created_by', read_only=True)
    members_info = UserStatsSerializer(source='members', many=True, read_only=True)
    member_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    average_points_per_member = serializers.ReadOnlyField()
    is_member = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = (
            'id', 'name', 'description', 'created_by', 'created_by_info',
            'members_info', 'total_points', 'total_co2_saved',
            'avatar', 'is_public', 'max_members', 'member_count',
            'is_full', 'average_points_per_member', 'is_member',
            'created_at', 'updated_at'
        )
    
    def get_is_member(self, obj):
        """Check if current user is a member"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

class LeaderboardEntrySerializer(serializers.Serializer):
    """Serializer for leaderboard entries"""
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    avatar = serializers.CharField()
    location = serializers.CharField()
    carbon_points = serializers.IntegerField()
    total_co2_saved = serializers.FloatField()
    level = serializers.IntegerField()
    current_streak = serializers.IntegerField()
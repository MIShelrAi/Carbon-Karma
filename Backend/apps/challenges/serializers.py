"""
Serializers for Challenges app
"""
from rest_framework import serializers
from .models import Challenge, ChallengeParticipation

class ChallengeSerializer(serializers.ModelSerializer):
    """Serializer for Challenge model"""
    challenge_type_display = serializers.CharField(source='get_challenge_type_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    is_ongoing = serializers.ReadOnlyField()
    participants_count = serializers.ReadOnlyField()
    completion_rate = serializers.ReadOnlyField()
    
    # Check if current user is participating
    is_participating = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Challenge
        fields = (
            'id', 'name', 'description', 'challenge_type', 'challenge_type_display',
            'difficulty', 'difficulty_display', 'target_type', 'target_value',
            'reward_points', 'badge_name', 'start_date', 'end_date',
            'is_active', 'is_ongoing', 'participants_count', 'completion_rate',
            'is_participating', 'user_progress', 'created_at'
        )
    
    def get_is_participating(self, obj):
        """Check if the current user is participating in this challenge"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ChallengeParticipation.objects.filter(
                challenge=obj,
                user=request.user
            ).exists()
        return False
    
    def get_user_progress(self, obj):
        """Get current user's progress in this challenge"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                participation = ChallengeParticipation.objects.get(
                    challenge=obj,
                    user=request.user
                )
                return {
                    'progress': participation.progress,
                    'is_completed': participation.is_completed,
                    'completed_at': participation.completed_at
                }
            except ChallengeParticipation.DoesNotExist:
                pass
        return None

class ChallengeParticipationSerializer(serializers.ModelSerializer):
    """Serializer for ChallengeParticipation model"""
    challenge = ChallengeSerializer(read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = ChallengeParticipation
        fields = (
            'id', 'challenge', 'user', 'progress', 'progress_percentage',
            'is_completed', 'completed_at', 'joined_at'
        )
        read_only_fields = ('user', 'progress', 'is_completed', 'completed_at', 'joined_at')

class ChallengeLeaderboardSerializer(serializers.Serializer):
    """Serializer for challenge leaderboard"""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    avatar = serializers.CharField()
    progress = serializers.FloatField()
    is_completed = serializers.BooleanField()
    rank = serializers.IntegerField()
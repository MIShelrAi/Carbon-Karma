"""
Serializers for Rewards app
"""
from rest_framework import serializers
from .models import Reward, Redemption

class RewardSerializer(serializers.ModelSerializer):
    """Serializer for Reward model"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    is_available = serializers.ReadOnlyField()
    redemption_count = serializers.ReadOnlyField()
    can_afford = serializers.SerializerMethodField()
    
    class Meta:
        model = Reward
        fields = (
            'id', 'title', 'description', 'category', 'category_display',
            'points_required', 'partner_name', 'partner_logo', 'image',
            'terms', 'is_active', 'stock', 'is_available',
            'available_in_nepal', 'delivery_available',
            'redemption_count', 'can_afford', 'created_at'
        )
    
    def get_can_afford(self, obj):
        """Check if current user can afford this reward"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.carbon_points >= obj.points_required
        return False

class RedemptionSerializer(serializers.ModelSerializer):
    """Serializer for Redemption model"""
    reward_info = RewardSerializer(source='reward', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Redemption
        fields = (
            'id', 'user', 'reward', 'reward_info', 'points_spent',
            'status', 'status_display', 'redemption_code',
            'delivery_address', 'delivery_phone',
            'approved_at', 'delivered_at', 'completed_at',
            'notes', 'can_cancel', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'user', 'points_spent', 'redemption_code',
            'approved_at', 'delivered_at', 'completed_at'
        )
    
    def get_can_cancel(self, obj):
        """Check if redemption can be cancelled"""
        return obj.can_cancel()

class RedeemRewardSerializer(serializers.Serializer):
    """Serializer for redeeming a reward"""
    reward_id = serializers.IntegerField()
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    delivery_phone = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
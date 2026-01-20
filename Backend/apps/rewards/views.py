"""
Views for Rewards app
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Reward, Redemption
from .serializers import (
    RewardSerializer,
    RedemptionSerializer,
    RedeemRewardSerializer
)

class RewardListView(generics.ListAPIView):
    """
    GET /api/rewards/
    List all available rewards
    """
    serializer_class = RewardSerializer
    permission_classes = []  # Allow public access
    
    def get_queryset(self):
        queryset = Reward.objects.filter(is_active=True, available_in_nepal=True)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by affordability
        affordable_only = self.request.query_params.get('affordable')
        if affordable_only == 'true':
            queryset = queryset.filter(
                points_required__lte=self.request.user.carbon_points
            )
        
        # Filter by availability
        available_only = self.request.query_params.get('available')
        if available_only == 'true':
            queryset = queryset.exclude(stock=0)
        
        return queryset

class RewardDetailView(generics.RetrieveAPIView):
    """
    GET /api/rewards/<id>/
    Get reward details
    """
    queryset = Reward.objects.filter(is_active=True)
    serializer_class = RewardSerializer
    permission_classes = [IsAuthenticated]

class MyRedemptionsView(generics.ListAPIView):
    """
    GET /api/rewards/my-redemptions/
    Get user's redemption history
    """
    serializer_class = RedemptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Redemption.objects.filter(user=self.request.user)

class RedemptionDetailView(generics.RetrieveAPIView):
    """
    GET /api/rewards/redemptions/<id>/
    Get redemption details
    """
    serializer_class = RedemptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Redemption.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_reward(request):
    """
    POST /api/rewards/redeem/
    Redeem a reward with points
    """
    serializer = RedeemRewardSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    reward_id = serializer.validated_data['reward_id']
    
    # Get reward
    try:
        reward = Reward.objects.get(id=reward_id, is_active=True)
    except Reward.DoesNotExist:
        return Response(
            {'error': 'Reward not found or not available'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if reward is available
    if not reward.is_available:
        return Response(
            {'error': 'This reward is currently out of stock'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user has enough points
    user = request.user
    if user.carbon_points < reward.points_required:
        return Response(
            {
                'error': 'Insufficient points',
                'required': reward.points_required,
                'available': user.carbon_points,
                'needed': reward.points_required - user.carbon_points
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Deduct points from user
    user.carbon_points -= reward.points_required
    user.save(update_fields=['carbon_points'])
    
    # Decrease stock if limited
    if reward.stock > 0:
        reward.stock -= 1
        reward.save(update_fields=['stock'])
    
    # Create redemption
    redemption = Redemption.objects.create(
        user=user,
        reward=reward,
        points_spent=reward.points_required,
        delivery_address=serializer.validated_data.get('delivery_address', ''),
        delivery_phone=serializer.validated_data.get('delivery_phone', ''),
        notes=serializer.validated_data.get('notes', '')
    )
    
    # Create notification
    from apps.gamification.models import Notification
    Notification.objects.create(
        user=user,
        notification_type='reward',
        title='Reward Redeemed!',
        message=f'You successfully redeemed {reward.title}. Redemption code: {redemption.redemption_code}',
        related_id=redemption.id
    )
    
    return Response({
        'message': 'Reward redeemed successfully!',
        'redemption': RedemptionSerializer(redemption).data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_redemption(request, redemption_id):
    """
    POST /api/rewards/redemptions/<id>/cancel/
    Cancel a pending redemption
    """
    try:
        redemption = Redemption.objects.get(
            id=redemption_id,
            user=request.user
        )
    except Redemption.DoesNotExist:
        return Response(
            {'error': 'Redemption not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if can be cancelled
    if not redemption.can_cancel():
        return Response(
            {'error': f'Cannot cancel redemption with status: {redemption.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Refund points to user
    user = request.user
    user.carbon_points += redemption.points_spent
    user.save(update_fields=['carbon_points'])
    
    # Restore stock if applicable
    if redemption.reward.stock >= 0:
        redemption.reward.stock += 1
        redemption.reward.save(update_fields=['stock'])
    
    # Update redemption status
    redemption.status = 'cancelled'
    redemption.save(update_fields=['status', 'updated_at'])
    
    return Response({
        'message': 'Redemption cancelled successfully. Points have been refunded.',
        'refunded_points': redemption.points_spent
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reward_categories(request):
    """
    GET /api/rewards/categories/
    Get all available reward categories
    """
    from django.db.models import Count
    
    categories = Reward.objects.filter(
        is_active=True,
        available_in_nepal=True
    ).values('category').annotate(
        count=Count('id')
    ).order_by('category')
    
    category_data = []
    for cat in categories:
        category_data.append({
            'value': cat['category'],
            'label': dict(Reward.CATEGORY_CHOICES).get(cat['category']),
            'count': cat['count']
        })
    
    return Response(category_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def redemption_stats(request):
    """
    GET /api/rewards/stats/
    Get user's redemption statistics
    """
    user = request.user
    
    total_redemptions = Redemption.objects.filter(user=user).count()
    total_points_spent = sum(
        r.points_spent for r in Redemption.objects.filter(user=user)
    )
    
    pending_redemptions = Redemption.objects.filter(
        user=user,
        status='pending'
    ).count()
    
    completed_redemptions = Redemption.objects.filter(
        user=user,
        status='completed'
    ).count()
    
    # Affordable rewards count
    affordable_rewards = Reward.objects.filter(
        is_active=True,
        points_required__lte=user.carbon_points
    ).count()
    
    return Response({
        'total_redemptions': total_redemptions,
        'total_points_spent': total_points_spent,
        'pending_redemptions': pending_redemptions,
        'completed_redemptions': completed_redemptions,
        'available_points': user.carbon_points,
        'affordable_rewards_count': affordable_rewards
    })
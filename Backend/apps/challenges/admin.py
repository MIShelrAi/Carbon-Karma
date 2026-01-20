"""
Admin configuration for Challenges app
"""
from django.contrib import admin
from .models import Challenge, ChallengeParticipation

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'challenge_type', 'difficulty', 'target_type',
        'target_value', 'reward_points', 'start_date', 'end_date',
        'is_active', 'participants_count'
    )
    list_filter = ('challenge_type', 'difficulty', 'is_active', 'start_date', 'end_date')
    search_fields = ('name', 'description')
    date_hierarchy = 'start_date'
    ordering = ('-start_date',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'challenge_type', 'difficulty')
        }),
        ('Challenge Criteria', {
            'fields': ('target_type', 'target_value')
        }),
        ('Rewards', {
            'fields': ('reward_points', 'badge_name')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
    )

@admin.register(ChallengeParticipation)
class ChallengeParticipationAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'challenge', 'progress', 'is_completed',
        'joined_at', 'completed_at'
    )
    list_filter = ('is_completed', 'challenge__difficulty', 'joined_at', 'completed_at')
    search_fields = ('user__username', 'challenge__name')
    date_hierarchy = 'joined_at'
    ordering = ('-joined_at',)
    readonly_fields = ('joined_at',)
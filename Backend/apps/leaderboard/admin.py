"""
Admin configuration for Leaderboard app
"""
from django.contrib import admin
from .models import Team

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'created_by', 'member_count',
        'total_points', 'total_co2_saved', 'is_public', 'created_at'
    )
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'description', 'created_by__username')
    filter_horizontal = ('members',)
    readonly_fields = ('total_points', 'total_co2_saved', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'avatar', 'created_by')
        }),
        ('Members', {
            'fields': ('members', 'max_members')
        }),
        ('Statistics', {
            'fields': ('total_points', 'total_co2_saved')
        }),
        ('Settings', {
            'fields': ('is_public',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def member_count(self, obj):
        return obj.member_count
    member_count.short_description = 'Members'
    
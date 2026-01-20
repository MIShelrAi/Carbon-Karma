"""
Admin configuration for Users app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'carbon_points', 'level', 'current_streak', 'is_staff'
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'level', 'preferred_language')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    ordering = ('-carbon_points',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('phone', 'location', 'preferred_language', 'bio', 'avatar')
        }),
        ('Gamification Stats', {
            'fields': (
                'carbon_points', 'total_co2_saved', 'level',
                'current_streak', 'longest_streak', 'last_activity_date',
                'total_activities'
            )
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj:  # Editing an existing user
            return fieldsets + (
                ('Important Dates', {
                    'fields': ('created_at', 'updated_at')
                }),
            )
        return fieldsets
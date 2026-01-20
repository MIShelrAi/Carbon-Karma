"""
Admin configuration for Rewards app
"""
from django.contrib import admin
from .models import Reward, Redemption

@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'category', 'points_required', 'partner_name',
        'stock', 'is_available', 'redemption_count', 'is_active'
    )
    list_filter = ('category', 'is_active', 'available_in_nepal', 'delivery_available')
    search_fields = ('title', 'description', 'partner_name')
    ordering = ('points_required',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'image')
        }),
        ('Points & Partner', {
            'fields': ('points_required', 'partner_name', 'partner_logo')
        }),
        ('Availability', {
            'fields': ('is_active', 'stock', 'available_in_nepal', 'delivery_available')
        }),
        ('Terms & Conditions', {
            'fields': ('terms',),
            'classes': ('collapse',)
        }),
    )

@admin.register(Redemption)
class RedemptionAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'reward', 'points_spent', 'status',
        'redemption_code', 'created_at'
    )
    list_filter = ('status', 'created_at', 'approved_at')
    search_fields = (
        'user__username', 'reward__title',
        'redemption_code', 'delivery_phone'
    )
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = ('redemption_code', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Redemption Info', {
            'fields': ('user', 'reward', 'points_spent', 'redemption_code')
        }),
        ('Status', {
            'fields': (
                'status', 'approved_at', 'delivered_at', 'completed_at'
            )
        }),
        ('Delivery Information', {
            'fields': ('delivery_address', 'delivery_phone')
        }),
        ('Notes', {
            'fields': ('notes', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['approve_redemptions', 'mark_as_delivered', 'mark_as_completed']
    
    def approve_redemptions(self, request, queryset):
        from django.utils import timezone
        count = queryset.filter(status='pending').update(
            status='approved',
            approved_at=timezone.now()
        )
        self.message_user(request, f'{count} redemptions approved.')
    approve_redemptions.short_description = 'Approve selected redemptions'
    
    def mark_as_delivered(self, request, queryset):
        from django.utils import timezone
        count = queryset.filter(status='approved').update(
            status='delivered',
            delivered_at=timezone.now()
        )
        self.message_user(request, f'{count} redemptions marked as delivered.')
    mark_as_delivered.short_description = 'Mark as delivered'
    
    def mark_as_completed(self, request, queryset):
        from django.utils import timezone
        count = queryset.filter(status='delivered').update(
            status='completed',
            completed_at=timezone.now()
        )
        self.message_user(request, f'{count} redemptions marked as completed.')
    mark_as_completed.short_description = 'Mark as completed'
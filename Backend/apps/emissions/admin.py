"""
Admin for Emissions app
"""
from django.contrib import admin
from .models import EmissionFactor

@admin.register(EmissionFactor)
class EmissionFactorAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'subcategory',
        'co2_per_unit', 'unit', 'nepal_specific', 'is_active'
    )
    list_filter = ('category', 'nepal_specific', 'is_active')
    search_fields = ('name', 'description', 'source')
    ordering = ('category', 'subcategory')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'subcategory', 'name', 'description')
        }),
        ('Emission Data', {
            'fields': ('co2_per_unit', 'unit')
        }),
        ('Metadata', {
            'fields': ('nepal_specific', 'source', 'is_active')
        }),
    )
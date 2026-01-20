"""
Carbon emission calculator for different activities
All values are in kg CO2
"""

# Nepal-specific emission factors (kg CO2 per unit)
TRANSPORT_EMISSIONS = {
    'walk': 0.0,
    'bicycle': 0.0,
    'ebike': 0.02,  # per km (electricity)
    'microbus': 0.089,  # per km
    'safa_tempo': 0.02,  # per km (electric)
    'motorcycle': 0.103,  # per km
    'car': 0.171,  # per km (average car)
    'bus': 0.068,  # per km
    'taxi': 0.171,  # per km
    'rickshaw': 0.0,  # manual
}

# Food emissions (kg CO2 per serving)
FOOD_EMISSIONS = {
    'vegan': 0.5,
    'vegetarian': 1.0,
    'dal_bhat': 1.2,  # typical vegetarian dal bhat
    'vegetable_curry': 0.8,
    'chicken': 2.9,
    'buff': 5.5,  # buffalo meat
    'pork': 5.9,
    'fish': 2.7,
    'egg': 1.6,
    'dairy': 1.3,
}

# Average meal emission in Nepal (for comparison)
AVERAGE_MEAL_EMISSION = 2.5  # kg CO2

# Energy savings (kg CO2 per kWh saved)
ENERGY_EMISSION_FACTOR = 0.67  # Nepal's grid emission factor

# Default energy savings for common actions (kWh)
ENERGY_SAVINGS = {
    'lights_off': 0.06,  # per hour
    'ac_off': 1.5,  # per hour
    'unplugged': 0.01,  # per device per hour
    'energy_efficient': 0.5,  # per use
    'solar_used': 1.0,  # per hour of use
}

# Waste reduction (kg CO2 saved per kg of waste)
WASTE_SAVINGS = {
    'recycled': 0.3,  # per kg
    'composted': 0.5,  # per kg
    'reused': 0.4,  # per item (estimated 0.5kg)
    'avoided_plastic': 0.2,  # per item avoided
}


def calculate_co2_impact(activity):
    """
    Calculate CO2 impact for an activity
    Returns positive value for CO2 saved, negative for CO2 emitted
    """
    activity_type = activity.activity_type
    
    if activity_type == 'transport':
        return calculate_transport_impact(activity)
    elif activity_type == 'food':
        return calculate_food_impact(activity)
    elif activity_type == 'energy':
        return calculate_energy_impact(activity)
    elif activity_type == 'waste':
        return calculate_waste_impact(activity)
    
    return 0.0


def calculate_transport_impact(activity):
    """Calculate transport CO2 impact"""
    mode = activity.transport_mode
    distance = activity.distance_km or 0
    
    if not mode or distance <= 0:
        return 0.0
    
    emission_factor = TRANSPORT_EMISSIONS.get(mode, 0)
    
    # For eco-friendly transport, calculate savings vs average car
    if mode in ['walk', 'bicycle', 'rickshaw', 'ebike', 'safa_tempo']:
        # Calculate what would have been emitted by car
        car_emission = TRANSPORT_EMISSIONS['car'] * distance
        actual_emission = emission_factor * distance
        co2_saved = car_emission - actual_emission
        return round(co2_saved, 3)
    else:
        # For polluting transport, return negative (emission, not saving)
        co2_emitted = emission_factor * distance
        return round(-co2_emitted, 3)


def calculate_food_impact(activity):
    """Calculate food CO2 impact"""
    meal_type = activity.meal_type
    servings = activity.servings or 1
    
    if not meal_type:
        return 0.0
    
    meal_emission = FOOD_EMISSIONS.get(meal_type, 0) * servings
    
    # Calculate savings vs average meal
    if meal_type in ['vegan', 'vegetarian', 'dal_bhat', 'vegetable_curry']:
        avg_emission = AVERAGE_MEAL_EMISSION * servings
        co2_saved = avg_emission - meal_emission
        return round(co2_saved, 3)
    else:
        # High emission meals
        co2_emitted = meal_emission
        return round(-co2_emitted, 3)


def calculate_energy_impact(activity):
    """Calculate energy CO2 savings"""
    energy_type = activity.energy_type
    
    # If kWh is provided directly
    if activity.energy_saved_kwh:
        kwh_saved = activity.energy_saved_kwh
    else:
        # Use default values based on energy type and hours
        hours = activity.hours or 1
        kwh_saved = ENERGY_SAVINGS.get(energy_type, 0) * hours
    
    co2_saved = kwh_saved * ENERGY_EMISSION_FACTOR
    return round(co2_saved, 3)


def calculate_waste_impact(activity):
    """Calculate waste CO2 savings"""
    waste_type = activity.waste_type
    
    if not waste_type:
        return 0.0
    
    # Use provided weight or default to 0.5 kg
    weight = activity.weight_kg or 0.5
    
    saving_factor = WASTE_SAVINGS.get(waste_type, 0)
    co2_saved = saving_factor * weight
    
    return round(co2_saved, 3)


def get_transport_comparison(mode, distance_km):
    """Get comparison of CO2 for different transport modes"""
    comparisons = {}
    for transport_mode, emission_factor in TRANSPORT_EMISSIONS.items():
        comparisons[transport_mode] = round(emission_factor * distance_km, 3)
    return comparisons


def get_food_comparison(servings=1):
    """Get comparison of CO2 for different food types"""
    comparisons = {}
    for food_type, emission_factor in FOOD_EMISSIONS.items():
        comparisons[food_type] = round(emission_factor * servings, 3)
    return comparisons


def estimate_monthly_savings(user):
    """Estimate user's monthly CO2 savings based on recent activities"""
    from datetime import timedelta
    from django.utils import timezone
    from .models import Activity
    
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    activities = Activity.objects.filter(
        user=user,
        timestamp__gte=thirty_days_ago
    )
    
    total_saved = sum(
        a.co2_impact for a in activities if a.co2_impact > 0
    )
    
    return round(total_saved, 2)


def co2_to_trees(co2_kg):
    """
    Convert CO2 savings to equivalent trees planted
    One tree absorbs about 21 kg CO2 per year
    """
    return round(co2_kg / 21, 2)


def co2_to_car_miles(co2_kg):
    """
    Convert CO2 to equivalent car miles not driven
    Average car emits 0.404 kg CO2 per mile
    """
    return round(co2_kg / 0.404, 1)


def co2_to_phone_charges(co2_kg):
    """
    Convert CO2 to equivalent phone charges
    One smartphone charge = ~0.008 kg CO2
    """
    return round(co2_kg / 0.008, 0)
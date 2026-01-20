#!/usr/bin/env python3
"""
Test script for Carbon Karma API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url, method='GET', data=None, headers=None):
    """Test an API endpoint"""
    print(f"\n🧪 Testing {name}...")
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers)

        print(f"   Status: {response.status_code}")
        if response.status_code < 400:
            print("   ✅ Success")
            return response.json()
        else:
            print(f"   ❌ Error: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection Error: {e}")
        return None

def main():
    print("🚀 Carbon Karma API Test Suite")
    print("=" * 50)

    # Test basic endpoints (no auth required)
    print("\n📋 Testing Public Endpoints:")

    # Test challenges endpoint
    challenges = test_endpoint("Challenges List", f"{BASE_URL}/challenges/")
    if challenges:
        print(f"   Found {len(challenges)} challenges")

    # Test leaderboard
    leaderboard = test_endpoint("Global Leaderboard", f"{BASE_URL}/leaderboard/global/")
    if leaderboard:
        print(f"   Found {len(leaderboard.get('results', []))} users on leaderboard")

    # Test rewards
    rewards = test_endpoint("Rewards List", f"{BASE_URL}/rewards/")
    if rewards:
        print(f"   Found {len(rewards)} rewards")

    # Test registration
    print("\n📝 Testing User Registration:")
    user_data = {
        "username": "testuser@example.com",
        "email": "testuser@example.com",
        "password": "testpass123",
        "password2": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    register_result = test_endpoint(
        "User Registration",
        f"{BASE_URL}/users/register/",
        method='POST',
        data=user_data
    )

    if register_result and 'tokens' in register_result:
        access_token = register_result['tokens']['access']
        print(f"   Got access token: {access_token[:20]}...")

        # Test authenticated endpoints
        headers = {'Authorization': f'Bearer {access_token}'}

        print("\n🔐 Testing Authenticated Endpoints:")

        # Test profile
        profile = test_endpoint("User Profile", f"{BASE_URL}/users/profile/", headers=headers)

        # Test dashboard stats
        stats = test_endpoint("Dashboard Stats", f"{BASE_URL}/users/dashboard-stats/", headers=headers)

        # Test activities
        activities = test_endpoint("Activities List", f"{BASE_URL}/tracking/activities/", headers=headers)

        # Test creating an activity
        activity_data = {
            "activity_type": "transport",
            "transport_mode": "walking",
            "distance_km": 2.5,
            "description": "Morning walk to work"
        }
        new_activity = test_endpoint(
            "Create Activity",
            f"{BASE_URL}/tracking/activities/",
            method='POST',
            data=activity_data,
            headers=headers
        )

        print("\n🎉 API Integration Test Complete!")
        print("\n📱 Frontend URLs:")
        print("   Landing Page: http://localhost:3000")
        print("   Login Page: http://localhost:3000/login.html")
        print("   Dashboard: http://localhost:3000/dashboard.html")

    else:
        print("   ❌ Registration failed - cannot test authenticated endpoints")

if __name__ == "__main__":
    main()
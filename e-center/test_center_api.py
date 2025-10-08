#!/usr/bin/env python3
"""
Test script for Center API endpoints
"""

import requests
import json

BASE_URL = 'http://localhost:8000/api/v1'

def test_endpoints():
    """Test all center API endpoints"""
    
    print("🧪 Testing Center API Endpoints\n")
    
    # Test endpoints that don't require authentication
    public_endpoints = [
        '/center/grammar/',
        '/center/videos/',
        '/center/vocabulary/',
        '/center/vocabulary/random/?count=5',
        '/center/vocabulary/categories/',
    ]
    
    print("📋 Testing public endpoints:")
    for endpoint in public_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} GET {endpoint} - Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'results' in data:
                    print(f"   📊 Found {data.get('count', 0)} items")
                elif isinstance(data, list):
                    print(f"   📊 Found {len(data)} items")
                    
        except requests.exceptions.ConnectionError:
            print(f"❌ GET {endpoint} - Connection Error (Server not running?)")
        except Exception as e:
            print(f"❌ GET {endpoint} - Error: {e}")
    
    print("\n🔐 Testing authenticated endpoints (requires login):")
    
    # First, try to login with a test user
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            headers = {'Authorization': f'Token {token}'}
            print("✅ Login successful")
            
            # Test protected endpoints
            protected_endpoints = [
                '/center/stats/grammar/',
                '/center/stats/videos/',
                '/center/stats/vocabulary/',
            ]
            
            for endpoint in protected_endpoints:
                try:
                    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
                    status = "✅" if response.status_code == 200 else "❌"
                    print(f"{status} GET {endpoint} - Status: {response.status_code}")
                except Exception as e:
                    print(f"❌ GET {endpoint} - Error: {e}")
                    
        else:
            print("❌ Login failed - Testing with anonymous access only")
            
    except Exception as e:
        print(f"❌ Login error: {e}")
    
    print("\n📖 API Documentation:")
    print(f"📄 Swagger UI: {BASE_URL.replace('/api/v1', '')}/api/docs/")
    print(f"📄 ReDoc: {BASE_URL.replace('/api/v1', '')}/api/redoc/")
    print(f"📄 Schema: {BASE_URL.replace('/api/v1', '')}/api/schema/")

if __name__ == "__main__":
    test_endpoints()
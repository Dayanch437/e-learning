#!/usr/bin/env python
"""
Simple script to test the Django Starter API endpoints
Run this script after starting the Django server (python manage.py runserver)
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api/v1'

def test_user_registration():
    """Test user registration endpoint"""
    print("Testing user registration...")
    data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/register/', json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            return response.json().get('token')
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Make sure Django server is running.")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_user_login():
    """Test user login endpoint"""
    print("\nTesting user login...")
    data = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/login/', json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            return response.json().get('token')
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_authenticated_request(token):
    """Test authenticated endpoint"""
    if not token:
        print("No token available for authenticated request")
        return
    
    print("\nTesting authenticated request (get profile)...")
    headers = {'Authorization': f'Token {token}'}
    
    try:
        response = requests.get(f'{BASE_URL}/auth/profile/', headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    print("Django Starter API Test Script")
    print("=" * 40)
    
    # Test registration (might fail if user already exists)
    token = test_user_registration()
    
    # Test login with admin user
    admin_token = test_user_login()
    
    # Test authenticated request
    test_authenticated_request(admin_token or token)
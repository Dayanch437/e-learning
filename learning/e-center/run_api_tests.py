#!/usr/bin/env python
import os
import sys
import django
import argparse

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from django.test.runner import DiscoverRunner
from django.conf import settings

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

class APITestRunner:
    """
    Custom test runner for API tests
    """
    def __init__(self):
        self.test_runner = DiscoverRunner(verbosity=1)
    
    def run_all_tests(self, verbosity=1):
        """Run all API tests"""
        print(f"{Colors.BOLD}{Colors.CYAN}\n=== Running All API Tests ==={Colors.END}")
        self.test_runner.verbosity = verbosity
        return self.test_runner.run_tests([
            'apps.users',
            'apps.center',
            'apps.chatbot'
        ])
    
    def run_app_tests(self, app_name, verbosity=1):
        """Run tests for a specific app"""
        print(f"{Colors.BOLD}{Colors.CYAN}\n=== Running {app_name.capitalize()} API Tests ==={Colors.END}")
        self.test_runner.verbosity = verbosity
        return self.test_runner.run_tests([f'apps.{app_name}'])

def parse_arguments():
    parser = argparse.ArgumentParser(description='Run API tests for the e-center project')
    parser.add_argument('--app', dest='app', help='Specify app to test (users, center, chatbot)')
    parser.add_argument('--verbose', dest='verbose', action='store_true', help='Increase output verbosity')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_arguments()
    verbosity = 2 if args.verbose else 1
    
    runner = APITestRunner()
    
    if args.app:
        if args.app not in ['users', 'center', 'chatbot']:
            print(f"{Colors.RED}Error: Invalid app name '{args.app}'. Choose from: users, center, chatbot{Colors.END}")
            sys.exit(1)
        result = runner.run_app_tests(args.app, verbosity)
    else:
        result = runner.run_all_tests(verbosity)
    
    if result:
        print(f"{Colors.BOLD}{Colors.RED}\n❌ Some tests failed!{Colors.END}")
        sys.exit(1)
    else:
        print(f"{Colors.BOLD}{Colors.GREEN}\n✅ All tests passed!{Colors.END}")
        sys.exit(0)
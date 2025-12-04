#!/bin/bash

# Settings Environment Configuration Script
# This script helps you switch between different Django settings environments

echo "Django Settings Environment Configuration"
echo "======================================="

echo "Available environments:"
echo "1. Local Development (config.settings.local)"
echo "2. Production (config.settings.production)"
echo ""

read -p "Select environment (1-2): " choice

case $choice in
    1)
        export DJANGO_SETTINGS_MODULE="config.settings.local"
        echo "✅ Environment set to: LOCAL DEVELOPMENT"
        echo "Using: config.settings.local"
        ;;
    2)
        export DJANGO_SETTINGS_MODULE="config.settings.production"
        echo "✅ Environment set to: PRODUCTION"
        echo "Using: config.settings.production"
        echo "⚠️  Make sure to configure production environment variables!"
        ;;
    *)
        echo "❌ Invalid choice. Using default local settings."
        export DJANGO_SETTINGS_MODULE="config.settings.local"
        ;;
esac

echo ""
echo "Current Django Settings Module: $DJANGO_SETTINGS_MODULE"
echo ""

# Configure Gemini API Key
echo "Gemini AI Configuration"
echo "======================="
read -p "Would you like to set a Gemini API key? (y/n): " set_gemini

if [ "$set_gemini" = "y" ] || [ "$set_gemini" = "Y" ]; then
    read -p "Enter your Gemini API key: " gemini_key
    export GEMINI_API_KEY=$gemini_key
    echo "✅ Gemini API key has been set"
    echo ""
    echo "To make these settings permanent, add these lines to your .env file:"
    echo "DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE"
    echo "GEMINI_API_KEY=$GEMINI_API_KEY"
else
    echo ""
    echo "To make this permanent, add this to your .env file:"
    echo "DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE"
fi
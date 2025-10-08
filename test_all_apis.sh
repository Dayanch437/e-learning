#!/bin/bash

echo "🚀 Testing API Endpoints Connectivity"
echo "======================================"

BASE_URL="http://localhost:8000/api/v1"

# Test Grammar API
echo "📚 Testing Grammar API..."
GRAMMAR_RESPONSE=$(curl -s "${BASE_URL}/center/grammar/?page_size=2")
if echo "$GRAMMAR_RESPONSE" | grep -q "count"; then
    echo "✅ Grammar API: Working"
    echo "   📊 Data sample: $(echo "$GRAMMAR_RESPONSE" | jq -r '.results[0].title // "No data"' 2>/dev/null || echo "JSON parsing unavailable")"
else
    echo "❌ Grammar API: Failed"
fi

# Test Videos API
echo "🎥 Testing Videos API..."
VIDEO_RESPONSE=$(curl -s "${BASE_URL}/center/videos/?page_size=2")
if echo "$VIDEO_RESPONSE" | grep -q "count"; then
    echo "✅ Videos API: Working"
    echo "   📊 Data sample: $(echo "$VIDEO_RESPONSE" | jq -r '.results[0].title // "No data"' 2>/dev/null || echo "JSON parsing unavailable")"
else
    echo "❌ Videos API: Failed"
fi

# Test Vocabulary API
echo "📖 Testing Vocabulary API..."
VOCAB_RESPONSE=$(curl -s "${BASE_URL}/center/vocabulary/?page_size=2")
if echo "$VOCAB_RESPONSE" | grep -q "count"; then
    echo "✅ Vocabulary API: Working"
    echo "   📊 Data sample: $(echo "$VOCAB_RESPONSE" | jq -r '.results[0].turkmen_word + " - " + .results[0].english_word // "No data"' 2>/dev/null || echo "JSON parsing unavailable")"
else
    echo "❌ Vocabulary API: Failed"
fi

# Test Stats APIs
echo "📈 Testing Stats APIs..."

# Grammar Stats
GRAMMAR_STATS=$(curl -s "${BASE_URL}/center/grammar-stats/")
if echo "$GRAMMAR_STATS" | grep -q "total_grammar\|total_lessons"; then
    echo "✅ Grammar Stats API: Working"
else
    echo "❌ Grammar Stats API: Failed"
fi

# Video Stats
VIDEO_STATS=$(curl -s "${BASE_URL}/center/video-stats/")
if echo "$VIDEO_STATS" | grep -q "total_videos\|total_lessons"; then
    echo "✅ Video Stats API: Working"
else
    echo "❌ Video Stats API: Failed"
fi

# Vocabulary Stats
VOCAB_STATS=$(curl -s "${BASE_URL}/center/vocabulary-stats/")
if echo "$VOCAB_STATS" | grep -q "total_words\|total_vocabulary"; then
    echo "✅ Vocabulary Stats API: Working"
else
    echo "❌ Vocabulary Stats API: Failed"
fi

echo ""
echo "🔍 Testing Frontend React App..."
REACT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$REACT_RESPONSE" = "200" ]; then
    echo "✅ React Frontend: Running on http://localhost:3000"
else
    echo "❌ React Frontend: Not accessible on http://localhost:3000 (HTTP $REACT_RESPONSE)"
fi

echo ""
echo "📋 API Summary:"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/api/docs/"
echo ""
echo "🎯 Next Steps:"
echo "   1. Visit http://localhost:3000/api-test to test API connections in the browser"
echo "   2. Use http://localhost:3000/login to login and access protected endpoints"
echo "   3. Check http://localhost:8000/api/docs/ for full API documentation"
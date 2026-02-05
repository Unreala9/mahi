#!/bin/bash
# Quick test script for Cloudflare deployment

echo "🧪 Testing Cloudflare Pages Deployment..."
echo ""

# Get the deployment URL
if [ -z "$1" ]; then
  echo "❌ Please provide your Cloudflare Pages URL"
  echo "Usage: ./test-deployment.sh https://your-project.pages.dev"
  exit 1
fi

DEPLOYMENT_URL=$1

echo "📍 Testing URL: $DEPLOYMENT_URL"
echo ""

# Test 1: Homepage
echo "1️⃣ Testing Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/")
if [ "$STATUS" -eq 200 ]; then
  echo "   ✅ Homepage: OK (200)"
else
  echo "   ❌ Homepage: FAILED ($STATUS)"
fi

# Test 2: API Proxy - All Sports
echo "2️⃣ Testing API Proxy - All Sports..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/allSportid")
if [ "$STATUS" -eq 200 ]; then
  echo "   ✅ All Sports API: OK (200)"
else
  echo "   ❌ All Sports API: FAILED ($STATUS)"
fi

# Test 3: Casino Data
echo "3️⃣ Testing Casino Data API..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/casino/data?type=dt20")
if [ "$STATUS" -eq 200 ]; then
  echo "   ✅ Casino API: OK (200)"
else
  echo "   ❌ Casino API: FAILED ($STATUS)"
fi

# Test 4: Casino Result
echo "4️⃣ Testing Casino Result API..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/casino/result?type=dt20")
if [ "$STATUS" -eq 200 ]; then
  echo "   ✅ Casino Result API: OK (200)"
else
  echo "   ❌ Casino Result API: FAILED ($STATUS)"
fi

# Test 5: Check if API key is added automatically
echo "5️⃣ Testing if API key is added automatically..."
RESPONSE=$(curl -s "$DEPLOYMENT_URL/allSportid")
if echo "$RESPONSE" | grep -q '"success"'; then
  echo "   ✅ API Key: Working (response contains success)"
else
  echo "   ❌ API Key: FAILED (unauthorized or invalid response)"
fi

echo ""
echo "🎉 Testing Complete!"
echo ""
echo "💡 If any test failed:"
echo "   1. Check Cloudflare Pages deployment logs"
echo "   2. Verify environment variables are set"
echo "   3. Ensure functions/_middleware.js is deployed"
echo "   4. Check browser console for detailed errors"

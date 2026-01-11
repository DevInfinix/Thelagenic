#!/bin/bash
# Quick Firebase Testing Commands
# Run these in order to validate your setup

echo "📋 Firebase Testing Checklist"
echo "=============================="
echo ""

echo "Step 1: Check if service account key exists"
if [ -f "credentials/serviceAccountKey.json" ]; then
  echo "✅ Service account key found"
else
  echo "❌ Service account key NOT found"
  echo "   Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key"
  echo "   Save to: credentials/serviceAccountKey.json"
  exit 1
fi

echo ""
echo "Step 2: Check if dependencies are installed"
if npm list firebase-admin > /dev/null 2>&1; then
  echo "✅ firebase-admin installed"
else
  echo "❌ firebase-admin not installed"
  echo "   Run: npm install firebase-admin"
  exit 1
fi

echo ""
echo "Step 3: Run Firebase connection test"
echo "======================================"
node scripts/testFirebase.js

echo ""
echo "Step 4: Test complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start your app: npm start"
echo "2. Go to onboarding screen"
echo "3. Enter test data and click 'Get Started'"
echo "4. Check Firebase Console for created user"
echo ""

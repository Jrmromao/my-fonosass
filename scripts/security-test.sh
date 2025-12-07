#!/bin/bash

echo "🔍 Running Security Tests..."

# Check for remaining hardcoded credentials
echo "Checking for hardcoded credentials..."
HARDCODED_CREDS=$(grep -r "password.*=" app/ --include="*.ts" --include="*.tsx" | grep -v "password.*:" | wc -l)
if [ $HARDCODED_CREDS -gt 0 ]; then
  echo "❌ Found $HARDCODED_CREDS hardcoded passwords"
  grep -r "password.*=" app/ --include="*.ts" --include="*.tsx" | grep -v "password.*:"
else
  echo "✅ No hardcoded passwords found"
fi

# Check for hardcoded emails
HARDCODED_EMAILS=$(grep -r "@gmail.com\|@yahoo.com\|@hotmail.com" app/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $HARDCODED_EMAILS -gt 0 ]; then
  echo "❌ Found $HARDCODED_EMAILS hardcoded emails"
  grep -r "@gmail.com\|@yahoo.com\|@hotmail.com" app/ --include="*.ts" --include="*.tsx"
else
  echo "✅ No hardcoded emails found"
fi

# Check for console.log with sensitive data
echo "Checking for sensitive data in logs..."
SENSITIVE_LOGS=$(grep -r "console\.log.*password\|console\.log.*token\|console\.log.*secret" app/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $SENSITIVE_LOGS -gt 0 ]; then
  echo "❌ Found $SENSITIVE_LOGS console.log statements with sensitive data"
  grep -r "console\.log.*password\|console\.log.*token\|console\.log.*secret" app/ --include="*.ts" --include="*.tsx"
else
  echo "✅ No sensitive data in console.log statements"
fi

# Test security headers
echo "Testing security headers..."
if command -v curl &> /dev/null; then
  HEADERS=$(curl -s -I http://localhost:3000/ | grep -E "X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport-Security")
  if [ -n "$HEADERS" ]; then
    echo "✅ Security headers found:"
    echo "$HEADERS"
  else
    echo "❌ No security headers found"
  fi
else
  echo "⚠️  curl not available, skipping header test"
fi

echo "✅ Security test complete!"

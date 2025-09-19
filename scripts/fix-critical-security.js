#!/usr/bin/env node

/**
 * Critical Security Fixes Script
 * 
 * This script automatically fixes the most critical security vulnerabilities
 * identified in the FonoSaaS application.
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Starting Critical Security Fixes...\n');

// 1. Fix hardcoded credentials in onboarding route
console.log('1. Fixing hardcoded credentials in onboarding route...');
const onboardingPath = 'app/api/onboarding/route.ts';
if (fs.existsSync(onboardingPath)) {
  let content = fs.readFileSync(onboardingPath, 'utf8');
  
  // Replace hardcoded password
  content = content.replace(
    /password: "MERDAP@ssword2023!",/g,
    'password: generateSecurePassword(),'
  );
  
  // Add password generation function
  if (!content.includes('generateSecurePassword')) {
    const importSection = content.indexOf('import { prisma } from \'@/app/db\';');
    if (importSection !== -1) {
      const insertPoint = content.indexOf('\n', importSection) + 1;
      content = content.slice(0, insertPoint) + 
        '\n// Generate secure password for test users\n' +
        'const generateSecurePassword = () => {\n' +
        '  return Math.random().toString(36).slice(-12) + \'@2024!\';\n' +
        '};\n\n' +
        content.slice(insertPoint);
    }
  }
  
  fs.writeFileSync(onboardingPath, content);
  console.log('   ✅ Fixed hardcoded password in onboarding route');
} else {
  console.log('   ⚠️  Onboarding route not found');
}

// 2. Fix hardcoded credentials in create-users route
console.log('2. Fixing hardcoded credentials in create-users route...');
const createUsersPath = 'app/api/create-users/route.ts';
if (fs.existsSync(createUsersPath)) {
  let content = fs.readFileSync(createUsersPath, 'utf8');
  
  // Replace hardcoded email and password
  content = content.replace(
    /email: `ecokeepr@gmail.com`,/g,
    'email: `test-${Date.now()}@example.com`,'
  );
  
  content = content.replace(
    /password: 'SecureP@ssword2023!',/g,
    'password: generateSecurePassword(),'
  );
  
  // Add password generation function
  if (!content.includes('generateSecurePassword')) {
    const importSection = content.indexOf('import { NextResponse } from "next/server";');
    if (importSection !== -1) {
      const insertPoint = content.indexOf('\n', importSection) + 1;
      content = content.slice(0, insertPoint) + 
        '\n// Generate secure password for test users\n' +
        'const generateSecurePassword = () => {\n' +
        '  return Math.random().toString(36).slice(-12) + \'@2024!\';\n' +
        '};\n\n' +
        content.slice(insertPoint);
    }
  }
  
  fs.writeFileSync(createUsersPath, content);
  console.log('   ✅ Fixed hardcoded credentials in create-users route');
} else {
  console.log('   ⚠️  Create-users route not found');
}

// 3. Add security headers to next.config.ts
console.log('3. Adding security headers to Next.js config...');
const nextConfigPath = 'next.config.ts';
if (fs.existsSync(nextConfigPath)) {
  let content = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Add security headers if not already present
  if (!content.includes('X-Frame-Options')) {
    const configEnd = content.lastIndexOf('}');
    if (configEnd !== -1) {
      const securityHeaders = `
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },`;
      
      content = content.slice(0, configEnd) + ',' + securityHeaders + '\n' + content.slice(configEnd);
      fs.writeFileSync(nextConfigPath, content);
      console.log('   ✅ Added security headers to Next.js config');
    }
  } else {
    console.log('   ✅ Security headers already present');
  }
} else {
  console.log('   ⚠️  Next.js config not found');
}

// 4. Add authentication to test API route
console.log('4. Adding authentication to test API route...');
const testApiPath = 'app/api/test/route.ts';
if (fs.existsSync(testApiPath)) {
  let content = fs.readFileSync(testApiPath, 'utf8');
  
  // Add authentication if not present
  if (!content.includes('auth()')) {
    content = content.replace(
      'export async function GET() {',
      `import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }`
    );
    
    // Add error handling
    if (!content.includes('catch (error)')) {
      content = content.replace(
        '  return NextResponse.json({ message: "Test endpoint working" });',
        `  return NextResponse.json({ message: "Test endpoint working" });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }`
      );
    }
    
    fs.writeFileSync(testApiPath, content);
    console.log('   ✅ Added authentication to test API route');
  } else {
    console.log('   ✅ Authentication already present in test API route');
  }
} else {
  console.log('   ⚠️  Test API route not found');
}

// 5. Create security middleware
console.log('5. Creating security middleware...');
const middlewarePath = 'middleware.ts';
if (fs.existsSync(middlewarePath)) {
  let content = fs.readFileSync(middlewarePath, 'utf8');
  
  // Add rate limiting if not present
  if (!content.includes('rateLimit')) {
    const rateLimitCode = `
// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  check: (identifier: string) => {
    const now = Date.now();
    const current = rateLimitMap.get(identifier) || { count: 0, resetTime: now + rateLimit.windowMs };
    
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + rateLimit.windowMs;
    }
    
    if (current.count >= rateLimit.maxRequests) {
      return { success: false };
    }
    
    current.count++;
    rateLimitMap.set(identifier, current);
    return { success: true };
  }
};`;
    
    // Insert rate limiting code before the main middleware function
    const middlewareStart = content.indexOf('export default clerkMiddleware');
    if (middlewareStart !== -1) {
      content = content.slice(0, middlewareStart) + rateLimitCode + '\n\n' + content.slice(middlewareStart);
      
      // Add rate limiting check in the middleware
      content = content.replace(
        'export default clerkMiddleware(async (auth, req: NextRequest) => {',
        `export default clerkMiddleware(async (auth, req: NextRequest) => {
    // Rate limiting check
    const identifier = req.ip || 'anonymous';
    const rateLimitResult = rateLimit.check(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }`
      );
      
      fs.writeFileSync(middlewarePath, content);
      console.log('   ✅ Added rate limiting to middleware');
    }
  } else {
    console.log('   ✅ Rate limiting already present in middleware');
  }
} else {
  console.log('   ⚠️  Middleware file not found');
}

// 6. Create security test script
console.log('6. Creating security test script...');
const securityTestScript = `#!/bin/bash

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
HARDCODED_EMAILS=$(grep -r "@gmail.com\\|@yahoo.com\\|@hotmail.com" app/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $HARDCODED_EMAILS -gt 0 ]; then
  echo "❌ Found $HARDCODED_EMAILS hardcoded emails"
  grep -r "@gmail.com\\|@yahoo.com\\|@hotmail.com" app/ --include="*.ts" --include="*.tsx"
else
  echo "✅ No hardcoded emails found"
fi

# Check for console.log with sensitive data
echo "Checking for sensitive data in logs..."
SENSITIVE_LOGS=$(grep -r "console\\.log.*password\\|console\\.log.*token\\|console\\.log.*secret" app/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $SENSITIVE_LOGS -gt 0 ]; then
  echo "❌ Found $SENSITIVE_LOGS console.log statements with sensitive data"
  grep -r "console\\.log.*password\\|console\\.log.*token\\|console\\.log.*secret" app/ --include="*.ts" --include="*.tsx"
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
`;

fs.writeFileSync('scripts/security-test.sh', securityTestScript);
fs.chmodSync('scripts/security-test.sh', '755');
console.log('   ✅ Created security test script');

// 7. Update package.json with security scripts
console.log('7. Adding security scripts to package.json...');
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['security:test']) {
    packageJson.scripts['security:test'] = 'bash scripts/security-test.sh';
    packageJson.scripts['security:audit'] = 'npm audit --audit-level=moderate';
    packageJson.scripts['security:fix'] = 'node scripts/fix-critical-security.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('   ✅ Added security scripts to package.json');
  } else {
    console.log('   ✅ Security scripts already present in package.json');
  }
} else {
  console.log('   ⚠️  package.json not found');
}

console.log('\n🎉 Critical security fixes completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: yarn security:test');
console.log('2. Run: yarn security:audit');
console.log('3. Test the application thoroughly');
console.log('4. Review the security audit report: docs/security/security-audit-report.md');
console.log('5. Implement the full remediation plan: docs/security/security-remediation-plan.md');
console.log('\n⚠️  IMPORTANT: These are basic fixes. Please implement the full security remediation plan for complete protection.');

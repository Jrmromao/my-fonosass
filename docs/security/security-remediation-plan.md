# 🛠️ **FonoSaaS Security Remediation Plan**

**Created**: December 2024  
**Priority**: CRITICAL  
**Timeline**: 4 Weeks  
**Status**: Ready for Implementation  

---

## 📅 **Implementation Timeline**

### **Week 1: Critical Security Fixes**
- [ ] Remove hardcoded credentials
- [ ] Secure unprotected API endpoints
- [ ] Implement security headers
- [ ] Fix SQL injection vulnerabilities
- [ ] Add input validation

### **Week 2: High Priority Fixes**
- [ ] Secure file upload handling
- [ ] Implement rate limiting
- [ ] Fix information disclosure
- [ ] Add access controls
- [ ] Implement CSRF protection

### **Week 3: Medium Priority Fixes**
- [ ] Enhance error handling
- [ ] Implement session management
- [ ] Add password policies
- [ ] Implement data encryption
- [ ] Add security monitoring

### **Week 4: Testing & Validation**
- [ ] Security testing
- [ ] Penetration testing
- [ ] Code review
- [ ] Documentation update
- [ ] Security training

---

## 🚨 **IMMEDIATE ACTIONS (Day 1-2)**

### **1. Remove Hardcoded Credentials**

**Files to Fix**:
- `app/api/onboarding/route.ts`
- `app/api/create-users/route.ts`

**Implementation**:
```typescript
// BEFORE (INSECURE)
password: "MERDAP@ssword2023!",
email: `ecokeepr@gmail.com`,

// AFTER (SECURE)
const generateSecurePassword = () => {
  return crypto.randomBytes(16).toString('hex');
};

const generateTestEmail = () => {
  return `test-${Date.now()}@example.com`;
};
```

**Testing**:
```bash
# Search for remaining hardcoded credentials
grep -r "password.*=" app/ --include="*.ts" --include="*.tsx"
grep -r "@gmail.com\|@yahoo.com\|@hotmail.com" app/ --include="*.ts" --include="*.tsx"
```

### **2. Secure API Endpoints**

**Files to Fix**:
- `app/api/test/route.ts`
- `app/api/create-users/route.ts`

**Implementation**:
```typescript
// Add authentication middleware
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add rate limiting
    const rateLimitResult = await rateLimit.check(userId);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    // Rest of implementation...
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### **3. Implement Security Headers**

**File**: `next.config.ts`

**Implementation**:
```typescript
const nextConfig = {
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
  },
};
```

---

## 🔴 **HIGH PRIORITY FIXES (Day 3-7)**

### **4. Fix SQL Injection Vulnerabilities**

**Files to Fix**:
- `app/api/exercises/route.ts`
- `lib/actions/activity.action.ts`

**Implementation**:
```typescript
// BEFORE (VULNERABLE)
const where: any = {
  isPublic: true,
  ...(search && {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }),
}

// AFTER (SECURE)
const buildSafeWhereClause = (searchParams: URLSearchParams) => {
  const where: Prisma.ActivityWhereInput = {
    isPublic: true,
  };
  
  const search = searchParams.get('search');
  if (search && search.length <= 100) { // Length limit
    const sanitizedSearch = search.replace(/[<>]/g, ''); // Basic sanitization
    where.OR = [
      { name: { contains: sanitizedSearch, mode: 'insensitive' } },
      { description: { contains: sanitizedSearch, mode: 'insensitive' } }
    ];
  }
  
  return where;
};
```

### **5. Secure File Upload Handling**

**Files to Fix**:
- `lib/actions/activity.action.ts`
- `services/S3Service.ts`

**Implementation**:
```typescript
// Add file validation
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large' };
  }
  
  // Check file name
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    return { valid: false, error: 'Invalid file name' };
  }
  
  return { valid: true };
};

// Scan file for malware (implement with ClamAV or similar)
const scanFile = async (buffer: Buffer): Promise<boolean> => {
  // Implement malware scanning
  return true; // Placeholder
};
```

### **6. Implement Rate Limiting**

**File**: `middleware.ts`

**Implementation**:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  check: (identifier: string) => {
    const now = Date.now();
    const windowStart = now - rateLimit.windowMs;
    
    const current = rateLimitMap.get(identifier) || { count: 0, resetTime: now + rateLimit.windowMs };
    
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + rateLimit.windowMs;
    }
    
    if (current.count >= rateLimit.maxRequests) {
      return { success: false, remaining: 0, resetTime: current.resetTime };
    }
    
    current.count++;
    rateLimitMap.set(identifier, current);
    
    return { success: true, remaining: rateLimit.maxRequests - current.count, resetTime: current.resetTime };
  }
};

export function middleware(request: NextRequest) {
  const identifier = request.ip || 'anonymous';
  const rateLimitResult = rateLimit.check(identifier);
  
  if (!rateLimitResult.success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Add rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', rateLimit.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  
  return response;
}
```

---

## 🟡 **MEDIUM PRIORITY FIXES (Week 2-3)**

### **7. Fix Information Disclosure in Logs**

**Implementation**:
```typescript
// Create secure logger
class SecureLogger {
  private static sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Remove sensitive patterns
      return data
        .replace(/password["\s]*[:=]["\s]*[^,\s}]+/gi, 'password: [REDACTED]')
        .replace(/token["\s]*[:=]["\s]*[^,\s}]+/gi, 'token: [REDACTED]')
        .replace(/key["\s]*[:=]["\s]*[^,\s}]+/gi, 'key: [REDACTED]');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.secret;
      return sanitized;
    }
    
    return data;
  }
  
  static log(level: string, message: string, data?: any) {
    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    console[level](message, sanitizedData);
  }
}

// Usage
SecureLogger.log('info', 'User created', { userId: user.id, email: user.email });
```

### **8. Implement CSRF Protection**

**Implementation**:
```typescript
// Add CSRF token generation
import { randomBytes } from 'crypto';

const generateCSRFToken = () => {
  return randomBytes(32).toString('hex');
};

// Add CSRF middleware
const csrfProtection = (req: NextRequest) => {
  const token = req.headers.get('x-csrf-token');
  const sessionToken = req.cookies.get('csrf-token')?.value;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return new NextResponse('CSRF token mismatch', { status: 403 });
  }
  
  return NextResponse.next();
};
```

### **9. Add Password Policies**

**Implementation**:
```typescript
// Password validation
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

---

## 🧪 **TESTING IMPLEMENTATION**

### **Security Test Suite**

**File**: `__tests__/security/security.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { testSecurityHeaders } from './security-test-utils';

describe('Security Tests', () => {
  it('should have proper security headers', async () => {
    const response = await fetch('http://localhost:3000/');
    const headers = response.headers;
    
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-xss-protection')).toBe('1; mode=block');
    expect(headers.get('strict-transport-security')).toContain('max-age=31536000');
  });
  
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await fetch(`http://localhost:3000/api/exercises?search=${encodeURIComponent(maliciousInput)}`);
    
    expect(response.status).toBe(200);
    // Verify no data corruption occurred
  });
  
  it('should validate file uploads', async () => {
    const maliciousFile = new File(['malicious content'], 'test.exe', { type: 'application/x-executable' });
    const formData = new FormData();
    formData.append('file', maliciousFile);
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(400);
  });
});
```

### **Automated Security Scanning**

**File**: `scripts/security-scan.sh`

```bash
#!/bin/bash

echo "🔍 Running Security Scan..."

# Check for hardcoded secrets
echo "Checking for hardcoded secrets..."
grep -r "password.*=" app/ --include="*.ts" --include="*.tsx" | grep -v "password.*:" | head -10

# Check for console.log statements
echo "Checking for sensitive data in logs..."
grep -r "console\.log.*password\|console\.log.*token\|console\.log.*secret" app/ --include="*.ts" --include="*.tsx"

# Run security tests
echo "Running security tests..."
yarn test:security

# Check dependencies for vulnerabilities
echo "Checking for vulnerable dependencies..."
npm audit --audit-level=moderate

echo "✅ Security scan complete!"
```

---

## 📊 **MONITORING AND ALERTING**

### **Security Monitoring Setup**

**File**: `lib/security/monitor.ts`

```typescript
class SecurityMonitor {
  private static suspiciousActivities: Map<string, number> = new Map();
  
  static logSuspiciousActivity(type: string, details: any) {
    const key = `${type}-${Date.now()}`;
    this.suspiciousActivities.set(key, 1);
    
    // Alert if too many suspicious activities
    if (this.suspiciousActivities.size > 100) {
      this.sendAlert('High volume of suspicious activities detected', details);
    }
  }
  
  static logFailedAuth(ip: string, userAgent: string) {
    this.logSuspiciousActivity('failed-auth', { ip, userAgent });
  }
  
  static logFileUpload(fileName: string, fileType: string, userId: string) {
    if (this.isSuspiciousFile(fileName, fileType)) {
      this.logSuspiciousActivity('suspicious-upload', { fileName, fileType, userId });
    }
  }
  
  private static isSuspiciousFile(fileName: string, fileType: string): boolean {
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
    const suspiciousTypes = ['application/x-executable', 'application/x-msdownload'];
    
    return suspiciousExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) ||
           suspiciousTypes.includes(fileType);
  }
  
  private static sendAlert(message: string, details: any) {
    // Implement alerting (email, Slack, etc.)
    console.error('SECURITY ALERT:', message, details);
  }
}
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Week 1 Checklist**
- [ ] Remove all hardcoded credentials
- [ ] Add authentication to unprotected endpoints
- [ ] Implement security headers
- [ ] Fix SQL injection vulnerabilities
- [ ] Add input validation
- [ ] Test all fixes

### **Week 2 Checklist**
- [ ] Secure file upload handling
- [ ] Implement rate limiting
- [ ] Fix information disclosure
- [ ] Add access controls
- [ ] Implement CSRF protection
- [ ] Test security measures

### **Week 3 Checklist**
- [ ] Enhance error handling
- [ ] Implement session management
- [ ] Add password policies
- [ ] Implement data encryption
- [ ] Add security monitoring
- [ ] Update documentation

### **Week 4 Checklist**
- [ ] Run comprehensive security tests
- [ ] Perform penetration testing
- [ ] Code review
- [ ] Security training for team
- [ ] Final validation
- [ ] Go-live preparation

---

## 🎯 **SUCCESS METRICS**

### **Security Metrics**
- [ ] Zero critical vulnerabilities
- [ ] All security headers implemented
- [ ] 100% API endpoint authentication
- [ ] File upload security score > 90%
- [ ] Security test coverage > 80%

### **Performance Metrics**
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%

---

*This remediation plan should be implemented immediately to address critical security vulnerabilities. Regular security assessments should be performed to maintain security posture.*

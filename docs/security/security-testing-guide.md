# 🧪 Almanaque da Fala Security Testing Guide

**Created**: December 2024  
**Purpose**: Comprehensive guide for running and maintaining security tests

---

## 📋 **Overview**

This guide provides instructions for running security tests, interpreting results, and maintaining the security testing framework for the Almanaque da Fala application.

---

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ installed
- Application running on `http://localhost:3000`
- All dependencies installed (`npm install`)

### Running Security Tests

```bash
# Run all security tests
npm run test:security

# Run security tests in watch mode
npm run test:security:watch

# Run security tests with coverage
npm run test:security:coverage

# Run all tests (unit + security)
npm run test:all
```

---

## 🧪 **Test Categories**

### 1. Authentication Security Tests (`auth.test.ts`)
Tests authentication vulnerabilities and security measures.

**What it tests**:
- API route authentication requirements
- Invalid token handling
- User ID validation
- Session security
- Role-based access control
- Authentication bypass attempts
- Password security
- Rate limiting on auth endpoints

**Key Test Cases**:
```typescript
// Example: Test authentication bypass
it('should require authentication for protected API routes', async () => {
  const result = await SecurityTestHelper.testAuthBypass('/api/forms');
  SecurityAssertions.assertAuthenticationRequired(result);
});
```

### 2. Input Validation Tests (`input-validation.test.ts`)
Tests input validation vulnerabilities and security measures.

**What it tests**:
- XSS protection in form inputs
- SQL injection protection
- Email validation
- File name validation
- Input length validation
- Type validation
- CSRF protection

**Key Test Cases**:
```typescript
// Example: Test XSS protection
it('should prevent XSS attacks in form inputs', async () => {
  const result = await SecurityTestHelper.testXSSProtection('/api/forms', '<script>alert("xss")</script>');
  SecurityAssertions.assertXSSProtection(result);
});
```

### 3. Security Headers Tests (`headers.test.ts`)
Tests security headers implementation and effectiveness.

**What it tests**:
- Required security headers presence
- Content Security Policy (CSP) configuration
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Header consistency

**Key Test Cases**:
```typescript
// Example: Test security headers
it('should include all required security headers', async () => {
  const result = await SecurityTestHelper.testSecurityHeaders('/');
  SecurityAssertions.assertSecurityHeaders(result);
});
```

---

## 🔧 **Test Utilities**

### SecurityTestHelper
Utility class for performing security tests.

**Methods**:
- `createMockRequest()` - Create mock NextRequest objects
- `testXSSProtection()` - Test XSS vulnerabilities
- `testSQLInjection()` - Test SQL injection vulnerabilities
- `testFileUpload()` - Test file upload security
- `testAuthBypass()` - Test authentication bypass
- `testRateLimit()` - Test rate limiting
- `testSecurityHeaders()` - Test security headers

### SecurityAssertions
Utility class for security test assertions.

**Methods**:
- `assertXSSProtection()` - Assert XSS protection
- `assertSQLInjectionProtection()` - Assert SQL injection protection
- `assertFileUploadSecurity()` - Assert file upload security
- `assertAuthenticationRequired()` - Assert authentication required
- `assertRateLimit()` - Assert rate limiting
- `assertSecurityHeaders()` - Assert security headers

### SecurityTestDataGenerator
Utility class for generating test data.

**Methods**:
- `generateRandomData()` - Generate random test data
- `generateMaliciousData()` - Generate malicious test data
- `generateLargePayload()` - Generate large payloads for DoS testing

---

## 📊 **Interpreting Test Results**

### Test Output Format
```
PASS __tests__/security/auth.test.ts
PASS __tests__/security/input-validation.test.ts
PASS __tests__/security/headers.test.ts

Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        15.234 s
```

### Coverage Reports
Security tests generate coverage reports in `coverage/security/`:
- `lcov-report/index.html` - HTML coverage report
- `lcov.info` - LCOV format coverage data
- `coverage-final.json` - JSON coverage data

### Failed Test Interpretation

**Authentication Failures**:
```
FAIL __tests__/security/auth.test.ts
  ● should require authentication for protected API routes
    Expected: 401
    Received: 200
```
**Action**: Check if API route has proper authentication middleware

**XSS Failures**:
```
FAIL __tests__/security/input-validation.test.ts
  ● should prevent XSS attacks in form inputs
    XSS vulnerability detected: <script>alert("xss")</script>
```
**Action**: Implement input sanitization

**Header Failures**:
```
FAIL __tests__/security/headers.test.ts
  ● should include all required security headers
    Missing security headers: x-frame-options, content-security-policy
```
**Action**: Add missing security headers to Next.js config

---

## 🛠 **Adding New Security Tests**

### 1. Create New Test File
```typescript
// __tests__/security/new-security.test.ts
import { describe, it, expect } from '@jest/globals';
import { SecurityTestHelper, SecurityAssertions } from './security-test-utils';

describe('New Security Tests', () => {
  it('should test new security feature', async () => {
    // Test implementation
  });
});
```

### 2. Add Test to Jest Config
Update `jest.security.config.js`:
```javascript
module.exports = {
  testMatch: [
    '<rootDir>/__tests__/security/**/*.test.ts',
    '<rootDir>/__tests__/security/new-security.test.ts' // Add new test
  ],
  // ... rest of config
};
```

### 3. Update Test Utilities (if needed)
Add new methods to `SecurityTestHelper` or `SecurityAssertions` as needed.

---

## 🔍 **Manual Security Testing**

### 1. XSS Testing
```bash
# Test XSS in forms
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(\"xss\")</script>"}'
```

### 2. SQL Injection Testing
```bash
# Test SQL injection
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{"query": "\"; DROP TABLE users; --"}'
```

### 3. File Upload Testing
```bash
# Test malicious file upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@malicious.exe"
```

### 4. Authentication Testing
```bash
# Test authentication bypass
curl -X GET http://localhost:3000/api/forms \
  -H "Authorization: Bearer invalid-token"
```

### 5. Security Headers Testing
```bash
# Test security headers
curl -I http://localhost:3000/
```

---

## 🚨 **Common Security Issues**

### 1. Missing Authentication
**Symptoms**: Tests fail with "Authentication bypassed"
**Fix**: Add authentication middleware to API routes

### 2. XSS Vulnerabilities
**Symptoms**: Tests fail with "XSS vulnerability detected"
**Fix**: Implement input sanitization using DOMPurify or similar

### 3. Missing Security Headers
**Symptoms**: Tests fail with "Missing security headers"
**Fix**: Add security headers to Next.js config

### 4. SQL Injection
**Symptoms**: Tests fail with "SQL injection vulnerability detected"
**Fix**: Use parameterized queries (Prisma handles this automatically)

### 5. File Upload Vulnerabilities
**Symptoms**: Tests fail with "File upload security bypassed"
**Fix**: Implement server-side file validation

---

## 📈 **Continuous Integration**

### GitHub Actions Example
```yaml
name: Security Tests
on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:security
      - run: npm run test:security:coverage
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:security"
    }
  }
}
```

---

## 🔄 **Maintenance**

### Weekly Tasks
- [ ] Run security tests
- [ ] Review test results
- [ ] Update test data if needed
- [ ] Check for new security vulnerabilities

### Monthly Tasks
- [ ] Review and update security test cases
- [ ] Update test utilities
- [ ] Review coverage reports
- [ ] Update security testing guide

### Quarterly Tasks
- [ ] Conduct security review
- [ ] Update security testing framework
- [ ] Review and update security policies
- [ ] Train team on security testing

---

## 📞 **Support**

**Security Issues**: [Add security team contact]  
**Test Failures**: [Add development team contact]  
**Framework Issues**: [Add DevOps contact]  

---

## 📚 **Resources**

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Clerk Security](https://clerk.com/docs/security)

---

**Last Updated**: December 2024  
**Next Review**: January 2025  
**Document Owner**: Development Team

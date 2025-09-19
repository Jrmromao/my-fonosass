# Download Limits Feature - Testing Plan

## 🎯 **Feature Overview**
Download limits system that restricts free users to 5 downloads per month while allowing unlimited downloads for Pro subscribers.

## 📋 **Test Coverage Strategy**

### **Unit Tests (85% Coverage Target)**
- ✅ **DownloadLimitService** - Core business logic
- ✅ **API Routes** - Request/response handling
- ✅ **Edge Cases** - Boundary conditions and error states

### **Integration Tests (Full User Journey)**
- ✅ **UI Interactions** - Modal behavior and user feedback
- ✅ **API Integration** - End-to-end API calls
- ✅ **Error Handling** - Graceful degradation

### **Security Tests**
- ✅ **Authentication** - Unauthorized access prevention
- ✅ **Rate Limiting** - Abuse prevention
- ✅ **Data Validation** - Input sanitization

## 🧪 **Unit Test Coverage**

### **DownloadLimitService Tests**
```typescript
✅ checkDownloadLimit()
  - New user creation
  - Under limit scenarios
  - Limit reached scenarios  
  - 30-day reset logic
  - Edge cases (negative values, invalid dates)

✅ recordDownload()
  - Increment counter
  - Upsert behavior
  - Concurrent access handling

✅ hasProAccess()
  - Active subscription detection
  - Inactive subscription handling
  - Missing subscription data
```

### **API Route Tests**
```typescript
✅ GET /api/download-limit
  - Unauthenticated requests (401)
  - Pro user responses (unlimited)
  - Free user responses (limited)
  - Error handling (500)

✅ POST /api/download-limit
  - Unauthenticated requests (401)
  - Pro user downloads (unlimited)
  - Free user downloads (within limit)
  - Limit exceeded (403)
  - Service errors (500)
```

## 🔄 **Integration Test Scenarios**

### **Happy Path Tests**
1. **Free User Download Flow**
   - Open exercise preview modal
   - See download limit info (5 downloads/month)
   - Click download button
   - Receive success message with remaining count
   - Verify download recorded in database

2. **Pro User Download Flow**
   - Open exercise preview modal
   - Click download button
   - Receive unlimited download confirmation
   - Verify no limit checking occurs

### **Edge Case Tests**
1. **Limit Exhaustion**
   - User with 0 remaining downloads
   - Click download button
   - Receive upgrade prompt
   - Verify no download recorded

2. **Reset Period**
   - User with exhausted limit from 31+ days ago
   - Check download availability
   - Verify limit reset to 5
   - Allow new downloads

3. **Subscription Changes**
   - Free user upgrades to Pro mid-month
   - Verify unlimited access immediately
   - Pro user downgrades to free
   - Verify limit enforcement

### **Error Handling Tests**
1. **API Failures**
   - Database connection errors
   - Service timeouts
   - Invalid responses
   - Network failures

2. **UI Resilience**
   - Modal remains functional during errors
   - User receives appropriate error messages
   - No data corruption occurs

## 🚀 **Test Execution Plan**

### **Development Phase**
```bash
# Run unit tests
yarn test services/__tests__/downloadLimitService.test.ts
yarn test app/api/download-limit/__tests__/route.test.ts

# Run with coverage
yarn test:coverage --testPathPattern=download
```

### **Integration Phase**
```bash
# Run integration tests
yarn test:integration tests/integration/download-limits.test.ts

# Run with UI
yarn test:integration:ui --grep "Download Limits"
```

### **CI/CD Pipeline**
```yaml
test-download-limits:
  runs-on: ubuntu-latest
  steps:
    - name: Unit Tests
      run: yarn test --testPathPattern=download --coverage
    - name: Integration Tests  
      run: yarn test:integration download-limits.test.ts
    - name: Coverage Report
      run: yarn test:coverage --coverageThreshold=85
```

## 📊 **Success Criteria**

### **Unit Tests**
- ✅ **85%+ code coverage** for DownloadLimitService
- ✅ **100% API route coverage** for all endpoints
- ✅ **All edge cases tested** (reset, limits, errors)
- ✅ **Performance tests** (< 100ms response time)

### **Integration Tests**
- ✅ **Complete user journeys** work end-to-end
- ✅ **Error scenarios** handled gracefully
- ✅ **Cross-browser compatibility** (Chrome, Firefox, Safari)
- ✅ **Mobile responsiveness** tested

### **Security Tests**
- ✅ **Authentication required** for all endpoints
- ✅ **No data leakage** between users
- ✅ **Rate limiting** prevents abuse
- ✅ **Input validation** prevents injection

## 🔍 **Test Data Requirements**

### **Database Fixtures**
```sql
-- Free user with downloads remaining
INSERT INTO download_limits (userId, downloads, resetDate) 
VALUES ('free-user-1', 2, NOW());

-- Free user with limit exhausted
INSERT INTO download_limits (userId, downloads, resetDate) 
VALUES ('free-user-2', 5, NOW());

-- Free user with old reset date
INSERT INTO download_limits (userId, downloads, resetDate) 
VALUES ('free-user-3', 5, NOW() - INTERVAL 35 DAY);

-- Pro user
INSERT INTO users (id, subscriptionStatus) 
VALUES ('pro-user-1', 'ACTIVE');
```

### **Mock Data**
- Exercise data for preview modals
- User authentication tokens
- API response fixtures
- Error scenarios

## 🎯 **Quality Gates**

### **Before Merge**
- [ ] All unit tests pass (85%+ coverage)
- [ ] All integration tests pass
- [ ] Security tests pass
- [ ] Performance benchmarks met
- [ ] Code review completed

### **Before Production**
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] User acceptance testing
- [ ] Monitoring alerts configured

## 📈 **Monitoring & Metrics**

### **Key Metrics to Track**
- Download success rate
- API response times
- Error rates by endpoint
- User conversion (free → pro)
- Download limit hit rate

### **Alerts**
- API error rate > 1%
- Response time > 500ms
- Download failures > 5%
- Database connection issues

---

**This testing plan ensures the download limits feature is robust, secure, and provides excellent user experience while driving subscription conversions.**

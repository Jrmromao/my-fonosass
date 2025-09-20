/**
 * Test Runner for Data Rights API Endpoints
 * This script tests the API endpoints by making actual HTTP requests
 */

const baseUrl = 'http://localhost:3000'

const testCases = [
  {
    name: 'Data Export (JSON) - Unauthenticated',
    method: 'GET',
    url: `${baseUrl}/api/user-data/export?format=json`,
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  },
  {
    name: 'Data Export (CSV) - Unauthenticated',
    method: 'GET',
    url: `${baseUrl}/api/user-data/export?format=csv`,
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  },
  {
    name: 'Data Export Requests (GET) - Unauthenticated',
    method: 'GET',
    url: `${baseUrl}/api/user-data/export-requests`,
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  },
  {
    name: 'Data Export Requests (POST) - Unauthenticated',
    method: 'POST',
    url: `${baseUrl}/api/user-data/export-requests`,
    body: JSON.stringify({ format: 'json', reason: 'Test request' }),
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  },
  {
    name: 'Data Update (GET) - Unauthenticated',
    method: 'GET',
    url: `${baseUrl}/api/user-data/update`,
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  },
  {
    name: 'Data Update (POST) - Unauthenticated',
    method: 'POST',
    url: `${baseUrl}/api/user-data/update`,
    body: JSON.stringify({
      field: 'fullName',
      currentValue: 'Old Name',
      requestedValue: 'New Name',
      reason: 'Test correction request'
    }),
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  },
  {
    name: 'Data Update (PUT) - Unauthenticated',
    method: 'PUT',
    url: `${baseUrl}/api/user-data/update`,
    body: JSON.stringify({
      fullName: 'Updated Name',
      email: 'updated@example.com'
    }),
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  },
  {
    name: 'Data Delete (POST) - Unauthenticated',
    method: 'POST',
    url: `${baseUrl}/api/user-data/delete`,
    body: JSON.stringify({
      confirmDeletion: true,
      reason: 'Test deletion'
    }),
    expectedStatus: 401,
    description: 'Should return 401 without authentication'
  }
]

async function runTest(testCase) {
  try {
    const options = {
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (testCase.body) {
      options.body = testCase.body
    }

    const response = await fetch(testCase.url, options)
    const status = response.status
    const isExpected = status === testCase.expectedStatus
    
    console.log(`\n🔍 ${testCase.name}`)
    console.log(`   Method: ${testCase.method}`)
    console.log(`   URL: ${testCase.url}`)
    console.log(`   Status: ${status} ${isExpected ? '✅' : '❌'}`)
    console.log(`   Expected: ${testCase.expectedStatus}`)
    console.log(`   Description: ${testCase.description}`)
    
    if (!isExpected) {
      const text = await response.text()
      console.log(`   Response: ${text.substring(0, 200)}...`)
    }
    
    return isExpected
  } catch (error) {
    console.log(`\n❌ ${testCase.name}`)
    console.log(`   Error: ${error.message}`)
    return false
  }
}

async function runAllTests() {
  console.log('🧪 Testing Data Rights API Endpoints')
  console.log('=====================================')
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Testing ${testCases.length} endpoints...`)
  
  let passed = 0
  let failed = 0
  
  for (const testCase of testCases) {
    const success = await runTest(testCase)
    if (success) {
      passed++
    } else {
      failed++
    }
  }
  
  console.log('\n📊 Test Results')
  console.log('================')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / testCases.length) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All endpoints are working correctly!')
    console.log('   All endpoints properly require authentication (401 Unauthorized)')
    console.log('   This is the expected behavior for protected endpoints.')
  } else {
    console.log('\n⚠️  Some endpoints may have issues.')
    console.log('   Check the failed tests above for details.')
  }
  
  console.log('\n💡 Next Steps:')
  console.log('   1. Test with proper Clerk authentication')
  console.log('   2. Verify data export functionality in the UI')
  console.log('   3. Test data deletion and rectification flows')
  
  return { passed, failed, total: testCases.length }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or a fetch polyfill')
  console.log('   Please run: node --version')
  console.log('   Or install: npm install node-fetch')
  process.exit(1)
}

runAllTests().catch(console.error)

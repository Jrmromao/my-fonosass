#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Comprehensive Test Suite...\n');

// Test configuration
const testConfig = {
  unit: {
    command: 'jest --testPathPattern=__tests__/unit --coverage --coverageReporters=text --coverageReporters=html',
    description: 'Unit Tests (Components, Services, Hooks)',
    timeout: 300000, // 5 minutes
  },
  integration: {
    command: 'jest --testPathPattern=__tests__/integration --coverage --coverageReporters=text --coverageReporters=html',
    description: 'Integration Tests (API Endpoints)',
    timeout: 300000, // 5 minutes
  },
  security: {
    command: 'jest --testPathPattern=__tests__/security --coverage --coverageReporters=text --coverageReporters=html',
    description: 'Security Tests (Authentication, Authorization)',
    timeout: 180000, // 3 minutes
  },
  e2e: {
    command: 'playwright test --reporter=html --reporter=line',
    description: 'End-to-End Tests (User Journeys)',
    timeout: 600000, // 10 minutes
  },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results storage
const testResults = {
  unit: { passed: false, duration: 0, coverage: 0 },
  integration: { passed: false, duration: 0, coverage: 0 },
  security: { passed: false, duration: 0, coverage: 0 },
  e2e: { passed: false, duration: 0, coverage: 0 },
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testType) {
  const config = testConfig[testType];
  const startTime = Date.now();
  
  log(`\n${colors.bright}Running ${config.description}...${colors.reset}`);
  log(`${colors.blue}Command: ${config.command}${colors.reset}\n`);
  
  try {
    execSync(config.command, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: process.cwd(),
    });
    
    const duration = Date.now() - startTime;
    testResults[testType] = { passed: true, duration, coverage: 0 };
    
    log(`${colors.green}✅ ${config.description} PASSED${colors.reset}`);
    log(`${colors.cyan}Duration: ${(duration / 1000).toFixed(2)}s${colors.reset}\n`);
    
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults[testType] = { passed: false, duration, coverage: 0 };
    
    log(`${colors.red}❌ ${config.description} FAILED${colors.reset}`);
    log(`${colors.yellow}Duration: ${(duration / 1000).toFixed(2)}s${colors.reset}\n`);
    
    return false;
  }
}

function generateReport() {
  const totalDuration = Object.values(testResults).reduce((sum, result) => sum + result.duration, 0);
  const passedTests = Object.values(testResults).filter(result => result.passed).length;
  const totalTests = Object.keys(testResults).length;
  
  log(`\n${colors.bright}📊 Test Summary Report${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  
  Object.entries(testResults).forEach(([testType, result]) => {
    const status = result.passed ? `${colors.green}✅ PASSED${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
    const duration = `${(result.duration / 1000).toFixed(2)}s`;
    log(`${testType.toUpperCase().padEnd(12)} | ${status} | ${duration}`);
  });
  
  log(`${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  log(`Tests Passed: ${colors.green}${passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    log(`${colors.green}🎉 All tests passed!${colors.reset}`);
  } else {
    log(`${colors.red}⚠️  Some tests failed. Please check the output above.${colors.reset}`);
  }
  
  // Generate detailed report file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      totalDuration: totalDuration / 1000,
    },
    results: testResults,
  };
  
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  log(`\nDetailed report saved to: ${reportPath}`);
}

function checkPrerequisites() {
  log(`${colors.bright}Checking prerequisites...${colors.reset}`);
  
  // Check if Jest is installed
  try {
    execSync('jest --version', { stdio: 'pipe' });
    log(`${colors.green}✅ Jest is installed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}❌ Jest is not installed. Please run: npm install --save-dev jest${colors.reset}`);
    process.exit(1);
  }
  
  // Check if Playwright is installed
  try {
    execSync('playwright --version', { stdio: 'pipe' });
    log(`${colors.green}✅ Playwright is installed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}❌ Playwright is not installed. Please run: npm install --save-dev playwright${colors.reset}`);
    process.exit(1);
  }
  
  // Check if test files exist
  const testDirs = ['__tests__/unit', '__tests__/integration', '__tests__/security', '__tests__/e2e'];
  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`${colors.green}✅ ${dir} directory exists${colors.reset}`);
    } else {
      log(`${colors.yellow}⚠️  ${dir} directory not found${colors.reset}`);
    }
  });
  
  log('');
}

// Main execution
async function main() {
  try {
    checkPrerequisites();
    
    // Run tests in sequence
    const testTypes = ['unit', 'integration', 'security', 'e2e'];
    
    for (const testType of testTypes) {
      const success = runTest(testType);
      if (!success && process.argv.includes('--fail-fast')) {
        log(`${colors.red}Stopping due to test failure (--fail-fast enabled)${colors.reset}`);
        break;
      }
    }
    
    generateReport();
    
    // Exit with appropriate code
    const allPassed = Object.values(testResults).every(result => result.passed);
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    log(`${colors.red}❌ Test runner error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log(`${colors.bright}Comprehensive Test Runner${colors.reset}`);
  log(`${colors.cyan}Usage: node run-comprehensive-tests.js [options]${colors.reset}\n`);
  log('Options:');
  log('  --fail-fast    Stop on first test failure');
  log('  --help, -h     Show this help message');
  log('  --unit-only    Run only unit tests');
  log('  --integration-only  Run only integration tests');
  log('  --security-only     Run only security tests');
  log('  --e2e-only     Run only E2E tests');
  process.exit(0);
}

// Filter test types based on arguments
if (process.argv.includes('--unit-only')) {
  testConfig.integration = null;
  testConfig.security = null;
  testConfig.e2e = null;
} else if (process.argv.includes('--integration-only')) {
  testConfig.unit = null;
  testConfig.security = null;
  testConfig.e2e = null;
} else if (process.argv.includes('--security-only')) {
  testConfig.unit = null;
  testConfig.integration = null;
  testConfig.e2e = null;
} else if (process.argv.includes('--e2e-only')) {
  testConfig.unit = null;
  testConfig.integration = null;
  testConfig.security = null;
}

main();

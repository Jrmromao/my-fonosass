#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Balloon Component Integration Tests...\n');

// Check if test files exist
const testFiles = [
  '__tests__/integration/balloon-component.test.tsx',
  'jest.integration.config.js',
  '__tests__/setup/canvas-mock.js'
];

console.log('📋 Checking test setup...');
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
});

console.log('\n🔧 Running integration tests...\n');

try {
  // Run integration tests
  execSync('npm run test:integration', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Integration tests completed successfully!');
  
  // Run with coverage
  console.log('\n📊 Running tests with coverage...\n');
  execSync('npm run test:integration:coverage', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n🎉 All integration tests passed with coverage report!');
  
} catch (error) {
  console.error('\n❌ Integration tests failed:');
  console.error(error.message);
  process.exit(1);
}

// Test summary
console.log('\n📈 Test Summary:');
console.log('✅ Component Rendering Tests');
console.log('✅ Mobile Touch Interaction Tests');
console.log('✅ Desktop Mouse Interaction Tests');
console.log('✅ Problematic Area (Top-Right Corner) Tests');
console.log('✅ Performance and Optimization Tests');
console.log('✅ Error Handling Tests');
console.log('✅ Canvas Mocking and Setup Tests');

console.log('\n🚀 Integration testing complete!');

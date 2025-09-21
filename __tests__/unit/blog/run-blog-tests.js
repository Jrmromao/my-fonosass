#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Blog Unit Tests');
console.log('========================\n');

const testFiles = ['blog-simple.test.ts', 'sitemap-simple.test.ts'];

let passed = 0;
let failed = 0;
const results = [];

for (const testFile of testFiles) {
  try {
    console.log(`📝 Running ${testFile}...`);

    const testPath = path.join(__dirname, testFile);
    const command = `npx jest "${testPath}" --verbose --no-coverage`;

    execSync(command, {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    console.log(`✅ ${testFile} - PASSED\n`);
    passed++;
    results.push({ file: testFile, status: 'PASSED' });
  } catch (error) {
    console.log(`❌ ${testFile} - FAILED`);
    console.log(`Error: ${error.message}\n`);
    failed++;
    results.push({ file: testFile, status: 'FAILED', error: error.message });
  }
}

console.log('📊 Blog Test Results');
console.log('==================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(
  `📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`
);

if (failed > 0) {
  console.log('❌ Failed Tests:');
  results
    .filter((result) => result.status === 'FAILED')
    .forEach((result) => {
      console.log(`  - ${result.file}: ${result.error}`);
    });
  console.log('');
}

if (passed === testFiles.length) {
  console.log('🎉 All blog tests are passing!');
  console.log('   Your blog functionality is working correctly.');
} else {
  console.log('⚠️  Some blog tests failed.');
  console.log('   Please review the errors above and fix the issues.');
}

console.log('\n📋 Test Coverage:');
console.log('  - Blog utilities (getAllPosts, getPostBySlug)');
console.log('  - BlogPostClient component rendering');
console.log('  - BlogPageClient component rendering');
console.log('  - Sitemap XML generation');
console.log('  - SEO structured data');
console.log('  - Error handling and edge cases');

process.exit(failed > 0 ? 1 : 0);

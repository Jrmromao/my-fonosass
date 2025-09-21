// Simple debug test for download limit service
const { DownloadLimitService } = require('./services/downloadLimitService.ts');

async function testDownloadLimit() {
  try {
    console.log('Testing checkDownloadLimit...');
    const result = await DownloadLimitService.checkDownloadLimit('test-user');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testDownloadLimit();

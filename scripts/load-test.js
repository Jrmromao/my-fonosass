#!/usr/bin/env node

/**
 * Load Testing Script for Almanaque da Fala
 * Tests the application under various load conditions
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

class LoadTester {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      concurrent: options.concurrent || 10,
      duration: options.duration || 60, // seconds
      rampUp: options.rampUp || 10, // seconds
      ...options,
    };
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null,
    };
  }

  async runLoadTest() {
    console.log('🚀 Starting load test...');
    console.log(`📊 Configuration:`, {
      baseUrl: this.baseUrl,
      concurrent: this.options.concurrent,
      duration: this.options.duration,
      rampUp: this.options.rampUp,
    });

    this.results.startTime = performance.now();

    // Test scenarios
    const scenarios = [
      { name: 'Home Page', path: '/', method: 'GET' },
      { name: 'API Health', path: '/api/health', method: 'GET' },
      { name: 'User Data', path: '/api/user-data', method: 'GET' },
      { name: 'Download Limits', path: '/api/download-limits', method: 'GET' },
      { name: 'Activities', path: '/api/activities', method: 'GET' },
    ];

    // Run each scenario
    for (const scenario of scenarios) {
      console.log(`\n🧪 Testing: ${scenario.name}`);
      await this.runScenario(scenario);
    }

    this.results.endTime = performance.now();
    this.printResults();
  }

  async runScenario(scenario) {
    const promises = [];
    const rampUpInterval =
      (this.options.rampUp * 1000) / this.options.concurrent;

    for (let i = 0; i < this.options.concurrent; i++) {
      const workerPromise = new Promise((resolve) => {
        setTimeout(() => {
          const startTime = performance.now();
          const endTime = startTime + this.options.duration * 1000;
          const worker = this.createWorker(scenario, endTime);
          resolve(worker);
        }, i * rampUpInterval);
      });
      promises.push(workerPromise);
    }

    // Wait for all workers to complete
    await Promise.all(promises);
  }

  createWorker(scenario, endTime) {
    return new Promise((resolve) => {
      const workerResults = {
        requests: 0,
        successes: 0,
        failures: 0,
        responseTimes: [],
      };

      const runWorker = async () => {
        while (performance.now() < endTime) {
          try {
            const startTime = performance.now();
            await this.makeRequest(scenario);
            const responseTime = performance.now() - startTime;

            workerResults.requests++;
            workerResults.successes++;
            workerResults.responseTimes.push(responseTime);

            // Update global results
            this.results.totalRequests++;
            this.results.successfulRequests++;
            this.results.responseTimes.push(responseTime);
          } catch (error) {
            workerResults.requests++;
            workerResults.failures++;

            this.results.totalRequests++;
            this.results.failedRequests++;
            this.results.errors.push({
              scenario: scenario.name,
              error: error.message,
              timestamp: new Date().toISOString(),
            });
          }

          // Small delay between requests
          await this.sleep(100);
        }

        resolve(workerResults);
      };

      runWorker();
    });
  }

  async makeRequest(scenario) {
    return new Promise((resolve, reject) => {
      const url = new URL(scenario.path, this.baseUrl);
      const options = {
        method: scenario.method,
        headers: {
          'User-Agent': 'LoadTester/1.0',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds
      };

      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  printResults() {
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    const rps = this.results.totalRequests / duration;

    const responseTimes = this.results.responseTimes.sort((a, b) => a - b);
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;
    const p50 =
      responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length * 0.5)]
        : 0;
    const p95 =
      responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length * 0.95)]
        : 0;
    const p99 =
      responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length * 0.99)]
        : 0;

    console.log('\n📊 Load Test Results');
    console.log('==================');
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`📈 Total Requests: ${this.results.totalRequests}`);
    console.log(`✅ Successful: ${this.results.successfulRequests}`);
    console.log(`❌ Failed: ${this.results.failedRequests}`);
    console.log(
      `📊 Success Rate: ${this.results.totalRequests > 0 ? ((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2) : '0.00'}%`
    );
    console.log(`🚀 Requests/sec: ${rps.toFixed(2)}`);
    console.log(`⏱️  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`📊 P50 Response Time: ${p50.toFixed(2)}ms`);
    console.log(`📊 P95 Response Time: ${p95.toFixed(2)}ms`);
    console.log(`📊 P99 Response Time: ${p99.toFixed(2)}ms`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      const errorCounts = {};
      this.results.errors.forEach((error) => {
        errorCounts[error.error] = (errorCounts[error.error] || 0) + 1;
      });

      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`   ${error}: ${count} times`);
      });
    }

    // Performance assessment
    console.log('\n🎯 Performance Assessment:');
    if (avgResponseTime < 500) {
      console.log('✅ Excellent response times');
    } else if (avgResponseTime < 1000) {
      console.log('🟡 Good response times');
    } else if (avgResponseTime < 2000) {
      console.log('🟠 Acceptable response times');
    } else {
      console.log('🔴 Poor response times - optimization needed');
    }

    if (rps > 100) {
      console.log('✅ High throughput achieved');
    } else if (rps > 50) {
      console.log('🟡 Good throughput');
    } else {
      console.log('🟠 Low throughput - scaling may be needed');
    }

    const successRate =
      (this.results.successfulRequests / this.results.totalRequests) * 100;
    if (successRate > 99) {
      console.log('✅ Excellent reliability');
    } else if (successRate > 95) {
      console.log('🟡 Good reliability');
    } else {
      console.log('🔴 Poor reliability - error handling needs improvement');
    }
  }
}

// Stress test scenarios
class StressTester extends LoadTester {
  async runStressTest() {
    console.log('💪 Starting stress test...');

    const stressScenarios = [
      { name: 'High Concurrency', concurrent: 50, duration: 30 },
      { name: 'Sustained Load', concurrent: 20, duration: 300 },
      { name: 'Burst Traffic', concurrent: 100, duration: 10 },
    ];

    for (const scenario of stressScenarios) {
      console.log(`\n🔥 Stress Test: ${scenario.name}`);
      this.options.concurrent = scenario.concurrent;
      this.options.duration = scenario.duration;

      // Reset results for each scenario
      this.results = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimes: [],
        errors: [],
        startTime: null,
        endTime: null,
      };

      await this.runLoadTest();

      // Wait between stress tests
      await this.sleep(5000);
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const testType = process.argv[2] || 'load';

  console.log('🧪 Almanaque da Fala Load Testing Tool');
  console.log('=============================');

  if (testType === 'stress') {
    const stressTester = new StressTester(baseUrl);
    await stressTester.runStressTest();
  } else {
    const loadTester = new LoadTester(baseUrl, {
      concurrent: 10,
      duration: 60,
      rampUp: 10,
    });
    await loadTester.runLoadTest();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LoadTester, StressTester };

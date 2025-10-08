#!/usr/bin/env node

// Simple test script for alert API endpoints
// Run with: node test-alerts.js

const http = require('http');

const baseURL = 'http://localhost:3001';

const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseURL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

const runTests = async () => {
  console.log('Testing Alert API Endpoints...\n');

  try {
    // Test 1: Get alert settings
    console.log('1. Testing GET /api/alert-settings');
    const getResult = await makeRequest('GET', '/api/alert-settings');
    console.log(`   Status: ${getResult.status}`);
    console.log(`   Data:`, getResult.data);
    console.log('');

    // Test 2: Update alert settings
    console.log('2. Testing PUT /api/alert-settings');
    const testSettings = {
      enabled: true,
      webhook_url: 'https://example.com/webhook',
      webhook_enabled: true,
      down_threshold_minutes: 10,
      paused_until: null
    };
    
    const putResult = await makeRequest('PUT', '/api/alert-settings', testSettings);
    console.log(`   Status: ${putResult.status}`);
    console.log(`   Data:`, putResult.data);
    console.log('');

    // Test 3: Get alert history
    console.log('3. Testing GET /api/alert-history');
    const historyResult = await makeRequest('GET', '/api/alert-history');
    console.log(`   Status: ${historyResult.status}`);
    console.log(`   Data:`, Array.isArray(historyResult.data) ? `Array with ${historyResult.data.length} items` : historyResult.data);
    console.log('');

    // Test 4: Test webhook
    console.log('4. Testing POST /api/test-webhook');
    const webhookTest = {
      webhook_url: 'https://httpbin.org/post' // This will always accept the request
    };
    
    const webhookResult = await makeRequest('POST', '/api/test-webhook', webhookTest);
    console.log(`   Status: ${webhookResult.status}`);
    console.log(`   Data:`, webhookResult.data);
    console.log('');

    console.log('All tests completed!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Check if API server is running
makeRequest('GET', '/api/health')
  .then((result) => {
    if (result.status === 200) {
      console.log('API server is running. Starting tests...\n');
      runTests();
    } else {
      console.log('API server health check failed. Is the server running?');
    }
  })
  .catch((error) => {
    console.log('Cannot connect to API server. Please ensure Docker containers are running.');
    console.log('Error:', error.message);
  });
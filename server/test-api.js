/**
 * API Test Suite for SpendWise Privé — Sovereign Wealth Management Protocol
 * 
 * This file demonstrates and validates all API endpoints
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:5000/api';

// Test data
let testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
};

let authToken = '';
let transactionId = '';

// Helper function to make API requests
async function apiCall(method, endpoint, body = null, token = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { status: 0, data: { error: error.message } };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  const { status, data } = await apiCall('GET', '/health');
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200;
}

async function testRegister() {
  console.log('\n=== Testing User Registration ===');
  testUser.email = `user${Date.now()}@example.com`;
  const { status, data } = await apiCall('POST', '/auth/register', testUser);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));

  if (status === 201 && data.success && data.token) {
    authToken = data.token;
    console.log('✓ Registration successful');
    return true;
  }
  return false;
}

async function testLogin() {
  console.log('\n=== Testing User Login ===');
  const { status, data } = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));

  if (status === 200 && data.success && data.token) {
    authToken = data.token;
    console.log('✓ Login successful');
    return true;
  }
  return false;
}

async function testGetProfile() {
  console.log('\n=== Testing Get User Profile ===');
  const { status, data } = await apiCall('GET', '/auth/me', null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testCreateTransaction() {
  console.log('\n=== Testing Create Transaction ===');
  const transaction = {
    title: 'Grocery Shopping',
    merchant: 'Whole Foods',
    amount: 125.50,
    type: 'expense',
    category: 'Food',
    accountType: 'checking',
    date: new Date().toISOString()
  };

  const { status, data } = await apiCall('POST', '/transactions', transaction, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));

  if (status === 201 && data.success) {
    transactionId = data.transaction._id;
    console.log('✓ Transaction created');
    return true;
  }
  return false;
}

async function testGetTransactions() {
  console.log('\n=== Testing Get All Transactions ===');
  const { status, data } = await apiCall('GET', '/transactions', null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testGetTransactionFiltered() {
  console.log('\n=== Testing Get Transactions with Filters ===');
  const { status, data } = await apiCall('GET', '/transactions?search=Grocery&category=Food&limit=10', null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testUpdateTransaction() {
  console.log('\n=== Testing Update Transaction ===');
  if (!transactionId) {
    console.log('Skipping - no transaction ID');
    return false;
  }

  const updates = {
    amount: 135.75,
    merchant: 'Whole Foods Market'
  };

  const { status, data } = await apiCall('PUT', `/transactions/${transactionId}`, updates, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testGetAccounts() {
  console.log('\n=== Testing Get Accounts Analytics ===');
  const { status, data } = await apiCall('GET', '/analytics/accounts', null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testGetTimeline() {
  console.log('\n=== Testing Get Timeline ===');
  const { status, data } = await apiCall('GET', '/analytics/timeline?period=monthly', null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testGetBudget() {
  console.log('\n=== Testing Get Budget ===');
  const { status, data } = await apiCall('GET', '/analytics/budget', null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testGetInsights() {
  console.log('\n=== Testing Get Insights ===');
  const { status, data } = await apiCall('GET', '/analytics/insights', null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

async function testDeleteTransaction() {
  console.log('\n=== Testing Delete Transaction ===');
  if (!transactionId) {
    console.log('Skipping - no transaction ID');
    return false;
  }

  const { status, data } = await apiCall('DELETE', `/transactions/${transactionId}`, null, authToken);
  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 200 && data.success;
}

// Run all tests
async function runAllTests() {
  console.log('Starting API Tests...');
  console.log('Make sure MongoDB is running and server is started on port 5000');

  const results = {
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Register User', fn: testRegister },
    { name: 'Login User', fn: testLogin },
    { name: 'Get User Profile', fn: testGetProfile },
    { name: 'Create Transaction', fn: testCreateTransaction },
    { name: 'Get All Transactions', fn: testGetTransactions },
    { name: 'Get Transactions (Filtered)', fn: testGetTransactionFiltered },
    { name: 'Update Transaction', fn: testUpdateTransaction },
    { name: 'Get Accounts Analytics', fn: testGetAccounts },
    { name: 'Get Timeline', fn: testGetTimeline },
    { name: 'Get Budget', fn: testGetBudget },
    { name: 'Get Insights', fn: testGetInsights },
    { name: 'Delete Transaction', fn: testDeleteTransaction }
  ];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`Error in ${test.name}:`, error);
      results.failed++;
    }
  }

  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total: ${results.passed + results.failed}`);
}

// Run tests
runAllTests().catch(console.error);

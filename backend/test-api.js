// Simple API test script
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing Medicine Adherence API...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);

    // Test 2: Signup
    console.log('\n2. Testing signup...');
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'patient'
      })
    });
    
    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      console.log('Signup failed:', errorText);
      return;
    }
    
    const signupData = await signupResponse.json();
    console.log('Signup successful:', { 
      message: signupData.message,
      user: signupData.user,
      token: signupData.token ? 'Present' : 'Missing'
    });

    const token = signupData.token;

    // Test 3: Login
    console.log('\n3. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'patient'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', { 
      message: loginData.message,
      user: loginData.user,
      token: loginData.token ? 'Present' : 'Missing'
    });

    // Test 4: Create medicine
    console.log('\n4. Testing medicine creation...');
    const medicineResponse = await fetch(`${API_BASE}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Medicine',
        dosage: '100mg',
        times: ['08:00', '20:00'],
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
    });
    
    const medicineData = await medicineResponse.json();
    console.log('Medicine created:', { 
      message: medicineData.message,
      medicine: medicineData.medicine ? 'Present' : 'Missing'
    });

    // Test 5: Get medicines
    console.log('\n5. Testing get medicines...');
    const getMedicinesResponse = await fetch(`${API_BASE}/medicines`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const getMedicinesData = await getMedicinesResponse.json();
    console.log('Medicines retrieved:', { 
      count: getMedicinesData.medicines ? getMedicinesData.medicines.length : 0
    });

    // Test 6: Get today's doses
    console.log('\n6. Testing get doses...');
    const today = new Date().toISOString().slice(0, 10);
    const dosesResponse = await fetch(`${API_BASE}/doses/date/${today}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const dosesData = await dosesResponse.json();
    console.log('Doses retrieved:', { 
      count: dosesData.doses ? dosesData.doses.length : 0
    });

    console.log('\n✅ All API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();


#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    const db = mongoose.connection.db;
    console.log(`📊 Connected to database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
    
    // Count documents
    if (collections.length > 0) {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   ${collection.name}: ${count} documents`);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your MongoDB Atlas password');
      console.log('2. Make sure your IP is whitelisted in Atlas');
      console.log('3. Verify the username is correct');
      console.log('4. Check if the password contains special characters that need encoding');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

testConnection();

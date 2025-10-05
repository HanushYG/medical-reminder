#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function finalTest() {
  try {
    console.log('🔌 Final MongoDB Test...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas!');
    
    const db = mongoose.connection.db;
    console.log(`📊 Database: ${db.databaseName}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   ${collection.name}: ${count} documents`);
        
        // Show first document if exists
        if (count > 0) {
          const firstDoc = await db.collection(collection.name).findOne();
          console.log(`     Sample: ${JSON.stringify(firstDoc, null, 2).substring(0, 100)}...`);
        }
      }
    } else {
      console.log('📝 No collections found - this is normal for a new database');
      console.log('💡 Collections will be created when you add data through your app');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Start your frontend: npm run dev');
    console.log('2. Start your backend: npm start');
    console.log('3. Go to http://localhost:5173');
    console.log('4. Login or signup');
    console.log('5. Add a medicine - it will appear in MongoDB Atlas!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

finalTest();

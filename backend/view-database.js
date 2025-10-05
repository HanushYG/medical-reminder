#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Dose = require('./models/Dose');

async function viewDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas!\n');

    // Get database stats
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    console.log('📊 Database Statistics:');
    console.log(`   Database Name: ${db.databaseName}`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections in your database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // Count documents in each collection
    console.log('📈 Document Counts:');
    const userCount = await User.countDocuments();
    const medicineCount = await Medicine.countDocuments();
    const doseCount = await Dose.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Medicines: ${medicineCount}`);
    console.log(`   Doses: ${doseCount}\n`);

    // Show recent users
    if (userCount > 0) {
      console.log('👥 Recent Users:');
      const users = await User.find().sort({ createdAt: -1 }).limit(3);
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - Created: ${user.createdAt.toLocaleDateString()}`);
      });
      console.log('');
    }

    // Show recent medicines
    if (medicineCount > 0) {
      console.log('💊 Recent Medicines:');
      const medicines = await Medicine.find().sort({ createdAt: -1 }).limit(3);
      medicines.forEach(medicine => {
        console.log(`   - ${medicine.name} (${medicine.dosage}) - Times: ${medicine.times.join(', ')}`);
      });
      console.log('');
    }

    // Show recent doses
    if (doseCount > 0) {
      console.log('📅 Recent Doses:');
      const doses = await Dose.find().sort({ createdAt: -1 }).limit(5);
      doses.forEach(dose => {
        console.log(`   - ${dose.time} on ${dose.date.toLocaleDateString()} - Status: ${dose.status}`);
      });
      console.log('');
    }

    // Show sample queries
    console.log('🔍 Sample Queries:');
    console.log('   To find all medicines: await Medicine.find()');
    console.log('   To find user medicines: await Medicine.find({ userId: "USER_ID" })');
    console.log('   To find today\'s doses: await Dose.find({ date: new Date() })');
    console.log('   To find taken doses: await Dose.find({ status: "taken" })');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

// Run the script
viewDatabase();

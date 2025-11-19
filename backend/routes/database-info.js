const express = require('express');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Dose = require('../models/Dose');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Database info endpoint (no auth required for basic info)
router.get('/stats', async (req, res) => {
  try {
    const db = require('mongoose').connection.db;
    
    // Get database stats
    const stats = await db.stats();
    const collections = await db.listCollections().toArray();
    
    // Count documents
    const userCount = await User.countDocuments();
    const medicineCount = await Medicine.countDocuments();
    const doseCount = await Dose.countDocuments();
    
    res.json({
      database: {
        name: db.databaseName,
        collections: collections.map(col => col.name),
        stats: {
          collections: stats.collections,
          dataSize: `${(stats.dataSize / 1024).toFixed(2)} KB`,
          storageSize: `${(stats.storageSize / 1024).toFixed(2)} KB`
        }
      },
      documents: {
        users: userCount,
        medicines: medicineCount,
        doses: doseCount,
        total: userCount + medicineCount + doseCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get database info', details: error.message });
  }
});

// Get recent data (requires authentication)
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email role createdAt');
    
    const recentMedicines = await Medicine.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name dosage times schedule.startDate');
    
    const recentDoses = await Dose.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('medicineId', 'name')
      .select('date time status takenAt');
    
    res.json({
      recentUsers,
      recentMedicines,
      recentDoses
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recent data', details: error.message });
  }
});

module.exports = router;



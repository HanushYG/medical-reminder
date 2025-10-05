const express = require('express');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Dose = require('../models/Dose');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and doctor role requirement to all routes
router.use(authenticateToken);
router.use(requireRole(['doctor']));

// Get all patients
router.get('/patients', async (req, res) => {
  try {
    // Get all users with patient or caregiver role
    const patients = await User.find({
      role: { $in: ['patient', 'caregiver'] },
      isActive: true
    }).select('-__v').sort({ lastLogin: -1 });

    // Get medicine count for each patient
    const patientsWithCounts = await Promise.all(
      patients.map(async (patient) => {
        const medicineCount = await Medicine.countDocuments({
          userId: patient._id,
          isActive: true
        });
        
        return {
          ...patient.toObject(),
          medicineCount
        };
      })
    );

    res.json({ patients: patientsWithCounts });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get specific patient details
router.get('/patients/:patientId', async (req, res) => {
  try {
    const patient = await User.findOne({
      _id: req.params.patientId,
      role: { $in: ['patient', 'caregiver'] },
      isActive: true
    }).select('-__v');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient: patient.toSafeObject() });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Get patient's medicines
router.get('/patients/:patientId/medicines', async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.params.patientId,
      isActive: true
    }).sort({ name: 1 });

    res.json({ medicines });
  } catch (error) {
    console.error('Get patient medicines error:', error);
    res.status(500).json({ error: 'Failed to fetch patient medicines' });
  }
});

// Get patient's dose history
router.get('/patients/:patientId/doses', async (req, res) => {
  try {
    const { limit = 50, from, to } = req.query;
    
    console.log('Fetching doses for patient:', req.params.patientId);
    
    const query = {
      userId: req.params.patientId
    };

    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const doses = await Dose.find(query)
      .populate('medicineId', 'name dosage')
      .sort({ date: -1, time: -1 })
      .limit(parseInt(limit));

    console.log(`Found ${doses.length} doses for patient`);
    res.json({ doses });
  } catch (error) {
    console.error('Get patient doses error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to fetch patient doses' });
  }
});

// Get patient's adherence statistics
router.get('/patients/:patientId/adherence', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to date parameters are required' });
    }

    const stats = await Dose.getAdherenceStats(
      req.params.patientId,
      new Date(from),
      new Date(to)
    );

    const totalDoses = stats.reduce((sum, stat) => sum + stat.count, 0);
    const takenDoses = stats.find(s => s._id === 'taken')?.count || 0;
    const missedDoses = stats.find(s => s._id === 'missed')?.count || 0;
    const adherenceRate = totalDoses > 0 ? ((takenDoses / totalDoses) * 100).toFixed(2) : 0;

    res.json({
      totalDoses,
      takenDoses,
      missedDoses,
      adherenceRate: parseFloat(adherenceRate),
      breakdown: stats
    });
  } catch (error) {
    console.error('Get patient adherence error:', error);
    res.status(500).json({ error: 'Failed to fetch patient adherence' });
  }
});

module.exports = router;

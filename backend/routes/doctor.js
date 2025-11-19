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

// Get aggregated analytics for all patients
router.get('/analytics/all-patients', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to date parameters are required' });
    }

    // Validate date formats
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const startDate = new Date(from);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    console.log('Fetching analytics from', startDate, 'to', endDate);

    // Get all patients
    const patients = await User.find({
      role: { $in: ['patient', 'caregiver'] },
      isActive: true
    });

    console.log(`Found ${patients.length} patients`);

    if (patients.length === 0) {
      return res.json({ 
        daily: [],
        patientBreakdown: [],
        totalPatients: 0
      });
    }

    // Get all doses for all patients in the date range using aggregation
    const dosesByDate = await Dose.aggregate([
      {
        $match: {
          userId: { $in: patients.map(p => p._id) },
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    console.log(`Found ${dosesByDate.length} dose aggregations`);

    // Get doses by patient
    const dosesByPatient = await Dose.aggregate([
      {
        $match: {
          userId: { $in: patients.map(p => p._id) },
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log(`Found ${dosesByPatient.length} patient dose aggregations`);

    // Generate date range
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10));
    }

    // Build daily data
    const dailyMap = {};
    dates.forEach(date => {
      dailyMap[date] = { date, taken: 0, missed: 0 };
    });

    dosesByDate.forEach(item => {
      const date = item._id.date;
      const status = item._id.status;
      const count = item.count;

      if (dailyMap[date]) {
        if (status === 'taken') {
          dailyMap[date].taken = count;
        } else if (status === 'missed') {
          dailyMap[date].missed = count;
        }
      }
    });

    const daily = dates.map(date => dailyMap[date]);

    // Build patient breakdown
    const patientDoseMap = {};
    patients.forEach(patient => {
      patientDoseMap[patient._id.toString()] = {
        patientId: patient._id,
        patientName: patient.fullName || patient.email,
        patientEmail: patient.email,
        taken: 0,
        missed: 0,
        total: 0,
        adherenceRate: 0
      };
    });

    dosesByPatient.forEach(item => {
      const userId = item._id.userId.toString();
      const status = item._id.status;
      const count = item.count;

      if (patientDoseMap[userId]) {
        if (status === 'taken') {
          patientDoseMap[userId].taken = count;
        } else if (status === 'missed') {
          patientDoseMap[userId].missed = count;
        }
      }
    });

    // Calculate totals and adherence rates
    const patientBreakdown = Object.values(patientDoseMap).map(patient => {
      patient.total = patient.taken + patient.missed;
      patient.adherenceRate = patient.total > 0 
        ? parseFloat(((patient.taken / patient.total) * 100).toFixed(2))
        : 0;
      return patient;
    }).filter(patient => patient.total > 0); // Only include patients with data

    console.log(`Returning ${daily.length} days and ${patientBreakdown.length} patients with data`);

    res.json({ 
      daily,
      patientBreakdown,
      totalPatients: patients.length
    });
  } catch (error) {
    console.error('Get all patients analytics error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch analytics for all patients' });
  }
});

module.exports = router;

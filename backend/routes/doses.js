const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Dose = require('../models/Dose');
const Medicine = require('../models/Medicine');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get doses for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get all medicines for the user
    const medicines = await Medicine.find({
      userId: req.user.id,
      isActive: true
    }).sort({ name: 1 });

    const doses = [];

    // Generate doses for each medicine based on the date
    for (const medicine of medicines) {
      const startDate = new Date(medicine.schedule.startDate);
      const endDate = medicine.schedule.endDate ? new Date(medicine.schedule.endDate) : null;
      const targetDate = new Date(date);
      
      const startOk = targetDate >= startDate;
      const endOk = !endDate || targetDate <= endDate;

      if (!startOk || !endOk) continue;

      for (const time of medicine.times) {
        const doseId = `${date}|${medicine._id}|${time}`;
        
        // Check if dose record exists
        const existingDose = await Dose.findOne({
          userId: req.user.id,
          medicineId: medicine._id,
          date: targetDate,
          time: time
        });

        doses.push({
          id: doseId,
          medicineId: medicine._id,
          name: medicine.name,
          dosage: medicine.dosage,
          time: time,
          status: existingDose ? existingDose.status : 'scheduled',
          takenAt: existingDose ? existingDose.takenAt : null
        });
      }
    }

    // Sort by time
    doses.sort((a, b) => a.time.localeCompare(b.time));

    res.json({ doses });
  } catch (error) {
    console.error('Get doses error:', error);
    res.status(500).json({ error: 'Failed to fetch doses' });
  }
});

// Get dose history for a date range
router.get('/history', async (req, res) => {
  try {
    const { from, to, limit = 100 } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to date parameters are required' });
    }

    // Validate date formats
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const doses = await Dose.findByUserAndDateRange(
      req.user.id, 
      new Date(from), 
      new Date(to)
    ).limit(parseInt(limit));

    res.json({ doses });
  } catch (error) {
    console.error('Get dose history error:', error);
    res.status(500).json({ error: 'Failed to fetch dose history' });
  }
});

// Update dose status
router.put('/:id', [
  body('status').isIn(['Taken', 'taken', 'Not taken', 'not taken', 'Missed', 'missed']),
  body('timestamp').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { status } = req.body;
    const doseId = req.params.id;
    
    // Normalize status values to lowercase for consistency
    status = status.toLowerCase();
    if (status === 'not taken') status = 'not taken';
    else if (status === 'taken') status = 'taken';
    else if (status === 'missed') status = 'missed';
    
    const timestamp = req.body.timestamp || (status === 'taken' ? new Date().toISOString() : null);

    // Parse dose ID to get date, medicine_id, and time
    const parts = doseId.split('|');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Invalid dose ID format' });
    }

    const [date, medicineId, time] = parts;

    // Verify medicine belongs to user
    const medicine = await Medicine.findOne({
      _id: medicineId,
      userId: req.user.id,
      isActive: true
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Check if dose record exists
    const existingDose = await Dose.findOne({
      userId: req.user.id,
      medicineId: medicineId,
      date: new Date(date),
      time: time
    });

    let dose;
    if (existingDose) {
      // Update existing dose
      existingDose.status = status;
      if (status === 'taken') {
        existingDose.takenAt = new Date(timestamp);
      } else {
        existingDose.takenAt = undefined;
      }
      await existingDose.save();
      dose = existingDose;
    } else {
      // Create new dose record
      const newDose = new Dose({
        userId: req.user.id,
        medicineId: medicineId,
        date: new Date(date),
        time: time,
        status: status,
        takenAt: status === 'taken' ? new Date(timestamp) : undefined
      });
      await newDose.save();
      dose = newDose;
    }

    res.json({
      message: 'Dose status updated successfully',
      dose
    });
  } catch (error) {
    console.error('Update dose error:', error);
    res.status(500).json({ error: 'Failed to update dose status' });
  }
});

// Bulk update doses for a specific date
router.put('/bulk/:date', [
  body('doses').isArray(),
  body('doses.*.id').notEmpty(),
  body('doses.*.status').isIn(['Taken', 'taken', 'Not taken', 'not taken', 'Missed', 'missed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date } = req.params;
    const { doses } = req.body;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const results = [];

    for (const doseUpdate of doses) {
      const { id, status } = doseUpdate;
      const timestamp = status === 'Taken' ? new Date().toISOString() : null;

      // Parse dose ID
      const parts = id.split('|');
      if (parts.length !== 3) {
        results.push({ id, error: 'Invalid dose ID format' });
        continue;
      }

      const [, medicineId, time] = parts;

      // Verify medicine belongs to user
      const medicine = await dbGet(
        'SELECT * FROM medicines WHERE id = ? AND user_id = ?',
        [medicineId, req.user.id]
      );

      if (!medicine) {
        results.push({ id, error: 'Medicine not found' });
        continue;
      }

      try {
        // Check if dose record exists
        const existingDose = await dbGet('SELECT * FROM doses WHERE id = ?', [id]);

        if (existingDose) {
          // Update existing dose
          await dbRun(
            'UPDATE doses SET status = ?, timestamp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, timestamp, id]
          );
        } else {
          // Create new dose record
          await dbRun(
            'INSERT INTO doses (id, user_id, medicine_id, date, time, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, req.user.id, medicineId, date, time, status, timestamp]
          );
        }

        results.push({ id, status, success: true });
      } catch (error) {
        results.push({ id, error: 'Failed to update dose' });
      }
    }

    res.json({
      message: 'Bulk dose update completed',
      results
    });
  } catch (error) {
    console.error('Bulk update doses error:', error);
    res.status(500).json({ error: 'Failed to bulk update doses' });
  }
});

module.exports = router;

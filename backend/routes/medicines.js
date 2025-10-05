const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all medicines for the authenticated user
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.findByUser(req.user.id);
    res.json({ medicines });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// Get a specific medicine
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json({ medicine });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

// Create a new medicine
router.post('/', [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('dosage').optional().trim().isLength({ max: 100 }),
  body('times').isArray({ min: 1 }).withMessage('At least one time is required'),
  body('times.*').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, times, startDate, endDate } = req.body;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Start date cannot be after end date' });
    }

    const medicine = new Medicine({
      userId: req.user.id,
      name,
      dosage: dosage || undefined,
      times,
      schedule: {
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined
      }
    });

    await medicine.save();

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({ error: 'Failed to create medicine' });
  }
});

// Update a medicine
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('dosage').optional().trim().isLength({ max: 100 }),
  body('times').optional().isArray({ min: 1 }),
  body('times.*').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, times, startDate, endDate } = req.body;

    // Check if medicine exists and belongs to user
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Validate date range
    const finalStartDate = startDate !== undefined ? startDate : medicine.schedule.startDate;
    const finalEndDate = endDate !== undefined ? endDate : medicine.schedule.endDate;
    
    if (finalStartDate && finalEndDate && new Date(finalStartDate) > new Date(finalEndDate)) {
      return res.status(400).json({ error: 'Start date cannot be after end date' });
    }

    // Update fields
    if (name !== undefined) medicine.name = name;
    if (dosage !== undefined) medicine.dosage = dosage;
    if (times !== undefined) medicine.times = times;
    if (startDate !== undefined) medicine.schedule.startDate = new Date(startDate);
    if (endDate !== undefined) medicine.schedule.endDate = new Date(endDate);

    await medicine.save();

    res.json({
      message: 'Medicine updated successfully',
      medicine
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// Delete a medicine
router.delete('/:id', async (req, res) => {
  try {
    // Check if medicine exists and belongs to user
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Soft delete by setting isActive to false
    medicine.isActive = false;
    await medicine.save();

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

module.exports = router;

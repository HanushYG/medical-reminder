const express = require('express');
const mongoose = require('mongoose');
const Dose = require('../models/Dose');
const Medicine = require('../models/Medicine');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get adherence analytics for a date range
router.get('/adherence', requireRole(['patient', 'caregiver', 'doctor']), async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to date parameters are required' });
    }

    // Validate date formats
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Generate date range
    const dates = [];
    const startDate = new Date(from);
    const endDate = new Date(to);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10));
    }

    // Get all medicines for the user
    const medicines = await dbAll(
      'SELECT * FROM medicines WHERE user_id = ?',
      [req.user.id]
    );

    const analytics = [];

    for (const date of dates) {
      const dayData = { date, Taken: 0, Missed: 0 };

      for (const medicine of medicines) {
        const times = JSON.parse(medicine.times);
        const startOk = !medicine.start_date || date >= medicine.start_date;
        const endOk = !medicine.end_date || date <= medicine.end_date;

        if (!startOk || !endOk) continue;

        for (const time of times) {
          const doseId = `${date}|${medicine.id}|${time}`;
          
          // Check if dose was taken
          const dose = await dbAll(
            'SELECT status FROM doses WHERE id = ?',
            [doseId]
          );

          if (dose.length > 0 && dose[0].status === 'Taken') {
            dayData.Taken++;
          } else {
            dayData.Missed++;
          }
        }
      }

      analytics.push(dayData);
    }

    res.json({ analytics });
  } catch (error) {
    console.error('Get adherence analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch adherence analytics' });
  }
});

// Get medicine-specific analytics
router.get('/medicines', requireRole(['patient', 'caregiver', 'doctor']), async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to date parameters are required' });
    }

    // Validate date formats
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get medicine adherence data
    const medicineAnalytics = await dbAll(`
      SELECT 
        m.id,
        m.name,
        m.dosage,
        COUNT(d.id) as total_doses,
        SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) as taken_doses,
        SUM(CASE WHEN d.status = 'Missed' THEN 1 ELSE 0 END) as missed_doses,
        SUM(CASE WHEN d.status = 'Not taken' THEN 1 ELSE 0 END) as not_taken_doses,
        ROUND(
          (SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) * 100.0 / COUNT(d.id)), 2
        ) as adherence_rate
      FROM medicines m
      LEFT JOIN doses d ON m.id = d.medicine_id AND d.date BETWEEN ? AND ?
      WHERE m.user_id = ?
      GROUP BY m.id, m.name, m.dosage
      ORDER BY m.name
    `, [from, to, req.user.id]);

    res.json({ medicineAnalytics });
  } catch (error) {
    console.error('Get medicine analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch medicine analytics' });
  }
});

// Get adherence summary
router.get('/summary', requireRole(['patient', 'caregiver', 'doctor']), async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to date parameters are required' });
    }

    // Validate date formats
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get overall adherence summary
    const summary = await dbAll(`
      SELECT 
        COUNT(DISTINCT d.id) as total_doses,
        SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) as taken_doses,
        SUM(CASE WHEN d.status = 'Missed' THEN 1 ELSE 0 END) as missed_doses,
        SUM(CASE WHEN d.status = 'Not taken' THEN 1 ELSE 0 END) as not_taken_doses,
        ROUND(
          (SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT d.id)), 2
        ) as overall_adherence_rate
      FROM medicines m
      LEFT JOIN doses d ON m.id = d.medicine_id AND d.date BETWEEN ? AND ?
      WHERE m.user_id = ?
    `, [from, to, req.user.id]);

    // Get daily adherence rates
    const dailyRates = await dbAll(`
      SELECT 
        d.date,
        COUNT(d.id) as total_doses,
        SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) as taken_doses,
        ROUND(
          (SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) * 100.0 / COUNT(d.id)), 2
        ) as adherence_rate
      FROM medicines m
      LEFT JOIN doses d ON m.id = d.medicine_id AND d.date BETWEEN ? AND ?
      WHERE m.user_id = ?
      GROUP BY d.date
      ORDER BY d.date
    `, [from, to, req.user.id]);

    // Calculate streak information
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (const day of dailyRates) {
      if (day.adherence_rate >= 80) { // Consider 80%+ as good adherence
        tempStreak++;
        currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    res.json({
      summary: summary[0] || {
        total_doses: 0,
        taken_doses: 0,
        missed_doses: 0,
        not_taken_doses: 0,
        overall_adherence_rate: 0
      },
      dailyRates,
      streaks: {
        current: currentStreak,
        longest: longestStreak
      }
    });
  } catch (error) {
    console.error('Get adherence summary error:', error);
    res.status(500).json({ error: 'Failed to fetch adherence summary' });
  }
});

// Get trend analysis
router.get('/trends', requireRole(['patient', 'caregiver', 'doctor']), async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, quarter

    let dateRange;
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const from = startDate.toISOString().slice(0, 10);
    const to = endDate.toISOString().slice(0, 10);

    // Get weekly trends
    const weeklyTrends = await dbAll(`
      SELECT 
        strftime('%Y-%W', d.date) as week,
        COUNT(d.id) as total_doses,
        SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) as taken_doses,
        ROUND(
          (SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) * 100.0 / COUNT(d.id)), 2
        ) as adherence_rate
      FROM medicines m
      LEFT JOIN doses d ON m.id = d.medicine_id AND d.date BETWEEN ? AND ?
      WHERE m.user_id = ?
      GROUP BY strftime('%Y-%W', d.date)
      ORDER BY week
    `, [from, to, req.user.id]);

    // Get medicine-specific trends
    const medicineTrends = await dbAll(`
      SELECT 
        m.name,
        m.id,
        COUNT(d.id) as total_doses,
        SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) as taken_doses,
        ROUND(
          (SUM(CASE WHEN d.status = 'Taken' THEN 1 ELSE 0 END) * 100.0 / COUNT(d.id)), 2
        ) as adherence_rate
      FROM medicines m
      LEFT JOIN doses d ON m.id = d.medicine_id AND d.date BETWEEN ? AND ?
      WHERE m.user_id = ?
      GROUP BY m.id, m.name
      ORDER BY adherence_rate DESC
    `, [from, to, req.user.id]);

    res.json({
      period,
      dateRange: { from, to },
      weeklyTrends,
      medicineTrends
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;

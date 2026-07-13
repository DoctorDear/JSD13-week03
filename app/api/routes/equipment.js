const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const Order = require('../models/Order');
const { authenticateUser } = require('./auth');

// GET /api/equipment - Get available equipment with optional date range and filters
router.get('/', async (req, res) => {
  const { startDate, endDate, brand, category } = req.query;

  try {
    const query = { status: 'available' };

    if (brand) {
      query.brand = brand;
    }

    if (category) {
      query.category = category;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        // Query overlapping bookings
        const bookedOrders = await Order.find({
          startDate: { $lte: end },
          endDate: { $gte: start },
          status: { $in: ['pending', 'active'] }
        }).select('equipmentId');

        const bookedIds = bookedOrders.map(order => order.equipmentId);
        query._id = { $nin: bookedIds };
      }
    }

    const items = await Equipment.find(query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/equipment/:id - Get a single equipment item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/equipment - Get all equipment for admin (including maintenance)
router.get('/admin/all', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }

  try {
    const items = await Equipment.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/equipment/:id - Update equipment status/price (Admin only)
router.put('/admin/:id', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }

  const { status, pricePerDay } = req.body;

  try {
    const item = await Equipment.findById(req.id || req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (status) item.status = status;
    if (pricePerDay !== undefined) item.pricePerDay = pricePerDay;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

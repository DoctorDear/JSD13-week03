const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');
const Equipment = require('../models/Equipment');
const { authenticateUser } = require('./auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config for ID Card upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'id_card_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper to estimate deposit based on category and name (aligning with week-02 mock data)
function estimateDeposit(category, name) {
  if (category === 'Body') {
    if (name.includes('C70')) return 10000;
    if (name.includes('R5') && !name.includes('R50')) return 8000;
    if (name.includes('FX3')) return 8000;
    if (name.includes('R50')) return 3000;
    return 5000; // e.g. Sony Alpha 7 IV
  }
  if (category === 'Lens') {
    if (name.includes('70-200')) return 4000;
    if (name.includes('85mm')) return 4000;
    if (name.includes('50mm')) return 1000;
    return 3000; // e.g. Sony FE 24-70mm GM II
  }
  if (category === 'Flash') {
    if (name.includes('AD200')) return 2000;
    return 1000;
  }
  if (category === 'Adapter') {
    return 500;
  }
  return 1000;
}

// GET /api/orders - Get orders for the logged-in customer
router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ renterId: req.user._id })
      .populate('equipmentId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/orders - Create booking request (Customer Checkout)
router.post('/', authenticateUser, upload.single('idCard'), async (req, res) => {
  const { startDate, endDate } = req.body;
  let { equipmentIds } = req.body;

  if (!startDate || !endDate || !equipmentIds || !req.file) {
    return res.status(400).json({ message: 'Please provide all required fields, including ID card photo.' });
  }

  try {
    // Parse equipmentIds if sent as a JSON string
    if (typeof equipmentIds === 'string') {
      equipmentIds = JSON.parse(equipmentIds);
    }

    if (!Array.isArray(equipmentIds) || equipmentIds.length === 0) {
      return res.status(400).json({ message: 'Equipment IDs must be a non-empty array.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const idCardImageUrl = '/uploads/' + req.file.filename;

    const createdOrders = [];

    for (const eqId of equipmentIds) {
      const gear = await Equipment.findById(eqId);
      if (!gear) {
        return res.status(404).json({ message: `Equipment ${eqId} not found.` });
      }

      if (gear.status === 'maintenance') {
        return res.status(400).json({ message: `Equipment ${gear.name} is currently under maintenance.` });
      }

      // Check if already booked for these dates (double check)
      const overlapOrder = await Order.findOne({
        equipmentId: gear._id,
        startDate: { $lte: end },
        endDate: { $gte: start },
        status: { $in: ['pending', 'active'] }
      });

      if (overlapOrder) {
        return res.status(400).json({ message: `Equipment ${gear.name} is already booked for the selected dates.` });
      }

      const rentalFee = gear.pricePerDay * rentalDays;
      const deposit = estimateDeposit(gear.category, gear.name);
      const totalAmount = rentalFee + deposit;

      const order = new Order({
        renterId: req.user._id,
        equipmentId: gear._id,
        startDate: start,
        endDate: end,
        rentalFee,
        deposit,
        totalAmount,
        status: 'pending',
        verificationDoc: {
          idCardImageUrl,
          uploadedAt: new Date()
        }
      });

      await order.save();
      createdOrders.push(order);
    }

    // Clear user cart after booking
    req.user.cart = [];
    await req.user.save();

    res.status(201).json({
      message: 'Booking request created successfully.',
      orders: createdOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/orders - Get all orders (Admin only)
router.get('/admin/all', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }

  try {
    const orders = await Order.find({})
      .populate('renterId', 'name email')
      .populate('equipmentId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/orders/:id - Update order status (Admin only)
router.put('/admin/:id', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }

  const { status, cancelReason } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Please specify status.' });
  }

  try {
    const order = await Order.findById(req.id || req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'cancelled' && cancelReason) {
      order.cancelReason = cancelReason;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

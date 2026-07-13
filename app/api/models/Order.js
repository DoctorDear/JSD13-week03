const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentalFee: { type: Number, required: true },
  deposit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'active', 'returned', 'cancelled'], default: 'pending' },
  verificationDoc: {
    idCardImageUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  cancelReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

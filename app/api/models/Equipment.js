const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, enum: ['Body', 'Lens', 'Flash', 'Adapter'], required: true },
  pricePerDay: { type: Number, required: true },
  status: { type: String, enum: ['available', 'maintenance'], default: 'available' },
  imageUrl: { type: String }
});

module.exports = mongoose.model('Equipment', equipmentSchema);

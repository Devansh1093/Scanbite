const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    barcode: { type: String, required: true, index: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    nutritionScoreAtScan: { type: Number },
    scannedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScanHistory', scanHistorySchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String },
    imageUrl: { type: String },

    // Raw fields pulled from Open Food Facts, kept for re-scoring later
    // without another API call.
    ingredients: [{ type: String }],
    nutriScore: { type: String },
    novaGroup: { type: Number },

    nutrientLevels: {
      sugars: { type: String, enum: ['low', 'moderate', 'high', null], default: null },
      salt: { type: String, enum: ['low', 'moderate', 'high', null], default: null },
      saturatedFat: { type: String, enum: ['low', 'moderate', 'high', null], default: null },
      fat: { type: String, enum: ['low', 'moderate', 'high', null], default: null },
    },
    nutriments: {
      energyKcal: { type: Number },
      sugars: { type: Number },
      salt: { type: Number },
      saturatedFat: { type: Number },
      proteins: { type: Number },
    },
    additivesCount: { type: Number, default: null },
    allergens: [{ type: String }],

    // ScanBite's own computed nutrition score. Mixed type for
    // metrics/breakdown since their shape (value + label + reason
    // strings) is intentionally flexible as the scoring engine evolves.
    nutritionScore: {
      value: { type: Number, min: 0, max: 100 },
      grade: { type: String, enum: ['A', 'B', 'C', 'D', 'E'] },
      summary: { type: String },
      metrics: { type: mongoose.Schema.Types.Mixed },
      breakdown: { type: mongoose.Schema.Types.Mixed },
      computedAt: { type: Date },
    },

    source: {
      type: String,
      enum: ['openfoodfacts'],
      default: 'openfoodfacts',
    },
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products?q=granola&category=snacks&minScore=60&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { q, category, minScore, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (minScore) filter['ecoScore.value'] = { $gte: Number(minScore) };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ 'ecoScore.value': -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:barcode - single cached product, no OFF fallback
// (that's what /api/scan is for; this route is read-only from cache)
router.get('/:barcode', async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      return res.status(404).json({ error: 'Product not in cache' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

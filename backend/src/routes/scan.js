const express = require('express');
const { z } = require('zod');
const Product = require('../models/Product');
const ScanHistory = require('../models/ScanHistory');
const { fetchProductByBarcode } = require('../services/offService');
const { computeNutritionScore } = require('../services/scoringEngine');

const router = express.Router();

const barcodeParamSchema = z.object({
  barcode: z.string().min(6).max(20),
});

// GET /api/scan/:barcode
// Cache-first: check Mongo, fall back to Open Food Facts, score, persist.
router.get('/:barcode', async (req, res, next) => {
  try {
    const { barcode } = barcodeParamSchema.parse(req.params);

    let product = await Product.findOne({ barcode });

    if (!product) {
      const offData = await fetchProductByBarcode(barcode);

      if (!offData) {
        return res.status(404).json({
          error: 'Product not found in Open Food Facts',
          barcode,
        });
      }

      const nutritionScore = computeNutritionScore(offData);

      product = await Product.create({
        barcode,
        ...offData,
        nutritionScore,
      });
    } else if (isStale(product.lastFetchedAt)) {
      // Re-fetch + re-score periodically so prices/labels don't go stale
      // forever, without hitting OFF on every single scan.
      const offData = await fetchProductByBarcode(barcode);
      if (offData) {
        const nutritionScore = computeNutritionScore(offData);
        Object.assign(product, offData, {
          nutritionScore,
          lastFetchedAt: new Date(),
        });
        await product.save();
      }
    }

    // Fire-and-forget history log; don't block the response on it.
    // req.userId would come from auth middleware once that's wired in.
    ScanHistory.create({
      userId: req.userId || null,
      barcode,
      product: product._id,
      nutritionScoreAtScan: product.nutritionScore?.value,
    }).catch((err) => console.error('Failed to log scan history:', err.message));

    res.json(product);
  } catch (err) {
    next(err);
  }
});

function isStale(lastFetchedAt, maxAgeDays = 30) {
  if (!lastFetchedAt) return true;
  const ageMs = Date.now() - new Date(lastFetchedAt).getTime();
  return ageMs > maxAgeDays * 24 * 60 * 60 * 1000;
}

module.exports = router;

const express = require('express');
const ScanHistory = require('../models/ScanHistory');

const router = express.Router();

// GET /api/dashboard/history?userId=...&page=1&limit=20
router.get('/history', async (req, res, next) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const filter = userId ? { userId } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const history = await ScanHistory.find(filter)
      .populate('product', 'name brand imageUrl nutritionScore')
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json(history);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/stats?userId=...
// Aggregate: average score over time, grade distribution.
router.get('/stats', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const match = userId
      ? { userId: new (require('mongoose').Types.ObjectId)(userId) }
      : {};

    const [avgScore, gradeDistribution, totalScans] = await Promise.all([
      ScanHistory.aggregate([
        { $match: match },
        { $group: { _id: null, avg: { $avg: '$nutritionScoreAtScan' } } },
      ]),
      ScanHistory.aggregate([
        { $match: match },
        {
          $bucket: {
            groupBy: '$nutritionScoreAtScan',
            boundaries: [0, 20, 40, 60, 80, 101],
            default: 'unknown',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
      ScanHistory.countDocuments(match),
    ]);

    res.json({
      totalScans,
      averageScore: avgScore[0]?.avg ?? null,
      gradeDistribution,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

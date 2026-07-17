/**
 * Nutrition scoring engine.
 *
 * Rates a product on food content rather than environmental impact - sugar,
 * salt, and saturated fat levels, how processed it is (NOVA group +
 * additive count), each backed directly by Open Food Facts' own
 * nutrient_levels classification (low/moderate/high) rather than raw
 * numbers thresholded arbitrarily here. Nutri-Score and allergens are
 * surfaced as-is since OFF already computes/reports them directly.
 */

const LEVEL_SCORES = { low: 25, moderate: 14, high: 5 };

function scoreNutrientLevel(level, label) {
  if (!level) return { score: 12, reason: `${label} level not reported for this product.` };
  const score = LEVEL_SCORES[level];
  if (score === undefined) return { score: 12, reason: `${label} level not reported for this product.` };
  const descriptor = { low: 'Low', moderate: 'Moderate', high: 'High' }[level];
  return { score, reason: `${descriptor} ${label.toLowerCase()} content.` };
}

function scoreProcessing(novaGroup, additivesCount) {
  let score;
  let novaText;
  if (novaGroup === 1) { score = 25; novaText = 'minimally processed (NOVA 1)'; }
  else if (novaGroup === 2) { score = 18; novaText = 'processed culinary ingredient (NOVA 2)'; }
  else if (novaGroup === 3) { score = 12; novaText = 'processed food (NOVA 3)'; }
  else if (novaGroup === 4) { score = 5; novaText = 'ultra-processed (NOVA 4)'; }
  else { score = 12; novaText = 'processing level not reported'; }

  let reason = `Classified as ${novaText}.`;
  if (typeof additivesCount === 'number') {
    if (additivesCount === 0) {
      reason += ' No additives detected.';
    } else {
      score = clamp(score - Math.min(additivesCount * 2, 10), 0, 25);
      reason += ` Contains ${additivesCount} additive${additivesCount === 1 ? '' : 's'}.`;
    }
  }
  return { score, reason };
}

function gradeFromValue(value) {
  if (value >= 80) return 'A';
  if (value >= 60) return 'B';
  if (value >= 40) return 'C';
  if (value >= 20) return 'D';
  return 'E';
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildMetrics(product) {
  return {
    nutriScore: {
      available: !!product.nutriScore,
      value: product.nutriScore || null,
      label: product.nutriScore ? `Nutri-Score ${product.nutriScore}` : 'Not available for this product',
    },
    additives: {
      value: product.additivesCount ?? null,
      label:
        typeof product.additivesCount === 'number'
          ? `${product.additivesCount} additive${product.additivesCount === 1 ? '' : 's'}`
          : 'Not reported',
    },
    allergens: {
      value: product.allergens || [],
      label: product.allergens && product.allergens.length
        ? product.allergens.map((a) => a.replace('en:', '')).join(', ')
        : 'None listed',
    },
  };
}

/**
 * @param {object} product - normalized product shape from offService.js
 * @returns {{ value, grade, summary, metrics, breakdown, computedAt }}
 */
function computeNutritionScore(product) {
  const sugar = scoreNutrientLevel(product.nutrientLevels?.sugars, 'Sugar');
  const salt = scoreNutrientLevel(product.nutrientLevels?.salt, 'Salt');
  const satFat = scoreNutrientLevel(product.nutrientLevels?.saturatedFat, 'Saturated fat');
  const processing = scoreProcessing(product.novaGroup, product.additivesCount);

  const value = sugar.score + salt.score + satFat.score + processing.score;
  const grade = gradeFromValue(value);

  return {
    value,
    grade,
    summary: buildSummary(grade, value),
    metrics: buildMetrics(product),
    breakdown: {
      sugar: { score: sugar.score, max: 25, reason: sugar.reason },
      salt: { score: salt.score, max: 25, reason: salt.reason },
      saturatedFat: { score: satFat.score, max: 25, reason: satFat.reason },
      processing: { score: processing.score, max: 25, reason: processing.reason },
    },
    computedAt: new Date(),
  };
}

function buildSummary(grade, value) {
  const gradeText = {
    A: 'Excellent nutritional profile',
    B: 'Good nutritional profile',
    C: 'Average nutritional profile',
    D: 'Below-average nutritional profile',
    E: 'Poor nutritional profile',
  };
  return `${gradeText[grade]} (${value}/100).`;
}

module.exports = { computeNutritionScore };

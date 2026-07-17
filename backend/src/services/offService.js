const axios = require('axios');

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

async function fetchProductByBarcode(barcode) {
  const { data } = await axios.get(`${BASE_URL}/${barcode}.json`, {
    timeout: 8000,
    headers: {
      'User-Agent': 'ScanBite/1.0 (student project)',
    },
  });

  if (!data || data.status !== 1 || !data.product) {
    return null;
  }

  return normalizeProduct(data.product);
}

/**
 * Maps OFF's response down to what the nutrition scoring engine needs.
 * nutrient_levels is OFF's own low/moderate/high classification - using
 * it directly avoids re-deriving sugar/salt/fat thresholds ourselves.
 */
function normalizeProduct(p) {
  return {
    name: p.product_name || p.generic_name || 'Unknown product',
    brand: p.brands || null,
    category: (p.categories_tags && p.categories_tags[0]) || null,
    imageUrl: p.image_front_url || p.image_url || null,
    ingredients: (p.ingredients || []).map((i) => i.text).filter(Boolean),
    nutriScore: (p.nutriscore_grade || '').toUpperCase() || null,
    novaGroup: p.nova_group || null,
    source: 'openfoodfacts',

    nutrientLevels: {
      sugars: p.nutrient_levels?.sugars || null,
      salt: p.nutrient_levels?.salt || null,
      saturatedFat: p.nutrient_levels?.['saturated-fat'] || null,
      fat: p.nutrient_levels?.fat || null,
    },
    nutriments: {
      energyKcal: p.nutriments?.['energy-kcal_100g'] ?? null,
      sugars: p.nutriments?.sugars_100g ?? null,
      salt: p.nutriments?.salt_100g ?? null,
      saturatedFat: p.nutriments?.['saturated-fat_100g'] ?? null,
      proteins: p.nutriments?.proteins_100g ?? null,
    },
    additivesCount: Array.isArray(p.additives_tags) ? p.additives_tags.length : null,
    allergens: p.allergens_tags || [],
  };
}

module.exports = { fetchProductByBarcode };

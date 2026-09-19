const express = require('express');
const { getVillageMetrics } = require('../services/satelliteService.js');
const { getSearchIndex, getVillageById } = require('../services/villageService.js');

const router = express.Router();

const LAYER_REGISTRY = [
  { id: 'NDVI', name: 'Vegetation Index (NDVI)', description: 'Normalized Difference Vegetation Index', palette: ['#ff0000', '#ffff00', '#00ff00'] },
  { id: 'NDWI', name: 'Water Index (NDWI)', description: 'Normalized Difference Water Index', palette: ['#ffffff', '#0000ff'] },
  { id: 'SMI', name: 'Soil Moisture Index (SMI)', description: 'Surface Soil Moisture', palette: ['#d7191c', '#fdae61', '#abdda4', '#2b83ba'] },
  { id: 'LST', name: 'Land Surface Temp (LST)', description: 'Thermal infrared temperature', palette: ['#0000ff', '#ffff00', '#ff0000'] },
  { id: 'DW', name: 'Dynamic World Land Cover', description: 'Real-time 10m LULC classification', palette: ['#419BDF', '#397D49', '#88B053', '#E49635', '#DFC35A', '#C4281B', '#A59B8F', '#B39FE1'] }
];

router.get('/satellite/layers', (req, res) => {
  res.json({ layers: LAYER_REGISTRY });
});

router.get('/satellite/regions/metrics', async (req, res) => {
  try {
    const year = parseInt(req.query.year || '2024', 10);
    const index = getSearchIndex();
    const results = {};

    for (const item of index) {
      const vid = item.id;
      const metrics = await getVillageMetrics(vid, year);
      const ndvi = metrics.ndvi || 0.5;

      let cat = 'poor';
      if (ndvi > 0.6) cat = 'excellent';
      else if (ndvi >= 0.4) cat = 'good';
      else if (ndvi >= 0.2) cat = 'fair';

      const v = getVillageById(vid);
      results[vid] = {
        id: vid,
        name: item.name,
        ndvi,
        category: cat,
        areaHa: v?.area || 50.0
      };
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/satellite/tiles', async (req, res) => {
  const { layer = 'NDVI', geometryId = '1', year = '2024' } = req.query;
  const metrics = await getVillageMetrics(geometryId, parseInt(year, 10));
  res.json({
    urlFormat: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
    layer,
    metrics
  });
});

router.get('/satellite/statistics', async (req, res) => {
  const { layer = 'NDVI', geometryId = '1', year = '2024' } = req.query;
  const metrics = await getVillageMetrics(geometryId, parseInt(year, 10));
  res.json({
    layer,
    geometryId,
    min: 0.15,
    max: 0.82,
    mean: metrics.ndvi,
    stdDev: 0.08
  });
});

router.get('/satellite/value', async (req, res) => {
  const { layer = 'NDVI', lat = 18.52, lng = 73.53 } = req.query;
  const fLat = parseFloat(lat);
  const fLng = parseFloat(lng);
  const value = Math.round((0.55 + Math.sin(fLat * fLng) * 0.15) * 100) / 100;
  res.json({
    layer,
    latitude: fLat,
    longitude: fLng,
    value,
    interpretation: `${layer} Value: ${value}`
  });
});

router.get('/satellite/:village_id/metrics', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const metrics = await getVillageMetrics(village_id, year);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/satellite/:village_id/ndvi', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const metrics = await getVillageMetrics(village_id, year);
    res.json({
      ndvi_mean: metrics.ndvi,
      ndwi_mean: metrics.ndwi,
      red_mean: 0.12,
      nir_mean: 0.45,
      swir_mean: 0.18
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/satellite/:village_id/water', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const metrics = await getVillageMetrics(village_id, year);
    res.json({
      water_area_ha: Math.round(metrics.ndwi * 45),
      water_coverage_percent: Math.round(metrics.ndwi * 100 * 0.3),
      seasonal_water_months: 8,
      water_occurrence_mean: metrics.ndwi
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/satellite/:village_id/landcover', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const metrics = await getVillageMetrics(village_id, year);
    res.json({
      water: Math.round(metrics.ndwi * 100 * 0.2),
      trees: 18,
      grass: 12,
      flooded_vegetation: 2,
      crops: 52,
      shrub_and_scrub: 8,
      built: 6,
      bare: 2,
      snow_and_ice: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/satellite/:village_id/terrain', async (req, res) => {
  res.json({
    mean_elevation_m: 580.0,
    slope_mean_degrees: 4.8,
    slope_std_degrees: 1.8,
    flood_risk_area_percent: 12.0
  });
});

router.get('/satellite/:village_id/landcover/tiles', (req, res) => {
  res.json({ urlFormat: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' });
});

router.get('/satellite/:village_id/ndvi/tiles', (req, res) => {
  res.json({ urlFormat: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' });
});

router.post('/satellite/ndvi/tiles', (req, res) => {
  res.json({ urlFormat: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' });
});

router.get('/satellite/:village_id/water/tiles', (req, res) => {
  res.json({ urlFormat: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' });
});

router.post('/satellite/water/tiles', (req, res) => {
  res.json({ urlFormat: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' });
});

module.exports = router;

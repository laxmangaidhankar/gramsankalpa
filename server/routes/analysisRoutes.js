const express = require('express');

const {
  getVillageBoundary,
  addDynamicVillage
} = require('../services/villageService.js');

const { getVillageMetrics } = require('../services/satelliteService.js');


const router = express.Router();

function interpretNDVI(ndvi) {
  if (ndvi > 0.6) return { category: 'Dense Canopy', message: 'Healthy crop growth and dense vegetation canopy.' };
  if (ndvi > 0.4) return { category: 'Moderate Vigor', message: 'Standard crop vigor with normal vegetative health.' };
  return { category: 'Low Vegetation', message: 'Sparse vegetation canopy or early field preparation state.' };
}

function interpretWater(ndwi, soilMoisture) {
  if (ndwi > 0.35 || soilMoisture > 0.45) return { status: 'Optimal', advisory: 'Sufficient moisture retained in soil profile.' };
  return { status: 'Moderate Deficit', advisory: 'Sub-surface moisture levels lower; light scheduled irrigation recommended.' };
}

function assessFloodRisk(rainfall) {
  if (rainfall > 1100) return { risk: 'High', warning: 'Heavy precipitation anomaly detected in watershed region.' };
  return { risk: 'Low', warning: 'No active surface flood alerts for area.' };
}

router.post('/analyze', async (req, res) => {
  try {
    const { village_id, polygon, year = 2024 } = req.body;
    if (village_id && polygon) {
      addDynamicVillage(village_id, polygon);
    }
    const targetId = village_id || '1';
    const metrics = await getVillageMetrics(targetId, year);

    res.json({
      villageId: targetId,
      year,
      metrics,
      interpretations: {
        vegetation: interpretNDVI(metrics.ndvi),
        water: interpretWater(metrics.ndwi, metrics.soil_moisture),
        flood: assessFloodRisk(metrics.rainfall_mm)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analysis/:village_id/environmental', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const metrics = await getVillageMetrics(village_id, year);

    res.json({
      villageId: village_id,
      year,
      metrics,
      interpretations: {
        vegetation: interpretNDVI(metrics.ndvi),
        water: interpretWater(metrics.ndwi, metrics.soil_moisture),
        flood: assessFloodRisk(metrics.rainfall_mm)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analysis/:village_id/summary', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const metrics = await getVillageMetrics(village_id, year);

    res.json({
      villageId: village_id,
      year,
      metrics,
      interpretations: {
        vegetation: interpretNDVI(metrics.ndvi),
        water: interpretWater(metrics.ndwi, metrics.soil_moisture),
        flood: assessFloodRisk(metrics.rainfall_mm)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports= router;

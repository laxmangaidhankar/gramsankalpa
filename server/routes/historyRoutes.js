const express = require('express');

const { getVillageMetrics } = require('../services/satelliteService.js');

const { getVillageScore } = require('../services/scoreService.js');


const router = express.Router();

async function getHistoricalMetrics(villageId, years = [2022, 2023, 2024, 2025, 2026]) {
  const metricsList = await Promise.all(
    years.map(async y => {
      const m = await getVillageMetrics(villageId, y);
      const s = await getVillageScore(villageId, y);
      return {
        year: y,
        ndvi: m.ndvi,
        ndwi: m.ndwi,
        soilMoisture: m.soil_moisture,
        waterAreaHa: Math.round(m.ndwi * 45),
        greenCoverPercent: Math.round(m.ndvi * 100),
        score: s.overallScore
      };
    })
  );

  return {
    villageId: String(villageId),
    years,
    metrics: metricsList
  };
}

router.get('/history/:village_id', async (req, res) => {
  try {
    const { village_id } = req.params;
    const history = await getHistoricalMetrics(village_id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/:village_id/changes', async (req, res) => {
  try {
    const { village_id } = req.params;
    const history = await getHistoricalMetrics(village_id, [2022, 2024]);
    const m2022 = history.metrics[0];
    const m2024 = history.metrics[1];

    const stats = {
      villageId: String(village_id),
      ndvi_change_percent: Math.round(((m2024.ndvi - m2022.ndvi) / m2022.ndvi) * 100),
      green_cover_change_percent: m2024.greenCoverPercent - m2022.greenCoverPercent,
      water_area_change_ha: m2024.waterAreaHa - m2022.waterAreaHa,
      overall_health_trend: m2024.score >= m2022.score ? 'Improving / Stable' : 'Decline'
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/:village_id/compare', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year1 = parseInt(req.query.year1 || '2022', 10);
    const year2 = parseInt(req.query.year2 || '2024', 10);

    const m1 = await getVillageMetrics(village_id, year1);
    const m2 = await getVillageMetrics(village_id, year2);

    res.json({
      villageId: String(village_id),
      year1,
      year2,
      ndvi_diff: Math.round((m2.ndvi - m1.ndvi) * 100) / 100,
      water_diff_ha: Math.round((m2.ndwi - m1.ndwi) * 45),
      green_cover_diff_percent: Math.round((m2.ndvi - m1.ndvi) * 100)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports= router;
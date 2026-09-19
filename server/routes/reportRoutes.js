const express = require('express');

const { generateVillageReportPDF } = require('../services/reportService.js');

const { getVillageById } = require('../services/villageService.js');

const { getVillageMetrics } = require('../services/satelliteService.js');

const { getVillageScore } = require('../services/scoreService.js');

const { getCurrentWeather } = require('../services/weatherService.js');

const {
  generateVillageRecommendations
} = require('../services/cropRecommendationService.js');



const router = express.Router();

router.get('/reports/:village_id/pdf', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    await generateVillageReportPDF(village_id, year, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/:village_id/json', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const village = getVillageById(village_id) || { name: 'Mulshi', district: 'Pune', state: 'Maharashtra', coordinates: [18.52, 73.53] };
    const metrics = await getVillageMetrics(village_id, year);
    const score = await getVillageScore(village_id, year);
    const weather = await getCurrentWeather(village.coordinates[0], village.coordinates[1]);
    const recs = await generateVillageRecommendations(village, metrics, score);

    res.json({
      village,
      year,
      metrics,
      score,
      weather,
      recommendations: recs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/:village_id/csv', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const village = getVillageById(village_id) || { name: 'Mulshi', district: 'Pune', state: 'Maharashtra' };
    const metrics = await getVillageMetrics(village_id, year);
    const score = await getVillageScore(village_id, year);

    const csvContent = [
      'Field,Value',
      `Village Name,${village.name}`,
      `District,${village.district}`,
      `State,${village.state}`,
      `Year,${year}`,
      `Health Score,${score.overallScore}`,
      `NDVI,${metrics.ndvi}`,
      `NDWI,${metrics.ndwi}`,
      `Soil Moisture,${metrics.soil_moisture}`
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="GramDrishti_Report_${village_id}_${year}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');

const {
  getVillageById,
  addDynamicVillage
} = require('../services/villageService.js');

const { getVillageMetrics } = require('../services/satelliteService.js');

const { getVillageScore } = require('../services/scoreService.js');

const {
  generateVillageRecommendations
} = require('../services/cropRecommendationService.js');



const router = express.Router();

router.get('/recommendations/:village_id', async (req, res) => {
  try {
    const village_id = req.params.village_id;
    const year = parseInt(req.query.year || '2024', 10);
    const village = getVillageById(village_id) || { id: village_id, name: 'Village', district: 'Pune', state: 'Maharashtra', coordinates: [18.52, 73.53], soilType: 'Black Cotton Soil' };

    const metrics = await getVillageMetrics(village_id, year);
    const score = await getVillageScore(village_id, year);

    const recs = await generateVillageRecommendations(village, metrics, score);
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/recommendations/analyze', async (req, res) => {
  try {
    const { village_id, polygon, year = 2024 } = req.body;
    const village = addDynamicVillage(village_id, polygon);
    const metrics = await getVillageMetrics(village_id, year);
    const score = await getVillageScore(village_id, year);

    const recs = await generateVillageRecommendations(village, metrics, score);
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recommendations/:village_id/risks', async (req, res) => {
  try {
    const village_id = req.params.village_id;
    const year = parseInt(req.query.year || '2024', 10);
    const score = await getVillageScore(village_id, year);

    const risks = [
      { pillar: 'Water Security', level: score.components.water < 50 ? 'High Risk' : 'Low Risk', score: score.components.water, impact: 'Sub-surface aquifer replenishment required.' },
      { pillar: 'Vegetation Health', level: score.components.vegetation < 55 ? 'Moderate Risk' : 'Low Risk', score: score.components.vegetation, impact: 'Monitored canopy vigor and crop rotation.' },
      { pillar: 'Climate Stability', level: score.components.climate < 50 ? 'High Risk' : 'Low Risk', score: score.components.climate, impact: 'Heat stress advisory active during peak summer months.' }
    ];
    res.json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');

const { getVillageScore } = require('../services/scoreService.js');

const { addDynamicVillage } = require('../services/villageService.js');
const router = express.Router();

router.get('/scores/:village_id', async (req, res) => {
  try {
    const { village_id } = req.params;
    const year = parseInt(req.query.year || '2024', 10);
    const score = await getVillageScore(village_id, year);
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scores/analyze', async (req, res) => {
  try {
    const { village_id, polygon, year = 2024 } = req.body;
    const targetId = village_id || `dynamic_${Date.now()}`;
    if (polygon) {
      addDynamicVillage(targetId, polygon);
    }
    const score = await getVillageScore(targetId, parseInt(year, 10));
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

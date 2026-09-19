const express = require('express');
const { searchVillages, getVillageById, getVillageBoundary, addDynamicVillage, getAllVillageBoundaries } = require('../services/villageService.js');
const FarmModel = require('../models/Farm.js');

const router = express.Router();

router.get('/villages/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const results = await searchVillages(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/villages/boundaries/all', (req, res) => {
  try {
    const boundaries = getAllVillageBoundaries();
    res.json(boundaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/villages/register', (req, res) => {
  const { village_id, polygon, name, district } = req.body;
  if (!village_id || !polygon) {
    return res.status(400).json({ detail: 'village_id and polygon are required' });
  }
  const village = addDynamicVillage(village_id, polygon, name, district);
  res.json(village);
});

router.post('/villages/dynamic', (req, res) => {
  const { village_id, polygon, name, district } = req.body;
  if (!village_id || !polygon) {
    return res.status(400).json({ detail: 'village_id and polygon are required' });
  }
  const village = addDynamicVillage(village_id, polygon, name, district);
  res.json(village);
});

router.get('/villages/:id', (req, res) => {
  const village = getVillageById(req.params.id);
  if (!village) {
    return res.status(404).json({ detail: 'Village not found' });
  }
  res.json(village);
});

router.get('/villages/:id/boundary', (req, res) => {
  const boundary = getVillageBoundary(req.params.id);
  if (!boundary) {
    return res.status(404).json({ detail: 'Boundary not found' });
  }
  res.json(boundary);
});

router.get('/villages/:id/farms', async (req, res) => {
  try {
    const farms = await FarmModel.find().lean().catch(() => []);
    res.json(farms);
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;

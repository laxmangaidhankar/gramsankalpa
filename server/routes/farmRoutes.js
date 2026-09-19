const express = require('express');
const { FarmModel } = require('../models/Farm'); 

const router = express.Router();
const inMemoryFarms = new Map();

router.get('/farms', async (req, res) => {
  try {
    const dbFarms = await FarmModel.find().lean().catch(() => []);
    if (dbFarms && dbFarms.length > 0) {
      return res.json(dbFarms);
    }
    res.json(Array.from(inMemoryFarms.values()));
  } catch (err) {
    res.json(Array.from(inMemoryFarms.values()));
  }
});

router.post('/farms', async (req, res) => {
  try {
    const { name, boundary, area_ha = 1.2, crop = 'Soybean', sowingDate } = req.body;
    const farm = {
      id: `farm_${Date.now()}`,
      name: name || 'My Farm Plot',
      boundary: boundary || {},
      area_ha,
      crop,
      sowingDate: sowingDate || new Date().toISOString().split('T')[0]
    };
    inMemoryFarms.set(farm.id, farm);
    FarmModel.create(farm).catch(() => {});
    res.status(201).json(farm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/farms/:id', async (req, res) => {
  try {
    const id = req.params.id;
    inMemoryFarms.delete(id);
    await FarmModel.deleteOne({ id }).catch(() => {});
    res.json({ message: 'Farm boundary deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

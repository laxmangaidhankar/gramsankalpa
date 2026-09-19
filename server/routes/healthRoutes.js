const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'GramDrishti MERN Platform (AG-02)',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'in_memory_mode'
  });
});

module.exports = router;

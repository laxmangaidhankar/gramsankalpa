const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'GramSankalpa',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'in_memory_mode'
  });
});

module.exports = router;

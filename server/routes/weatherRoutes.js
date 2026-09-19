const express = require('express');

const { getVillageById } = require('../services/villageService.js');

const {
  getCurrentWeather,
  get7DayForecast,
  getHistoricalAnnual,
  assessHeatStress,
  assessRainfallAdequacy,
  assessDroughtRisk
} = require('../services/weatherService.js');



const router = express.Router();

router.get('/weather/:village_id/current', async (req, res) => {
  try {
    const village = getVillageById(req.params.village_id);
    if (!village) return res.status(404).json({ detail: 'Village not found' });

    const [lat, lon] = village.coordinates;
    const weather = await getCurrentWeather(lat, lon);
    const forecast7Day = await get7DayForecast(lat, lon);

    res.json({
      ...weather,
      forecast_7day: forecast7Day
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/weather/:village_id/historical', async (req, res) => {
  try {
    const village = getVillageById(req.params.village_id);
    if (!village) return res.status(404).json({ detail: 'Village not found' });

    const year = parseInt(req.query.year || '2024', 10);
    const [lat, lon] = village.coordinates;
    const hist = await getHistoricalAnnual(lat, lon, year);
    res.json(hist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/weather/:village_id/assessment', async (req, res) => {
  try {
    const village = getVillageById(req.params.village_id);
    if (!village) return res.status(404).json({ detail: 'Village not found' });

    const year = parseInt(req.query.year || '2024', 10);
    const [lat, lon] = village.coordinates;
    const hist = await getHistoricalAnnual(lat, lon, year);

    const heatStress = assessHeatStress(hist.max_temp_c, 50.0);
    const rainfallAdequacy = assessRainfallAdequacy(hist.annual_rainfall_mm, village.district);
    const droughtRisk = assessDroughtRisk(hist.annual_rainfall_mm, 0.55, village.district);

    res.json({
      heat_stress: heatStress,
      rainfall_adequacy: rainfallAdequacy,
      drought_risk: droughtRisk
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports =   router;

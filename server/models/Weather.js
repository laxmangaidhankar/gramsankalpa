import mongoose from 'mongoose';

const WeatherSchema = new mongoose.Schema({
  villageId: { type: String, required: true, index: true },
  lat: { type: Number },
  lon: { type: Number },
  current: {
    temp_c: Number,
    humidity_pct: Number,
    rainfall_mm: Number,
    wind_speed_kmh: Number,
    uv_index: Number,
    condition: String,
    timestamp: String
  },
  forecast: [{
    date: String,
    max_temp_c: Number,
    min_temp_c: Number,
    precipitation_mm: Number,
    humidity_pct: Number,
    condition: String,
    agricultural_risk: String
  }],
  historical: {
    year: Number,
    annual_rainfall_mm: Number,
    max_temp_c: Number,
    min_temp_c: Number,
    dry_spells_count: Number
  },
  assessment: {
    heat_stress: Object,
    rainfall_adequacy: Object,
    drought_risk: Object
  }
}, { timestamps: true });

export const WeatherModel = mongoose.model('Weather', WeatherSchema);

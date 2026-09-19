const mongoose = require('mongoose');
const VillageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  nameHindi: { type: String },
  district: { type: String, default: 'Unknown' },
  state: { type: String, default: 'Unknown' },
  coordinates: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  boundary: { type: Object, required: true },
  area: { type: Number, default: 0 },
  soilType: { type: String, default: 'Black Cotton / Clay Loam' },
  primaryCrops: [{ type: String }],
  waterSources: [{ type: String }]
}, { timestamps: true });

 const VillageModel = mongoose.model('Village', VillageSchema);

 module.exports = VillageModel;

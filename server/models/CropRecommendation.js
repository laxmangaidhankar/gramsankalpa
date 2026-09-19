const mongoose = require('mongoose');

const CropRecommendationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  villageId: { type: String, required: true, index: true },
  cropName: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g. agriculture, water, conservation
  urgency: { type: String, required: true, enum: ['high', 'medium', 'low'] },
  suitabilityScore: { type: Number, required: true },
  sowingWindow: { type: String },
  expectedYield: { type: String },
  soilMatch: { type: String },
  waterNeed: { type: String },
  description: { type: String, required: true },
  actionableSteps: [{ type: String }],
  expectedImpact: { type: String, required: true },
  schemeEligible: [{ type: String }]
}, { timestamps: true });

 const CropRecommendationModel = mongoose.model('CropRecommendation', CropRecommendationSchema);


 module.exports = CropRecommendationModel;
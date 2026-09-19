const mongoose = require('mongoose');
const FarmSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  villageId: { type: String },
  boundary: { type: Object, required: true },
  area_ha: { type: Number, default: 0 },
  crop: { type: String, default: 'Soybean' },
  sowingDate: { type: String },
  ownerName: { type: String, default: 'Farmer' }
}, { timestamps: true });

const FarmModel = mongoose.model('Farm', FarmSchema);


module.exports = FarmModel;
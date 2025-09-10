const mongoose = require('mongoose');

const changeAnalysisSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  beforeImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SatelliteImage',
    required: true
  },
  afterImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SatelliteImage',
    required: true
  },
  changeMap: {
    type: String // URL to the change detection result image
  },
  changePercentage: {
    type: Number
  },
  changeAreas: [{
    coordinates: [{
      lat: Number,
      lng: Number
    }],
    area: Number, // in square meters
    changeType: {
      type: String,
      enum: ['deforestation', 'urbanization', 'water-change', 'vegetation', 'other']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChangeAnalysis', changeAnalysisSchema);
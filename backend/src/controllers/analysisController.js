const ChangeAnalysis = require('../models/ChangeAnalysis');
const SatelliteImage = require('../models/SatelliteImage');

exports.createAnalysis = async (req, res) => {
  try {
    const { title, description, beforeImageId, afterImageId } = req.body;
    
    // Verify images exist
    const beforeImage = await SatelliteImage.findById(beforeImageId);
    const afterImage = await SatelliteImage.findById(afterImageId);
    
    if (!beforeImage || !afterImage) {
      return res.status(404).json({
        message: 'One or both images not found'
      });
    }
    
    // For demo purposes, we'll simulate change detection
    // In a real application, this would call your ML model
    const changePercentage = Math.random() * 100;
    const changeMap = '/uploads/change-map-' + Date.now() + '.png';
    
    const changeAreas = [
      {
        coordinates: [
          { lat: beforeImage.coordinates.lat + 0.001, lng: beforeImage.coordinates.lng + 0.001 },
          { lat: beforeImage.coordinates.lat + 0.002, lng: beforeImage.coordinates.lng + 0.001 },
          { lat: beforeImage.coordinates.lat + 0.002, lng: beforeImage.coordinates.lng + 0.002 },
          { lat: beforeImage.coordinates.lat + 0.001, lng: beforeImage.coordinates.lng + 0.002 }
        ],
        area: 10000,
        changeType: 'deforestation'
      }
    ];
    
    const analysis = new ChangeAnalysis({
      title,
      description,
      beforeImage: beforeImageId,
      afterImage: afterImageId,
      changeMap,
      changePercentage,
      changeAreas,
      createdBy: req.userId
    });
    
    await analysis.save();
    
    // Populate related data
    await analysis.populate('beforeImage');
    await analysis.populate('afterImage');
    await analysis.populate('createdBy', 'username email');
    
    // Notify clients via WebSocket
    const io = req.app.get('io');
    io.emit('new-analysis', analysis);
    
    res.status(201).json({
      message: 'Analysis created successfully',
      analysis
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating analysis',
      error: error.message
    });
  }
};

exports.getAnalyses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { isPublic: true };
    
    // If user is authenticated, show their private analyses too
    if (req.userId) {
      query.$or = [
        { isPublic: true },
        { createdBy: req.userId }
      ];
    }
    
    const analyses = await ChangeAnalysis.find(query)
      .populate('beforeImage')
      .populate('afterImage')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ChangeAnalysis.countDocuments(query);
    
    res.json({
      analyses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAnalyses: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching analyses',
      error: error.message
    });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await ChangeAnalysis.findById(req.params.id)
      .populate('beforeImage')
      .populate('afterImage')
      .populate('createdBy', 'username email');
    
    if (!analysis) {
      return res.status(404).json({
        message: 'Analysis not found'
      });
    }
    
    // Check if user can access private analysis
    if (!analysis.isPublic && analysis.createdBy._id.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching analysis',
      error: error.message
    });
  }
};
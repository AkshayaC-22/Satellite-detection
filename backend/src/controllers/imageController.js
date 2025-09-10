const SatelliteImage = require('../models/SatelliteImage');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|tiff|tif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).single('image');

exports.uploadImage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: 'File upload error',
        error: err.message
      });
    }
    
    try {
      const { title, description, lat, lng, dateTaken, tags } = req.body;
      
      const image = new SatelliteImage({
        title,
        description,
        imageUrl: `/uploads/${req.file.filename}`,
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        dateTaken,
        tags: tags ? tags.split(',') : [],
        uploadedBy: req.userId
      });
      
      await image.save();
      
      // Populate uploadedBy field
      await image.populate('uploadedBy', 'username email');
      
      res.status(201).json({
        message: 'Image uploaded successfully',
        image
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading image',
        error: error.message
      });
    }
  });
};

exports.getImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const images = await SatelliteImage.find()
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await SatelliteImage.countDocuments();
    
    res.json({
      images,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalImages: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching images',
      error: error.message
    });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const image = await SatelliteImage.findById(req.params.id)
      .populate('uploadedBy', 'username email');
    
    if (!image) {
      return res.status(404).json({
        message: 'Image not found'
      });
    }
    
    res.json(image);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching image',
      error: error.message
    });
  }
};
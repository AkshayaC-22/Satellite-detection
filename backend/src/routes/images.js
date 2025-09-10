const express = require('express');
const { uploadImage, getImages, getImageById } = require('../controllers/imageController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/upload', authenticate, uploadImage);
router.get('/', optionalAuth, getImages);
router.get('/:id', optionalAuth, getImageById);

module.exports = router;
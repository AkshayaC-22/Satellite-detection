const express = require('express');
const { createAnalysis, getAnalyses, getAnalysisById } = require('../controllers/analysisController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, createAnalysis);
router.get('/', optionalAuth, getAnalyses);
router.get('/:id', optionalAuth, getAnalysisById);

module.exports = router;
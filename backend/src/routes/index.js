const express = require('express');
const router = express.Router();
const uploadRoutes = require('./upload');

// Upload routes
router.use('/upload', uploadRoutes);

module.exports = router;
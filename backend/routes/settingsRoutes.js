const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// For now, allow BOSS and MANAGER to manage settings
const ALLOWED_ROLES = ['BOSS', 'MANAGER', 'admin'];

router.route('/')
    .get(protect, authorize(...ALLOWED_ROLES), getSettings)
    .put(protect, authorize(...ALLOWED_ROLES), updateSettings);

module.exports = router;

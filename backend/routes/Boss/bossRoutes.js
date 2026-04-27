const express = require('express');
const router = express.Router();
const bossController = require('../../controllers/Boss/bossController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);
router.use(authorize('BOSS', 'MANAGER'));

router.get('/stats', bossController.getBossStats);

module.exports = router;

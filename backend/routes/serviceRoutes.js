const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getAllServices);
router.post('/', serviceController.createService);
router.get('/nearby', serviceController.getNearbyServices);
router.patch('/:id/lifecycle', serviceController.updateLifecycle);

module.exports = router;


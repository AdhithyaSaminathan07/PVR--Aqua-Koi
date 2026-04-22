const express = require('express');
const router = express.Router();
const serviceController = require('../../controllers/Aqua/serviceController');

router.get('/', serviceController.getAllServices);
router.post('/', serviceController.createService);
router.get('/reminders', serviceController.getReminders);
router.get('/nearby', serviceController.getNearbyServices);
router.patch('/:id/lifecycle', serviceController.updateLifecycle);
router.post('/:id/log', serviceController.addServiceLog);

module.exports = router;

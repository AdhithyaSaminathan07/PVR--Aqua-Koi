const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getTasks, createTask, updateTaskStatus, getAssignedTasks } = require('../controllers/taskController');

router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.get('/assigned', protect, getAssignedTasks);
router.patch('/:id/status', protect, updateTaskStatus);

module.exports = router;

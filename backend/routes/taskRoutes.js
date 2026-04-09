const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTaskStatus } = require('../controllers/taskController');

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;

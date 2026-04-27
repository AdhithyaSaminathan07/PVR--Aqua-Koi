const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, deleteDepartment } = require('../../controllers/Boss/departmentController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getDepartments)
    .post(createDepartment);

router.route('/:id')
    .delete(deleteDepartment);

module.exports = router;

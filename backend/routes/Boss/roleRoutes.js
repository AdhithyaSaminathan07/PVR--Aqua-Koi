const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require('../../controllers/Boss/roleController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);
router.use(authorize('BOSS')); // Only BOSS can manage roles

router.route('/')
    .get(getRoles)
    .post(createRole);

router.route('/:id')
    .put(updateRole)
    .delete(deleteRole);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaintStatus } = require('../controllers/complaintController');

router.get('/', getComplaints);
router.post('/', createComplaint);
router.patch('/:id/status', updateComplaintStatus);

module.exports = router;

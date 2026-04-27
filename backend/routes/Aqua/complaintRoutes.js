const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaintStatus, updateComplaint, deleteComplaint } = require('../../controllers/Aqua/complaintController');

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id', updateComplaint);
router.patch('/:id/status', updateComplaintStatus);
router.post('/:id/convert', convertToTask);
router.delete('/:id', deleteComplaint);

module.exports = router;

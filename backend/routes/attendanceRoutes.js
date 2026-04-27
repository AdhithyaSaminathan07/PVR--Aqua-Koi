const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const ADMIN_ROLES = ['BOSS', 'MANAGER', 'admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'];

router.get('/', protect, authorize(...ADMIN_ROLES), attendanceController.getAttendanceData);
router.post('/rfid-attendance', protect, authorize(...ADMIN_ROLES), attendanceController.recordRFIDAttendance);
router.post('/enroll-face', protect, authorize(...ADMIN_ROLES), attendanceController.enrollFace);
router.post('/recognize-face', protect, authorize(...ADMIN_ROLES), attendanceController.recognizeFaceForAttendance);
router.get('/employees-with-face', protect, authorize(...ADMIN_ROLES), attendanceController.getEmployeesWithFace);
router.post('/correct-missing-punch', protect, authorize(...ADMIN_ROLES), attendanceController.correctMissingPunch);

module.exports = router;

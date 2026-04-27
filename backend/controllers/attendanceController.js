const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Boss/Employee');
const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');

// Feature flag for face recognition service
const FACE_RECOGNITION_ENABLED = process.env.FACE_RECOGNITION_ENABLED !== 'false';

// Helper function to calculate working duration and permissions for a single in-out pair
const calculateAttendanceDetails = (checkIn, checkOut, employee) => {
    if (!checkIn || !checkOut) {
        return {
            workingDuration: 0,
            lateArrival: 0,
            earlyLeaving: 0,
            totalPermissionTime: 0,
            overtime: 0
        };
    }

    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const durationInMs = checkOutTime.getTime() - checkInTime.getTime();
    const workingDuration = parseFloat((durationInMs / (1000 * 60)).toFixed(2));

    let lateArrival = 0;
    let earlyLeaving = 0;
    let overtime = 0;

    // Use default values if no shift info is present
    let startTime = "09:00 AM";
    let endTime = "06:00 PM";

    const parseTime = (timeStr) => {
        if (!timeStr) return [0, 0];
        const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
        if (!match) return [0, 0];
        let hours = parseInt(match[1], 10);
        let minutes = parseInt(match[2], 10);
        const modifier = match[3] ? match[3].toUpperCase() : null;
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return [hours, minutes];
    };

    const [shiftStartHours, shiftStartMinutes] = parseTime(startTime);
    const [shiftEndHours, shiftEndMinutes] = parseTime(endTime);

    const shiftStartDate = new Date(checkInTime);
    shiftStartDate.setHours(shiftStartHours, shiftStartMinutes, 0, 0);
    const shiftEndDate = new Date(checkInTime);
    shiftEndDate.setHours(shiftEndHours, shiftEndMinutes, 0, 0);

    if (checkInTime > shiftStartDate) {
        const lateMs = checkInTime.getTime() - shiftStartDate.getTime();
        lateArrival = parseFloat((lateMs / (1000 * 60)).toFixed(2));
    }
    if (checkOutTime < shiftEndDate) {
        const earlyMs = shiftEndDate.getTime() - checkOutTime.getTime();
        earlyLeaving = parseFloat((earlyMs / (1000 * 60)).toFixed(2));
    }
    const shiftDurationMinutes = (shiftEndDate.getTime() - shiftStartDate.getTime()) / (1000 * 60);
    if (workingDuration > shiftDurationMinutes) {
        overtime = parseFloat((workingDuration - shiftDurationMinutes).toFixed(2));
    }

    return {
        workingDuration,
        lateArrival,
        earlyLeaving,
        totalPermissionTime: parseFloat((lateArrival + earlyLeaving).toFixed(2)),
        overtime
    };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

const verifyLocation = async (branch, latitude, longitude) => {
    const settings = await Settings.findOne({ branch });
    if (!settings || !settings.locationRestriction || !settings.locationRestriction.isEnabled) {
        return true;
    }

    if (!latitude || !longitude) {
        throw new Error('Location is required for attendance in this branch.');
    }

    const distance = calculateDistance(
        latitude,
        longitude,
        settings.locationRestriction.latitude,
        settings.locationRestriction.longitude
    );

    if (distance > settings.locationRestriction.radius) {
        throw new Error(`Out of range. Current distance: ${Math.round(distance)}m, Allowed radius: ${settings.locationRestriction.radius}m`);
    }

    return true;
};

const handleAttendancePunch = async (employeeId, branch = 'Aqua') => {
    const today = new Date();

    // For lookup, we look for any incomplete record for this employee in this branch.
    // This allows punching in with RFID and punching out with Face, or vice-versa.
    // It also supports shifts that cross midnight.

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error('Employee not found');

    console.log(`Processing punch for: ${employee.name} (${employeeId}) at branch: ${branch}`);

    // Prevent double punch (within 1 minute)
    const PUNCH_COOLDOWN = 60000; // 1 minute in ms
    if (employee.lastAttendanceTime && (new Date() - new Date(employee.lastAttendanceTime)) < PUNCH_COOLDOWN) {
        const remaining = Math.ceil((PUNCH_COOLDOWN - (new Date() - new Date(employee.lastAttendanceTime))) / 1000);
        const error = new Error(`Please wait ${remaining} seconds before your next punch.`);
        error.statusCode = 429;
        throw error;
    }

    // Look for the most recent incomplete record for this employee at this branch
    // We limit this to records from the last 24 hours to prevent picking up very old forgotten punches
    const oneDayAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000));

    const todaysIncompleteRecord = await Attendance.findOne({
        worker: employeeId,
        branch,
        checkIn: { $gte: oneDayAgo },
        checkOut: { $exists: false }
    }).sort({ checkIn: -1 });

    if (todaysIncompleteRecord) {
        console.log(`Found incomplete record (In: ${todaysIncompleteRecord.checkIn}). Recording Punch Out.`);
        todaysIncompleteRecord.checkOut = new Date();
        const details = calculateAttendanceDetails(todaysIncompleteRecord.checkIn, todaysIncompleteRecord.checkOut, employee);
        Object.assign(todaysIncompleteRecord, details);
        const savedRecord = await todaysIncompleteRecord.save();

        employee.lastAttendanceTime = new Date();
        await employee.save();

        return {
            message: `Punch Out successful for ${employee.name}.`,
            worker: employee.name,
            attendance: savedRecord,
            type: 'checkout'
        };
    } else {
        console.log(`No incomplete record found. Recording new Punch In.`);
        const newAttendance = new Attendance({
            worker: employeeId,
            branch,
            checkIn: new Date()
        });
        const savedRecord = await newAttendance.save();

        employee.lastAttendanceTime = new Date();
        await employee.save();

        return {
            message: `Punch In successful for ${employee.name}.`,
            worker: employee.name,
            attendance: savedRecord,
            type: 'checkin'
        };
    }
};

exports.getAttendanceData = async (req, res) => {
    try {
        const branch = req.query.branch || 'Aqua';
        const now = new Date();
        const startOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        const endOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const allAttendance = await Attendance.find({
            branch,
            checkIn: { $gte: startOfRange, $lt: endOfRange }
        }).populate('worker', 'name rfid').lean();

        const grouped = {};
        allAttendance.forEach(record => {
            if (!record.worker) return;
            const workerId = record.worker._id.toString();
            if (!grouped[workerId]) grouped[workerId] = {};
            const d = new Date(record.checkIn);
            const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!grouped[workerId][dateKey]) grouped[workerId][dateKey] = [];
            grouped[workerId][dateKey].push(record);
        });

        const employees = await Employee.find({ branch, status: 'Active' }).lean();
        const combinedData = employees.map(emp => {
            const empId = emp._id.toString();
            const attendanceByDate = grouped[empId] || {};
            const groupedArray = Object.keys(attendanceByDate).map(dateKey => ({
                date: dateKey,
                records: attendanceByDate[dateKey]
            }));
            return { ...emp, attendanceRecordsGroupedByDate: groupedArray };
        });

        res.json(combinedData);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyAttendanceData = async (req, res) => {
    try {
        const employeeId = req.query.employeeId || req.user.employeeId;
        if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

        const now = new Date();
        const startOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60); // Last 60 days

        const attendance = await Attendance.find({
            worker: employeeId,
            checkIn: { $gte: startOfRange }
        }).sort({ checkIn: -1 }).lean();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getEmployeesWithFace = async (req, res) => {
    try {
        const branch = req.query.branch || 'Aqua';
        const employees = await Employee.find({ branch, "faceEncodings.0": { "$exists": true }, status: 'Active' })
            .select('name _id faceEncodings designation rfid')
            .lean();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching face data', error: error.message });
    }
};

exports.recordRFIDAttendance = async (req, res) => {
    let { rfid, branch, latitude, longitude } = req.body;
    if (!branch) branch = 'Aqua';
    if (rfid) rfid = rfid.trim();
    if (!rfid) return res.status(400).json({ message: 'RFID is required.' });

    try {
        // Verify Location
        try {
            await verifyLocation(branch, latitude, longitude);
        } catch (locationError) {
            return res.status(403).json({ message: locationError.message });
        }

        const employee = await Employee.findOne({ $or: [{ rfid }, { _id: mongoose.isValidObjectId(rfid) ? rfid : null }], branch });
        if (!employee) return res.status(404).json({ message: 'No employee found with this ID/RFID in this branch.' });

        const result = await handleAttendancePunch(employee._id, branch);
        res.json({ ...result, rfid: employee.rfid });
    } catch (error) {
        console.error('RFID Attendance Error:', error.message);
        res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : 'Server error.',
            error: error.message
        });
    }
};

exports.enrollFace = async (req, res) => {
    const { employeeId, faceDescriptors } = req.body;
    if (!employeeId || !faceDescriptors) return res.status(400).json({ message: 'Missing data' });

    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const formatted = faceDescriptors.map(desc => Array.isArray(desc) ? desc : Array.from(desc));
        employee.faceEncodings = (employee.faceEncodings || []).concat(formatted);
        await employee.save();
        res.json({ message: 'Face enrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling face', error: error.message });
    }
};

exports.recognizeFaceForAttendance = async (req, res) => {
    let { faceDescriptor, branch, latitude, longitude } = req.body;
    if (!branch) branch = 'Aqua';
    if (!faceDescriptor) return res.status(400).json({ message: 'Face descriptor is required.' });

    try {
        // Verify Location
        try {
            await verifyLocation(branch, latitude, longitude);
        } catch (locationError) {
            return res.status(403).json({ message: locationError.message });
        }
        const employees = await Employee.find({ branch, "faceEncodings.0": { "$exists": true }, status: 'Active' });
        let bestMatch = null;
        let bestDistance = Infinity;
        const threshold = 0.5;

        for (const emp of employees) {
            for (const enrolled of emp.faceEncodings) {
                let sum = 0;
                for (let i = 0; i < faceDescriptor.length; i++) {
                    const diff = faceDescriptor[i] - enrolled[i];
                    sum += diff * diff;
                }
                const distance = Math.sqrt(sum);
                if (distance < threshold && distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = emp;
                }
            }
        }

        if (!bestMatch) return res.status(404).json({ message: 'Face not recognized in this branch.' });

        const result = await handleAttendancePunch(bestMatch._id, branch);
        res.json({ ...result, confidence: Math.round((1 - bestDistance) * 100) });
    } catch (error) {
        console.error('Face Attendance Error:', error.message);
        res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : 'Server error.',
            error: error.message
        });
    }
};

exports.correctMissingPunch = async (req, res) => {
    const { employeeId, checkOutTime } = req.body;
    if (!employeeId || !checkOutTime) return res.status(400).json({ message: 'Missing data' });

    try {
        const incomplete = await Attendance.findOne({
            worker: employeeId,
            checkOut: { $exists: false }
        }).sort({ checkIn: -1 });

        if (!incomplete) return res.status(404).json({ message: 'No incomplete record found.' });

        incomplete.checkOut = new Date(checkOutTime);
        incomplete.isManualCorrection = true;
        const employee = await Employee.findById(employeeId);
        const details = calculateAttendanceDetails(incomplete.checkIn, incomplete.checkOut, employee);
        Object.assign(incomplete, details);
        await incomplete.save();

        res.json({ message: 'Missing punch corrected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error correcting punch', error: error.message });
    }
};

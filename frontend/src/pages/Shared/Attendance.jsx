import React from 'react';
import AttendanceTracker from '../../components/Attendance/AttendanceTracker';
import { motion } from 'framer-motion';

const AttendancePage = () => {
    const branch = window.location.pathname.includes('/koi') ? 'Koi' : 'Aqua';

    return (
        <div className="py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <AttendanceTracker branch={branch} />
            </motion.div>
        </div>
    );
};

export default AttendancePage;

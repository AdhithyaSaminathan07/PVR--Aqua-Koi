import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    CreditCard,
    Download,
    Search,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    Camera
} from 'lucide-react';
import { getAttendance, correctMissingPunch } from '../../services/api';
import RFIDAttendance from './RFIDAttendance';
import FaceAttendance from './FaceAttendance';
import { generateAttendanceReportPdf } from '../../utils/generateAttendanceReportPdf';
import Modal from '../Modal';

const AttendanceTracker = ({ branch = 'Aqua' }) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRFIDModal, setShowRFIDModal] = useState(false);
    const [showFaceModal, setShowFaceModal] = useState(false);
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [correctionTime, setCorrectionTime] = useState('');

    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAttendance(branch);
            setAttendance(res.data);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const formatTime = (dateString) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleCorrection = async () => {
        if (!selectedWorker || !correctionTime) return;
        try {
            await correctMissingPunch({
                employeeId: selectedWorker._id,
                checkOutTime: correctionTime
            });
            setShowCorrectionModal(false);
            fetchAttendance();
        } catch (err) {
            alert('Error correcting punch');
        }
    };

    const formatDuration = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '--:--:--';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.max(0, end - start);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const filteredAttendance = attendance.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rfid?.includes(searchTerm)
    );

    const sortedAttendance = [...filteredAttendance].sort((a, b) => {
        const getLatestTimestamp = (item) => {
            const allGroups = item.attendanceRecordsGroupedByDate || [];
            if (allGroups.length === 0) return 0;
            const lastGroup = allGroups[allGroups.length - 1];
            const records = lastGroup.records || [];
            if (records.length === 0) return 0;
            const lastRec = records[records.length - 1];
            const latestAction = lastRec.checkOut || lastRec.checkIn;
            return latestAction ? new Date(latestAction).getTime() : 0;
        };
        return getLatestTimestamp(b) - getLatestTimestamp(a);
    });

    const displayRows = React.useMemo(() => {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const allRows = [];
        sortedAttendance.forEach(emp => {
            const groups = emp.attendanceRecordsGroupedByDate || [];
            groups.forEach(group => {
                allRows.push({
                    ...emp,
                    displayDate: group.date,
                    displayRecords: group.records,
                    isToday: group.date === today
                });
            });
        });

        allRows.sort((a, b) => {
            if (b.displayDate !== a.displayDate) {
                return b.displayDate.localeCompare(a.displayDate);
            }
            return a.name.localeCompare(b.name);
        });
        return allRows;
    }, [sortedAttendance]);

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Attendance Tracker</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Real-time workplace activity monitoring</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 ${branch === 'Koi' ? 'focus:ring-orange-500' : 'focus:ring-blue-500'} outline-none transition-all`}
                        />
                    </div>

                    <button
                        onClick={() => setShowRFIDModal(true)}
                        className={`${branch === 'Koi' ? 'bg-orange-600 shadow-orange-900/20 hover:bg-orange-700' : 'bg-blue-600 shadow-blue-900/20 hover:bg-blue-700'} text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2`}
                    >
                        <CreditCard size={14} /> RFID
                    </button>

                    <button
                        onClick={() => setShowFaceModal(true)}
                        className={`${branch === 'Koi' ? 'bg-amber-600 shadow-amber-900/20 hover:bg-amber-700' : 'bg-indigo-600 shadow-indigo-900/20 hover:bg-indigo-700'} text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2`}
                    >
                        <Camera size={14} /> FACE
                    </button>

                    <button
                        onClick={() => generateAttendanceReportPdf(displayRows)}
                        className="bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
                    >
                        <Download size={14} /> PDF
                    </button>

                    <button
                        onClick={fetchAttendance}
                        className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <Clock size={18} className="text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto -mx-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Punch In</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Punch Out</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading && (
                            <tr>
                                <td colSpan="5" className="px-8 py-12 text-center text-gray-400 animate-pulse font-medium italic">
                                    Syncing attendance data...
                                </td>
                            </tr>
                        )}
                        {!loading && displayRows.map((item, i) => {
                            const records = item.displayRecords || [];
                            const latest = records[records.length - 1];
                            const isActive = item.isToday && latest && !latest.checkOut;

                            return (
                                <motion.tr
                                    key={`${item._id}-${item.displayDate}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`hover:${branch === 'Koi' ? 'bg-orange-50/30' : 'bg-blue-50/30'} transition-colors group ${item.isToday ? 'bg-white' : 'bg-gray-50/30'}`}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isActive ? (branch === 'Koi' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20') : 'bg-gray-100 text-gray-600'}`}>
                                                {item.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.designation} • {item.rfid || 'No RFID'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{formatDate(item.displayDate)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {records.length > 0 ? records.map((rec, idx) => (
                                            <div key={idx} className="text-xs font-bold text-teal-600 mb-1 whitespace-nowrap">
                                                {formatTime(rec.checkIn)}
                                            </div>
                                        )) : <span className="text-gray-300 text-xs italic">No record</span>}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {records.length > 0 ? records.map((rec, idx) => (
                                            <div key={idx} className="text-xs font-bold text-rose-500 mb-1 whitespace-nowrap">
                                                {rec.checkOut ? formatTime(rec.checkOut) : '--:--:--'}
                                            </div>
                                        )) : <span className="text-gray-300 text-xs italic">--:--:--</span>}
                                    </td>
                                    <td className="px-8 py-5 text-center font-mono font-bold text-gray-900 text-sm">
                                        {(() => {
                                            const totalMs = records.reduce((acc, rec) => {
                                                if (!rec.checkIn || !rec.checkOut) return acc;
                                                const start = new Date(rec.checkIn);
                                                const end = new Date(rec.checkOut);
                                                return acc + Math.max(0, end - start);
                                            }, 0);

                                            if (totalMs === 0) return '00:00:00';

                                            const hours = Math.floor(totalMs / 3600000);
                                            const minutes = Math.floor((totalMs % 3600000) / 60000);
                                            const seconds = Math.floor((totalMs % 60000) / 1000);
                                            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                                        })()}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showRFIDModal}
                onClose={() => setShowRFIDModal(false)}
                title="Scan RFID Card"
            >
                <RFIDAttendance branch={branch} onAttendanceRecorded={() => { setShowRFIDModal(false); fetchAttendance(); }} />
            </Modal>

            <Modal
                isOpen={showFaceModal}
                onClose={() => setShowFaceModal(false)}
                title="Face Recognition Attendance"
            >
                <FaceAttendance branch={branch} onAttendanceRecorded={() => { setShowFaceModal(false); fetchAttendance(); }} />
            </Modal>

            <Modal
                isOpen={showCorrectionModal}
                onClose={() => setShowCorrectionModal(false)}
                title="Manual Punch Correction"
            >
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6">Correct missing punch out for <span className="font-bold text-gray-900">{selectedWorker?.name}</span>.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Punch Out Time</label>
                            <input
                                type="datetime-local"
                                value={correctionTime}
                                onChange={(e) => setCorrectionTime(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ${branch === 'Koi' ? 'focus:ring-orange-500' : 'focus:ring-blue-500'}`}
                            />
                        </div>
                        <button
                            onClick={handleCorrection}
                            className={`w-full py-4 ${branch === 'Koi' ? 'bg-orange-600 shadow-orange-900/20 hover:bg-orange-700' : 'bg-blue-600 shadow-blue-900/20 hover:bg-blue-700'} text-white rounded-2xl font-bold text-sm shadow-lg transition-all`}
                        >
                            Confirm Correction
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AttendanceTracker;

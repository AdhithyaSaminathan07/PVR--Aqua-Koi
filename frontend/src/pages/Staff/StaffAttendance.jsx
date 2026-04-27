import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    ArrowLeft,
    Loader2,
    Filter,
    MapPin,
    ArrowUpRight,
    Search
} from 'lucide-react';
import * as api from '../../services/api';
import { motion } from 'framer-motion';

const StaffAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDays: 0,
        avgWorkingHours: 0,
        lateArrivals: 0
    });

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.getMyAttendance();
            const data = res.data;
            setAttendance(data);

            // Calculate simple stats
            if (data.length > 0) {
                const totalLate = data.filter(r => r.lateArrival > 0).length;
                const totalHours = data.reduce((acc, r) => acc + (r.workingDuration || 0), 0) / 60;
                setStats({
                    totalDays: data.length,
                    avgWorkingHours: (totalHours / data.length).toFixed(1),
                    lateArrivals: totalLate
                });
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Report</h1>
                    <p className="text-gray-500 font-medium mt-1">Review your check-in history and working hours.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <button onClick={fetchAttendance} className="p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <Filter size={18} className="text-gray-400" />
                    </button>
                    <div className="h-6 w-[1px] bg-gray-100"></div>
                    <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest">Last 60 Days</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Calendar size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Present</p>
                        <p className="text-4xl font-black text-gray-900">{stats.totalDays} Days</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Daily Hours</p>
                        <p className="text-4xl font-black text-gray-900">{stats.avgWorkingHours}h</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertCircle size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Late Arrivals</p>
                        <p className="text-4xl font-black text-gray-900">{stats.lateArrivals}</p>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <Clock className="text-blue-600" size={20} />
                        Detailed Log
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Check In</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Check Out</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center"><Loader2 className="animate-spin inline-block mr-2 text-blue-600" /> <span className="text-gray-400 italic">Compiling logs...</span></td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 italic font-medium">No attendance records found for this period.</td></tr>
                            ) : (
                                attendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-6 font-bold text-gray-700">{formatDate(record.checkIn)}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="font-black text-gray-900">{formatTime(record.checkIn)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                <span className="font-black text-gray-900">{formatTime(record.checkOut)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-wider">
                                                {record.workingDuration ? `${(record.workingDuration / 60).toFixed(1)} Hours` : 'In Progress'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {record.lateArrival > 0 ? (
                                                <span className="flex items-center gap-1.5 text-rose-500 font-black text-[10px] bg-rose-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider">
                                                    <AlertCircle size={12} />
                                                    Late ({record.lateArrival}m)
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider">
                                                    <CheckCircle2 size={12} />
                                                    On Time
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffAttendance;

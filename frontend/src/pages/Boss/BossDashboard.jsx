import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield,
    Users,
    TrendingUp,
    DollarSign,
    Package,
    Activity,
    CheckSquare,
    ChevronRight,
    ArrowRight,
    Briefcase,
    Globe,
    Zap,
    Loader2
} from 'lucide-react';
import { getBossStats } from '../../services/api';

const StatCard = ({ label, sub, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-6 hover:shadow-md transition-all cursor-pointer group"
    >
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">{label}</h4>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{sub}</p>
        </div>
        <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
    </motion.div>
);

const BossDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await getBossStats();
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-gray-400 font-bold italic animate-pulse">Aggregating Global Systems Data...</p>
            </div>
        );
    }

    return (
        <div className="py-4 lg:py-6">

            {/* Quick Access Grid */}
            <div className="mb-8 lg:mb-12">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Primary Modules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <Link to="/boss/aqua/dashboard">
                        <StatCard
                            label="Aqua Management"
                            sub={`${stats?.branches.aqua.orders} Active Orders`}
                            icon={Briefcase}
                            color="bg-[#2988FF]"
                            delay={0.1}
                        />
                    </Link>
                    <Link to="/boss/koi/dashboard">
                        <StatCard
                            label="Koi Centre"
                            sub={`${stats?.branches.koi.orders} Active Orders`}
                            icon={Globe}
                            color="bg-[#60A7FF]"
                            delay={0.2}
                        />
                    </Link>
                    <Link to="/boss/users">
                        <StatCard
                            label="User Controls"
                            sub="Access & Permissions"
                            icon={Users}
                            color="bg-indigo-500"
                            delay={0.3}
                        />
                    </Link>
                </div>
            </div>

            {/* Main Stats and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Activity Feed (Large Area) */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900">Recent Activity</h3>
                    </div>

                    <div className="bg-white rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-8 border border-gray-50 shadow-sm relative min-h-[350px] lg:min-h-[400px] flex flex-col justify-between overflow-hidden">
                        <div className="relative z-10 space-y-4 lg:space-y-6">
                            {stats?.recentActivity.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 lg:gap-4 group">
                                    <div className={`w-10 h-10 lg:w-12 lg:h-12 ${item.type === 'Aqua' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'} rounded-xl flex items-center justify-center shrink-0`}>
                                        {item.type === 'Aqua' ? <Briefcase size={18} /> : <Globe size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                                        <p className="text-[10px] lg:text-xs text-gray-400 font-medium tracking-tight whitespace-nowrap">{item.type} Branch Operation</p>
                                    </div>
                                    <p className="font-bold text-sm lg:text-base text-black italic shrink-0">{item.val}</p>
                                </div>
                            ))}
                            {stats?.recentActivity.length === 0 && <p className="text-center py-20 text-gray-400 italic">No recent activity detected.</p>}
                        </div>

                        {/* Chart labels */}
                        <div className="relative z-10 hidden sm:flex justify-between text-[10px] font-bold text-gray-300 uppercase mt-auto pt-8 border-t border-gray-50">
                            <span>Performance monitoring active across all nodes</span>
                        </div>
                    </div>
                </div>

                {/* Performance / Revenue */}
                <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">Financials</h3>
                    <div className="bg-white rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-10 border border-gray-50 shadow-sm flex flex-col items-center gap-6">
                        <div className="relative w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#F0F7FF" strokeWidth="12" />
                                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#2988FF" strokeWidth="12" strokeDasharray="250" strokeDashoffset={250 - (250 * (stats?.resolutionRate || 0) / 100)} strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <p className="text-[8px] lg:text-[10px] font-bold text-gray-400 uppercase">Resolution</p>
                                <p className="text-xl lg:text-2xl font-bold italic">{stats?.resolutionRate}%</p>
                            </div>
                        </div>

                        <div className="w-full space-y-3 lg:space-y-4">
                            <div className="flex justify-between items-center bg-[#F0F7FF] p-3 lg:p-4 rounded-xl lg:rounded-2xl">
                                <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</span>
                                <span className="font-bold text-sm lg:text-base">₹{(stats?.totalRevenue / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#F0F7FF] p-3 lg:p-4 rounded-xl lg:rounded-2xl">
                                <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">Customers</span>
                                <span className="font-bold text-sm lg:text-base">{stats?.totalCustomers}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BossDashboard;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    ShoppingCart,
    Wallet,
    Clock,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Package,
    AlertCircle,
    Wrench,
    Loader2,
    ArrowRight,
    Droplets
} from 'lucide-react';
import { getCustomers, getOrders, getTasks, getProducts } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color, loading, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col gap-4 hover:shadow-md transition-all group"
    >
        <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? <Loader2 className="animate-spin text-gray-200" size={20} /> : value}
            </p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        customers: 0,
        orders: 0,
        balance: 0,
        tasks: 0,
        lowStock: 0,
        recentTasks: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [custRes, ordRes, taskRes, prodRes] = await Promise.all([
                getCustomers(), getOrders(), getTasks(), getProducts()
            ]);

            const balance = ordRes.data.reduce((acc, o) => acc + ((o.totalAmount || 0) - (o.paidAmount || 0)), 0);
            const lowStock = prodRes.data.filter(p => (p.stock || 0) <= (p.lowStockThreshold || 0)).length;

            setStats({
                customers: custRes.data.length,
                orders: ordRes.data.length,
                balance,
                tasks: taskRes.data.filter(t => t.status !== 'Completed').length,
                lowStock,
                recentTasks: taskRes.data.slice(0, 3)
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-4 lg:py-6">
            {/* Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#E6F0FF] rounded-2xl lg:rounded-[3rem] p-6 sm:p-8 lg:p-12 overflow-hidden mb-8 lg:mb-12"
            >
                <div className="relative z-10 max-w-lg text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a365d] mb-4 leading-tight">
                        Aqua Hub <br />
                        <span className="text-[#2988FF]">Operations Manager</span>
                    </h1>
                    <p className="text-[#1a365d]/60 text-sm sm:text-base font-medium mb-6 lg:mb-8 text-balance">
                        Monitor aquaculture operations, inventory health, and field task distribution.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                        <button className="bg-[#1a365d] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
                            New Task <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:flex items-center justify-center opacity-20">
                    <Droplets size={240} className="text-[#2988FF]" />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
                <StatCard
                    title="Total Customers"
                    value={stats.customers}
                    icon={Users}
                    color="bg-blue-500"
                    loading={loading}
                    delay={0.1}
                />
                <StatCard
                    title="Active Orders"
                    value={stats.orders}
                    icon={ShoppingCart}
                    color="bg-cyan-500"
                    loading={loading}
                    delay={0.2}
                />
                <StatCard
                    title="Pending Payments"
                    value={`₹${(stats.balance / 1000).toFixed(1)}K`}
                    icon={Wallet}
                    color="bg-red-500"
                    loading={loading}
                    delay={0.3}
                />
                <StatCard
                    title="Ongoing Tasks"
                    value={stats.tasks}
                    icon={Clock}
                    color="bg-indigo-500"
                    loading={loading}
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Recent Tasks</h2>
                        <Link to="/tasks" className="text-[#2988FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
                    </div>

                    <div className="bg-white rounded-2xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 border border-gray-50 shadow-sm space-y-3 lg:space-y-4">
                        {stats.recentTasks.map((task, i) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-4 lg:p-5 bg-[#F5F9FC]/50 rounded-xl lg:rounded-[1.5rem] hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3 lg:gap-4">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-[#2988FF] group-hover:text-white transition-all shrink-0">
                                        <Wrench size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{task.description}</h4>
                                        <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5 truncate">{task.assignedStaff}</p>
                                    </div>
                                </div>
                                <span className={`px-2 sm:px-4 py-1 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 shrink-0`}>
                                    {task.status}
                                </span>
                            </motion.div>
                        ))}
                        {stats.recentTasks.length === 0 && <p className="text-center py-8 lg:py-12 text-gray-400 italic font-medium">No tasks found.</p>}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">Inventory Health</h2>
                    <div className="bg-indigo-900 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-10 text-white relative overflow-hidden min-h-[250px] lg:h-[300px] flex flex-col justify-between shadow-xl shadow-indigo-900/20">
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <Package size={200} />
                        </div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <AlertCircle size={18} className={stats.lowStock > 0 ? "text-red-400 animate-pulse" : "text-white/40"} />
                            </div>
                            <span className="text-[8px] lg:text-[10px] font-bold opacity-50 uppercase tracking-widest">Global Stock</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                            <p className="text-4xl lg:text-5xl font-bold italic">{stats.lowStock}</p>
                            <p className="text-[8px] lg:text-[10px] font-bold opacity-50 uppercase tracking-widest mt-2">Low Stock Alerts</p>
                        </div>

                        <Link to="/inventory" className="relative z-10 w-full py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-bold uppercase tracking-widest transition-all text-center mt-4">
                            Manage Storage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

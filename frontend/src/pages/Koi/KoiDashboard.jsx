import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    Package,
    Fish,
    ArrowRight,
    CreditCard,
    MessageSquare
} from 'lucide-react';
import { getKoiOrders, getPendingKoiPayments, getLowKoiStock, getKoiCustomers, getKoiEnquiries } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-4 hover:shadow-md transition-all group"
    >
        <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-[#F97316] text-[10px] font-bold uppercase tracking-widest opacity-80">{title}</h3>
            <p className="text-2xl font-black text-[#1a365d] mt-1 italic tracking-tight">{value}</p>
        </div>
    </motion.div>
);

const KoiDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingPayments: 0,
        lowStockItems: 0,
        totalCustomers: 0,
        totalEnquiries: 0,
        recentOrders: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [orders, pending, lowStock, customers, enquiries] = await Promise.all([
                    getKoiOrders(),
                    getPendingKoiPayments(),
                    getLowKoiStock(),
                    getKoiCustomers(),
                    getKoiEnquiries()
                ]);
                setStats({
                    totalOrders: orders.data.length,
                    pendingPayments: pending.data.length,
                    lowStockItems: lowStock.data.length,
                    totalCustomers: customers.data.length,
                    totalEnquiries: enquiries.data.length,
                    recentOrders: orders.data.slice(0, 5)
                });
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="py-6">
            {/* Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#FFF4E6] rounded-2xl p-8 sm:p-12 overflow-hidden mb-8 lg:mb-12"
            >
                <div className="relative z-10 max-w-lg text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F97316] mb-4 leading-tight">
                        Koi Hub <br />
                        <span className="text-[#F97316]">Centre Operations</span>
                    </h1>
                    <p className="text-[#1a365d]/60 text-sm sm:text-base font-medium mb-6 lg:mb-8 text-balance">
                        Track premium koi inventory, manage high-value sales & enquiries.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                        <button className="bg-[#1a365d] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
                            New Sale <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:flex items-center justify-center opacity-20">
                    <Fish size={240} className="text-[#F97316]" />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    color="bg-orange-500"
                    delay={0.1}
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.pendingPayments}
                    icon={CreditCard}
                    color="bg-red-500"
                    delay={0.2}
                />
                <StatCard
                    title="Low Stock"
                    value={stats.lowStockItems}
                    icon={AlertCircle}
                    color="bg-cyan-500"
                    delay={0.3}
                />
                <StatCard
                    title="Customers"
                    value={stats.totalCustomers}
                    icon={Users}
                    color="bg-indigo-500"
                    delay={0.4}
                />
                <StatCard
                    title="Live Enquiries"
                    value={stats.totalEnquiries}
                    icon={MessageSquare}
                    color="bg-blue-500"
                    delay={0.5}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-50 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map((order, i) => (
                                        <motion.tr
                                            key={order._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="hover:bg-orange-50/50 transition-all group cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">
                                                        {order.customer?.name?.[0]}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600">{order.customer?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.totalAmount}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Alerts</h2>
                    <div className="space-y-4">
                        {stats.lowStockItems > 0 && (
                            <div className="p-6 bg-[#F97316] rounded-2xl text-white shadow-lg shadow-orange-900/20 relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                                    <Package size={100} />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Inventory</h4>
                                <p className="text-2xl font-bold mb-1">{stats.lowStockItems} Items Low</p>
                                <p className="text-[10px] font-medium opacity-70 leading-relaxed mb-4">Stock levels critically low across multiple koi varieties.</p>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Restock Now</button>
                            </div>
                        )}

                        <div className="p-6 bg-[#1a365d] rounded-2xl text-white shadow-lg shadow-orange-900/20 relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                                <Clock size={100} />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Finance</h4>
                            <p className="text-2xl font-bold mb-1">{stats.pendingPayments} Pending</p>
                            <p className="text-[10px] font-medium opacity-70 leading-relaxed mb-4">Follow up on high-value koi sales payments.</p>
                            <Link to="/koi/payments" className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-center">Open Payments</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KoiDashboard;

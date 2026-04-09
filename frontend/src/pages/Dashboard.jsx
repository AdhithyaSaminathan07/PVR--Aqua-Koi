import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Loader2
} from 'lucide-react';
import { getCustomers, getOrders, getTasks, getProducts } from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color, loading }) => (
    <div className="card group hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                <Icon size={24} />
            </div>
            {!loading && trend && (
                <span className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'} bg-gray-50 px-2 py-1 rounded-full`}>
                    {trend > 0 ? '+' : ''}{trend}%
                    <TrendingUp size={12} className="ml-1" />
                </span>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? <Loader2 className="animate-spin text-gray-300" size={24} /> : value}</p>
    </div>
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display italic leading-tight">Welcome to Aqua Manager</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest italic opacity-70">Aquaculture Operations Control Center</p>
                </div>
                <button className="btn-primary">
                    <Calendar size={18} />
                    <span>Generate Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Customers"
                    value={stats.customers}
                    icon={Users}
                    color="bg-primary-500"
                    loading={loading}
                />
                <StatCard
                    title="Active Orders"
                    value={stats.orders}
                    icon={ShoppingCart}
                    color="bg-aqua-500"
                    loading={loading}
                />
                <StatCard
                    title="Pending Payments"
                    value={`₹${(stats.balance / 1000).toFixed(1)}K`}
                    icon={Wallet}
                    color="bg-orange-500"
                    loading={loading}
                />
                <StatCard
                    title="Ongoing Tasks"
                    value={stats.tasks}
                    icon={Clock}
                    color="bg-purple-500"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 font-display">Tasks in Progress</h2>
                        <Link to="/tasks" className="text-primary-600 text-sm font-semibold hover:underline border-b-2 border-primary-50">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recentTasks.map((task) => (
                            <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Wrench size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">{task.description}</h4>
                                        <p className="text-xs text-gray-500 italic mt-0.5">{task.customerId?.name} • {task.assignedStaff}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] uppercase font-bold rounded-full">{task.status}</span>
                                    <ArrowUpRight size={16} className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                            </div>
                        ))}
                        {stats.recentTasks.length === 0 && <p className="text-center py-8 text-gray-400 italic">No tasks active.</p>}
                    </div>
                </div>

                <div className="card border-none bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 opacity-5">
                        <Package size={200} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold font-display italic">Inventory Health</h2>
                            <AlertCircle size={20} className={stats.lowStock > 0 ? "text-red-400 animate-pulse" : "text-gray-500"} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center text-center">
                            <p className="text-4xl font-bold font-display">{stats.lowStock}</p>
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mt-2 italic">Low Stock Items</p>
                        </div>
                        <Link to="/inventory" className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 text-white text-center rounded-xl text-xs font-bold transition-colors uppercase tracking-widest">
                            Manage Inventory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

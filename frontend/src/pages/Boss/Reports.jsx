import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart, MessageSquare, AlertCircle, Calendar, Download, Filter, Loader2 } from 'lucide-react';
import { getBossStats } from '../../services/api';

const BossReports = () => {
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
                <p className="text-gray-400 font-bold italic animate-pulse">Generating Global Analytics...</p>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 lg:mb-10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BarChart3 className="text-indigo-600" size={32} />
                            Strategic Global Reports
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">Real-time business intelligence across all branches</p>
                    </div>
                </div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign size={80} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Revenue (Net)</p>
                        <h3 className="text-3xl font-bold text-gray-900">₹{(stats?.totalRevenue / 100000).toFixed(2)}L</h3>
                        <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-sm">
                            <TrendingUp size={16} />
                            Active Stream
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShoppingCart size={80} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Combined Orders</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stats?.totalOrders}</h3>
                        <p className="mt-4 text-gray-400 text-sm font-medium">Aqua: {stats?.branches.aqua.orders} | Koi: {stats?.branches.koi.orders}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageSquare size={80} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resolution Rate</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stats?.resolutionRate}%</h3>
                        <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${stats?.resolutionRate}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Inventory Analysis */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Package size={20} className="text-indigo-600" />
                                Stock Alerts
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-red-50 border border-red-100">
                                <span className="font-semibold text-red-700 uppercase text-xs tracking-tighter">Aqua Low Stock</span>
                                <span className="text-xl font-black text-red-700">{stats?.branches.aqua.lowStock} Items</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-orange-50 border border-orange-100">
                                <span className="font-semibold text-orange-700 uppercase text-xs tracking-tighter">Koi Low Stock</span>
                                <span className="text-xl font-black text-orange-700">{stats?.branches.koi.lowStock} Items</span>
                            </div>
                        </div>
                    </div>

                    {/* Department Performance */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-600" />
                                Revenue Split
                            </h2>
                        </div>
                        <div className="space-y-8 mt-4">
                            {[
                                { branch: 'Aqua Culture', metric: 'Revenue Share', value: stats?.totalRevenue > 0 ? ((stats.branches.aqua.revenue / stats.totalRevenue) * 100).toFixed(0) : 0 },
                                { branch: 'Koi Centre', metric: 'Revenue Share', value: stats?.totalRevenue > 0 ? ((stats.branches.koi.revenue / stats.totalRevenue) * 100).toFixed(0) : 0 },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="font-bold text-gray-900">{item.branch}</p>
                                        <p className="text-xs font-bold text-gray-400 tracking-wider text-right">{item.metric}: <span className="text-indigo-600">{item.value}%</span></p>
                                    </div>
                                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-1000 ease-out"
                                            style={{ width: `${item.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BossReports;

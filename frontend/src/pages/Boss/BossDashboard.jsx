import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Package, Settings, Database, Activity, CheckSquare } from 'lucide-react';

const BossDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="text-indigo-600" size={36} />
                            Boss Command Centre
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Super Admin Control • PVR Aqua & Koi Management</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                            Download Global Audit
                        </button>
                    </div>
                </div>

                {/* KPI Overviews */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Combined Revenue', value: '₹18.2L', icon: DollarSign, color: 'bg-emerald-500' },
                        { label: 'Total Customers', value: '1,240', icon: Users, color: 'bg-blue-500' },
                        { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'bg-indigo-500' },
                        { label: 'Pending Tasks', value: '14', icon: CheckSquare, color: 'bg-orange-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Activity Feed */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-600" />
                            Global Activity Stream
                        </h2>
                        <div className="space-y-6">
                            {[
                                { title: 'New Aqua Order', sub: 'Customer: Rajesh Kumar • ₹12,500', time: '5 mins ago' },
                                { title: 'Koi Enquiry Resolved', sub: 'Staff: Suresh B. • Enquiry #902', time: '12 mins ago' },
                                { title: 'Inventory Alert', sub: 'Low Stock: Premium Koi Pellets (2kg)', time: '45 mins ago' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.title}</p>
                                        <p className="text-sm text-gray-500">{item.sub} • {item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Management */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-indigo-600" />
                            Quick Controls
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/aqua-dashboard" className="p-6 bg-primary-50 rounded-2xl border border-primary-100 hover:bg-primary-100 transition-all group">
                                <p className="font-bold text-primary-700">Aqua Manager</p>
                                <p className="text-xs text-primary-500 mt-1">Inventory & services oversight</p>
                            </Link>
                            <Link to="/boss/koi/dashboard" className="p-6 bg-orange-50 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-all group">
                                <p className="font-bold text-orange-700">Koi Centre</p>
                                <p className="text-xs text-orange-500 mt-1">Orders & billing oversight</p>
                            </Link>
                            <Link to="/employees" className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all group">
                                <p className="font-bold text-emerald-700">Staff Control</p>
                                <p className="text-xs text-emerald-500 mt-1">Manage all employees</p>
                            </Link>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 opacity-50 cursor-not-allowed">
                                <p className="font-bold text-gray-700">System Logs</p>
                                <p className="text-xs text-gray-500 mt-1">Security logs (Coming Soon)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit History */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6">Recent System Audit</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="pb-4">Timestamp</th>
                                    <th className="pb-4">Action</th>
                                    <th className="pb-4">User</th>
                                    <th className="pb-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[1, 2, 3].map((_, i) => (
                                    <tr key={i} className="text-sm">
                                        <td className="py-4 text-gray-500">2026-04-11 12:45</td>
                                        <td className="py-4 font-semibold">Bulk Price Update</td>
                                        <td className="py-4 text-gray-600">Admin_99</td>
                                        <td className="py-4 text-right"><span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase">Success</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BossDashboard;

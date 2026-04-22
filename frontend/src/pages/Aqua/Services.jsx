import React, { useState, useEffect, useMemo } from 'react';
import {
    Wrench, Calendar, Clock, RefreshCcw, Sparkles, Loader2, Bell,
    AlertTriangle, CheckCircle2, Plus, User, ChevronDown, ChevronUp,
    Shield, Zap, Filter as FilterIcon, ClipboardList
} from 'lucide-react';
import {
    getServices, createService, getCustomers, getEmployees,
    updateLifecycle, getServiceReminders, addServiceLog
} from '../../services/api';
import Modal from '../../components/Modal';

const Services = () => {
    const [services, setServices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [reminders, setReminders] = useState({ overdue: [], upcoming: [], componentAlerts: [] });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logServiceId, setLogServiceId] = useState(null);
    const [expandedService, setExpandedService] = useState(null);
    const [tab, setTab] = useState('all');

    const emptyForm = { customerId: '', installationDate: new Date().toISOString().split('T')[0], componentLifecycles: [] };
    const emptyLogForm = { visitDate: new Date().toISOString().split('T')[0], notes: '', visitedBy: '' };
    const [formData, setFormData] = useState(emptyForm);
    const [logFormData, setLogFormData] = useState(emptyLogForm);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch core data needed for the list
            const [serRes, custRes, empRes] = await Promise.all([
                getServices().catch(err => { console.error("Services fetch failed:", err); return { data: [] }; }),
                getCustomers().catch(err => { console.error("Customers fetch failed:", err); return { data: [] }; }),
                getEmployees().catch(err => { console.error("Employees fetch failed:", err); return { data: [] }; })
            ]);
            
            setServices(serRes.data || []);
            setCustomers(custRes.data || []);
            setEmployees(empRes.data || []);

            // Fetch reminders separately as it's less critical for the initial render
            getServiceReminders()
                .then(remRes => setReminders(remRes.data || { overdue: [], upcoming: [], componentAlerts: [] }))
                .catch(err => console.error("Reminders fetch failed:", err));

        } catch (err) {
            console.error("Data fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createService(formData);
            setIsModalOpen(false);
            setFormData(emptyForm);
            fetchData();
        } catch (err) {
            alert('Error scheduling service');
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        try {
            await addServiceLog(logServiceId, logFormData);
            setIsLogModalOpen(false);
            setLogFormData(emptyLogForm);
            setLogServiceId(null);
            fetchData();
        } catch (err) {
            alert('Error logging visit');
        }
    };

    const handleUpdateLifecycle = async (serviceId, componentName) => {
        const date = new Date().toISOString().split('T')[0];
        try {
            await updateLifecycle(serviceId, { componentName, lastReplacementDate: date });
            fetchData();
        } catch (err) {
            alert('Error updating lifecycle');
        }
    };

    const getDaysLeft = (date) => {
        if (!date) return 999;
        return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    };

    const filteredServices = useMemo(() => {
        if (tab === 'overdue') return services.filter(s => getDaysLeft(s.serviceExpiryDate) < 0);
        if (tab === 'upcoming') return services.filter(s => { const d = getDaysLeft(s.serviceExpiryDate); return d >= 0 && d <= 7; });
        return services;
    }, [services, tab]);

    const stats = useMemo(() => ({
        total: services.length,
        overdue: reminders.overdue?.length || 0,
        upcoming: reminders.upcoming?.length || 0,
        componentAlerts: reminders.componentAlerts?.length || 0,
    }), [services, reminders]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Service & Maintenance</h1>
                    <p className="text-gray-500 mt-1">60-day service cycles, automatic reminders & component tracking.</p>
                </div>
                <button onClick={() => { setFormData(emptyForm); setIsModalOpen(true); }} className="btn-primary">
                    <Sparkles size={18} />
                    <span>Schedule Service</span>
                </button>
            </div>

            {/* Alert Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Services', value: stats.total, icon: <Wrench size={18}/>, color: 'text-gray-600 bg-gray-100' },
                    { label: 'Overdue', value: stats.overdue, icon: <AlertTriangle size={18}/>, color: 'text-red-600 bg-red-100' },
                    { label: 'Due in 7 Days', value: stats.upcoming, icon: <Clock size={18}/>, color: 'text-amber-600 bg-amber-100' },
                    { label: 'Component Alerts', value: stats.componentAlerts, icon: <Shield size={18}/>, color: 'text-purple-600 bg-purple-100' },
                ].map(s => (
                    <div key={s.label} className="card flex items-center gap-4 py-4">
                        <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{loading ? '–' : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overdue / Component Alerts Banner */}
            {!loading && (reminders.overdue?.length > 0 || reminders.componentAlerts?.length > 0) && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <Bell size={16} className="text-red-500" />
                        <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Automatic Alerts</p>
                    </div>
                    {reminders.overdue?.map((r, i) => (
                        <div key={`o-${i}`} className="flex items-center justify-between bg-white/80 border border-red-100 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{r.customer}</p>
                                    <p className="text-[10px] text-red-500 font-bold uppercase">Service overdue by {r.daysOverdue} days</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">OVERDUE</span>
                        </div>
                    ))}
                    {reminders.componentAlerts?.map((a, i) => (
                        <div key={`c-${i}`} className="flex items-center justify-between bg-white/80 border border-orange-100 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${a.overdue ? 'bg-red-500' : 'bg-orange-400'}`}></span>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{a.customer}</p>
                                    <p className="text-[10px] text-orange-600 font-bold uppercase">{a.component} — {a.overdue ? `Overdue by ${Math.abs(a.daysLeft)} days` : `Due in ${a.daysLeft} days`}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${a.overdue ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'}`}>
                                {a.overdue ? 'REPLACE NOW' : 'UPCOMING'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab Filter */}
            <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-2">
                {[
                    { key: 'all', label: 'All Services' },
                    { key: 'overdue', label: `Overdue (${stats.overdue})` },
                    { key: 'upcoming', label: `Due Soon (${stats.upcoming})` },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Services List */}
            <div className="space-y-3 min-h-[200px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                        <p className="text-gray-400 font-medium italic">Loading services...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Wrench size={40} className="text-gray-200 mb-3" />
                        <p className="text-gray-400 font-semibold">No services found</p>
                    </div>
                ) : (
                    filteredServices.map(service => {
                        const daysLeft = getDaysLeft(service.serviceExpiryDate);
                        const isOverdue = daysLeft < 0;
                        const isDueSoon = daysLeft >= 0 && daysLeft <= 7;
                        const isExpanded = expandedService === service._id;

                        return (
                            <div key={service._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isOverdue ? 'border-red-200' : isDueSoon ? 'border-amber-200' : 'border-gray-100'}`}>
                                <div className="flex">
                                    {/* Priority stripe */}
                                    <div className={`w-1 flex-shrink-0 ${isOverdue ? 'bg-red-500' : isDueSoon ? 'bg-amber-400' : 'bg-green-400'}`}></div>
                                    <div className="flex-1 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-100 text-red-600' : isDueSoon ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                    {isOverdue ? <AlertTriangle size={18}/> : isDueSoon ? <Clock size={18}/> : <CheckCircle2 size={18}/>}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-base font-bold text-gray-900">{service.customerId?.name || 'Unknown'}</h4>
                                                        {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase">Overdue {Math.abs(daysLeft)}d</span>}
                                                        {isDueSoon && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">Due in {daysLeft}d</span>}
                                                        {!isOverdue && !isDueSoon && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold uppercase">{daysLeft}d left</span>}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            <span>Installed: {service.installationDate ? new Date(service.installationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-gray-400" />
                                                            <span>Next Service: {service.serviceExpiryDate ? new Date(service.serviceExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                                                        </div>
                                                        {service.logs?.length > 0 && (
                                                            <div className="flex items-center gap-1.5">
                                                                <ClipboardList size={12} className="text-gray-400" />
                                                                <span>{service.logs.length} visit{service.logs.length > 1 ? 's' : ''} logged</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => { setLogServiceId(service._id); setLogFormData(emptyLogForm); setIsLogModalOpen(true); }}
                                                    className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-2 rounded-xl hover:bg-sky-100 transition-all"
                                                >
                                                    + Log Visit
                                                </button>
                                                <button
                                                    onClick={() => setExpandedService(isExpanded ? null : service._id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition-all"
                                                >
                                                    {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded: Component Lifecycle + Visit Log */}
                                        {isExpanded && (
                                            <div className="mt-5 pt-5 border-t border-gray-100 space-y-5">
                                                {/* Component Lifecycles */}
                                                {service.componentLifecycles?.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                            <Shield size={12} /> Annual Component Tracker
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {service.componentLifecycles.map((comp, idx) => {
                                                                const compDays = getDaysLeft(comp.nextReplacementDate);
                                                                const totalDays = (comp.lifespanYears || 1) * 365;
                                                                const usedPercent = Math.max(0, Math.min(100, ((totalDays - compDays) / totalDays) * 100));
                                                                const isCompOverdue = compDays < 0;
                                                                const isCompSoon = compDays >= 0 && compDays <= 30;
                                                                return (
                                                                    <div key={idx} className={`rounded-xl border p-4 ${isCompOverdue ? 'border-red-200 bg-red-50/50' : isCompSoon ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-gray-50/50'}`}>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <p className="text-sm font-bold text-gray-900">{comp.componentName}</p>
                                                                            <button
                                                                                onClick={() => handleUpdateLifecycle(service._id, comp.componentName)}
                                                                                className="text-[9px] font-black text-primary-600 hover:text-primary-800 uppercase"
                                                                            >
                                                                                <RefreshCcw size={12} />
                                                                            </button>
                                                                        </div>
                                                                        <p className={`text-[10px] font-bold uppercase ${isCompOverdue ? 'text-red-600' : isCompSoon ? 'text-amber-600' : 'text-gray-400'}`}>
                                                                            {isCompOverdue ? `Overdue by ${Math.abs(compDays)} days` : `${compDays} days until replacement`}
                                                                        </p>
                                                                        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full transition-all ${isCompOverdue ? 'bg-red-500' : isCompSoon ? 'bg-amber-500' : 'bg-green-500'}`}
                                                                                style={{ width: `${usedPercent}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Visit Log */}
                                                {service.logs?.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                            <ClipboardList size={12} /> Service Visit History
                                                        </p>
                                                        <div className="space-y-2">
                                                            {service.logs.slice().reverse().slice(0, 5).map((log, idx) => (
                                                                <div key={idx} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <Calendar size={14} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-xs font-bold text-gray-900">
                                                                                {log.visitDate ? new Date(log.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                                            </span>
                                                                            {log.visitedBy && (
                                                                                <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                                                    <User size={10} /> {log.visitedBy?.name || 'Staff'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {log.notes && <p className="text-xs text-gray-500 mt-1">{log.notes}</p>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Schedule Service Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFormData(emptyForm); }}
                title="Schedule New Service"
            >
                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-6 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Customer & Date</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Customer <span className="text-red-400">*</span></label>
                                    <select
                                        required className="input-field text-sm"
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    >
                                        <option value="">Select Customer...</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name} · {c.phone}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Installation / Start Date <span className="text-red-400">*</span></label>
                                    <input
                                        type="date" required className="input-field text-sm"
                                        value={formData.installationDate}
                                        onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 ml-0.5">Next service will be auto-scheduled 60 days from this date.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} />
                            Schedule Service (60-Day Cycle)
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Log Visit Modal */}
            <Modal
                isOpen={isLogModalOpen}
                onClose={() => { setIsLogModalOpen(false); setLogFormData(emptyLogForm); }}
                title="Log Service Visit"
            >
                <form onSubmit={handleLogSubmit}>
                    <div className="px-8 py-6 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-green-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visit Details</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Visit Date <span className="text-red-400">*</span></label>
                                    <input
                                        type="date" required className="input-field text-sm"
                                        value={logFormData.visitDate}
                                        onChange={(e) => setLogFormData({ ...logFormData, visitDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Visited By</label>
                                    <select
                                        className="input-field text-sm"
                                        value={logFormData.visitedBy}
                                        onChange={(e) => setLogFormData({ ...logFormData, visitedBy: e.target.value })}
                                    >
                                        <option value="">Select Employee...</option>
                                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} · {emp.designation}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Notes</label>
                                    <textarea
                                        placeholder="What was done during this visit..."
                                        className="input-field text-sm min-h-[80px] resize-none"
                                        value={logFormData.notes}
                                        onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Log Visit & Reset 60-Day Cycle
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Services;

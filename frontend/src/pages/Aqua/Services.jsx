import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [products, setProducts] = useState([]);
    const [reminders, setReminders] = useState({ overdue: [], upcoming: [], componentAlerts: [] });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logServiceId, setLogServiceId] = useState(null);
    const [expandedService, setExpandedService] = useState(null);
    const [tab, setTab] = useState('all');

    const emptyForm = { customerId: '', installationDate: new Date().toISOString().split('T')[0], serviceExpiryDate: '', componentLifecycles: [] };
    const emptyLogForm = { visitDate: new Date().toISOString().split('T')[0], notes: '', visitedBy: '', replacedItems: [] };
    const [formData, setFormData] = useState(emptyForm);
    const [logFormData, setLogFormData] = useState(emptyLogForm);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch core data needed for the list
            const [serRes, custRes, empRes, prodRes] = await Promise.all([
                getServices().catch(err => { console.error("Services fetch failed:", err); return { data: [] }; }),
                getCustomers().catch(err => { console.error("Customers fetch failed:", err); return { data: [] }; }),
                getEmployees().catch(err => { console.error("Employees fetch failed:", err); return { data: [] }; }),
                import('../../services/api').then(m => m.getProducts()).catch(err => { console.error("Products fetch failed:", err); return { data: [] }; })
            ]);
            
            setServices(serRes.data || []);
            setCustomers(custRes.data || []);
            setEmployees(empRes.data || []);
            setProducts(prodRes.data || []);

            // Fetch reminders separately as it's less critical for the initial render
            import('../../services/api').then(m => m.getServiceReminders())
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
        const inputDate = window.prompt("Enter replacement date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
        if (!inputDate) return;
        
        try {
            await updateLifecycle(serviceId, { componentName, lastReplacementDate: inputDate });
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
                    <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight">Service & Maintenance</h1>
                    <p className="text-gray-500 mt-1 font-medium">Simple 3-step process: 1. Schedule Service → 2. Perform Visit & Log → 3. Reset Cycle.</p>
                </div>
                <button onClick={() => { setFormData(emptyForm); setIsModalOpen(true); }} className="btn-primary">
                    <Calendar size={18} />
                    <span>Schedule Service</span>
                </button>
            </div>

            {/* Consolidate Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Active Services', value: stats.total, icon: <Wrench size={18}/>, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Action Required', value: stats.overdue + stats.upcoming, icon: <AlertTriangle size={18}/>, color: 'text-red-600 bg-red-50' },
                    { label: 'Component Alerts', value: stats.componentAlerts, icon: <Shield size={18}/>, color: 'text-amber-600 bg-amber-50' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
                        <div className={`p-3 rounded-2xl ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.label}</p>
                            <p className="text-2xl font-black text-gray-900 leading-none mt-1">{loading ? '–' : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Services List */}
            <div className="space-y-4 min-h-[200px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <p className="text-gray-400 font-medium italic">Loading records...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                        <Wrench size={40} className="text-gray-200 mb-3" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No services found</p>
                        <p className="text-[10px] text-gray-300 mt-1">Click "Schedule Service" to get started.</p>
                    </div>
                ) : (
                    filteredServices.map(service => {
                        const daysLeft = getDaysLeft(service.serviceExpiryDate);
                        const isOverdue = daysLeft < 0;
                        const isDueSoon = daysLeft >= 0 && daysLeft <= 7;
                        const isExpanded = expandedService === service._id;

                        return (
                            <div key={service._id} className={`bg-white rounded-3xl border transition-all ${isOverdue ? 'border-red-200 shadow-red-100/50' : isDueSoon ? 'border-amber-200 shadow-amber-100/50' : 'border-gray-100 shadow-gray-100/50'} hover:shadow-lg shadow-sm overflow-hidden`}>
                                <div className="p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-50 text-red-600' : isDueSoon ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {isOverdue ? <AlertTriangle size={20}/> : isDueSoon ? <Clock size={20}/> : <CheckCircle2 size={20}/>}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-black text-[#1a365d] truncate">{service.customerId?.name || 'Unknown'}</h4>
                                                    {isOverdue && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Overdue</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Calendar size={12} className="text-gray-400" />
                                                    <span className={`text-xs font-bold ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-600' : 'text-gray-500'}`}>
                                                        Next Service: {service.serviceExpiryDate ? new Date(service.serviceExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => { setLogServiceId(service._id); setLogFormData(emptyLogForm); setIsLogModalOpen(true); }}
                                                className="hidden sm:flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-2xl transition-all"
                                            >
                                                <Plus size={14} />
                                                <span>Log Visit</span>
                                            </button>
                                            <button
                                                onClick={() => navigate('/aqua/tasks', { state: { customerId: service.customerId?._id } })}
                                                className="hidden sm:flex items-center gap-2 text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-4 py-2.5 rounded-2xl transition-all"
                                                title="View in Work Allocation"
                                            >
                                                <ClipboardList size={14} />
                                            </button>
                                            <button
                                                onClick={() => setExpandedService(isExpanded ? null : service._id)}
                                                className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
                                            >
                                                {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expansion Section */}
                                    {isExpanded && (
                                        <div className="mt-5 pt-5 border-t border-gray-50 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                            {/* Basic Info Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Installation Date</p>
                                                    <p className="text-xs font-bold text-gray-700 mt-1">{service.installationDate ? new Date(service.installationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                                                </div>
                                                <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                                    <p className="text-xs font-bold text-gray-700 mt-1">{service.customerId?.phone || 'N/A'}</p>
                                                </div>
                                            </div>

                                            {/* Component Lifecycles */}
                                            {service.componentLifecycles?.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-3 rounded-full bg-amber-400"></div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Annual Component Tracker</p>
                                                    </div>
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
                                                                            className="p-1.5 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-blue-600 transition-all"
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

                                            {/* Visit History */}
                                            {service.logs?.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-3 rounded-full bg-blue-400"></div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service History</p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {service.logs.slice().reverse().slice(0, 5).map((log, idx) => (
                                                            <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <Calendar size={14} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-xs font-bold text-gray-900">
                                                                                {log.visitDate ? new Date(log.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                                            </span>
                                                                            {log.visitedBy && (
                                                                                <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full font-bold">
                                                                                    {log.visitedBy?.name || 'Staff'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {log.notes && <p className="text-xs text-gray-500 mt-1">{log.notes}</p>}
                                                                        {log.replacedItems?.length > 0 && (
                                                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                                                {log.replacedItems.map((item, i) => (
                                                                                    <span key={i} className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md font-bold uppercase">
                                                                                        {item.productId?.name || 'Item'} x{item.quantity}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
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
                            <div className="space-y-4">
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-0.5">Start Date <span className="text-red-400">*</span></label>
                                        <input
                                            type="date" required className="input-field text-sm"
                                            value={formData.installationDate}
                                            onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-0.5">Custom Due Date</label>
                                        <input
                                            type="date" className="input-field text-sm"
                                            value={formData.serviceExpiryDate}
                                            onChange={(e) => setFormData({ ...formData, serviceExpiryDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 ml-0.5 italic">
                                    Leave "Custom Due Date" empty to auto-schedule exactly 60 days from the start date.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} />
                            Schedule Service
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
                    <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Component Alerts (Internal) */}
                        {(() => {
                            const currentService = services.find(s => s._id === logServiceId);
                            const alerts = currentService?.componentLifecycles?.filter(c => getDaysLeft(c.nextReplacementDate) <= 30) || [];
                            if (alerts.length === 0) return null;

                            return (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-800">
                                        <AlertTriangle size={16} className="text-amber-600" />
                                        <p className="text-xs font-black uppercase tracking-wider">Maintenance Required</p>
                                    </div>
                                    <div className="space-y-2">
                                        {alerts.map((a, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white/60 p-2 rounded-xl text-[11px]">
                                                <span className="font-bold text-gray-700">{a.componentName}</span>
                                                <span className={`font-black uppercase ${getDaysLeft(a.nextReplacementDate) < 0 ? 'text-red-500' : 'text-amber-600'}`}>
                                                    {getDaysLeft(a.nextReplacementDate) < 0 
                                                        ? `Overdue by ${Math.abs(getDaysLeft(a.nextReplacementDate))}d` 
                                                        : `Due in ${getDaysLeft(a.nextReplacementDate)}d`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-amber-700 italic">Consider replacing these components during this visit.</p>
                                </div>
                            );
                        })()}

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-green-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visit Details</p>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
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
                                            <option value="">Select Staff...</option>
                                            {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} · {emp.designation}</option>)}
                                        </select>
                                    </div>
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

                        {/* Replacement Tracking */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Replaced Items</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setLogFormData(prev => ({ 
                                        ...prev, 
                                        replacedItems: [...prev.replacedItems, { productId: '', quantity: 1 }] 
                                    }))}
                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {logFormData.replacedItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex-1 space-y-1.5">
                                            <select
                                                required
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                                                value={item.productId}
                                                onChange={(e) => {
                                                    const newItems = [...logFormData.replacedItems];
                                                    newItems[idx].productId = e.target.value;
                                                    setLogFormData({ ...logFormData, replacedItems: newItems });
                                                }}
                                            >
                                                <option value="">Select Component...</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name} ({p.stock} in stock)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-20">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                min="1"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...logFormData.replacedItems];
                                                    newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                    setLogFormData({ ...logFormData, replacedItems: newItems });
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = logFormData.replacedItems.filter((_, i) => i !== idx);
                                                setLogFormData({ ...logFormData, replacedItems: newItems });
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Plus size={14} className="rotate-45" />
                                        </button>
                                    </div>
                                ))}
                                {logFormData.replacedItems.length === 0 && (
                                    <p className="text-[10px] text-gray-400 text-center italic py-2">No components replaced during this visit.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Log Visit & Update Cycles
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Services;

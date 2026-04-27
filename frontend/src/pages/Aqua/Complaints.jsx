import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Plus, Search, Clock, CheckCircle2, AlertCircle, Loader2,
    Droplets, Wrench, HeadphonesIcon, CreditCard, HelpCircle, Trash2, Eye,
    CalendarDays, User, Tag, FileText, AlertTriangle, MapPin, ExternalLink, Sparkles
} from 'lucide-react';
import { 
    getComplaints, createComplaint, deleteComplaint, getCustomers, 
    updateComplaintStatus, updateComplaint, getEmployees, convertToTask
} from '../../services/api';
import Modal from '../../components/Modal';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    { value: 'Water Quality', label: 'Water Quality', icon: Droplets, color: '#3B82F6' },
    { value: 'Equipment', label: 'Equipment', icon: Wrench, color: '#F97316' },
    { value: 'Service', label: 'Service', icon: HeadphonesIcon, color: '#8B5CF6' },
    { value: 'Billing', label: 'Billing', icon: CreditCard, color: '#10B981' },
    { value: 'Other', label: 'Other', icon: HelpCircle, color: '#6B7280' },
];

const PRIORITIES = [
    { value: 'Low', color: '#10B981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'Medium', color: '#F59E0B', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'High', color: '#F97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'Urgent', color: '#EF4444', bg: 'bg-red-50 text-red-700 border-red-200' },
];

const STATUS_MAP = {
    'Open': { color: '#F97316', bg: 'bg-orange-50 text-orange-700', icon: AlertCircle },
    'In Progress': { color: '#3B82F6', bg: 'bg-blue-50 text-blue-700', icon: Clock },
    'Resolved': { color: '#10B981', bg: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
};

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailComplaint, setDetailComplaint] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    const [formData, setFormData] = useState({
        customerId: '',
        description: '',
        category: 'Other',
        priority: 'Medium',
        assignedTo: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [compRes, custRes, empRes] = await Promise.all([
                getComplaints(), 
                getCustomers(),
                getEmployees()
            ]);
            setComplaints(compRes.data);
            setCustomers(custRes.data);
            // Filter employees to only show General Staff/Employee for task assignment
            setEmployees(empRes.data.filter(e => e.status === 'Active' && /general (employee|staff)/i.test(e.designation)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            await createComplaint(formData);
            setIsModalOpen(false);
            setFormData({ customerId: '', description: '', category: 'Other', priority: 'Medium', assignedTo: '' });
            fetchData();
        } catch (err) {
            alert('Error creating complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateComplaintStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleConvertToTask = async (id, assignedTo) => {
        try {
            const res = await convertToTask(id, assignedTo);
            // res.data should be the populated complaint
            setDetailComplaint(res.data);
            fetchData();
        } catch (err) {
            alert('Error converting to task');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this complaint permanently?')) return;
        try {
            await deleteComplaint(id);
            setDetailComplaint(null);
            fetchData();
        } catch (err) {
            alert('Error deleting complaint');
        }
    };

    const filtered = useMemo(() => {
        return complaints.filter(c => {
            const matchesSearch =
                (c.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.category?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [complaints, searchTerm, filterStatus]);

    const stats = useMemo(() => ({
        open: complaints.filter(c => c.status === 'Open').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        today: complaints.filter(c => new Date(c.createdAt).toLocaleDateString() === new Date().toLocaleDateString()).length,
    }), [complaints]);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const getCategoryInfo = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[4];
    const getPriorityInfo = (pri) => PRIORITIES.find(p => p.value === pri) || PRIORITIES[1];

    return (
        <div className="space-y-6 py-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Complaint Box</h1>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Track and resolve customer issues effectively</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>New Complaint</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Open', value: stats.open, color: '#F97316', icon: AlertCircle, bg: 'from-orange-50 to-orange-100/50' },
                    { label: 'In Progress', value: stats.inProgress, color: '#3B82F6', icon: Clock, bg: 'from-blue-50 to-blue-100/50' },
                    { label: 'Resolved', value: stats.resolved, color: '#10B981', icon: CheckCircle2, bg: 'from-emerald-50 to-emerald-100/50' },
                    { label: 'Today', value: stats.today, color: '#8B5CF6', icon: CalendarDays, bg: 'from-violet-50 to-violet-100/50' },
                ].map((s, i) => (
                    <div
                        key={i}
                        className={`bg-gradient-to-br ${s.bg} rounded-2xl p-4 sm:p-5 border border-gray-100/60`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                                <s.icon size={18} style={{ color: s.color }} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search complaints, customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-200 outline-none transition-all"
                    />
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 shrink-0">
                    {['All', 'Open', 'In Progress', 'Resolved'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-gray-400 font-medium text-sm">Loading complaints...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <MessageSquare className="text-gray-200" size={48} />
                        <p className="text-gray-400 font-medium text-sm">
                            {searchTerm || filterStatus !== 'All' ? 'No complaints match your search.' : 'No complaints logged yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map((complaint, i) => {
                            const catInfo = getCategoryInfo(complaint.category);
                            const priInfo = getPriorityInfo(complaint.priority);
                            const statusInfo = STATUS_MAP[complaint.status] || STATUS_MAP['Open'];
                            const CatIcon = catInfo.icon;

                            return (
                                <div
                                    key={complaint._id}
                                    className="p-4 sm:p-5 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                    onClick={() => setDetailComplaint(complaint)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                                            style={{ backgroundColor: catInfo.color + '12' }}
                                        >
                                            <CatIcon size={20} style={{ color: catInfo.color }} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm truncate max-w-[280px]">
                                                    {complaint.description}
                                                </h4>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${priInfo.bg}`}>
                                                    {complaint.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <User size={12} />
                                                    {complaint.customerId?.name || 'Unknown'}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(complaint.createdAt)}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="hidden sm:inline" style={{ color: catInfo.color }}>{complaint.category}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={complaint.status}
                                                onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold outline-none border cursor-pointer transition-colors ${statusInfo.bg} border-current/10`}
                                                style={{ borderColor: statusInfo.color + '30' }}
                                            >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                            {/* Experience: Quick Track button for untracked complaints */}
                                            {!complaint.taskId && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailComplaint(complaint);
                                                    }}
                                                    className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-xl transition-all hover:scale-110 active:scale-95 group relative"
                                                    title="Track as Task"
                                                >
                                                    <Sparkles size={16} className="animate-pulse" />
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none shadow-xl">
                                                        Track as Task
                                                    </span>
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => setDetailComplaint(complaint)}
                                                className="p-2 hover:bg-blue-50 rounded-xl text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ============ NEW COMPLAINT MODAL ============ */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise New Complaint" accent="#3B82F6">
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Customer Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <User size={12} /> Customer
                        </label>
                        <select
                            required
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-200 outline-none transition-all appearance-none"
                        >
                            <option value="">Select a customer...</option>
                            {customers.map(c => (
                                <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
                            ))}
                        </select>
                    </div>

                    {/* Employee Selector (Assignment) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={12} /> Assign Task To (Staff)
                        </label>
                        <select
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-200 outline-none transition-all appearance-none"
                        >
                            <option value="">Auto-assign to first available staff</option>
                            {employees.map(e => (
                                <option key={e._id} value={e._id}>{e.name} — {e.designation}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 font-medium italic">
                            Only "General Staff" and "General Employees" are available for task assignment.
                        </p>
                    </div>

                    {/* Category Picker */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Tag size={12} /> Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => {
                                const CIcon = cat.icon;
                                const isActive = formData.category === cat.value;
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.value })}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${isActive
                                            ? 'shadow-sm'
                                            : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                                            }`}
                                        style={isActive ? {
                                            backgroundColor: cat.color + '10',
                                            borderColor: cat.color + '40',
                                            color: cat.color
                                        } : {}}
                                    >
                                        <CIcon size={14} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Priority Picker */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <AlertTriangle size={12} /> Priority
                        </label>
                        <div className="flex gap-2">
                            {PRIORITIES.map(pri => {
                                const isActive = formData.priority === pri.value;
                                return (
                                    <button
                                        key={pri.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: pri.value })}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${isActive
                                            ? 'shadow-sm'
                                            : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                                            }`}
                                        style={isActive ? {
                                            backgroundColor: pri.color + '10',
                                            borderColor: pri.color + '40',
                                            color: pri.color
                                        } : {}}
                                    >
                                        {pri.value}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <FileText size={12} /> Description
                        </label>
                        <textarea
                            required
                            placeholder="Describe the issue in detail..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-200 outline-none transition-all min-h-[120px] resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {submitting ? 'Submitting...' : 'Raise Complaint'}
                    </button>

                    <p className="text-[10px] text-center text-gray-300 font-medium">
                        A task will be automatically created for tracking this complaint.
                    </p>
                </form>
            </Modal>

            {/* ============ COMPLAINT DETAIL MODAL ============ */}
            <Modal
                isOpen={!!detailComplaint}
                onClose={() => setDetailComplaint(null)}
                title="Complaint Details"
                accent={detailComplaint ? getCategoryInfo(detailComplaint.category)?.color : '#3B82F6'}
            >
                {detailComplaint && (
                    <div className="p-6 space-y-6">
                        {/* Top Info */}
                        <div className="flex items-start gap-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: getCategoryInfo(detailComplaint.category).color + '12' }}
                            >
                                {React.createElement(getCategoryInfo(detailComplaint.category).icon, { size: 28, style: { color: getCategoryInfo(detailComplaint.category).color } })}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_MAP[detailComplaint.status]?.bg || 'bg-gray-100 text-gray-700'}`}>
                                        {detailComplaint.status}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityInfo(detailComplaint.priority).bg}`}>
                                        {detailComplaint.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    Filed on {formatDate(detailComplaint.createdAt)} at {formatTime(detailComplaint.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Task Link Section with Experience */}
                        <AnimatePresence mode="wait">
                            {detailComplaint.taskId ? (
                                <motion.div 
                                    key="tracked"
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-5 border border-blue-100/50 relative overflow-hidden group/task"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/task:opacity-20 transition-opacity">
                                        <CheckCircle2 size={64} className="text-blue-600" />
                                    </div>
                                    <div className="relative z-10 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Sparkles size={10} /> Active Tracking Task
                                            </p>
                                            <h5 className="text-sm font-bold text-blue-900 truncate mb-1">
                                                {detailComplaint.taskId.title}
                                            </h5>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700`}>
                                                    {detailComplaint.taskId.status}
                                                </span>
                                                <span className="text-[10px] text-blue-400 font-medium">Synced with complaint</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/boss/tasks')}
                                            className="whitespace-nowrap px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all active:scale-95"
                                        >
                                            Manage Task <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="untracked"
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50 relative overflow-hidden"
                                >
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <AlertCircle size={14} /> Untracked Complaint
                                    </p>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <select 
                                                className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer pr-10"
                                                id="manualAssignSelect"
                                            >
                                                <option value="">Auto-assign to first available...</option>
                                                {employees.map(e => <option key={e._id} value={e._id}>{e.name} — {e.designation}</option>)}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-300">
                                                <Plus size={14} />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const staffId = document.getElementById('manualAssignSelect').value;
                                                handleConvertToTask(detailComplaint._id, staffId);
                                            }}
                                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 group/btn"
                                        >
                                            <Sparkles size={14} className="group-hover/btn:animate-spin" /> 
                                            <span>Experience Tracking Action</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                <p className="text-sm font-bold text-gray-900">{detailComplaint.customerId?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-400">{detailComplaint.customerId?.phone || '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</p>
                                <p className="text-sm font-bold" style={{ color: getCategoryInfo(detailComplaint.category).color }}>{detailComplaint.category || 'General'}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Issue Description</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{detailComplaint.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <select
                                value={detailComplaint.status}
                                onChange={(e) => {
                                    handleStatusChange(detailComplaint._id, e.target.value);
                                    setDetailComplaint({ ...detailComplaint, status: e.target.value });
                                }}
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                            >
                                <option value="Open">✦ Open</option>
                                <option value="In Progress">⟳ In Progress</option>
                                <option value="Resolved">✓ Resolved</option>
                            </select>
                            <button
                                onClick={() => handleDelete(detailComplaint._id)}
                                className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Complaints;

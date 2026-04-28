import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    CheckSquare, Plus, Clock, MapPin, User, AlertTriangle,
    Loader2, Calendar as CalendarIcon, Flag, Users, Filter, Wrench, Zap, Edit,
    MessageSquare, ExternalLink, ChevronDown, X
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getTasks, createTask, updateTaskStatus, getCustomers, getEmployees, updateTask } from '../../services/api';
import Modal from '../../components/Modal';

const PRIORITY_CONFIG = {
    Low:    { color: 'bg-gray-100 text-gray-600 border-gray-200',   dot: 'bg-gray-400',    label: 'Low' },
    Medium: { color: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500',    label: 'Medium' },
    High:   { color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: 'High' },
    Urgent: { color: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500',     label: 'Urgent' },
};

const STATUS_CONFIG = {
    'Travelling':  { color: 'bg-amber-100 text-amber-700',  label: 'Travelling' },
    'Arrived':     { color: 'bg-cyan-100 text-cyan-700',    label: 'Arrived' },
    'In Progress': { color: 'bg-blue-100 text-blue-700',    label: 'In Progress' },
    'Completed':   { color: 'bg-green-100 text-green-700',  label: 'Completed' },
    'Returned':    { color: 'bg-purple-100 text-purple-700', label: 'Returned' },
};

const TYPE_ICON = {
    'Installation': <CheckSquare size={18} />,
    'Service':      <Wrench size={18} />,
    'Rescue/Repair': <AlertTriangle size={18} />,
    'Client Issue': <Zap size={18} />,
};

const emptyForm = {
    customerId: '',
    type: 'Installation',
    assignedTo: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
};

const Tasks = () => {
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => { 
        fetchData(); 
        // Handle deep-linking from Service module
        if (location.state?.customerId) {
            setFilterCustomer(location.state.customerId);
            setFilterEmployee('');
            setFilterStatus('');
            setFilterType('');
        }
    }, [location.state]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskRes, custRes, empRes] = await Promise.all([
                getTasks(), getCustomers(), getEmployees()
            ]);
            setTasks(taskRes.data);
            setCustomers(custRes.data);
            setEmployees(empRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.customerId) delete dataToSubmit.customerId;
            if (!dataToSubmit.dueDate) delete dataToSubmit.dueDate;
            
            if (dataToSubmit._id) {
                await updateTask(dataToSubmit._id, dataToSubmit);
            } else {
                await createTask(dataToSubmit);
            }
            
            setIsModalOpen(false);
            setFormData(emptyForm);
            fetchData();
        } catch (err) {
            alert('Error saving task: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (task) => {
        setFormData({
            ...emptyForm,
            _id: task._id,
            customerId: task.customerId?._id || '',
            type: task.type,
            assignedTo: task.assignedTo?._id || '',
            description: task.description || '',
            priority: task.priority || 'Medium',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
    };
    const handleWhatsAppDispatch = (task) => {
        const empPhone = task.assignedTo?.phone;
        if (!empPhone) return alert('Employee phone number not found');
        
        const mapLink = task.customerId?.location?.googleMapsLink || 'Not provided';
        const message = `*PVR AQUA - NEW TASK*\n\n` +
                        `*Work:* ${task.description}\n` +
                        `*Branch:* Aqua\n` +
                        `*Client:* ${task.customerId?.name || 'Reference'}\n` +
                        `*Priority:* ${task.priority}\n\n` +
                        `*📍 Map Location:* ${mapLink}`;
        
        const encoded = encodeURIComponent(message);
        // Normalize phone: remove non-digits, add 91 if 10 digits
        let phone = empPhone.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;
        
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    };



    const filteredTasks = useMemo(() => tasks.filter(t => {
        const empMatch = !filterEmployee || t.assignedTo?._id === filterEmployee;
        const statMatch = !filterStatus || t.status === filterStatus;
        const typeMatch = !filterType || t.type === filterType;
        const custMatch = !filterCustomer || t.customerId?._id === filterCustomer;
        
        let dateMatch = true;
        if (dateRange[0] && dateRange[1]) {
            const taskDate = t.dueDate ? new Date(t.dueDate) : null;
            if (!taskDate) dateMatch = false;
            else {
                // Normalize dates to midnight for accurate comparison
                const start = new Date(dateRange[0]); start.setHours(0,0,0,0);
                const end = new Date(dateRange[1]); end.setHours(23,59,59,999);
                dateMatch = taskDate >= start && taskDate <= end;
            }
        }
        
        return empMatch && statMatch && typeMatch && custMatch && dateMatch;
    }), [tasks, filterEmployee, filterStatus, filterType, filterCustomer, dateRange]);

    const stats = useMemo(() => {
        // Stats should respect Employee, Status, and Date Range filters
        const sourceTasks = tasks.filter(t => {
            const empMatch = !filterEmployee || t.assignedTo?._id === filterEmployee;
            const statMatch = !filterStatus || t.status === filterStatus;
            const custMatch = !filterCustomer || t.customerId?._id === filterCustomer;
            
            let dateMatch = true;
            if (dateRange[0] && dateRange[1]) {
                const taskDate = t.dueDate ? new Date(t.dueDate) : null;
                if (!taskDate) dateMatch = false;
                else {
                    const start = new Date(dateRange[0]); start.setHours(0,0,0,0);
                    const end = new Date(dateRange[1]); end.setHours(23,59,59,999);
                    dateMatch = taskDate >= start && taskDate <= end;
                }
            }
            return empMatch && statMatch && custMatch && dateMatch;
        });

        return {
            total: sourceTasks.length,
            installation: sourceTasks.filter(t => t.type === 'Installation').length,
            service: sourceTasks.filter(t => t.type === 'Service').length,
            repair: sourceTasks.filter(t => t.type === 'Rescue/Repair' || t.type === 'Client Issue').length,
        };
    }, [tasks, filterEmployee, filterStatus, dateRange]);

    const isOverdue = (task) => {
        if (!task.dueDate || task.status === 'Completed') return false;
        return new Date(task.dueDate) < new Date();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Work Allocation</h1>
                    <p className="text-gray-500 mt-1">Assign tasks to field staff and monitor real-time progress.</p>
                </div>
                <button onClick={() => { setFormData(emptyForm); setIsModalOpen(true); }} className="btn-primary">
                    <Plus size={18} />
                    <span>Assign Task</span>
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tasks', value: stats.total, icon: <CheckSquare size={22}/>, color: 'indigo', type: '' },
                    { label: 'Installation', value: stats.installation, icon: <Zap size={22}/>, color: 'blue', type: 'Installation' },
                    { label: 'Service', value: stats.service, icon: <Wrench size={22}/>, color: 'amber', type: 'Service' },
                    { label: 'Repair / Replace', value: stats.repair, icon: <AlertTriangle size={22}/>, color: 'rose', type: 'Rescue/Repair' },
                ].map((s) => {
                    const isActive = filterType === s.type;
                    const colorMap = {
                        indigo: 'from-indigo-50/50 text-indigo-600 border-indigo-100 ring-indigo-500/10',
                        blue:   'from-blue-50/50 text-blue-600 border-blue-100 ring-blue-500/10',
                        amber:  'from-amber-50/50 text-amber-600 border-amber-100 ring-amber-500/10',
                        rose:   'from-rose-50/50 text-rose-600 border-rose-100 ring-rose-500/10',
                    };
                    const activeMap = {
                        indigo: 'border-indigo-400 bg-indigo-50/30',
                        blue:   'border-blue-400 bg-blue-50/30',
                        amber:  'border-amber-400 bg-amber-50/30',
                        rose:   'border-rose-400 bg-rose-50/30',
                    };
                    
                    const cls = colorMap[s.color] || colorMap.indigo;
                    const activeCls = isActive && s.type !== '' ? (activeMap[s.color] || activeMap.indigo) : 'border-slate-100 hover:border-slate-200';

                    return (
                        <button 
                            key={s.label} 
                            onClick={() => setFilterType(isActive ? '' : s.type)}
                            className={`relative group bg-white p-6 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] flex flex-col items-start gap-4 ${activeCls}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cls.split(' ')[0]} to-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                <div className={cls.split(' ')[1]}>{s.icon}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">{s.label}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                    {loading ? '–' : s.value}
                                </p>
                            </div>
                            {/* Glow effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${cls.split(' ')[0]} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
                            {isActive && s.type !== '' && (
                                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse ${cls.split(' ')[1].replace('text-', 'bg-')}`}></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white border border-gray-100 rounded-xl p-4 items-center">
                <Filter size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">Filter:</span>
                <select
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50"
                    value={filterEmployee}
                    onChange={e => setFilterEmployee(e.target.value)}
                >
                    <option value="">All Employees</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                </select>
                <select
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="relative">
                    <button 
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className={`flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-all ${dateRange[0] ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-gray-50 text-gray-600'}`}
                    >
                        <CalendarIcon size={16} />
                        {dateRange[0] && dateRange[1] 
                            ? `${dateRange[0].toLocaleDateString('en-IN', {day:'numeric', month:'short'})} - ${dateRange[1].toLocaleDateString('en-IN', {day:'numeric', month:'short'})}`
                            : 'Date Range'}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isCalendarOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCalendarOpen && (
                        <div className="absolute top-full left-0 mt-2 z-[150] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 duration-300 w-[280px]">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select Date Window</span>
                                <button onClick={() => setIsCalendarOpen(false)} className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition-all">
                                    <X size={14} />
                                </button>
                            </div>
                            <style>{`
                                .react-calendar { width: 100% !important; border: none !important; font-family: 'Outfit', sans-serif !important; font-size: 0.75rem !important; }
                                .react-calendar__navigation { height: 32px !important; margin-bottom: 0.5rem !important; }
                                .react-calendar__navigation button { font-size: 0.8rem !important; min-width: 32px !important; }
                                .react-calendar__month-view__weekdays { font-size: 0.6rem !important; font-weight: 800 !important; }
                                .react-calendar__tile { padding: 0.5em 0.2em !important; font-size: 0.75rem !important; }
                                .react-calendar__tile--active { background: #4f46e5 !important; border-radius: 6px !important; color: white !important; }
                                .react-calendar__tile--range { background: #e0e7ff !important; color: #4338ca !important; border-radius: 0 !important; }
                                .react-calendar__tile--rangeStart { border-top-left-radius: 6px !important; border-bottom-left-radius: 6px !important; background: #4f46e5 !important; color: white !important; }
                                .react-calendar__tile--rangeEnd { border-top-right-radius: 6px !important; border-bottom-right-radius: 6px !important; background: #4f46e5 !important; color: white !important; }
                                .react-calendar__tile--now { background: #f8fafc !important; border-radius: 6px !important; font-weight: bold !important; border: 1px solid #e2e8f0 !important; }
                            `}</style>
                            <Calendar
                                selectRange={true}
                                value={dateRange[0] ? dateRange : new Date()}
                                onChange={(val) => {
                                    // Robustly handle [start, end] vs single date cases
                                    if (Array.isArray(val)) {
                                        setDateRange(val);
                                        // Auto-close only if a full range is selected
                                        if (val[0] && val[1] && val[0].getTime() !== val[1].getTime()) {
                                            setIsCalendarOpen(false);
                                        }
                                    } else {
                                        setDateRange([val, val]);
                                    }
                                }}
                                className="border-none"
                            />
                            <div className="mt-4 flex gap-2">
                                <button 
                                    onClick={() => { setDateRange([null, null]); setIsCalendarOpen(false); }}
                                    className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={() => setIsCalendarOpen(false)}
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {(filterEmployee || filterStatus || filterType || filterCustomer || dateRange[0]) && (
                    <button
                        onClick={() => { 
                            setFilterEmployee(''); 
                            setFilterStatus(''); 
                            setFilterType(''); 
                            setFilterCustomer('');
                            setDateRange([null, null]); 
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-widest ml-2"
                    >✕ Reset View</button>
                )}
                <span className="ml-auto text-xs text-gray-400 font-medium">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Task List */}
            <div className="space-y-3 min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                        <p className="text-gray-400 font-medium italic">Loading tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <CheckSquare size={40} className="text-gray-200 mb-3" />
                        <p className="text-gray-400 font-semibold">No tasks found</p>
                        <p className="text-gray-300 text-sm mt-1">Try changing your filters or assign a new task.</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
                        const overdue = isOverdue(task);
                        return (
                            <div
                                key={task._id}
                                className={`bg-white rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-500 overflow-hidden group ${overdue ? 'border-red-100' : 'border-slate-100'}`}
                            >
                                <div className="flex">
                                    <div className={`w-2 flex-shrink-0 ${prio.dot.replace('bg-', 'bg-')}`} style={{background: overdue ? '#ef4444' : undefined}}></div>
                                    <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex items-start gap-6 flex-1 min-w-0">
                                            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                                                {TYPE_ICON[task.type] || <CheckSquare size={20} />}
                                            </div>
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h4 className="text-lg font-black text-slate-900 truncate tracking-tight">{task.description || 'No description'}</h4>
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-full tracking-widest border border-slate-200">{task.type}</span>
                                                    {overdue && (
                                                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded-full tracking-widest animate-pulse border border-rose-100">Overdue</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                                                        <User size={14} className="text-indigo-500" />
                                                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{task.assignedTo?.name || 'Unassigned'}</span>
                                                    </div>
                                                    {task.customerId && (
                                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                            <MapPin size={14} className="text-slate-300" />
                                                            <span className="text-[11px] font-bold">{task.customerId?.name}</span>
                                                        </div>
                                                    )}
                                                    {task.dueDate && (
                                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${overdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                            <CalendarIcon size={14} />
                                                            <span className="text-[10px] font-black tracking-widest uppercase">{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                        </div>
                                                    )}
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${prio.color}`}>
                                                        <Flag size={12} />
                                                        <span>{task.priority || 'Medium'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm ${STATUS_CONFIG[task.status]?.color || 'bg-slate-50 text-slate-700'}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                                {STATUS_CONFIG[task.status]?.label || task.status}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => handleWhatsAppDispatch(task)}
                                                    className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100"
                                                    title="Dispatch via WhatsApp"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(task)}
                                                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
                                                    title="Edit / Reassign Task"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Assign Task Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFormData(emptyForm); }}
                title={formData._id ? "Edit Task / Reassign" : "Assign New Task"}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-6 space-y-6">

                        {/* ── Section 1: Assignment ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Assignment</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Assign To <span className="text-red-400">*</span></label>
                                    <select
                                        required
                                        className="input-field text-sm"
                                        value={formData.assignedTo}
                                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    >
                                        <option value="">Select Employee...</option>
                                        {employees
                                            .filter(e => e.status === 'Active')
                                            .map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.name} · {emp.designation}</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Customer (Optional)</label>
                                    <select
                                        className="input-field text-sm"
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    >
                                        <option value="">No specific customer</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name} · {c.phone}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* ── Section 2: Task Details ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Task Details</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Task Type <span className="text-red-400">*</span></label>
                                    <select
                                        required
                                        className="input-field text-sm"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Installation">Installation</option>
                                        <option value="Service">Service</option>
                                        <option value="Rescue/Repair">Rescue / Repair</option>
                                        <option value="Client Issue">Client Issue</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Task Description <span className="text-red-400">*</span></label>
                                    <textarea
                                        placeholder="Describe what needs to be done..."
                                        required
                                        className="input-field text-sm min-h-[90px] resize-none leading-relaxed"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* ── Section 3: Priority & Deadline ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Priority & Deadline</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Priority</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Low', 'Medium', 'High', 'Urgent'].map((p) => {
                                            const cfg = PRIORITY_CONFIG[p];
                                            const isSelected = formData.priority === p;
                                            return (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priority: p })}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${isSelected ? cfg.color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${isSelected ? cfg.dot : 'bg-gray-300'}`}></div>
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Due Date</label>
                                    <input
                                        type="date"
                                        className="input-field text-sm"
                                        value={formData.dueDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <CheckSquare size={16} />
                            {formData._id ? "Update Task / Assignment" : "Assign Task to Employee"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;

import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckSquare, Plus, Clock, MapPin, User, AlertTriangle,
    Loader2, Calendar, Flag, Users, Filter, Wrench, Zap
} from 'lucide-react';
import { getTasks, createTask, updateTaskStatus, getCustomers, getEmployees } from '../../services/api';
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
    const [tasks, setTasks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => { fetchData(); }, []);

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
            await createTask(dataToSubmit);
            setIsModalOpen(false);
            setFormData(emptyForm);
            fetchData();
        } catch (err) {
            alert('Error creating task: ' + (err.response?.data?.message || err.message));
        }
    };



    const filteredTasks = useMemo(() => tasks.filter(t => {
        const empMatch = !filterEmployee || t.assignedTo?._id === filterEmployee;
        const statMatch = !filterStatus || t.status === filterStatus;
        return empMatch && statMatch;
    }), [tasks, filterEmployee, filterStatus]);

    const stats = useMemo(() => ({
        total: tasks.length,
        ongoing: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Returned').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        urgent: tasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').length,
    }), [tasks]);

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tasks', value: stats.total, icon: <CheckSquare size={18}/>, color: 'text-gray-600 bg-gray-100' },
                    { label: 'Ongoing', value: stats.ongoing, icon: <Clock size={18}/>, color: 'text-blue-600 bg-blue-100' },
                    { label: 'Completed', value: stats.completed, icon: <Users size={18}/>, color: 'text-green-600 bg-green-100' },
                    { label: 'High Priority', value: stats.urgent, icon: <Flag size={18}/>, color: 'text-red-600 bg-red-100' },
                ].map((s) => (
                    <div key={s.label} className="card flex items-center gap-4 py-4">
                        <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{loading ? '–' : s.value}</p>
                        </div>
                    </div>
                ))}
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
                {(filterEmployee || filterStatus) && (
                    <button
                        onClick={() => { setFilterEmployee(''); setFilterStatus(''); }}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >✕ Clear</button>
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
                                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${overdue ? 'border-red-200' : 'border-gray-100'}`}
                            >
                                {/* Coloured left stripe by priority */}
                                <div className={`flex`}>
                                    <div className={`w-1 flex-shrink-0 rounded-l-2xl ${prio.dot.replace('bg-', 'bg-')}`} style={{background: overdue ? '#ef4444' : undefined}}></div>
                                    <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Left: icon + info */}
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                                                {TYPE_ICON[task.type] || <CheckSquare size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h4 className="text-base font-bold text-gray-900 truncate">{task.description || 'No description'}</h4>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded tracking-wide">{task.type}</span>
                                                    {overdue && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded tracking-wide">Overdue</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                    {/* Assigned Employee */}
                                                    <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg">
                                                        <User size={13} className="text-sky-500" />
                                                        <span className="text-xs font-bold text-sky-700">{task.assignedTo?.name || 'Unassigned'}</span>
                                                        {task.assignedTo?.designation && (
                                                            <span className="text-[10px] text-sky-400">· {task.assignedTo.designation}</span>
                                                        )}
                                                    </div>
                                                    {/* Customer */}
                                                    {task.customerId && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <MapPin size={13} className="text-gray-400" />
                                                            <span>{task.customerId?.name}</span>
                                                        </div>
                                                    )}
                                                    {/* Due Date */}
                                                    {task.dueDate && (
                                                        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg ${overdue ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                                                            <Calendar size={12} />
                                                            <span>{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                        </div>
                                                    )}
                                                    {/* Priority */}
                                                    <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg border ${prio.color}`}>
                                                        <Flag size={11} />
                                                        <span className="font-semibold">{task.priority || 'Medium'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Status badge (read-only — employee updates this) */}
                                        <div className="flex-shrink-0">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${STATUS_CONFIG[task.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                                {STATUS_CONFIG[task.status]?.label || task.status}
                                            </span>
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
                title="Assign New Task"
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
                                            .filter(e => e.status === 'Active' && /general (employee|staff)/i.test(e.designation))
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
                            Assign Task to Employee
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;

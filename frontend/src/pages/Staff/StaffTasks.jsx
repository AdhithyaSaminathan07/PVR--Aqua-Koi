import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    Clock,
    MapPin,
    AlertCircle,
    MessageSquare,
    Plus,
    ClipboardList,
    Loader2,
    ChevronRight,
    User,
    ShoppingCart,
    Filter,
    Calendar
} from 'lucide-react';
import * as api from '../../services/api';
import Modal from '../../components/Modal';

const StaffTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const [formData, setFormData] = useState({
        customerId: '',
        description: '',
        details: '',
        orderNote: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskRes, custRes] = await Promise.all([
                api.getAssignedTasks(),
                api.getCustomers()
            ]);
            setTasks(taskRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error('Error fetching staff tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.updateTaskStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Error updating task status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Travelling': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Arrived': return 'text-sky-600 bg-sky-50 border-sky-100';
            case 'Work completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Returned home': return 'text-purple-600 bg-purple-50 border-purple-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const filteredTasks = tasks.filter(t => filterStatus === 'All' || t.status === filterStatus);

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="px-4 md:px-0">
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                            My <span className="text-blue-600">Assignments</span>
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mt-1.5 flex items-center gap-2">
                            <Clock size={14} className="text-blue-400" />
                            Active schedule for today
                        </p>
                    </div>
                    
                    {/* Compact Filter Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                        {['All', 'Travelling', 'Arrived', 'Work completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${filterStatus === status ? 'bg-blue-600 text-white border-blue-600 shadow-md translate-y-[-1px]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task List Container */}
            <div className="space-y-4 px-4 md:px-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-3xl border border-gray-100">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Loading tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white px-8 py-16 rounded-3xl border border-dashed border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <ClipboardList size={28} />
                        </div>
                        <p className="text-gray-900 font-black text-xl italic tracking-tight uppercase">No Tasks</p>
                        <p className="text-gray-400 text-xs mt-1">You're all caught up for now!</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task._id} className="group relative bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden">
                            {/* Color Accent */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(task.status).split(' ')[1]}`}></div>
                            
                            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-6">
                                {/* Left Content: Task Info */}
                                <div className="flex gap-4 md:gap-5 flex-1 min-w-0">
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center border ${getStatusColor(task.status)} transition-all group-hover:scale-105 duration-300`}>
                                        <Calendar size={20} className="md:size-24" />
                                    </div>
                                    <div className="min-w-0 space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight truncate">
                                                {task.description}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>
                                                {task.type}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                                                <User size={12} className="text-blue-500" />
                                                <span className="truncate">{task.customerId?.name || 'Walk-in'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                                <MapPin size={12} className="text-rose-400" />
                                                <span className="truncate">{task.customerId?.address || 'Site Visit'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Content: Status Action */}
                                <div className="flex items-center gap-3 bg-gray-50/80 p-2 md:p-3 rounded-2xl border border-gray-100/50">
                                    {task.customerId?.location?.googleMapsLink && (
                                        <a 
                                            href={task.customerId.location.googleMapsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                                            title="Open Navigation"
                                        >
                                            <MapPin size={18} />
                                        </a>
                                    )}
                                    <div className="flex-1 lg:min-w-[140px] px-2">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Status</p>
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            className={`w-full bg-transparent text-[10px] md:text-xs font-black uppercase tracking-widest cursor-pointer outline-none ${getStatusColor(task.status).split(' ')[0]}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Travelling">Travelling</option>
                                            <option value="Arrived">Arrived</option>
                                            <option value="Work completed">Work completed</option>
                                            <option value="Returned home">Returned home</option>
                                        </select>
                                    </div>
                                    <button className="hidden md:flex w-10 h-10 items-center justify-center bg-white text-gray-300 rounded-xl group-hover:text-blue-500 group-hover:shadow-md transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StaffTasks;

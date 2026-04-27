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
            case 'Travelling': return 'bg-yellow-100 text-yellow-700';
            case 'Arrived': return 'bg-sky-100 text-sky-700';
            case 'Work completed': return 'bg-green-100 text-green-700';
            case 'Returned home': return 'bg-gray-100 text-gray-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const filteredTasks = tasks.filter(t => filterStatus === 'All' || t.status === filterStatus);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        My Assignments
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 italic">Your active schedule and operational responsibilities.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    {['All', 'Travelling', 'Arrived', 'Work completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                        <Loader2 className="animate-spin text-blue-500" size={48} />
                        <p className="text-gray-400 font-bold italic tracking-tight">Syncing your operational matrix...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <ClipboardList size={48} />
                        </div>
                        <p className="text-gray-500 font-black text-2xl italic tracking-tight mb-2">No Tasks Found</p>
                        <p className="text-gray-400 max-w-sm mx-auto">There are no tasks matching your current filter. Great time for a review!</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task._id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
                            {/* Status Indicator Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${getStatusColor(task.status).split(' ')[0]}`}></div>
                            
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex gap-6 items-start">
                                    <div className={`p-5 rounded-2xl ${getStatusColor(task.status)} transition-transform`}>
                                        <Calendar size={32} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{task.description}</h3>
                                            <span className="px-4 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100 tracking-widest">{task.type}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-6">
                                            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-600 italic">
                                                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><User size={14} /></div>
                                                <span>{task.customerId?.name || 'Walk-in Client'}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-500">
                                                <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500"><MapPin size={14} /></div>
                                                <span>{task.customerId?.address || 'Site Visit'}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-400">
                                                <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400"><Clock size={14} /></div>
                                                <span>Assigned {new Date(task.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                    <div className="flex flex-col px-4">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Update Status</p>
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            className={`py-2 pr-10 text-xs font-black uppercase tracking-widest border-none outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] ${getStatusColor(task.status)} bg-opacity-0`}
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")' }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Travelling">Travelling</option>
                                            <option value="Arrived">Arrived</option>
                                            <option value="Work completed">Work completed</option>
                                            <option value="Returned home">Returned home</option>
                                        </select>
                                    </div>
                                    <div className="w-[1px] h-10 bg-gray-200 mx-2"></div>
                                    <button className="p-4 bg-white text-gray-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                                        <ChevronRight size={24} />
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

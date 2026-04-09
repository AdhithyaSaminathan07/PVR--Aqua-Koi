import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    Plus,
    Clock,
    MapPin,
    User,
    AlertTriangle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { getTasks, createTask, updateTaskStatus, getCustomers, getEmployees } from '../services/api';

import Modal from '../components/Modal';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [formData, setFormData] = useState({
        customerId: '',
        type: 'Installation',
        assignedTo: '',
        description: ''
    });


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskRes, custRes, empRes] = await Promise.all([getTasks(), getCustomers(), getEmployees()]);
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
            if (!dataToSubmit.assignedTo) delete dataToSubmit.assignedTo;
            
            await createTask(dataToSubmit);
            setIsModalOpen(false);
            setFormData({ customerId: '', type: 'Installation', assignedTo: '', description: '' });
            fetchData();
        } catch (err) {
            alert('Error creating task: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateTaskStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Error updating task');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Travelling': return 'bg-yellow-100 text-yellow-700';
            case 'Arrived': return 'bg-aqua-100 text-aqua-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Returned': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Work Allocation</h1>
                    <p className="text-gray-500 mt-1">Assign tasks to staff and monitor real-time execution.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus size={18} />
                    <span>Create Task</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 italic">Task Status</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Ongoing', count: tasks.filter(t => t.status !== 'Completed').length, color: 'bg-blue-500' },
                                { label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length, color: 'bg-green-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                        <span className="text-sm font-medium text-gray-600">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-primary-500" size={32} />
                            <p className="text-gray-400 font-medium italic">Loading work allocated...</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task._id} className="card p-0 overflow-hidden hover:shadow-lg transition-all border-transparent hover:border-primary-100">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-primary-600">
                                            {task.type === 'Installation' ? <CheckSquare size={24} /> : task.type === 'Service' ? <Clock size={24} /> : <AlertTriangle size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-bold text-gray-900">{task.description}</h4>
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded">{task.type}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                {task.customerId && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <MapPin size={14} className="text-primary-400" />
                                                        <span>{task.customerId?.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-primary-50 px-2 py-1 rounded-lg">
                                                    <User size={14} className="text-primary-600" />
                                                    <span className="font-bold text-primary-700">{task.assignedTo?.name || 'Unassigned'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${getStatusColor(task.status)}`}
                                        >
                                            <option value="Travelling">Travelling to site</option>
                                            <option value="Arrived">Arrived at site</option>
                                            <option value="In Progress">Work in progress</option>
                                            <option value="Completed">Work completed</option>
                                            <option value="Returned">Returned home</option>
                                        </select>
                                        <ChevronRight size={20} className="text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {!loading && tasks.length === 0 && <p className="text-center py-20 text-gray-400 italic">No tasks assigned today.</p>}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Task">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        className="input-field"
                        value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    >
                        <option value="">Select Customer (Optional)</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <select
                        required className="input-field"
                        value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Installation">Installation</option>
                        <option value="Service">Service</option>
                        <option value="Rescue/Repair">Rescue/Repair</option>
                    </select>
                    <select
                        required className="input-field"
                        value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    >
                        <option value="">Assign Employee</option>
                        {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.designation})</option>)}
                    </select>

                    <textarea
                        placeholder="Task Description..." required className="input-field min-h-[100px]"
                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <button type="submit" className="btn-primary w-full py-3 mt-4 text-white font-bold">Assign Task</button>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;

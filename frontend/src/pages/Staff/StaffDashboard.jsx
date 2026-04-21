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
    User
} from 'lucide-react';
import * as api from '../../services/api';
import Modal from '../../components/Modal';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'complaint', 'enquiry', 'order'

    const [formData, setFormData] = useState({
        customerId: '',
        description: '', // for complaint
        details: '', // for enquiry
        type: 'Installation' // for task if relevant
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
            console.error('Error fetching staff data:', err);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeModal === 'complaint') {
                await api.createComplaint({ customerId: formData.customerId, description: formData.description });
            } else if (activeModal === 'enquiry') {
                await api.createEnquiry({ customerId: formData.customerId, details: formData.details });
            } else if (activeModal === 'order') {
                // For order, we just redirect or show a message that it should start as enquiry
                // or we can implement a simple order creation if the user wants.
                // Looking at Orders.jsx, they start as enquiries usually.
                alert('Orders should be created by converting Enquiries in the manager panel. For now, please raise an Enquiry.');
                return;
            }
            setActiveModal(null);
            setFormData({ customerId: '', description: '', details: '' });
            alert(`${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} raised successfully!`);
        } catch (err) {
            alert(`Error raising ${activeModal}: ` + (err.response?.data?.message || err.message));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Travelling': return 'bg-yellow-100 text-yellow-700';
            case 'Arrived': return 'bg-sky-100 text-sky-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Returned': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 font-display tracking-tight">Staff Portal</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your field operations and assist customers on the go.</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setActiveModal('complaint')}
                        className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all shadow-sm border border-rose-100"
                    >
                        <AlertCircle size={20} />
                        <span>Raise Complaint</span>
                    </button>
                    <button 
                        onClick={() => setActiveModal('enquiry')}
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all shadow-sm border border-indigo-100"
                    >
                        <MessageSquare size={20} />
                        <span>New Enquiry</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic mb-1">Ongoing Tasks</p>
                        <p className="text-5xl font-black text-blue-600 font-display tracking-tight">
                            {tasks.filter(t => t.status !== 'Completed').length}
                        </p>
                    </div>
                    <div className="relative p-4 bg-blue-50 rounded-2xl text-blue-600">
                        <Clock size={32} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic mb-1">Completed Today</p>
                        <p className="text-5xl font-black text-green-600 font-display tracking-tight">
                            {tasks.filter(t => t.status === 'Completed').length}
                        </p>
                    </div>
                    <div className="relative p-4 bg-green-50 rounded-2xl text-green-600">
                        <CheckSquare size={32} />
                    </div>
                </div>
            </div>

            {/* Assigned Tasks */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight italic">Assigned Responsibilities</h2>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <Loader2 className="animate-spin text-blue-500" size={40} />
                            <p className="text-gray-400 font-medium italic">Fetching your schedule...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-white p-16 rounded-[2rem] border border-dashed border-gray-200 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <ClipboardList size={40} />
                            </div>
                            <p className="text-gray-500 font-bold text-xl italic tracking-tight">No tasks assigned for you currently.</p>
                            <p className="text-gray-400 mt-1">Enjoy your break or check back later!</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task._id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 hover:border-blue-100 transition-all group">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex gap-6 items-start">
                                        <div className={`p-5 rounded-2xl ${getStatusColor(task.status)} group-hover:scale-105 transition-transform`}>
                                            <CheckSquare size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{task.description}</h3>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-lg border border-gray-100 tracking-widest">{task.type}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500 italic">
                                                    <User size={16} className="text-blue-500" />
                                                    <span>{task.customerId?.name || 'Walk-in Client'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                                    <MapPin size={16} className="text-rose-500" />
                                                    <span>{task.customerId?.address || 'Site Visit'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-2xl">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            className={`pl-6 pr-12 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-none outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] ${getStatusColor(task.status)}`}
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")' }}
                                        >
                                            <option value="Travelling">Travelling</option>
                                            <option value="Arrived">Arrived</option>
                                            <option value="In Progress">Working</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Returned">Returned</option>
                                        </select>
                                        <div className="p-3 bg-white rounded-xl text-gray-300 group-hover:text-blue-500 transition-colors">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal 
                isOpen={activeModal !== null} 
                onClose={() => setActiveModal(null)} 
                title={`Raise New ${activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1)}`}
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Select Customer</label>
                        <select
                            required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold transition-all"
                            value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        >
                            <option value="">Choose a customer...</option>
                            {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                        </select>
                    </div>

                    {activeModal === 'complaint' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Describe the Problem</label>
                            <textarea
                                placeholder="What is the issue?" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold min-h-[150px] transition-all"
                                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    )}

                    {activeModal === 'enquiry' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Enquiry Details</label>
                            <textarea
                                placeholder="What is the customer looking for?" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold min-h-[150px] transition-all"
                                value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            />
                        </div>
                    )}

                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                        Submit {activeModal}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest italic pt-2">This will be notified to the branch manager</p>
                </form>
            </Modal>
        </div>
    );
};

export default StaffDashboard;

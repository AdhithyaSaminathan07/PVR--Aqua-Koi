import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Sparkles,
    ArrowRight,
    Droplets,
    Fish
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
        orderNote: '', // for order note
        type: 'Installation', // for task if relevant
        branch: 'Aqua' // for dynamic routing
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskRes, aquaCustRes, koiCustRes] = await Promise.all([
                api.getAssignedTasks(),
                api.getCustomers(),
                api.getKoiCustomers()
            ]);
            setTasks(taskRes.data);
            setCustomers({
                Aqua: aquaCustRes.data,
                Koi: koiCustRes.data
            });
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
                if (formData.branch === 'Koi') {
                    await api.createKoiEnquiry({ customerId: formData.customerId, details: formData.details });
                } else {
                    await api.createEnquiry({ customerId: formData.customerId, details: formData.details });
                }
            } else if (activeModal === 'order') {
                if (formData.branch === 'Koi') {
                    await api.createKoiOrder({ customerId: formData.customerId, details: formData.orderNote, items: [], totalAmount: 0 });
                } else {
                    await api.createOrder({ 
                        customerId: formData.customerId, 
                        items: [{ name: formData.orderNote || 'Staff Field Order', quantity: 1, price: 0 }], 
                        totalAmount: 0,
                        status: 'Pending'
                    });
                }
            }
            setActiveModal(null);
            setFormData({ ...formData, customerId: '', description: '', details: '', orderNote: '' });
            alert(`${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} raised for ${formData.branch} successfully!`);
        } catch (err) {
            alert(`Error raising ${activeModal}: ` + (err.response?.data?.message || err.message));
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

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 font-display tracking-tight flex items-center gap-3">
                        Welcome Back 
                        <span className="text-blue-600 inline-flex items-center gap-2">
                             Staff Operations <Sparkles className="text-amber-400" size={32} />
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium italic">Your command center for field operations and customer excellence.</p>
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
                    <button 
                        onClick={() => setActiveModal('order')}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"
                    >
                        <ShoppingCart size={20} className="lucide lucide-shopping-cart" />
                        <span>Raise Order</span>
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

            {/* Quick Actions & Recent Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Tasks Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight italic">Assigned Responsibilities</h2>
                        </div>
                        <Link to="/staff/tasks" className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">View All Tasks</Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                <Loader2 className="animate-spin text-blue-500" size={40} />
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
                                <p className="text-gray-400 font-bold italic">No active tasks assigned.</p>
                            </div>
                        ) : (
                            tasks.slice(0, 3).map((task) => (
                                <div key={task._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-blue-100 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${getStatusColor(task.status)} group-hover:scale-105 transition-transform`}>
                                            <CheckSquare size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{task.description}</h3>
                                            <p className="text-[10px] text-gray-400 font-medium">{task.customerId?.name || 'Walk-in'}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Customer Assistance Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Plus size={80} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Service Mode</h3>
                        <p className="text-blue-100 text-xs font-medium mb-6">Assisting a customer? Raise a request instantly.</p>
                        <div className="space-y-3">
                            <button onClick={() => setActiveModal('complaint')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-xs font-bold transition-all text-left px-4 flex items-center justify-between">
                                Complaint <ChevronRight size={14} />
                            </button>
                            <button onClick={() => setActiveModal('enquiry')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-xs font-bold transition-all text-left px-4 flex items-center justify-between">
                                Enquiry <ChevronRight size={14} />
                            </button>
                            <button onClick={() => setActiveModal('order')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-xs font-bold transition-all text-left px-4 flex items-center justify-between">
                                Order <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance Status</p>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Checked In</p>
                                <p className="text-[10px] text-gray-400">Regular Shift</p>
                            </div>
                        </div>
                        <Link to="/staff/attendance" className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-gray-100">View History</Link>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal 
                isOpen={activeModal !== null} 
                onClose={() => setActiveModal(null)} 
                title={`Raise New ${activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1)}`}
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-2">
                    {(activeModal === 'enquiry' || activeModal === 'order') && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Target Department</label>
                            <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-3xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, branch: 'Aqua', customerId: '' })}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.branch === 'Aqua' ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Droplets size={16} />
                                    Aqua Branch
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, branch: 'Koi', customerId: '' })}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.branch === 'Koi' ? 'bg-white text-orange-600 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Fish size={16} />
                                    Koi Centre
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 text-center lg:text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic flex items-center gap-2">
                            <User size={12} className="text-gray-300" />
                            Select Business Customer ({formData.branch})
                        </label>
                        <div className="relative group">
                            <select
                                required 
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold transition-all appearance-none text-gray-900 shadow-inner"
                                value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            >
                                <option value="">Select established client...</option>
                                {(customers[formData.branch] || []).map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone || c.whatsapp})</option>)}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                <ChevronRight size={20} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    {activeModal === 'complaint' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Describe the Problem</label>
                                <textarea
                                    placeholder="What is the issue?" required 
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold min-h-[180px] transition-all text-gray-900 placeholder:text-gray-300 shadow-inner"
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {activeModal === 'enquiry' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Enquiry Details</label>
                            <textarea
                                placeholder="What is the customer looking for?" required 
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold min-h-[180px] transition-all text-gray-900 placeholder:text-gray-300 shadow-inner"
                                value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            />
                        </div>
                    )}
                    {activeModal === 'order' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Order Note / Brief</label>
                            <textarea
                                placeholder="Describe what the customer wants to order..." required 
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold min-h-[180px] transition-all text-gray-900 placeholder:text-gray-300 shadow-inner"
                                value={formData.orderNote} onChange={(e) => setFormData({ ...formData, orderNote: e.target.value })}
                            />
                        </div>
                    )}

                    <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
                        Submit {activeModal}
                        <ArrowRight size={18} />
                    </button>
                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest italic pt-2">This will be notified to the branch manager</p>
                </form>
            </Modal>
        </div>
    );
};

export default StaffDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
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
    Fish,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import * as api from '../../services/api';
import Modal from '../../components/Modal';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [customers, setCustomers] = useState({ Aqua: [], Koi: [] });
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        leadName: '',
        leadPhone: '',
        description: '',
        details: '',
        orderNote: '',
        type: 'Installation',
        branch: 'Aqua'
    });

    useEffect(() => {
        setSearchTerm('');
        setShowDropdown(false);
        setIsNewCustomer(false);
        if (!activeModal) {
            setFormData(prev => ({ ...prev, customerId: '', leadName: '', leadPhone: '', description: '', details: '', orderNote: '' }));
        }
    }, [activeModal]);

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
                if (!formData.customerId) return alert('Please select a customer first');
                await api.createComplaint({ customerId: formData.customerId, description: formData.description });
            } else if (activeModal === 'enquiry') {
                if (formData.branch === 'Koi') {
                    const payload = isNewCustomer 
                        ? { customerName: formData.leadName, contact: formData.leadPhone, requirement: formData.details }
                        : { customerName: searchTerm, contact: customers.Koi.find(c => c._id === formData.customerId)?.phone || 'Existing', requirement: formData.details };
                    
                    if (!payload.customerName || !payload.contact) return alert('Customer name and contact are required for Koi enquiries');
                    await api.createKoiEnquiry(payload);
                } else {
                    const payload = isNewCustomer
                        ? { leadName: formData.leadName, leadPhone: formData.leadPhone, details: formData.details }
                        : { customerId: formData.customerId, details: formData.details };

                    if (!isNewCustomer && !formData.customerId) return alert('Please select a customer first');
                    if (isNewCustomer && (!formData.leadName || !formData.leadPhone)) return alert('Please enter lead name and phone');
                    
                    await api.createEnquiry(payload);
                }
            } else if (activeModal === 'order') {
                if (!formData.customerId) return alert('Please select a customer first');
                if (formData.branch === 'Koi') {
                    await api.createKoiOrder({ customer: formData.customerId, details: formData.orderNote, items: [], totalAmount: 0 });
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
            setSearchTerm('');
            setIsNewCustomer(false);
            setFormData({ ...formData, customerId: '', leadName: '', leadPhone: '', description: '', details: '', orderNote: '' });
            alert(`${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} raised successfully!`);
        } catch (err) {
            alert(`Error raising ${activeModal}: ` + (err.response?.data?.message || err.message));
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

    const stats = {
        pending: tasks.filter(t => t.status === 'Pending').length,
        ongoing: tasks.filter(t => ['Travelling', 'Arrived', 'In Progress'].includes(t.status)).length,
        completedToday: tasks.filter(t => 
            (['Completed', 'Work completed'].includes(t.status)) && 
            new Date(t.updatedAt).toDateString() === new Date().toDateString()
        ).length
    };

    const filteredCustomers = (customers[formData.branch] || []).filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.whatsapp && c.whatsapp.includes(searchTerm))
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="px-4 md:px-0">
                <div className="flex flex-col gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-full">Operational Hub</div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
                            Operational <span className="text-blue-600">Matrix</span>
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mt-2 italic">
                            Command center for field excellence and customer service.
                        </p>
                    </div>
                    
                    {/* Compact Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setActiveModal('complaint')}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-tighter hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
                        >
                            <AlertCircle size={14} />
                            Raise Complaint
                        </button>
                        <button 
                            onClick={() => setActiveModal('enquiry')}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-tighter hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                            <MessageSquare size={14} />
                            New Enquiry
                        </button>
                        <button 
                            onClick={() => setActiveModal('order')}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-tighter hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                        >
                            <ShoppingCart size={14} />
                            Raise Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Dynamic Stats Grid */}
            <div className="px-4 md:px-0 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Ongoing</p>
                        <p className="text-3xl md:text-4xl font-black text-gray-900 leading-none">{stats.ongoing}</p>
                    </div>
                    <Clock size={40} className="absolute -right-2 -bottom-2 text-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending</p>
                        <p className="text-3xl md:text-4xl font-black text-gray-900 leading-none">{stats.pending}</p>
                    </div>
                    <AlertCircle size={40} className="absolute -right-2 -bottom-2 text-amber-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-500 to-green-600 p-5 md:p-6 rounded-3xl shadow-lg shadow-emerald-100 relative overflow-hidden group">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest mb-1">Done Today</p>
                        <p className="text-3xl md:text-4xl font-black text-white leading-none">{stats.completedToday}</p>
                    </div>
                    <CheckSquare size={40} className="absolute -right-2 -bottom-2 text-white/20" />
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Recent Tasks Preview */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-widest">Active Schedule</h2>
                        <Link to="/staff/tasks" className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group">
                            View Full List <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 bg-white rounded-3xl border border-gray-100">
                                <Loader2 className="animate-spin text-blue-500" size={24} />
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="bg-white py-12 rounded-3xl border border-dashed border-gray-200 text-center">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No active tasks assigned</p>
                            </div>
                        ) : (
                            tasks.slice(0, 3).map((task) => (
                                <div key={task._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl border ${getStatusColor(task.status)}`}>
                                            <Calendar size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-xs truncate max-w-[150px] md:max-w-none">{task.description}</h3>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{task.customerId?.name || 'Walk-in'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {task.customerId?.location?.googleMapsLink && (
                                            <a 
                                                href={task.customerId.location.googleMapsLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Open Navigation"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MapPin size={18} />
                                            </a>
                                        )}
                                        <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Quick Actions & Attendance */}
                <div className="space-y-6">
                    {/* Attendance Mini Card */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Attendance</p>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="font-black text-gray-900 text-xs uppercase tracking-tight leading-none">Checked In</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter italic">Operational since 09:00 AM</p>
                            </div>
                        </div>
                        <Link to="/staff/attendance" className="w-full py-2.5 bg-gray-50 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-gray-100 hover:text-gray-700 transition-colors">History Matrix</Link>
                    </div>

                    {/* Support Resource Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
                        <Droplets className="absolute -right-4 -bottom-4 text-white opacity-10 group-hover:scale-125 transition-transform" size={100} />
                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 italic">Field Support</h3>
                        <p className="text-[10px] text-blue-100 font-medium mb-4">Request assistance from lead technicians.</p>
                        <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all text-center">
                            Call Branch Lead
                        </button>
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
                                    onClick={() => {
                                        setFormData({ ...formData, branch: 'Aqua', customerId: '' });
                                        setSearchTerm('');
                                        setShowDropdown(false);
                                    }}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.branch === 'Aqua' ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Droplets size={16} />
                                    Aqua Branch
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, branch: 'Koi', customerId: '' });
                                        setSearchTerm('');
                                        setShowDropdown(false);
                                    }}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.branch === 'Koi' ? 'bg-white text-orange-600 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Fish size={16} />
                                    Koi Centre
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic flex items-center gap-2">
                                <Sparkles size={12} className="text-amber-500" />
                                Customer Type
                            </label>
                            <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-3xl">
                                <button
                                    type="button"
                                    onClick={() => setIsNewCustomer(false)}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isNewCustomer ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}
                                >
                                    Existing
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsNewCustomer(true)}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isNewCustomer ? 'bg-white text-rose-600 shadow-md' : 'text-gray-400'}`}
                                >
                                    New Lead
                                </button>
                            </div>
                        </div>

                        {!isNewCustomer ? (
                            <div className="space-y-4 animate-in slide-in-from-left-2 duration-300">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic flex items-center gap-2">
                                    <User size={12} className="text-gray-300" />
                                    Select Business Customer ({formData.branch})
                                </label>
                                
                                <div className="relative group">
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder={`Search ${formData.branch} customers...`}
                                            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold transition-all text-gray-900 shadow-inner"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setShowDropdown(true);
                                            }}
                                            onFocus={() => {
                                                if (searchTerm.length > 0) setShowDropdown(true);
                                            }}
                                        />
                                    </div>

                                    {/* Dropdown Results */}
                                    {showDropdown && (
                                        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                                {filteredCustomers.length === 0 ? (
                                                    <div className="p-6 text-center text-gray-400 font-bold text-xs italic">No matching customers found.</div>
                                                ) : (
                                                    filteredCustomers.map(c => (
                                                        <button
                                                            key={c._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, customerId: c._id });
                                                                setSearchTerm(c.name);
                                                                setShowDropdown(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all ${formData.customerId === c._id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-700'}`}
                                                        >
                                                            <div>
                                                                <p className="font-bold text-sm leading-none mb-1">{c.name}</p>
                                                                <p className={`text-[10px] font-medium ${formData.customerId === c._id ? 'text-blue-100' : 'text-gray-400'}`}>
                                                                    {c.phone || c.whatsapp || 'No contact info'}
                                                                </p>
                                                            </div>
                                                            {formData.customerId === c._id && <CheckCircle2 size={16} />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Showing results for {formData.branch}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1 italic">Prospect Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full name..."
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-rose-500/20 focus:bg-white outline-none font-bold transition-all text-gray-900 shadow-inner"
                                        value={formData.leadName}
                                        onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1 italic">Prospect Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="Contact number..."
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-rose-500/20 focus:bg-white outline-none font-bold transition-all text-gray-900 shadow-inner"
                                        value={formData.leadPhone}
                                        onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {activeModal === 'complaint' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Describe the Problem</label>
                                <textarea
                                    placeholder="What is the issue?" required 
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold min-h-[150px] transition-all text-gray-900 placeholder:text-gray-300 shadow-inner resize-none"
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
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold min-h-[150px] transition-all text-gray-900 placeholder:text-gray-300 shadow-inner resize-none"
                                value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            />
                        </div>
                    )}
                    {activeModal === 'order' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Order Note / Brief</label>
                            <textarea
                                placeholder="Describe what the customer wants to order..." required 
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500/20 focus:bg-white outline-none font-bold min-h-[150px] transition-all text-gray-900 placeholder:text-gray-300 shadow-inner resize-none"
                                value={formData.orderNote} onChange={(e) => setFormData({ ...formData, orderNote: e.target.value })}
                            />
                        </div>
                    )}

                    <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
                        Submit {activeModal}
                        <ArrowRight size={18} />
                    </button>
                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest italic">This will be notified to the branch manager</p>
                </form>
            </Modal>
        </div>
    );
};

export default StaffDashboard;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    User,
    Phone,
    MapPin,
    History,
    ChevronDown,
    Users,
    ChevronRight,
    ShoppingBag,
    Trash2,
    Edit3,
    ArrowRight,
    Fish,
    CreditCard,
    Filter,
    Calendar,
    Loader2
} from 'lucide-react';
import {
    getKoiCustomers,
    createKoiCustomer,
    getKoiCustomerById,
    updateKoiCustomer,
    deleteKoiCustomer
} from '../../services/api';
import Modal from '../../components/Modal';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col gap-4 hover:shadow-md transition-all group"
    >
        <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    </motion.div>
);

const KoiCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await getKoiCustomers();
            setCustomers(res.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (id) => {
        if (!id) return;
        const newId = expandedId === id ? null : id;
        setExpandedId(newId);

        if (newId && !customerDetails[id]) {
            try {
                const res = await getKoiCustomerById(id);
                setCustomerDetails(prev => ({ ...prev, [id]: res.data }));
            } catch (err) {
                console.error('Error fetching customer details:', err);
            }
        }
    };

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateKoiCustomer(editingId, formData);
            } else {
                await createKoiCustomer(formData);
            }
            fetchCustomers();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving customer:', err);
            alert('Error saving customer');
        }
    };

    const handleEditClick = (customer, e) => {
        if (e) e.stopPropagation();
        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address || ''
        });
        setEditingId(customer._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this customer record?')) {
            try {
                await deleteKoiCustomer(id);
                fetchCustomers();
            } catch (err) {
                console.error('Error deleting customer:', err);
                alert('Error deleting customer');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', phone: '', address: '' });
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="py-6 space-y-8 lg:space-y-12">
            {/* Banner Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#FFF7ED] rounded-2xl lg:rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-sm"
            >
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-[#f97316] text-[10px] font-black uppercase tracking-widest mb-6 border border-orange-500/20">
                        <Fish size={12} />
                        Premium Koi Clientele
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-bold text-orange-950 mb-4 leading-tight">
                        Client <br />
                        <span className="text-[#f97316]">Directory</span>
                    </h1>
                    <p className="text-orange-900/60 text-sm lg:text-base font-medium mb-8 max-w-md">
                        Manage high-value koi enthusiasts, track premium purchase cycles and exclusive collection histories.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#f97316] text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-orange-900/20 hover:bg-[#f97316]/90 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Register Client
                        </button>
                    </div>
                </div>

                <div className="absolute right-[-20px] top-[-20px] w-1/2 h-full hidden lg:flex items-center justify-center opacity-10">
                    <Fish size={320} className="text-[#f97316]" />
                </div>
            </motion.div>

            {/* Stats & Search Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-2/3 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, contact, or variety preference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/5 focus:border-[#f97316]/30 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                                <Filter size={16} />
                                Filter
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                                <Calendar size={16} />
                                Timeline
                            </button>
                        </div>
                    </div>

                    {/* Customer List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm">
                                <Loader2 className="animate-spin text-[#f97316] mb-4" size={40} />
                                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest italic">Loading portfolio records...</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((customer, i) => (
                                    <motion.div
                                        key={customer._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`bg-white border transition-all duration-300 overflow-hidden ${expandedId === customer._id
                                            ? 'rounded-[2rem] border-orange-500/30 shadow-xl shadow-orange-500/5 ring-1 ring-orange-500/10'
                                            : 'rounded-[1.5rem] border-gray-50 shadow-sm hover:border-orange-100 hover:shadow-md'
                                            }`}
                                    >
                                        <div
                                            onClick={() => toggleExpand(customer._id)}
                                            className="p-5 flex items-center justify-between cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-500 ${expandedId === customer._id
                                                    ? 'bg-orange-600 text-white scale-105 shadow-lg shadow-orange-900/20'
                                                    : 'bg-orange-50 text-[#f97316]'
                                                    }`}>
                                                    {customer.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 tracking-tight group-hover:text-[#f97316] transition-colors uppercase italic font-black">
                                                        {customer.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <Phone size={12} className="text-orange-500" />
                                                            {customer.phone}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase tracking-widest italic bg-orange-50 px-2 py-0.5 rounded-full">
                                                            {customer.purchaseFrequency || 0} Purchase Cycles
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={(e) => handleEditClick(customer, e)}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <div className={`p-2 rounded-xl transition-all duration-300 ${expandedId === customer._id ? 'bg-orange-50 text-orange-600 rotate-180' : 'text-gray-300 group-hover:text-orange-200'}`}>
                                                    <ChevronDown size={20} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dropdown Content */}
                                        <AnimatePresence>
                                            {expandedId === customer._id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="px-6 pb-8 pt-2 border-t border-gray-50 bg-[#FFF7ED]/30">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                            <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm relative overflow-hidden group/card space-y-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                                        <MapPin size={16} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Residence</span>
                                                                </div>
                                                                <p className="text-sm font-medium text-gray-700 leading-relaxed italic uppercase">
                                                                    {customer.address || "No address provided"}
                                                                </p>
                                                                <button className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline pt-2">
                                                                    <History size={14} /> Full Engagement History
                                                                </button>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <ShoppingBag size={14} className="text-orange-500" /> Collection History
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {customerDetails[customer._id]?.orderHistory?.length > 0 ? (
                                                                        customerDetails[customer._id].orderHistory.slice(0, 3).map((order, idx) => (
                                                                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 transition-all shadow-sm">
                                                                                <div>
                                                                                    <span className="block text-[11px] font-black text-gray-900 uppercase">#{order._id?.slice(-6).toUpperCase()}</span>
                                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{order.fishType || 'Unknown Variety'}</span>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <div className="text-xs font-black text-gray-900">₹{order.totalAmount}</div>
                                                                                    <div className="text-[9px] font-bold text-emerald-500 uppercase italic">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="py-8 text-center bg-white/50 rounded-2xl border border-dashed border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">No previous collections</div>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={(e) => handleDeleteClick(customer._id, e)}
                                                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                                                    >
                                                                        <Trash2 size={14} /> Archive
                                                                    </button>
                                                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/10">
                                                                        View Profile
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm border-dashed">
                                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-200 mb-4 border border-orange-100">
                                            <Users size={32} />
                                        </div>
                                        <p className="text-gray-400 font-bold text-sm italic tracking-wide">No client records found.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="flex flex-col gap-6">
                    <StatCard
                        title="Client Database"
                        value={customers.length.toString().padStart(2, '0')}
                        icon={Users}
                        color="bg-orange-500"
                        delay={0.1}
                    />
                    <div className="bg-orange-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-orange-900/20">
                        <div className="absolute right-[-20%] bottom-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Fish size={180} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Portfolio Value</h4>
                        <p className="text-3xl font-bold mb-4">Premium <span className="text-xs font-medium opacity-50 block mt-1">Tier-1 Enthusiasts</span></p>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full bg-orange-500"
                            />
                        </div>
                        <p className="text-[10px] font-bold opacity-40 mt-3 uppercase tracking-widest">Confidence: 85%</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Engagement</h4>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-orange-50/50 hover:bg-orange-100 rounded-2xl transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                                        <CreditCard size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600">Ledger Report</span>
                                </div>
                                <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Registration Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "PORTFOLIO UPDATE" : "CLIENT REGISTRATION"} maxWidth="max-w-xl">
                <form onSubmit={handleSaveCustomer} className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                            <Plus size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase italic font-black">{isEditMode ? 'Update Client Record' : 'Register New Client'}</h4>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Premium Koi Enthusiast Profile</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text" placeholder="e.g. Rajesh Kumar" required
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                            <input
                                type="text" placeholder="+91 XXXXX XXXXX" required
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Physical Address</label>
                            <textarea
                                placeholder="Enter complete billing/residential address..."
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner min-h-[100px] resize-none"
                                value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button" onClick={handleCloseModal}
                            className="flex-1 px-4 py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-bold text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 uppercase tracking-widest active:scale-95"
                        >
                            {isEditMode ? 'Commit Changes' : 'Confirm Registration'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default KoiCustomers;


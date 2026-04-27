import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Phone,
    MapPin,
    ExternalLink,
    MessageSquare,
    History,
    ShoppingCart,
    Loader2,
    ArrowRight,
    Droplets,
    ChevronDown,
    Trash2,
    Edit3,
    UserCheck,
    Calendar,
    Filter
} from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/api';
import Modal from '../../components/Modal';

const StatCard = ({ title, value, icon: Icon, color, loading, delay }) => (
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
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? <Loader2 className="animate-spin text-gray-200" size={20} /> : value}
            </p>
        </div>
    </motion.div>
);

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        location: { lat: 0, lng: 0, googleMapsLink: '' }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await getCustomers();
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCustomer(formData);
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', address: '', location: { lat: 0, lng: 0, googleMapsLink: '' } });
            fetchCustomers();
        } catch (err) {
            alert('Error creating customer');
        }
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
                className="relative bg-[#E6F0FF] rounded-2xl lg:rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-sm"
            >
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#2988FF] text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/20">
                        <UserCheck size={12} />
                        Elite Partner Network
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-bold text-[#1a365d] mb-4 leading-tight">
                        Customer <br />
                        <span className="text-[#2988FF]">Directory</span>
                    </h1>
                    <p className="text-[#1a365d]/60 text-sm lg:text-base font-medium mb-8 max-w-md">
                        Manage your elite aquaculture client base, history, and engagement patterns in one centralized hub.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#1a365d] text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-[#1a365d]/90 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Elite Client
                        </button>
                    </div>
                </div>

                <div className="absolute right-[-20px] top-[-20px] w-1/2 h-full hidden lg:flex items-center justify-center opacity-10">
                    <Droplets size={320} className="text-[#2988FF]" />
                </div>
            </motion.div>

            {/* Stats & Search Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-2/3 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2988FF] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, contact, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/5 focus:border-[#2988FF]/30 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                                <Filter size={16} />
                                Filter
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                                <Calendar size={16} />
                                History
                            </button>
                        </div>
                    </div>

                    {/* Customer List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm">
                                <Loader2 className="animate-spin text-[#2988FF] mb-4" size={40} />
                                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest italic">Syncing secure records...</p>
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
                                            ? 'rounded-[2rem] border-[#2988FF]/30 shadow-xl shadow-blue-500/5 ring-1 ring-[#2988FF]/10'
                                            : 'rounded-[1.5rem] border-gray-50 shadow-sm hover:border-blue-100 hover:shadow-md'
                                            }`}
                                    >
                                        <div
                                            onClick={() => setExpandedId(expandedId === customer._id ? null : customer._id)}
                                            className="p-5 flex items-center justify-between cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-500 ${expandedId === customer._id
                                                    ? 'bg-[#1a365d] text-white scale-105 shadow-lg shadow-blue-900/20'
                                                    : 'bg-[#F5F9FC] text-[#2988FF]'
                                                    }`}>
                                                    {customer.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 tracking-tight group-hover:text-[#2988FF] transition-colors">
                                                        {customer.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <Phone size={12} className="text-[#2988FF]" />
                                                            {customer.phone}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                            Active Client
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl transition-all duration-300 ${expandedId === customer._id ? 'bg-blue-50 text-[#2988FF] rotate-180' : 'text-gray-300 group-hover:text-blue-200'}`}>
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
                                                    <div className="px-6 pb-8 pt-2 border-t border-gray-50 bg-[#F5F9FC]/50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                            <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm relative overflow-hidden group/card">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2988FF] flex items-center justify-center">
                                                                        <MapPin size={16} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location Profile</span>
                                                                </div>
                                                                <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4">
                                                                    {customer.address}
                                                                </p>
                                                                {customer.location?.googleMapsLink && (
                                                                    <a
                                                                        href={customer.location.googleMapsLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 text-[10px] font-bold text-[#2988FF] uppercase tracking-widest hover:underline"
                                                                    >
                                                                        View on Map <ExternalLink size={12} />
                                                                    </a>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col gap-4">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <button className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 hover:border-[#2988FF]/30 hover:text-[#2988FF] rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm group/btn">
                                                                        <ShoppingCart size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                                        Orders
                                                                    </button>
                                                                    <button className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 hover:border-cyan-500/30 hover:text-cyan-600 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm group/btn">
                                                                        <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                                        Insights
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#1a365d] text-white rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10">
                                                                        <History size={16} />
                                                                        Client History
                                                                    </button>
                                                                    <div className="flex items-center gap-2">
                                                                        <button className="p-4 bg-white border border-gray-100 hover:border-red-500/30 hover:text-red-500 rounded-2xl transition-all shadow-sm">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                        <button className="p-4 bg-white border border-gray-100 hover:border-blue-500/30 hover:text-blue-500 rounded-2xl transition-all shadow-sm">
                                                                            <Edit3 size={16} />
                                                                        </button>
                                                                    </div>
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
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4 border border-gray-100">
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
                        title="Total Database"
                        value={customers.length.toString().padStart(2, '0')}
                        icon={Users}
                        color="bg-blue-500"
                        loading={loading}
                        delay={0.1}
                    />
                    <div className="bg-[#1a365d] rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-blue-900/20">
                        <div className="absolute right-[-20%] bottom-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Droplets size={180} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Growth Metric</h4>
                        <p className="text-3xl font-bold mb-4">+12.5% <span className="text-xs font-medium opacity-50 block mt-1">New acquisitions this month</span></p>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full bg-[#2988FF]"
                            />
                        </div>
                        <p className="text-[10px] font-bold opacity-40 mt-3 uppercase tracking-widest">Target: 40 Clients</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h4>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-blue-50 rounded-2xl transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#2988FF] shadow-sm">
                                        <FileText size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600">Export PDF</span>
                                </div>
                                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#2988FF] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-blue-50 rounded-2xl transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#2988FF] shadow-sm">
                                        <MessageSquare size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600">Broadcast SMS</span>
                                </div>
                                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#2988FF] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Registration Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Client Registration" maxWidth="max-w-xl">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2988FF] flex items-center justify-center shadow-inner">
                            <Plus size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">Register Elite Client</h4>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Digital Aquaculture Profile</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text" placeholder="Adhithya Saminathan" required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text" placeholder="+91 XXXXX XXXXX" required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Office/Farm Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-5 text-gray-300" size={18} />
                                <textarea
                                    placeholder="Enter complete physical address details..." required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner min-h-[100px] resize-none"
                                    value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps Intelligence (Link)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text" placeholder="https://maps.google.com/..."
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                    value={formData.location.googleMapsLink} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, googleMapsLink: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button" onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-[#1a365d] text-white rounded-2xl font-bold text-xs hover:bg-[#1a365d]/90 transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest active:scale-95"
                        >
                            Authorize & Save
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Internal icon for forms since ExternalLink is used elsewhere
const LinkIcon = ({ size, className }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);

const FileText = ({ size, className }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

export default Customers;

